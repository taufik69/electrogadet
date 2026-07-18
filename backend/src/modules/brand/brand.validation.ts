import { z } from "zod"
import { cursorPaginationSchema } from "../../shared/types/pagination.js"
import { BRAND_ICON_KEYS } from "./brand.constant.js"

// slug is never accepted from the client — brand.service.ts derives it from
// `name` via slugify. Accepting a client-supplied slug here would let the
// dashboard bypass the server-side uniqueness/collision handling.
export const createBrandSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  iconKey: z.enum(BRAND_ICON_KEYS).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
})

export const updateBrandSchema = createBrandSchema.partial()

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
