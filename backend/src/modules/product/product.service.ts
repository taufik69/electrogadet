import { ApiError } from "../../shared/helpers/ApiError.js"
import { toCursorResult } from "../../shared/utils/pagination.js"
import { cached, bumpCacheVersion } from "../../shared/utils/cache.js"
import { CACHE_TTL } from "../../shared/constant/cache.js"
import { productRepository } from "./product.repository.js"
import { PRODUCT_CACHE_NAMESPACE } from "./product.constant.js"
import type { CreateProductInput } from "./product.types.js"

export const productService = {
  async listProducts(cursor: string | undefined, limit: number) {
    return cached(
      {
        namespace: PRODUCT_CACHE_NAMESPACE,
        key: `list:cursor=${cursor ?? "start"}:limit=${limit}`,
        ttlSeconds: CACHE_TTL.DEFAULT,
      },
      async () => {
        const rows = await productRepository.findManyByCursor(cursor, limit)
        return toCursorResult(rows, limit)
      },
    )
  },

  async createProduct(input: CreateProductInput) {
    const existing = await productRepository.findBySlug(input.slug)
    if (existing) {
      throw ApiError.conflict(`Product with slug "${input.slug}" already exists`)
    }
    const product = await productRepository.create(input)
    await bumpCacheVersion(PRODUCT_CACHE_NAMESPACE)
    return product
  },
}
