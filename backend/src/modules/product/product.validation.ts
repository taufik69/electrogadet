import { z } from "zod"
import { cursorPaginationSchema } from "../../shared/types/pagination.js"
import type { Prisma } from "../../generated/prisma/client.js"

const availabilityStatusSchema = z.enum(["in_stock", "out_of_stock", "preorder"])
const twitterCardSchema = z.enum(["summary", "summary_large_image", "app", "player"])

// JSON-LD is genuinely schemaless (spec §2.3) — this only constrains the value
// to "valid JSON", matching Prisma's InputJsonValue, without opinion on shape.
const jsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.array(jsonValueSchema), z.record(z.string(), jsonValueSchema)]),
)

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().min(0),
  isActive: z.boolean().optional().default(true),
  sku: z.string().min(1).optional(),
  barcode: z.string().min(1),
  stock: z.number().int().min(0),
  availabilityStatus: availabilityStatusSchema.optional().default("in_stock"),
  warrantyInformation: z.string().optional(),
  shippingInformation: z.string().optional(),
  manufactureCountry: z.string().optional(),
  tags: z.array(z.string().trim().toLowerCase()).optional().default([]),
  weightGrams: z.number().int().min(0).optional(),
  widthMm: z.number().int().min(0).optional(),
  heightMm: z.number().int().min(0).optional(),
  depthMm: z.number().int().min(0).optional(),
  brandId: z.string().min(1).optional(),
})

// slug is server-generated and immutable — never accepted from the client,
// same rule as brand/category (spec §9.4).
export const updateProductSchema = createProductSchema.partial()

export const listProductsQuerySchema = cursorPaginationSchema.extend({
  brandId: z.string().min(1).optional(),
  includeInactive: z.coerce.boolean().optional().default(false),
})

export const upsertProductSeoSchema = z.object({
  metaTitle: z.string().min(1).max(70),
  metaDescription: z.string().min(1).max(200),
  metaKeywords: z.array(z.string().trim().toLowerCase()).optional(),
  canonicalUrl: z.string().url().optional(),
  focusKeyword: z.string().trim().toLowerCase().optional(),
  ogTitle: z.string().max(70).optional(),
  ogDescription: z.string().max(200).optional(),
  twitterCard: twitterCardSchema.optional(),
  structuredData: jsonValueSchema.optional(),
  noIndex: z.boolean().optional(),
  noFollow: z.boolean().optional(),
})
