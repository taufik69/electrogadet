import type { FlashSaleModel, FlashSaleProductModel } from "../../generated/prisma/models.js"

export type FlashSale = FlashSaleModel
export type FlashSaleProduct = FlashSaleProductModel

export interface CreateFlashSaleInput {
  title: string
  startsAt: string
  endsAt: string
  isActive?: boolean
}

export type UpdateFlashSaleInput = Partial<CreateFlashSaleInput>

export interface AddFlashSaleProductInput {
  productId: string
  salePriceCents: number
  sortOrder?: number
}

export type UpdateFlashSaleProductInput = Partial<Omit<AddFlashSaleProductInput, "productId">>
