import { z } from "zod"
import { cursorPaginationSchema } from "../../shared/types/pagination.js"

export const createAnnouncementSchema = z.object({
  message: z.string().min(1),
  linkUrl: z.string().url().optional(),
  linkText: z.string().min(1).optional(),
  isActive: z.boolean().optional().default(false),
})

export const updateAnnouncementSchema = createAnnouncementSchema.partial()

export const listAnnouncementsQuerySchema = cursorPaginationSchema
