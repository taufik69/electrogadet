import { prisma } from "../../shared/lib/prisma.js"
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.types.js"

export const categoryRepository = {
  async findManyByCursor(cursor: string | undefined, limit: number) {
    return prisma.category.findMany({
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
      orderBy: { id: "asc" },
    })
  },

  async findById(id: string) {
    return prisma.category.findUnique({ where: { id } })
  },

  async findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } })
  },

  async findTree() {
    return prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: { children: { orderBy: { sortOrder: "asc" } } },
    })
  },

  async create(data: CreateCategoryInput) {
    return prisma.category.create({ data })
  },

  async update(id: string, data: UpdateCategoryInput) {
    return prisma.category.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.category.delete({ where: { id } })
  },
}
