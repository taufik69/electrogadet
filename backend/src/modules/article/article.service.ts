import { ApiError } from "../../shared/helpers/ApiError.js"
import { toCursorResult } from "../../shared/utils/pagination.js"
import { cached, bumpCacheVersion } from "../../shared/utils/cache.js"
import { CACHE_TTL } from "../../shared/constant/cache.js"
import { generateSlug } from "../../shared/utils/slug.js"
import { enqueueImageDelete, enqueueImageUpload } from "../../shared/queues/image.queue.js"
import { articleRepository } from "./article.repository.js"
import { ARTICLE_CACHE_NAMESPACE, META_DESCRIPTION_LENGTH } from "./article.constant.js"
import type {
  ArticleSeoInput,
  CoverImage,
  CreateArticleInput,
  ListArticleFilters,
  UpdateArticleInput,
} from "./article.types.js"
import type { ImageModel } from "../../generated/prisma/models.js"

/**
 * Projects the raw Image row down to what the API exposes (spec §2.3a).
 * localPath/publicId/tries/lastError are the worker's bookkeeping — publicId is
 * an infrastructure identifier and localPath leaks a server filesystem path, so
 * neither belongs in a response. `status` is kept deliberately: the dashboard
 * polls on it and the storefront filters on it.
 */
function toCoverImage(image: ImageModel): CoverImage {
  return { id: image.id, url: image.url, status: image.status, alt: image.alt }
}

type WithCover<T> = T & { coverImage: CoverImage | null }

/**
 * Batched merge, not an N+1 — one Image query for the whole page. `coverImage`
 * is always present as a key (null when absent, never omitted) so consumers can
 * rely on `article.coverImage?.status` (spec §4.3).
 */
async function attachCoverImages<T extends { id: string }>(articles: T[]): Promise<WithCover<T>[]> {
  if (articles.length === 0) return []

  const images = await articleRepository.findImagesByOwners(articles.map((a) => a.id))
  const imageByOwner = new Map(images.map((img) => [img.ownerId, img]))

  return articles.map((article) => {
    const image = imageByOwner.get(article.id)
    return { ...article, coverImage: image ? toCoverImage(image) : null }
  })
}

/**
 * Article slugs are globally unique like product's, so a same-titled article
 * appends -2, -3, … rather than rejecting the create outright (spec §2.10).
 */
async function generateUniqueSlug(title: string): Promise<string> {
  // slugify with strict:true strips punctuation and non-latin characters
  // entirely, so a title like "???" yields "". Fall back to a stable prefix so
  // the collision loop below has something to suffix.
  const base = generateSlug(title) || "article"

  let slug = base
  let suffix = 2
  while (await articleRepository.slugExists(slug)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }
  return slug
}

/**
 * The <meta name="description"> fallback now that `excerpt` is gone (spec
 * §2.11). Derived at read time rather than stored, so it can never drift from
 * the body it summarizes.
 */
