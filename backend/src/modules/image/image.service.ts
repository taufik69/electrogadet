import { ApiError } from "../../shared/helpers/ApiError.js"
import { bumpCacheVersion } from "../../shared/utils/cache.js"
import { enqueueImageDelete, enqueueImageUpload } from "../../shared/queues/image.queue.js"
import { imageRepository } from "./image.repository.js"
import {
  IMAGE_CACHE_NAMESPACE,
  MAX_ARTICLE_COVER_IMAGES,
  MAX_BANNER_IMAGES,
  MAX_PRODUCT_GALLERY_IMAGES,
} from "./image.constant.js"
import type { ImageOwnerType } from "../../generated/prisma/enums.js"
import type { CreateImageInput, ReorderImageItem } from "./image.types.js"

export const imageService = {
  async listByOwner(ownerType: ImageOwnerType, ownerId: string) {
    return imageRepository.findByOwner(ownerType, ownerId)
  },

  /**
   * Creates the row as `pending` and enqueues the upload job — the response
   * returns immediately with a placeholder-worthy row; the worker fills
   * url/publicId asynchronously (spec §4.2b). Callers polling GET /api/images
   * see status flip through processing -> uploaded | failed.
   */
  async createImage(input: CreateImageInput) {
    if (input.ownerType === "product_gallery") {
      const count = await imageRepository.countByOwner(input.ownerType, input.ownerId)
      if (count >= MAX_PRODUCT_GALLERY_IMAGES) {
        throw ApiError.conflict(`A product's gallery cannot exceed ${MAX_PRODUCT_GALLERY_IMAGES} images`)
      }
    }

    // A banner carries exactly one image (banner spec §4.2). Replacing it is
    // delete-then-upload — the delete already enqueues Cloudinary cleanup.
    if (input.ownerType === "banner") {
      const count = await imageRepository.countByOwner(input.ownerType, input.ownerId)
      if (count >= MAX_BANNER_IMAGES) {
        throw ApiError.conflict("A banner can only have one image — delete the existing one first")
      }
    }

    // An article carries exactly one cover (article spec §4.4). Unlike banner,
    // replacement has a dedicated atomic endpoint — PUT /api/articles/:id/cover
    // — which swaps the row and hands the old publicId to the worker, so this
    // path is only ever the first upload.
    if (input.ownerType === "article_cover") {
      const count = await imageRepository.countByOwner(input.ownerType, input.ownerId)
      if (count >= MAX_ARTICLE_COVER_IMAGES) {
        throw ApiError.conflict("An article already has a cover image — use PUT /api/articles/:id/cover to replace it")
      }
    }

    const image = await imageRepository.create(input)
    await enqueueImageUpload({
      imageId: image.id,
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      localPath: input.localPath,
    })
    return image
  },

  async updateImage(id: string, data: { sortOrder?: number; alt?: string }) {
    const existing = await imageRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Image with id "${id}" not found`)
    }

    const image = await imageRepository.update(id, data)
    await bumpCacheVersion(IMAGE_CACHE_NAMESPACE)
    return image
  },

  async deleteImage(id: string) {
    const existing = await imageRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Image with id "${id}" not found`)
    }

    await imageRepository.delete(id)
    if (existing.publicId) {
      await enqueueImageDelete({ publicId: existing.publicId })
    }
    await bumpCacheVersion(IMAGE_CACHE_NAMESPACE)
  },

  async reorderImages(items: ReorderImageItem[]) {
    await imageRepository.reorder(items)
    await bumpCacheVersion(IMAGE_CACHE_NAMESPACE)
  },
}
