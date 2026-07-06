import { z } from "zod"
import { cursorPaginationSchema } from "../../shared/types/pagination.js"

const booleanFromFormData = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) => value === true || value === "true")

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  parentId: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isClearance: booleanFromFormData.default(false),
  showInMegaMenu: booleanFromFormData.default(true),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  parentId: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isClearance: booleanFromFormData.optional(),
  showInMegaMenu: booleanFromFormData.optional(),
})

export const listCategoriesQuerySchema = cursorPaginationSchema
