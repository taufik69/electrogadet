import { z } from "zod"

const ownerTypeSchema = z.enum(["product_gallery", "product_thumbnail", "seo_og", "brand", "category"])

export const listImagesQuerySchema = z.object({
  ownerType: ownerTypeSchema,
  ownerId: z.string().min(1),
})

export const updateImageSchema = z.object({
  sortOrder: z.number().int().min(0).optional(),
  alt: z.string().optional(),
})

export const reorderImagesSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.number().int().min(0),
      }),
    )
    .min(1),
})

export const createImageBodySchema = z.object({
  ownerType: ownerTypeSchema,
  ownerId: z.string().min(1),
})
