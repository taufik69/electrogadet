import type { CategoryModel } from "../../generated/prisma/models.js"

export type Category = CategoryModel

export interface CreateCategoryInput {
  name: string
  slug: string
  brandId: string
  parentId?: string
  isActive?: boolean
  sortOrder?: number
}

export type UpdateCategoryInput = Partial<Omit<CreateCategoryInput, "brandId">>

export interface ReorderCategoryItem {
  id: string
  sortOrder: number
}

export interface AttachProductInput {
  productId: string
  sortOrder?: number
}

export interface ReorderCategoryProductItem {
  productId: string
  sortOrder: number
}
