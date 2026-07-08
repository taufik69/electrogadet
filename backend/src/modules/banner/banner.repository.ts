import { prisma } from "../../shared/lib/prisma.js"
import type { CreateBannerInput, UpdateBannerInput } from "./banner.types.js"

const linkInclude = {
  product: { select: { id: true, name: true, slug: true } },
  category: { select: { id: true, name: true, slug: true } },
} as const

export const bannerRepository = {
  async findManyByCursor(cursor: string | undefined, limit: number) {
    return prisma.banner.findMany({
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
      orderBy: { id: "asc" },
      include: linkInclude,
    })
  },

  async findActive() {
    return prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: linkInclude,
    })
  },

  async findById(id: string) {
    return prisma.banner.findUnique({ where: { id }, include: linkInclude })
  },

  async create(data: CreateBannerInput) {
    return prisma.banner.create({ data, include: linkInclude })
  },

  async update(id: string, data: UpdateBannerInput) {
    return prisma.banner.update({ where: { id }, data, include: linkInclude })
  },

  async delete(id: string) {
    return prisma.banner.delete({ where: { id } })
  },
}
