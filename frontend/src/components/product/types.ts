export type ProductBadge = "new" | "hot"

export interface ProductCardData {
  slug: string
  name: string
  imageUrl: string
  priceCents: number
  compareAtCents: number | null
  discountPercent: number | null
  sellerName: string | null
  isVerifiedSeller: boolean
  badge: ProductBadge | null
  soldCount: number | null
  stockCount: number | null
}
