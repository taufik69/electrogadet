import type { BrandModel } from "../../generated/prisma/models.js"

export type Brand = BrandModel

export interface CreateBrandInput {
  name: string
  description?: string
  iconKey?: string
  imageUrl?: string
  isActive?: boolean
  sortOrder?: number
}

export type UpdateBrandInput = Partial<CreateBrandInput>

export interface ReorderBrandItem {
  id: string
  sortOrder: number
}
