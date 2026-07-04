import { prisma } from "../../shared/lib/prisma.js"
import type { CreateAnnouncementInput, UpdateAnnouncementInput } from "./announcement.types.js"

export const announcementRepository = {
  async findManyByCursor(cursor: string | undefined, limit: number) {
    return prisma.announcementBar.findMany({
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
      orderBy: { id: "asc" },
    })
  },

  async findById(id: string) {
    return prisma.announcementBar.findUnique({ where: { id } })
  },

  async findActive() {
    const now = new Date()
    return prisma.announcementBar.findFirst({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: { updatedAt: "desc" },
    })
  },

  async create(data: CreateAnnouncementInput) {
    return prisma.announcementBar.create({
      data: {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      },
    })
  },

  async update(id: string, data: UpdateAnnouncementInput) {
    return prisma.announcementBar.update({
      where: { id },
      data: {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      },
    })
  },

  async deactivateAllExcept(id: string) {
    return prisma.announcementBar.updateMany({
      where: { id: { not: id }, isActive: true },
      data: { isActive: false },
    })
  },

  async delete(id: string) {
    return prisma.announcementBar.delete({ where: { id } })
  },
}
