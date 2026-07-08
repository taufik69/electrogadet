export interface FlashSaleProductEntry {
  id: string
  salePriceCents: number
  sortOrder: number
  product: {
    id: string
    name: string
    slug: string
    imageUrl: string | null
    priceCents: number
    compareAtCents: number | null
  }
}

export interface FlashSale {
  id: string
  title: string
  startsAt: string
  endsAt: string
  isActive: boolean
  products: FlashSaleProductEntry[]
}
