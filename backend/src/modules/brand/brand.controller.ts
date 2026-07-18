import type { Request, Response } from "express"
import { ApiResponse } from "../../shared/helpers/apiResponse.js"
import { ApiError } from "../../shared/helpers/ApiError.js"
import { brandService } from "./brand.service.js"
import { createBrandSchema, updateBrandSchema, listBrandsQuerySchema, reorderBrandsSchema } from "./brand.validation.js"

export const brandController = {
  async list(req: Request, res: Response) {
    const parsed = listBrandsQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid query params", parsed.error.flatten())
    }

    const { cursor, limit, includeInactive } = parsed.data
    const { data, nextCursor, hasMore } = await brandService.listBrands(cursor, limit, includeInactive)

    ApiResponse.success(res, {
      message: "Fetched successfully",
      data,
      meta: { nextCursor, hasMore },
    })
  },

  async getById(req: Request<{ id: string }>, res: Response) {
    const brand = await brandService.getBrandById(req.params.id)
    ApiResponse.success(res, { message: "Fetched successfully", data: brand })
  },

  async create(req: Request, res: Response) {
    const parsed = createBrandSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid brand payload", parsed.error.flatten())
    }

    const brand = await brandService.createBrand(parsed.data)
    ApiResponse.success(res, { statusCode: 201, message: "Brand created", data: brand })
  },

  async update(req: Request<{ id: string }>, res: Response) {
    const parsed = updateBrandSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid brand payload", parsed.error.flatten())
    }

    const brand = await brandService.updateBrand(req.params.id, parsed.data)
    ApiResponse.success(res, { message: "Brand updated", data: brand })
  },

  async remove(req: Request<{ id: string }>, res: Response) {
    await brandService.deleteBrand(req.params.id)
    ApiResponse.success(res, { message: "Brand deleted", data: null })
  },

  async reorder(req: Request, res: Response) {
    const parsed = reorderBrandsSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid reorder payload", parsed.error.flatten())
    }

    await brandService.reorderBrands(parsed.data.items)
    ApiResponse.success(res, { message: "Brands reordered", data: null })
  },
}
