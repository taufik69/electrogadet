import { ApiError } from "../../shared/helpers/ApiError.js"
import { toCursorResult } from "../../shared/utils/pagination.js"
import { cached, bumpCacheVersions } from "../../shared/utils/cache.js"
import { generateSlug } from "../../shared/utils/slug.js"
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
    const slug = generateSlug(input.name)
    const existing = await brandRepository.findBySlug(slug)
    if (existing) {
      throw ApiError.conflict(`A brand named "${input.name}" already exists`)
    }

    const brand = await brandRepository.create({ ...input, slug })
    await bumpCacheVersions(BRAND_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE)
    return brand
  },

  async updateBrand(id: string, input: UpdateBrandInput) {
    const existing = await brandRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Brand with id "${id}" not found`)
    }

    // Renaming re-derives the slug (confirmed intentional: storefront URLs
    // move with the rename rather than staying pinned to the original name).
    let slug: string | undefined
    if (input.name && input.name !== existing.name) {
      slug = generateSlug(input.name)
      const collision = await brandRepository.findBySlug(slug)
      if (collision && collision.id !== id) {
        throw ApiError.conflict(`A brand named "${input.name}" already exists`)
      }
    }

    const brand = await brandRepository.update(id, { ...input, ...(slug ? { slug } : {}) })
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
