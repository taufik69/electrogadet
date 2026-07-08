import type { BannerModel } from "../../generated/prisma/models.js"

export type Banner = BannerModel

export interface CreateBannerInput {
  title: string
  imageUrl?: string
  productId?: string
  categoryId?: string
  isActive?: boolean
  sortOrder?: number
}

export type UpdateBannerInput = Partial<CreateBannerInput>
