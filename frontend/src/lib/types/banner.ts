export interface BannerLinkTarget {
  id: string
  name: string
  slug: string
}

export interface Banner {
  id: string
  title: string
  imageUrl: string | null
  productId: string | null
  categoryId: string | null
  product: BannerLinkTarget | null
  category: BannerLinkTarget | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}
