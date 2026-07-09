import { z } from "zod"
import { cursorPaginationSchema } from "../../shared/types/pagination.js"

const booleanFromFormData = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) => value === true || value === "true")

export const createBrandSchema = z.object({
  name: z.string().min(1),
  isActive: booleanFromFormData.default(true),
})

export const updateBrandSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: booleanFromFormData.optional(),
})

export const listBrandsQuerySchema = cursorPaginationSchema
