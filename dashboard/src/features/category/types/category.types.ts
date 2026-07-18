export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  sortOrder: number
  brandId: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

// slug is never sent — the backend derives it from `name`, same as brand
// (see backend/src/modules/category/category.service.ts generateSlug usage).
// brandId is required on create (chosen via the form's brand dropdown) but
// immutable after creation — see UpdateCategoryInput below.
export interface CreateCategoryInput {
  name: string
  description?: string
  brandId: string
  parentId?: string
  isActive?: boolean
  sortOrder?: number
}

export type UpdateCategoryInput = Partial<Omit<CreateCategoryInput, "brandId">>
