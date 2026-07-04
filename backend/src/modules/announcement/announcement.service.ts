import { ApiError } from "../../shared/helpers/ApiError.js"
import { toCursorResult } from "../../shared/utils/pagination.js"
import { cached, bumpCacheVersion } from "../../shared/utils/cache.js"
import { CACHE_TTL } from "../../shared/constant/cache.js"
import { announcementRepository } from "./announcement.repository.js"
import { ANNOUNCEMENT_CACHE_NAMESPACE } from "./announcement.constant.js"
import type { CreateAnnouncementInput, UpdateAnnouncementInput } from "./announcement.types.js"

export const announcementService = {
  async listAnnouncements(cursor: string | undefined, limit: number) {
    return cached(
      {
        namespace: ANNOUNCEMENT_CACHE_NAMESPACE,
        key: `list:cursor=${cursor ?? "start"}:limit=${limit}`,
        ttlSeconds: CACHE_TTL.DEFAULT,
      },
      async () => {
        const rows = await announcementRepository.findManyByCursor(cursor, limit)
        return toCursorResult(rows, limit)
      },
    )
  },

  async getActiveAnnouncement() {
    return cached(
      {
        namespace: ANNOUNCEMENT_CACHE_NAMESPACE,
        key: "active",
        ttlSeconds: CACHE_TTL.SHORT,
      },
      () => announcementRepository.findActive(),
    )
  },

  async getAnnouncementById(id: string) {
    const announcement = await announcementRepository.findById(id)
    if (!announcement) {
      throw ApiError.notFound(`Announcement with id "${id}" not found`)
    }
    return announcement
  },

  async createAnnouncement(input: CreateAnnouncementInput) {
    const announcement = await announcementRepository.create(input)
    if (announcement.isActive) {
      await announcementRepository.deactivateAllExcept(announcement.id)
    }
    await bumpCacheVersion(ANNOUNCEMENT_CACHE_NAMESPACE)
    return announcement
  },

  async updateAnnouncement(id: string, input: UpdateAnnouncementInput) {
    const existing = await announcementRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Announcement with id "${id}" not found`)
    }

    const announcement = await announcementRepository.update(id, input)
    if (input.isActive) {
      await announcementRepository.deactivateAllExcept(id)
    }
    await bumpCacheVersion(ANNOUNCEMENT_CACHE_NAMESPACE)
    return announcement
  },

  async deleteAnnouncement(id: string) {
    const existing = await announcementRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Announcement with id "${id}" not found`)
    }

    await announcementRepository.delete(id)
    await bumpCacheVersion(ANNOUNCEMENT_CACHE_NAMESPACE)
  },
}
