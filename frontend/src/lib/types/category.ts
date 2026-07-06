export interface NavCategory {
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

export interface NavCategoryTreeNode extends NavCategory {
  children: NavCategory[]
}
