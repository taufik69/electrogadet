import type { ProductModel, ProductSeoModel } from "../../generated/prisma/models.js"
import type { AvailabilityStatus, TwitterCard } from "../../generated/prisma/enums.js"
import type { Prisma } from "../../generated/prisma/client.js"

export type Product = ProductModel
export type ProductSeo = ProductSeoModel

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
  weightGrams?: number
  widthMm?: number
  heightMm?: number
  depthMm?: number
  brandId?: string
}

export type UpdateProductInput = Partial<CreateProductInput>

export interface UpsertProductSeoInput {
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  canonicalUrl?: string
  focusKeyword?: string
  ogTitle?: string
  ogDescription?: string
  twitterCard?: TwitterCard
  /** JSON-LD — validated only as "is JSON" at the zod boundary (product.validation.ts); Prisma's InputJsonValue is the actual write-time contract. */
  structuredData?: Prisma.InputJsonValue
  noIndex?: boolean
  noFollow?: boolean
}
