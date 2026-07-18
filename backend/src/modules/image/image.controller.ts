import type { Request, Response } from "express"
import { ApiResponse } from "../../shared/helpers/apiResponse.js"
import { ApiError } from "../../shared/helpers/ApiError.js"
import { imageService } from "./image.service.js"
import { listImagesQuerySchema, updateImageSchema, reorderImagesSchema, createImageBodySchema } from "./image.validation.js"

export const imageController = {
  async list(req: Request, res: Response) {
    const parsed = listImagesQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid query params", parsed.error.flatten())
    }

    const images = await imageService.listByOwner(parsed.data.ownerType, parsed.data.ownerId)
    ApiResponse.success(res, { message: "Fetched successfully", data: images })
  },

  async create(req: Request, res: Response) {
    const parsed = createImageBodySchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid image payload", parsed.error.flatten())
    }
    if (!req.file) {
      throw ApiError.badRequest("A file is required")
    }

    const image = await imageService.createImage({
      ownerType: parsed.data.ownerType,
      ownerId: parsed.data.ownerId,
      localPath: req.file.path,
    })
    ApiResponse.success(res, { statusCode: 201, message: "Image queued for upload", data: image })
  },

  async update(req: Request<{ id: string }>, res: Response) {
    const parsed = updateImageSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid image payload", parsed.error.flatten())
    }

    const image = await imageService.updateImage(req.params.id, parsed.data)
    ApiResponse.success(res, { message: "Image updated", data: image })
  },

  async remove(req: Request<{ id: string }>, res: Response) {
    await imageService.deleteImage(req.params.id)
    ApiResponse.success(res, { message: "Image deleted", data: null })
  },

  async reorder(req: Request, res: Response) {
    const parsed = reorderImagesSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid reorder payload", parsed.error.flatten())
    }

    await imageService.reorderImages(parsed.data.items)
    ApiResponse.success(res, { message: "Images reordered", data: null })
  },
}
