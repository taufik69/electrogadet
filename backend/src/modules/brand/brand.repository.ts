import { prisma } from "../../shared/lib/prisma.js"
import type { CreateBrandInput, ReorderBrandItem, UpdateBrandInput } from "./brand.types.js"

export const brandRepository = {
  async findManyByCursor(cursor: string | undefined, limit: number, includeInactive: boolean) {
    return prisma.brand.findMany({
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: includeInactive ? undefined : { isActive: true },
      take: limit + 1,
      orderBy: { id: "asc" },
    })
  },

  async findById(id: string) {
    return prisma.brand.findUnique({ where: { id } })
  },

  async findBySlug(slug: string) {
    return prisma.brand.findUnique({ where: { slug } })
  },

  async create(data: CreateBrandInput) {
    return prisma.brand.create({ data })
  },

  async update(id: string, data: UpdateBrandInput) {
    return prisma.brand.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.brand.delete({ where: { id } })
  },

  async reorder(items: ReorderBrandItem[]) {
    await prisma.$transaction(
      items.map((item) =>
        prisma.brand.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } }),
      ),
    )
  },
}
