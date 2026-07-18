import { z } from "zod"
import { cursorPaginationSchema } from "../../shared/types/pagination.js"

// slug is never accepted from the client — category.service.ts derives it
// from `name` via slugify, same as brand.service.ts. brandId is immutable
// after creation: moving a category between brands is a delete+recreate,
// not an update (its slug uniqueness is scoped to (brandId, slug)).
export const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  brandId: z.string().min(1),
  parentId: z.string().min(1).optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
})

export const updateCategorySchema = createCategorySchema.omit({ brandId: true }).partial()

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