export function deriveMetaDescription(content: string): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links/images → their text
    .replace(/[#>*_`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (plain.length <= META_DESCRIPTION_LENGTH) return plain
  return `${plain.slice(0, META_DESCRIPTION_LENGTH - 3).trimEnd()}…`
}

/**
 * publishedAt is set the first time an article becomes published, and is never
 * cleared on unpublish — re-publishing preserves the original date, so
 * "unpublish to fix a typo" doesn't silently reorder the listing (spec §2.4).
 */
function resolvePublishedAt(
  nextStatus: string | undefined,
  currentStatus: string | undefined,
  currentPublishedAt: Date | null | undefined,
  explicit: Date | undefined,
): Date | undefined {
  if (explicit) return explicit
  if (nextStatus !== "published") return undefined
  if (currentStatus === "published") return undefined
  return currentPublishedAt ?? new Date()
}

export const articleService = {
  async listArticles(cursor: string | undefined, limit: number, filters: ListArticleFilters) {
    return cached(
      {
        namespace: ARTICLE_CACHE_NAMESPACE,
        key: `list:cursor=${cursor ?? "start"}:limit=${limit}:status=${filters.status ?? "any"}:tag=${filters.tag ?? "any"}`,
        ttlSeconds: CACHE_TTL.DEFAULT,
      },
      async () => {
        const rows = await articleRepository.findManyByCursor(cursor, limit, filters)
        const { data, nextCursor, hasMore } = toCursorResult(rows, limit)
        return { data: await attachCoverImages(data), nextCursor, hasMore }
      },
    )
  },

  /** Storefront read — published only, newest first (spec §4). */
  async listPublishedArticles(limit: number) {
    return cached(
      { namespace: ARTICLE_CACHE_NAMESPACE, key: `published:limit=${limit}`, ttlSeconds: CACHE_TTL.DEFAULT },
      async () => attachCoverImages(await articleRepository.findPublished(limit)),
    )
  },

  async getArticleById(id: string) {
    const article = await articleRepository.findById(id)
    if (!article) {
      throw ApiError.notFound(`Article with id "${id}" not found`)
    }

    const [withCover] = await attachCoverImages([article])
    return withCover
  },

  /**
   * Storefront detail read. Drafts 404 here; archived articles still resolve so
   * inbound links to retired content don't break (spec §2.8/§4.2).
   *
   * Increments the view counter fire-and-forget after the read: a counter write
   * must never block or fail a page view, and it deliberately does not bump the
   * cache — doing so would invalidate the article on every single read (§2.5).
   */
  async getArticleBySlug(slug: string) {
    const cachedArticle = await cached(
      { namespace: ARTICLE_CACHE_NAMESPACE, key: `slug:${slug}`, ttlSeconds: CACHE_TTL.LONG },
      async () => {
        const article = await articleRepository.findBySlug(slug)
        if (!article || article.status === "draft") return null

        const [withCover] = await attachCoverImages([article])
        return withCover
      },
    )

    if (!cachedArticle) {
      throw ApiError.notFound(`Article "${slug}" not found`)
    }

    // Detached on purpose. The .catch is required, not defensive: an unhandled
    // rejection from a floating promise terminates the process under Node's
    // default unhandledRejection behavior.
    void articleRepository
      .incrementViewCount(cachedArticle.id)
      .catch((err: Error) => console.error("[Article] view increment failed:", err.message))

    return cachedArticle
  },

  async createArticle(input: CreateArticleInput) {
    if (input.status !== "published" && input.publishedAt) {
      throw ApiError.badRequest("publishedAt can only be set on a published article")
    }

    const slug = await generateUniqueSlug(input.title)
    const publishedAt = resolvePublishedAt(input.status, undefined, null, input.publishedAt)

    const article = await articleRepository.create({
      ...input,
      slug,
      ...(publishedAt ? { publishedAt } : {}),
    })

    await bumpCacheVersion(ARTICLE_CACHE_NAMESPACE)

    // Freshly created — no cover can exist yet, since the upload needs this id.
    return { ...article, coverImage: null }
  },

  /**
   * The slug is NOT regenerated when the title changes: a published article's
   * URL is already in search indexes and inbound links, so silently rewriting
   * it would 404 every existing link (spec §2.10).
   */
  async updateArticle(id: string, input: UpdateArticleInput) {
    const existing = await articleRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Article with id "${id}" not found`)
    }

    const publishedAt = resolvePublishedAt(
      input.status,
      existing.status,
      existing.publishedAt,
      input.publishedAt,
    )

    const article = await articleRepository.update(id, {
      ...input,
      ...(publishedAt ? { publishedAt } : {}),
    })

    await bumpCacheVersion(ARTICLE_CACHE_NAMESPACE)

    const [withCover] = await attachCoverImages([article])
    return withCover
  },

  async upsertSeo(id: string, input: ArticleSeoInput) {
    const existing = await articleRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Article with id "${id}" not found`)
    }

    const seo = await articleRepository.upsertSeo(id, input)
    await bumpCacheVersion(ARTICLE_CACHE_NAMESPACE)
    return seo
  },

  /**
   * Replace-on-edit (spec §4.4a). The old Cloudinary asset is passed to the
   * worker as oldPublicId and destroyed only AFTER the new upload succeeds —
   * deleting it up front would leave the article with no image at all if the
   * replacement then failed.
   *
   * The old Image *row* is removed synchronously so the one-cover-per-article
   * invariant holds and the article never briefly shows two covers. The old
   * *asset* is not routed through enqueueImageDelete, which would race the
   * upload job and could destroy it before the replacement lands.
   */
  async replaceCover(id: string, localPath: string) {
    const existing = await articleRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Article with id "${id}" not found`)
    }

    const current = await articleRepository.findCoverByOwner(id)
    const image = await articleRepository.createCoverImage(id, localPath)

    if (current) {
      await articleRepository.deleteImageById(current.id)
    }

    await enqueueImageUpload({
      imageId: image.id,
      ownerType: "article_cover",
      ownerId: id,
      localPath,
      // Empty when the previous cover never finished uploading — nothing to
      // clean up in that case.
      ...(current?.publicId ? { oldPublicId: current.publicId } : {}),
    })

    await bumpCacheVersion(ARTICLE_CACHE_NAMESPACE)
    return toCoverImage(image)
  },

  /**
   * Image.ownerId has no FK (schema.prisma "Media" section), so deleting the
   * article alone would orphan its Image row and leave the Cloudinary asset
   * behind forever. Cleanup is the owning service's job (spec §4.5).
   * ArticleSeo cascades via a real FK and needs no handling here.
   */
  async deleteArticle(id: string) {
    const existing = await articleRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Article with id "${id}" not found`)
    }

    const publicIds = await articleRepository.deleteImagesByOwner(id)
    await articleRepository.delete(id)

    // After the DB rows are gone: a failed Cloudinary delete costs storage, but
    // must never block or roll back the deletion the admin asked for.
    await Promise.all(publicIds.map((publicId) => enqueueImageDelete({ publicId })))

    await bumpCacheVersion(ARTICLE_CACHE_NAMESPACE)
  },
}
