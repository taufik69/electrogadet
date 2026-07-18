import { z } from "zod"
import { cursorPaginationSchema } from "../../shared/types/pagination.js"
import { BRAND_ICON_KEYS } from "./brand.constant.js"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const createBrandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(slugPattern, "Must be lowercase, hyphen-separated"),
  iconKey: z.enum(BRAND_ICON_KEYS).optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
})

// Slug is immutable after creation (spec §9.4) — changing it would break live
// URLs (`/products?brand=<slug>`) with no redirect mechanism in place.
export const updateBrandSchema = createBrandSchema.omit({ slug: true }).partial()

export const listBrandsQuerySchema = cursorPaginationSchema.extend({
  includeInactive: z.coerce.boolean().optional().default(false),
})

export const reorderBrandsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.number().int().min(0),
      }),
    )
    .min(1),
})
