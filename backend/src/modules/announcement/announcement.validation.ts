import { z } from "zod"
import { cursorPaginationSchema } from "../../shared/types/pagination.js"

const hexColorPattern = /^#[0-9a-fA-F]{6}$/

export const createAnnouncementSchema = z.object({
  message: z.string().min(1),
  linkUrl: z.string().url().optional(),
  linkText: z.string().min(1).optional(),
  isActive: z.boolean().optional().default(false),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  backgroundColor: z.string().regex(hexColorPattern, "Must be a hex color like #RRGGBB").optional(),
})

export const updateAnnouncementSchema = createAnnouncementSchema.partial()

export const listAnnouncementsQuerySchema = cursorPaginationSchema
