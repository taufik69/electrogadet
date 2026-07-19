import { ApiError } from "../../shared/helpers/ApiError.js"
import { toCursorResult } from "../../shared/utils/pagination.js"
import { cached, bumpCacheVersions } from "../../shared/utils/cache.js"
import { generateSlug } from "../../shared/utils/slug.js"
import { CACHE_TTL } from "../../shared/constant/cache.js"
import { NAVIGATION_CACHE_NAMESPACE } from "../../shared/constant/namespaces.js"
import { productRepository } from "./product.repository.js"
import { PRODUCT_CACHE_NAMESPACE } from "./product.constant.js"
import type { CreateProductInput, UpdateProductInput, UpsertProductSeoInput } from "./product.types.js"
import type { ImageModel } from "../../generated/prisma/models.js"

/**
 * Product has no image column (see schema.prisma's "Media" section) — images
 * live in the polymorphic Image table with no real FK, so they're batched in
 * here and merged onto each product as `thumbnail`/`gallery` before the
 * response leaves the service, instead of leaving the dashboard to make a
 * separate /api/images call per product. Reads Image directly (not through
 * the image module) — cross-module imports are forbidden by ARCHITECTURE.md
 * §5; navigation.repository.ts sets the precedent for this kind of read.
 */
async function attachImages<T extends { id: string }>(products: T[]) {
  if (products.length === 0) return products as (T & { thumbnail: ImageModel | null; gallery: ImageModel[] })[]

  const ids = products.map((p) => p.id)
  const [thumbnails, galleryImages] = await Promise.all([
    productRepository.findImagesByOwners("product_thumbnail", ids),
    productRepository.findImagesByOwners("product_gallery", ids),
  ])

  const thumbnailByOwner = new Map(thumbnails.map((img) => [img.ownerId, img]))
  const galleryByOwner = new Map<string, ImageModel[]>()
  for (const img of galleryImages) {
    galleryByOwner.set(img.ownerId, [...(galleryByOwner.get(img.ownerId) ?? []), img])
  }

  return products.map((product) => ({
    ...product,
    thumbnail: thumbnailByOwner.get(product.id) ?? null,
    gallery: galleryByOwner.get(product.id) ?? [],
  }))
}

/**
 * Product slugs are globally unique (unlike category, which scopes uniqueness
 * per brand), so a same-named product collides more easily — append -2, -3, …
 * until free, instead of rejecting the create outright.
 */
async function generateUniqueSlug(name: string): Promise<string> {
  const base = generateSlug(name)
  let slug = base
  let suffix = 2
  while (await productRepository.findBySlug(slug)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }
  return slug
}

export const productService = {
  async listProducts(
    cursor: string | undefined,
    limit: number,
    filters: { brandId?: string; includeInactive: boolean },
  ) {
    return cached(
      {
        namespace: PRODUCT_CACHE_NAMESPACE,
        key: `list:cursor=${cursor ?? "start"}:limit=${limit}:brand=${filters.brandId ?? "any"}:inactive=${filters.includeInactive}`,
        ttlSeconds: CACHE_TTL.DEFAULT,
      },
      async () => {
        const rows = await productRepository.findManyByCursor(cursor, limit, filters)
        const { data, nextCursor, hasMore } = toCursorResult(rows, limit)
        return { data: await attachImages(data), nextCursor, hasMore }
      },
    )
  },

  async getProductById(id: string) {
    const product = await productRepository.findById(id)
    if (!product) {
      throw ApiError.notFound(`Product with id "${id}" not found`)
    }
    const [withImages] = await attachImages([product])
    return withImages
  },

  async createProduct(input: CreateProductInput) {
    const slug = await generateUniqueSlug(input.name)
    const product = await productRepository.create({ ...input, slug })
    await bumpCacheVersions(PRODUCT_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE)
    return product
  },

  async updateProduct(id: string, input: UpdateProductInput) {
    const existing = await productRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Product with id "${id}" not found`)
    }

    const product = await productRepository.update(id, input)
    await bumpCacheVersions(PRODUCT_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE)
    return product
  },

  async deleteProduct(id: string) {
    const existing = await productRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Product with id "${id}" not found`)
    }

    await productRepository.delete(id)
    await bumpCacheVersions(PRODUCT_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE)
  },

  async upsertProductSeo(productId: string, input: UpsertProductSeoInput) {
    const existing = await productRepository.findById(productId)
    if (!existing) {
      throw ApiError.notFound(`Product with id "${productId}" not found`)
    }

    const seo = await productRepository.upsertSeo(productId, input)
    // SEO fields aren't read by the sidebar or navigation tree — only the
    // product's own cache needs invalidating, not "navigation".
    await bumpCacheVersions(PRODUCT_CACHE_NAMESPACE)
    return seo
  },
}
