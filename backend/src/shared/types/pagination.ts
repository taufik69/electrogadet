import { z } from "zod"

export const offsetPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

export type OffsetPaginationQuery = z.infer<typeof offsetPaginationSchema>
export type CursorPaginationQuery = z.infer<typeof cursorPaginationSchema>
