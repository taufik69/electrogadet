import { z } from "zod"
import { cursorPaginationSchema } from "../../shared/types/pagination.js"

export const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
})

export const listProductsQuerySchema = cursorPaginationSchema
