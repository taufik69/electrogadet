import { prisma } from "../../shared/lib/prisma.js"
import type { CreateProductInput } from "./product.types.js"

export const productRepository = {
  async findManyByCursor(cursor: string | undefined, limit: number) {
    return prisma.product.findMany({
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
      orderBy: { id: "asc" },
    })
  },

  async findBySlug(slug: string) {
    return prisma.product.findUnique({ where: { slug } })
  },

  async create(data: CreateProductInput) {
    return prisma.product.create({ data })
  },
}
