import { prisma } from "../../shared/lib/prisma.js"
import type { CreateBrandInput, UpdateBrandInput } from "./brand.types.js"

export const brandRepository = {
  async findManyByCursor(cursor: string | undefined, limit: number) {
    return prisma.brand.findMany({
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
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

  async create(data: CreateBrandInput & { slug: string }) {
    return prisma.brand.create({ data })
  },

  async update(id: string, data: UpdateBrandInput & { slug?: string }) {
    return prisma.brand.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.brand.delete({ where: { id } })
  },
}
