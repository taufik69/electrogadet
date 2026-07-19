import { z } from "zod"
import { cursorPaginationSchema } from "../../shared/types/pagination.js"

/**
 * Length caps are display-driven (spec §4.1): the title sits in a fixed 4/3
 * card over an image and the description is a single small line — longer
 * strings overflow the gradient overlay and look broken.
 */
export const createBannerSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(200),
  isActive: z.boolean().optional().default(true),
})

export const updateBannerSchema = createBannerSchema.partial()

export const listBannersQuerySchema = cursorPaginationSchema.extend({
  includeInactive: z.coerce.boolean().optional().default(false),
})
