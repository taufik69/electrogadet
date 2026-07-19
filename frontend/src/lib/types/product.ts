export interface Product {
  id: string
  name: string
  slug: string
  priceCents: number
  compareAtCents?: number | null
  createdAt: string
  updatedAt: string
  /** Populated server-side (backend product.service.ts attachImages) — null until an upload finishes. */
  thumbnail?: { url: string; status: "pending" | "processing" | "uploaded" | "failed" } | null
  gallery?: { url: string; status: "pending" | "processing" | "uploaded" | "failed" }[]
}

/**
 * Display-only extension for fields the backend doesn't have yet (gallery,
 * rating, discount, badge, stock). Populated deterministically from local
 * placeholder data — see src/lib/data/product-display.ts — until the backend
 * grows real columns for these. `imageUrl` is narrowed to always be resolved.
 */
export interface ProductCardData extends Product {
  imageUrl: string
  /** Additional gallery images; when >1 the card shows a dots indicator. */
  imageUrls?: string[]
  rating?: number
  reviewCount?: number
  discountPercent?: number
  badge?: "new" | "bestseller" | null
  inStock?: boolean
}
