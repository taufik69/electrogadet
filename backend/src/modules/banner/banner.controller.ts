import fs from "node:fs"
import type { Request, Response } from "express"
import { ApiResponse } from "../../shared/helpers/apiResponse.js"
import { ApiError } from "../../shared/helpers/ApiError.js"
import { bannerService } from "./banner.service.js"
import {
  createBannerSchema,
  updateBannerSchema,
  listBannersQuerySchema,
} from "./banner.validation.js"

function uploadedImageUrl(req: Request): string | undefined {
  if (!req.file) return undefined
  return `/public/uploads/banners/${req.file.filename}`
}

function cleanupUploadedFile(req: Request) {
  if (req.file) {
    fs.unlink(req.file.path, () => {})
  }
}

export const bannerController = {
  async list(req: Request, res: Response) {
    const parsed = listBannersQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid query params", parsed.error.flatten())
    }

    const { cursor, limit } = parsed.data
    const { data, nextCursor, hasMore } = await bannerService.listBanners(cursor, limit)

    ApiResponse.success(res, {
      message: "Fetched successfully",
      data,
      meta: { nextCursor, hasMore },
    })
  },

  async getActive(_req: Request, res: Response) {
    const banners = await bannerService.getActiveBanners()
    ApiResponse.success(res, { message: "Fetched successfully", data: banners })
  },

  async getById(req: Request<{ id: string }>, res: Response) {
    const banner = await bannerService.getBannerById(req.params.id)
    ApiResponse.success(res, { message: "Fetched successfully", data: banner })
  },

  async create(req: Request, res: Response) {
    const parsed = createBannerSchema.safeParse(req.body)
    if (!parsed.success) {
      cleanupUploadedFile(req)
      throw ApiError.badRequest("Invalid banner payload", parsed.error.flatten())
    }

    const imageUrl = uploadedImageUrl(req)
    const banner = await bannerService.createBanner({
      ...parsed.data,
      ...(imageUrl ? { imageUrl } : {}),
    })
    ApiResponse.success(res, { statusCode: 201, message: "Banner created", data: banner })
  },

  async update(req: Request<{ id: string }>, res: Response) {
    const parsed = updateBannerSchema.safeParse(req.body)
    if (!parsed.success) {
      cleanupUploadedFile(req)
      throw ApiError.badRequest("Invalid banner payload", parsed.error.flatten())
    }

    const imageUrl = uploadedImageUrl(req)
    const banner = await bannerService.updateBanner(req.params.id, {
      ...parsed.data,
      ...(imageUrl ? { imageUrl } : {}),
    })
    ApiResponse.success(res, { message: "Banner updated", data: banner })
  },

  async remove(req: Request<{ id: string }>, res: Response) {
    await bannerService.deleteBanner(req.params.id)
    ApiResponse.success(res, { message: "Banner deleted", data: null })
  },
}
