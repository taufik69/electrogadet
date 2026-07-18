import { z } from "zod"
import { cursorPaginationSchema } from "../../shared/types/pagination.js"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(slugPattern, "Must be lowercase, hyphen-separated"),
  brandId: z.string().min(1),
  parentId: z.string().min(1).optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
})

// slug and brandId are immutable after creation — the slug is part of the
// (brandId, slug) uniqueness key and the sidebar URL contract; moving a
// category between brands is a delete+recreate, not an update.
export const updateCategorySchema = createCategorySchema
  .omit({ slug: true, brandId: true })
  .partial()

export const listCategoriesQuerySchema = cursorPaginationSchema.extend({
  brandId: z.string().min(1).optional(),
  parentId: z.string().min(1).optional(),
  includeInactive: z.coerce.boolean().optional().default(false),
})

export const reorderCategoriesSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.number().int().min(0),
      }),
    )
    .min(1),
})

export const attachProductSchema = z.object({
  productId: z.string().min(1),
  sortOrder: z.number().int().min(0).optional().default(0),
})

export const reorderCategoryProductsSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        sortOrder: z.number().int().min(0),
      }),
    )
    .min(1),
})
