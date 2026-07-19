import { prisma } from "../../shared/lib/prisma.js"
import type { CreateBannerInput, UpdateBannerInput } from "./banner.types.js"

export const bannerRepository = {
  async findManyByCursor(cursor: string | undefined, limit: number, filters: { includeInactive: boolean }) {
    return prisma.banner.findMany({
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: filters.includeInactive ? {} : { isActive: true },
      take: limit + 1,
      // Cursor pagination needs a stable tiebreaker — createdAt alone isn't
      // unique, so two banners created in the same millisecond could repeat or
      // vanish across pages.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    })
  },

  /** Storefront read (spec §4): active only, newest first, unpaginated. */
  async findActive() {
    return prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    })
  },

  async findById(id: string) {
    return prisma.banner.findUnique({ where: { id } })
  },

  async create(data: CreateBannerInput) {
    return prisma.banner.create({ data })
  },

  async update(id: string, data: UpdateBannerInput) {
    return prisma.banner.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.banner.delete({ where: { id } })
  },

  /**
   * Reads Image directly rather than importing the image module — cross-module
   * imports are forbidden by ARCHITECTURE.md §5, and product.repository.ts
   * (findImagesByOwners) sets the precedent for this kind of read-only join.
   */
  async findImagesByOwners(ownerIds: string[]) {
    return prisma.image.findMany({
      where: { ownerType: "banner", ownerId: { in: ownerIds } },
      orderBy: { sortOrder: "asc" },
    })
  },

  /** Deletes a banner's Image rows and returns their publicIds so the service can enqueue Cloudinary cleanup (spec §4.4). */
  async deleteImagesByOwner(ownerId: string) {
    const images = await prisma.image.findMany({
      where: { ownerType: "banner", ownerId },
      select: { id: true, publicId: true },
    })

    if (images.length > 0) {
      await prisma.image.deleteMany({ where: { ownerType: "banner", ownerId } })
    }

    return images.map((img) => img.publicId).filter((publicId) => publicId !== "")
  },
}
