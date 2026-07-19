import { z } from "zod"
import { ImageOwnerType } from "../../generated/prisma/enums.js"

/**
 * Derived from the Prisma enum rather than hand-listed: a hardcoded copy
 * silently rejects any newly-added owner type at the zod boundary until
 * someone remembers to update it here too (this is exactly how `banner`
 * initially 400'd after being added to schema.prisma).
 */
const ownerTypeSchema = z.enum(ImageOwnerType)

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
