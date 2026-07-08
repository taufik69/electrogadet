import { z } from "zod"
import { cursorPaginationSchema } from "../../shared/types/pagination.js"

const booleanFromFormData = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) => value === true || value === "true")

function refineSingleLinkTarget<T extends { productId?: string; categoryId?: string }>(schema: z.ZodType<T>) {
  return schema.refine((data) => !(data.productId && data.categoryId), {
    message: "A banner can link to a product or a category, not both",
    path: ["categoryId"],
  })
}

export const createBannerSchema = refineSingleLinkTarget(
  z.object({
    title: z.string().min(1),
    productId: z.string().optional(),
    categoryId: z.string().optional(),
    isActive: booleanFromFormData.default(true),
    sortOrder: z.coerce.number().int().default(0),
  }),
)

export const updateBannerSchema = refineSingleLinkTarget(
  z.object({
    title: z.string().min(1).optional(),
    productId: z.string().optional(),
    categoryId: z.string().optional(),
    isActive: booleanFromFormData.optional(),
    sortOrder: z.coerce.number().int().optional(),
  }),
)

export const listBannersQuerySchema = cursorPaginationSchema
