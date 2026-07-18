import { prisma } from "../../shared/lib/prisma.js"
import type { ImageOwnerType } from "../../generated/prisma/enums.js"
import type { CreateImageInput, ReorderImageItem } from "./image.types.js"

export const imageRepository = {
  async findByOwner(ownerType: ImageOwnerType, ownerId: string) {
    return prisma.image.findMany({
      where: { ownerType, ownerId },
      orderBy: { sortOrder: "asc" },
    })
  },

  async findById(id: string) {
    return prisma.image.findUnique({ where: { id } })
  },

  async create(data: CreateImageInput) {
    return prisma.image.create({ data })
  },

  async update(id: string, data: { sortOrder?: number; alt?: string }) {
    return prisma.image.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.image.delete({ where: { id } })
  },

  async reorder(items: ReorderImageItem[]) {
    await prisma.$transaction(
      items.map((item) =>
        prisma.image.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } }),
      ),
    )
  },
}
