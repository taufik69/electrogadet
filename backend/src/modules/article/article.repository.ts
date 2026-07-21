import { prisma } from "../../shared/lib/prisma.js"
import type { Prisma } from "../../generated/prisma/client.js"
import type { ArticleSeoInput, CreateArticleInput, ListArticleFilters, UpdateArticleInput } from "./article.types.js"

/**
 * `content` is deliberately excluded from every list read (spec §4.3a): a page
 * of 20 articles would otherwise ship 20 full Markdown bodies to render three
 * lines of card text. Only the two single-article reads include it.
 */
const listSelect = {
  id: true,
  title: true,
  slug: true,
  authorName: true,
  tags: true,
  status: true,
  publishedAt: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ArticleSelect

function buildWhere(filters: ListArticleFilters): Prisma.ArticleWhereInput {
  return {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.tag ? { tags: { has: filters.tag } } : {}),
  }
}

export const articleRepository = {
  async findManyByCursor(cursor: string | undefined, limit: number, filters: ListArticleFilters) {
    return prisma.article.findMany({
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: buildWhere(filters),
      select: listSelect,
      take: limit + 1,
      // Cursor pagination needs a stable tiebreaker — createdAt alone isn't
      // unique, so two articles created in the same millisecond could repeat
      // or vanish across pages.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    })
  },

  /**
   * Storefront read (spec §4): published only, newest-published first.
   * Ordered by publishedAt, not createdAt — an article drafted in March and
   * published in June belongs at the June position.
   */
  async findPublished(limit: number) {
    return prisma.article.findMany({
      where: { status: "published" },
      select: listSelect,
      take: limit,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    })
  },

  async findById(id: string) {
    return prisma.article.findUnique({ where: { id }, include: { seo: true } })
  },

  /** Storefront detail read. Drafts are invisible here; archived still resolve (spec §4.2). */
  async findBySlug(slug: string) {
    return prisma.article.findUnique({ where: { slug }, include: { seo: true } })
  },

  /** Slug-collision probe for generateUniqueSlug — id only, no payload needed. */
  async slugExists(slug: string) {
    const row = await prisma.article.findUnique({ where: { slug }, select: { id: true } })
    return row !== null
  },

  async create(data: CreateArticleInput & { slug: string }) {
    return prisma.article.create({ data, include: { seo: true } })
  },

  async update(id: string, data: UpdateArticleInput & { publishedAt?: Date | null }) {
    return prisma.article.update({ where: { id }, data, include: { seo: true } })
  },

  async delete(id: string) {
    return prisma.article.delete({ where: { id } })
  },

  /**
   * Fire-and-forget from the service (spec §4.7). Deliberately does not touch
   * the cache — bumping here would invalidate the article on every read.
   */
  async incrementViewCount(id: string) {
    return prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { id: true },
    })
  },

  async upsertSeo(articleId: string, data: ArticleSeoInput) {
    const payload = data as Prisma.ArticleSeoUpdateInput
    return prisma.articleSeo.upsert({
      where: { articleId },
      create: { ...(payload as Prisma.ArticleSeoCreateInput), article: { connect: { id: articleId } } },
      update: payload,
    })
  },

  /**
   * Reads Image directly rather than importing the image module — cross-module
   * imports are forbidden by ARCHITECTURE.md §5, and product/banner
   * repositories set the precedent for this kind of read-only join.
   */
  async findImagesByOwners(ownerIds: string[]) {
    return prisma.image.findMany({
      where: { ownerType: "article_cover", ownerId: { in: ownerIds } },
      orderBy: { sortOrder: "asc" },
    })
  },

  async findCoverByOwner(ownerId: string) {
    return prisma.image.findFirst({
      where: { ownerType: "article_cover", ownerId },
      orderBy: { sortOrder: "asc" },
    })
  },

  async createCoverImage(ownerId: string, localPath: string) {
    return prisma.image.create({
      data: { ownerType: "article_cover", ownerId, localPath, status: "pending" },
    })
  },

  async deleteImageById(id: string) {
    return prisma.image.delete({ where: { id } })
  },

  /**
   * Deletes an article's Image rows and returns their publicIds so the service
   * can enqueue Cloudinary cleanup (spec §4.5). Empty publicIds are filtered
   * out — a still-pending image was never uploaded, so there is nothing to
   * delete and a job for "" would fail on every retry.
   */
  async deleteImagesByOwner(ownerId: string) {
    const images = await prisma.image.findMany({
      where: { ownerType: "article_cover", ownerId },
      select: { id: true, publicId: true },
    })

    if (images.length > 0) {
      await prisma.image.deleteMany({ where: { ownerType: "article_cover", ownerId } })
    }

    return images.map((img) => img.publicId).filter((publicId) => publicId !== "")
  },
}
