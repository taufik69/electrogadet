import type { Brand } from "@/features/brand"
import type { Category } from "@/features/category"
import type { ImageRecord } from "../api/product-image.api"

export type AvailabilityStatus = "in_stock" | "out_of_stock" | "preorder"

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  priceCents: number
  compareAtCents: number | null
  isActive: boolean
  sku: string | null
  barcode: string | null
  rating: number
  ratingCount: number
  stock: number
  availabilityStatus: AvailabilityStatus
  warrantyInformation: string | null
  shippingInformation: string | null
  manufactureCountry: string | null
  tags: string[]
  weightGrams: number | null
  widthMm: number | null
  heightMm: number | null
  depthMm: number | null
  brandId: string | null
  // Populated server-side (product.service.ts) on both list and single-product
  // fetches — full joined objects, not just the ids above.
  brand: Brand | null
  categories: { categoryId: string; category: Category }[]
  thumbnail: ImageRecord | null
  gallery: ImageRecord[]
  // Only present on single-product fetches (product.repository.ts findById).
  seo?: ProductSeo | null
  createdAt: string
  updatedAt: string
}

// Like brand/category, the backend derives the slug from name server-side
// (backend/src/modules/product/product.service.ts generateUniqueSlug) — never
// sent by the client, and immutable after creation.
export interface CreateProductInput {
  name: string
  description?: string
  priceCents: number
  compareAtCents?: number
  isActive?: boolean
  sku?: string
  barcode?: string
  stock?: number
  availabilityStatus?: AvailabilityStatus
  warrantyInformation?: string
  shippingInformation?: string
  manufactureCountry?: string
  tags?: string[]
  brandId?: string
}

export type UpdateProductInput = Partial<CreateProductInput>

export interface ProductSeo {
  id: string
  productId: string
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string[]
  canonicalUrl: string | null
  focusKeyword: string | null
  ogTitle: string | null
  ogDescription: string | null
  twitterCard: "summary" | "summary_large_image" | "app" | "player" | null
  noIndex: boolean
  noFollow: boolean
}

export interface UpsertProductSeoInput {
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  canonicalUrl?: string
  focusKeyword?: string
  ogTitle?: string
  ogDescription?: string
  noIndex?: boolean
  noFollow?: boolean
}
