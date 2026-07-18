import { prisma } from "../../shared/lib/prisma.js"
import type { CreateProductInput, UpdateProductInput, UpsertProductSeoInput } from "./product.types.js"

export const productRepository = {
  async findManyByCursor(
    cursor: string | undefined,
    limit: number,
    filters: { brandId?: string; includeInactive: boolean },
  ) {
    return prisma.product.findMany({
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: {
        ...(filters.brandId ? { brandId: filters.brandId } : {}),
        ...(filters.includeInactive ? {} : { isActive: true }),
      },
      take: limit + 1,
      orderBy: { id: "asc" },
    })
  },

  async findById(id: string) {
    return prisma.product.findUnique({ where: { id }, include: { seo: true } })
  },

  async findBySlug(slug: string) {
    return prisma.product.findUnique({ where: { slug } })
  },

  async create(data: CreateProductInput) {
    return prisma.product.create({ data })
  },

  async update(id: string, data: UpdateProductInput) {
    return prisma.product.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.product.delete({ where: { id } })
  },

  async upsertSeo(productId: string, data: UpsertProductSeoInput) {
    return prisma.productSeo.upsert({
      where: { productId },
      create: { productId, ...data },
      update: data,
    })
  },
}
