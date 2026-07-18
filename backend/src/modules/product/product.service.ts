import { ApiError } from "../../shared/helpers/ApiError.js"
import { toCursorResult } from "../../shared/utils/pagination.js"
import { cached, bumpCacheVersions } from "../../shared/utils/cache.js"
import { CACHE_TTL } from "../../shared/constant/cache.js"
import { NAVIGATION_CACHE_NAMESPACE } from "../../shared/constant/namespaces.js"
import { productRepository } from "./product.repository.js"
import { PRODUCT_CACHE_NAMESPACE } from "./product.constant.js"
import type { CreateProductInput, UpdateProductInput, UpsertProductSeoInput } from "./product.types.js"

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
      () => productRepository.findManyByCursor(cursor, limit, filters).then((rows) => toCursorResult(rows, limit)),
    )
  },

  async getProductById(id: string) {
    const product = await productRepository.findById(id)
    if (!product) {
      throw ApiError.notFound(`Product with id "${id}" not found`)
    }
    return product
  },

  async createProduct(input: CreateProductInput) {
    const existing = await productRepository.findBySlug(input.slug)
    if (existing) {
      throw ApiError.conflict(`Product with slug "${input.slug}" already exists`)
    }

    const product = await productRepository.create(input)
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
