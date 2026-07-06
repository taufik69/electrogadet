export interface Category {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  parentId: string | null
  sortOrder: number
  isClearance: boolean
  showInMegaMenu: boolean
  createdAt: string
  updatedAt: string
}

export interface CategoryTreeNode extends Category {
  children: Category[]
}

export interface CategoryInput {
  name: string
  slug: string
  image?: File
  parentId?: string
  sortOrder?: number
  isClearance?: boolean
  showInMegaMenu?: boolean
}
