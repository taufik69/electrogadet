import { ApiError } from "../../shared/helpers/ApiError.js"
import { bumpCacheVersion } from "../../shared/utils/cache.js"
import { enqueueImageDelete, enqueueImageUpload } from "../../shared/queues/image.queue.js"
import { imageRepository } from "./image.repository.js"
import { IMAGE_CACHE_NAMESPACE } from "./image.constant.js"
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
