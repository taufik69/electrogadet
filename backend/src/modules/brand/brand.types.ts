import type { BrandModel } from "../../generated/prisma/models.js"

export type Brand = BrandModel

export interface CreateBrandInput {
  name: string
  image?: string
  isActive?: boolean
}

export type UpdateBrandInput = Partial<CreateBrandInput>
