import type { CategoryModel } from "../../generated/prisma/models.js"

export type Category = CategoryModel

export type CategoryTree = Category & { children: Category[] }

export interface CreateCategoryInput {
  name: string
  slug: string
  imageUrl?: string
  parentId?: string
  sortOrder?: number
  isClearance?: boolean
  showInMegaMenu?: boolean
}

export interface UpdateCategoryInput {
  name?: string
  slug?: string
  imageUrl?: string
  parentId?: string
  sortOrder?: number
  isClearance?: boolean
  showInMegaMenu?: boolean
}
