import type { ImageModel } from "../../generated/prisma/models.js"
import type { ImageOwnerType } from "../../generated/prisma/enums.js"

export type Image = ImageModel

export interface CreateImageInput {
  ownerType: ImageOwnerType
  ownerId: string
  localPath: string
  sortOrder?: number
  alt?: string
}

export interface ReorderImageItem {
  id: string
  sortOrder: number
}
