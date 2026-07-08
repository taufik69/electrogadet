import { prisma } from "../../shared/lib/prisma.js"
import type {
  CreateFlashSaleInput,
  UpdateFlashSaleInput,
  AddFlashSaleProductInput,
  UpdateFlashSaleProductInput,
} from "./flash-sale.types.js"

const withProducts = {
  products: {
    orderBy: { sortOrder: "asc" as const },
    include: { product: true },
  },
} as const

export const flashSaleRepository = {
  async findManyByCursor(cursor: string | undefined, limit: number) {
    return prisma.flashSale.findMany({
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
      orderBy: { id: "asc" },
    })
  },

  async findCurrentlyActive(now: Date) {
    return prisma.flashSale.findFirst({
      where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
      orderBy: { endsAt: "asc" },
      include: withProducts,
    })
  },

  async findById(id: string) {
    return prisma.flashSale.findUnique({ where: { id }, include: withProducts })
  },

  async create(data: CreateFlashSaleInput) {
    return prisma.flashSale.create({
      data: { ...data, startsAt: new Date(data.startsAt), endsAt: new Date(data.endsAt) },
    })
  },

  async update(id: string, data: UpdateFlashSaleInput) {
    return prisma.flashSale.update({
      where: { id },
      data: {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      },
    })
  },

  async delete(id: string) {
    return prisma.flashSale.delete({ where: { id } })
  },

  async findProductEntry(flashSaleId: string, productId: string) {
    return prisma.flashSaleProduct.findUnique({
      where: { flashSaleId_productId: { flashSaleId, productId } },
    })
  },

  async addProduct(flashSaleId: string, data: AddFlashSaleProductInput) {
    return prisma.flashSaleProduct.create({
      data: { flashSaleId, ...data },
      include: { product: true },
    })
  },

  async updateProduct(id: string, data: UpdateFlashSaleProductInput) {
    return prisma.flashSaleProduct.update({
      where: { id },
      data,
      include: { product: true },
    })
  },

  async removeProduct(id: string) {
    return prisma.flashSaleProduct.delete({ where: { id } })
  },

  async findProductEntryById(id: string) {
    return prisma.flashSaleProduct.findUnique({ where: { id } })
  },
}
