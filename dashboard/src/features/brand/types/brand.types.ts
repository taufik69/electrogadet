export interface Brand {
  id: string
  name: string
  /** Server-derived from name via slugify — never entered or edited directly. */
  slug: string
  description: string | null
  iconKey: string | null
  imageUrl: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// slug is never sent — the backend derives it from `name` (see
// backend/src/modules/brand/brand.service.ts generateSlug()). iconKey is
// still accepted by the backend but this dashboard's form no longer offers
// it; brand imagery is the uploaded photo instead.
export interface CreateBrandInput {
  name: string
  description?: string
  isActive?: boolean
  sortOrder?: number
}

export type UpdateBrandInput = Partial<CreateBrandInput>
