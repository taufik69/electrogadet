import type { Category } from "@/features/category"

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
  // Joined from ProductCategory in backend product.repository.ts findById —
  // only present on single-product fetches, not list rows.
  categories?: { categoryId: string; category: Category }[]
  createdAt: string
  updatedAt: string
}

// Unlike brand/category, the backend does NOT derive product slugs from name
// (see backend/src/modules/product/product.service.ts — no generateSlug call)
// — slug is required from the client on create and is immutable after that.
export interface CreateProductInput {
  name: string
  slug: string
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

export type UpdateProductInput = Partial<Omit<CreateProductInput, "slug">>
