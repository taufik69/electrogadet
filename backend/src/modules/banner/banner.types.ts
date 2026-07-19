import type { BannerModel } from "../../generated/prisma/models.js"

export type Banner = BannerModel

export interface CreateBannerInput {
  title: string
  description: string
  isActive?: boolean
}

export type UpdateBannerInput = Partial<CreateBannerInput>
