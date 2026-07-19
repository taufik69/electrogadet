import { ApiError } from "../../shared/helpers/ApiError.js"
import { toCursorResult } from "../../shared/utils/pagination.js"
import { cached, bumpCacheVersion } from "../../shared/utils/cache.js"
import { CACHE_TTL } from "../../shared/constant/cache.js"
import { enqueueImageDelete } from "../../shared/queues/image.queue.js"
import { bannerRepository } from "./banner.repository.js"
import { BANNER_CACHE_NAMESPACE } from "./banner.constant.js"
import type { CreateBannerInput, UpdateBannerInput } from "./banner.types.js"
import type { ImageModel } from "../../generated/prisma/models.js"

type BannerWithImage<T> = T & { image: ImageModel | null }

/**
 * Banner has no imageUrl column (spec §2.1) — images live in the polymorphic
 * Image table, batched in here and merged onto each row before the response
 * leaves the service. Same approach as product.service.ts attachImages, so the
 * dashboard/storefront never need a separate /api/images call.
 *
 * `image` is always present as a key (null when absent, never omitted) so
 * consumers can rely on `banner.image?.status` (spec §4.3).
 */
async function attachImages<T extends { id: string }>(banners: T[]): Promise<BannerWithImage<T>[]> {
  if (banners.length === 0) return []

  const images = await bannerRepository.findImagesByOwners(banners.map((b) => b.id))
  const imageByOwner = new Map(images.map((img) => [img.ownerId, img]))

  return banners.map((banner) => ({ ...banner, image: imageByOwner.get(banner.id) ?? null }))
}

export const bannerService = {
  async listBanners(cursor: string | undefined, limit: number, filters: { includeInactive: boolean }) {
    return cached(
      {
        namespace: BANNER_CACHE_NAMESPACE,
        key: `list:cursor=${cursor ?? "start"}:limit=${limit}:inactive=${filters.includeInactive}`,
        ttlSeconds: CACHE_TTL.DEFAULT,
      },
      async () => {
        const rows = await bannerRepository.findManyByCursor(cursor, limit, filters)
        const { data, nextCursor, hasMore } = toCursorResult(rows, limit)
        return { data: await attachImages(data), nextCursor, hasMore }
      },
    )
  },

  /** Storefront read — active banners only, newest first (spec §4). */
  async listActiveBanners() {
    return cached(
      { namespace: BANNER_CACHE_NAMESPACE, key: "active", ttlSeconds: CACHE_TTL.DEFAULT },
      async () => attachImages(await bannerRepository.findActive()),
    )
  },

  async getBannerById(id: string) {
    const banner = await bannerRepository.findById(id)
    if (!banner) {
      throw ApiError.notFound(`Banner with id "${id}" not found`)
    }

    const [withImage] = await attachImages([banner])
    return withImage
  },

  async createBanner(input: CreateBannerInput) {
    const banner = await bannerRepository.create(input)
    await bumpCacheVersion(BANNER_CACHE_NAMESPACE)
    // Freshly created — no image can exist yet (the upload needs this id).
    return { ...banner, image: null }
  },

  async updateBanner(id: string, input: UpdateBannerInput) {
    const existing = await bannerRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Banner with id "${id}" not found`)
    }

    const banner = await bannerRepository.update(id, input)
    await bumpCacheVersion(BANNER_CACHE_NAMESPACE)

    const [withImage] = await attachImages([banner])
    return withImage
  },

  /**
   * Image.ownerId has no FK (schema.prisma "Media" section), so deleting the
   * banner alone would orphan its Image row and leave the Cloudinary asset
   * behind forever. Cleanup is the owning service's job (spec §4.4).
   */
  async deleteBanner(id: string) {
    const existing = await bannerRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Banner with id "${id}" not found`)
    }

    const publicIds = await bannerRepository.deleteImagesByOwner(id)
    await bannerRepository.delete(id)

    // After the DB rows are gone: a failed Cloudinary delete costs storage, but
    // must never block or roll back the banner deletion the admin asked for.
    await Promise.all(publicIds.map((publicId) => enqueueImageDelete({ publicId })))

    await bumpCacheVersion(BANNER_CACHE_NAMESPACE)
  },
}
