export interface Category {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  isActive: boolean
  sortOrder: number
  brandId: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryInput {
  name: string
  slug: string
  brandId: string
  parentId?: string
  isActive?: boolean
  sortOrder?: number
}

// slug and brandId are immutable after creation — the backend rejects both on
// update (spec §9.4: slug is part of the (brandId, slug) uniqueness key and
// the sidebar URL contract; moving brands is delete+recreate, not an update).
export type UpdateCategoryInput = Partial<Omit<CreateCategoryInput, "slug" | "brandId">>
