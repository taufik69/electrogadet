import fs from "node:fs"
import path from "node:path"
import { Prisma } from "../../generated/prisma/client.js"
import { ApiError } from "../../shared/helpers/ApiError.js"
import { toCursorResult } from "../../shared/utils/pagination.js"
import { cached, bumpCacheVersion } from "../../shared/utils/cache.js"
import { CACHE_TTL } from "../../shared/constant/cache.js"
import { PUBLIC_DIR } from "../../shared/middlewares/upload.js"
import { bannerRepository } from "./banner.repository.js"
import { BANNER_CACHE_NAMESPACE } from "./banner.constant.js"
import type { CreateBannerInput, UpdateBannerInput } from "./banner.types.js"

function deleteImageFile(imageUrl: string | null) {
  if (!imageUrl || !imageUrl.startsWith("/public/")) return
  const filePath = path.join(PUBLIC_DIR, imageUrl.replace(/^\/public\//, ""))
  fs.unlink(filePath, () => {})
}

async function withLinkTargetCheck<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw ApiError.badRequest("The linked product or category does not exist")
    }
    throw error
  }
}

export const bannerService = {
  async listBanners(cursor: string | undefined, limit: number) {
    return cached(
      {
        namespace: BANNER_CACHE_NAMESPACE,
        key: `list:cursor=${cursor ?? "start"}:limit=${limit}`,
        ttlSeconds: CACHE_TTL.DEFAULT,
      },
      async () => {
        const rows = await bannerRepository.findManyByCursor(cursor, limit)
        return toCursorResult(rows, limit)
      },
    )
  },

  async getActiveBanners() {
    return cached(
      { namespace: BANNER_CACHE_NAMESPACE, key: "active", ttlSeconds: CACHE_TTL.SHORT },
      () => bannerRepository.findActive(),
    )
  },

  async getBannerById(id: string) {
    const banner = await bannerRepository.findById(id)
    if (!banner) {
      throw ApiError.notFound(`Banner with id "${id}" not found`)
    }
    return banner
  },

  async createBanner(input: CreateBannerInput) {
    const banner = await withLinkTargetCheck(() => bannerRepository.create(input))
    await bumpCacheVersion(BANNER_CACHE_NAMESPACE)
    return banner
  },

  async updateBanner(id: string, input: UpdateBannerInput) {
    const existing = await bannerRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Banner with id "${id}" not found`)
    }

    const banner = await withLinkTargetCheck(() => bannerRepository.update(id, input))
    if (input.imageUrl && existing.imageUrl && existing.imageUrl !== input.imageUrl) {
      deleteImageFile(existing.imageUrl)
    }
    await bumpCacheVersion(BANNER_CACHE_NAMESPACE)
    return banner
  },

  async deleteBanner(id: string) {
    const existing = await bannerRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Banner with id "${id}" not found`)
    }

    await bannerRepository.delete(id)
    deleteImageFile(existing.imageUrl)
    await bumpCacheVersion(BANNER_CACHE_NAMESPACE)
  },
}
