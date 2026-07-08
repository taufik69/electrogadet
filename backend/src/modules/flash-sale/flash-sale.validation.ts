import { z } from "zod"
import { cursorPaginationSchema } from "../../shared/types/pagination.js"

export const createFlashSaleSchema = z.object({
  title: z.string().min(1),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  isActive: z.boolean().optional().default(true),
})

export const updateFlashSaleSchema = createFlashSaleSchema.partial()

export const listFlashSalesQuerySchema = cursorPaginationSchema

export const addFlashSaleProductSchema = z.object({
  productId: z.string().min(1),
  salePriceCents: z.number().int().nonnegative(),
  sortOrder: z.number().int().optional().default(0),
})

export const updateFlashSaleProductSchema = z.object({
  salePriceCents: z.number().int().nonnegative().optional(),
  sortOrder: z.number().int().optional(),
})
