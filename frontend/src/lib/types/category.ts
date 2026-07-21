export interface Category {
  id: string
  name: string
  /** Unique per brand, not globally — "phones" exists under several brands. */
  slug: string
  description: string | null
  /** Nullable: the backend stores the column but nothing populates it yet. */
  imageUrl: string | null
  isActive: boolean
  sortOrder: number
  brandId: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}
