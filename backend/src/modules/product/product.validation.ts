import { z } from "zod"
import { cursorPaginationSchema } from "../../shared/types/pagination.js"

export const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  imageUrl: z.string().min(1).optional(),
  priceCents: z.number().int().nonnegative(),
  compareAtCents: z.number().int().nonnegative().optional(),
})

export const listProductsQuerySchema = cursorPaginationSchema
