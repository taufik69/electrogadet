import { ApiError } from "../../shared/helpers/ApiError.js"
import { toCursorResult } from "../../shared/utils/pagination.js"
import { cached, bumpCacheVersions } from "../../shared/utils/cache.js"
import { CACHE_TTL } from "../../shared/constant/cache.js"
import { NAVIGATION_CACHE_NAMESPACE } from "../../shared/constant/namespaces.js"
import { brandRepository } from "./brand.repository.js"
import { BRAND_CACHE_NAMESPACE } from "./brand.constant.js"
import type { CreateBrandInput, ReorderBrandItem, UpdateBrandInput } from "./brand.types.js"

export const brandService = {
  async listBrands(cursor: string | undefined, limit: number, includeInactive: boolean) {
    return cached(
      {
        namespace: BRAND_CACHE_NAMESPACE,
        key: `list:cursor=${cursor ?? "start"}:limit=${limit}:inactive=${includeInactive}`,
        ttlSeconds: CACHE_TTL.DEFAULT,
      },
      async () => {
        const rows = await brandRepository.findManyByCursor(cursor, limit, includeInactive)
        return toCursorResult(rows, limit)
      },
    )
  },

  async getBrandById(id: string) {
    const brand = await brandRepository.findById(id)
    if (!brand) {
      throw ApiError.notFound(`Brand with id "${id}" not found`)
    }
    return brand
  },

  async createBrand(input: CreateBrandInput) {
    const existing = await brandRepository.findBySlug(input.slug)
    if (existing) {
      throw ApiError.conflict(`Brand with slug "${input.slug}" already exists`)
    }
    const brand = await brandRepository.create(input)
    await bumpCacheVersions(BRAND_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE)
    return brand
  },

  async updateBrand(id: string, input: UpdateBrandInput) {
    const existing = await brandRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Brand with id "${id}" not found`)
    }

    const brand = await brandRepository.update(id, input)
    await bumpCacheVersions(BRAND_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE)
    return brand
  },

  async deleteBrand(id: string) {
    const existing = await brandRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Brand with id "${id}" not found`)
    }

    await brandRepository.delete(id)
    await bumpCacheVersions(BRAND_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE)
  },

  async reorderBrands(items: ReorderBrandItem[]) {
    await brandRepository.reorder(items)
    await bumpCacheVersions(BRAND_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE)
  },
}
