import type { BrandModel } from "../../generated/prisma/models.js"

export type Brand = BrandModel

export interface CreateBrandInput {
  name: string
  slug: string
  iconKey?: string
  isActive?: boolean
  sortOrder?: number
}

export type UpdateBrandInput = Partial<CreateBrandInput>

export interface ReorderBrandItem {
  id: string
  sortOrder: number
}
