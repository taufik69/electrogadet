import type { Request, Response } from "express"
import { ApiResponse } from "../../shared/helpers/apiResponse.js"
import { ApiError } from "../../shared/helpers/ApiError.js"
import { flashSaleService } from "./flash-sale.service.js"
import {
  createFlashSaleSchema,
  updateFlashSaleSchema,
  listFlashSalesQuerySchema,
  addFlashSaleProductSchema,
  updateFlashSaleProductSchema,
} from "./flash-sale.validation.js"

export const flashSaleController = {
  async list(req: Request, res: Response) {
    const parsed = listFlashSalesQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid query params", parsed.error.flatten())
    }

    const { cursor, limit } = parsed.data
    const { data, nextCursor, hasMore } = await flashSaleService.listFlashSales(cursor, limit)

    ApiResponse.success(res, {
      message: "Fetched successfully",
      data,
      meta: { nextCursor, hasMore },
    })
  },

  async getActive(_req: Request, res: Response) {
    const flashSale = await flashSaleService.getActiveFlashSale()
    ApiResponse.success(res, { message: "Fetched successfully", data: flashSale ?? null })
  },

  async getById(req: Request<{ id: string }>, res: Response) {
    const flashSale = await flashSaleService.getFlashSaleById(req.params.id)
    ApiResponse.success(res, { message: "Fetched successfully", data: flashSale })
  },

  async create(req: Request, res: Response) {
    const parsed = createFlashSaleSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid flash sale payload", parsed.error.flatten())
    }

    const flashSale = await flashSaleService.createFlashSale(parsed.data)
    ApiResponse.success(res, { statusCode: 201, message: "Flash sale created", data: flashSale })
  },

  async update(req: Request<{ id: string }>, res: Response) {
    const parsed = updateFlashSaleSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid flash sale payload", parsed.error.flatten())
    }

    const flashSale = await flashSaleService.updateFlashSale(req.params.id, parsed.data)
    ApiResponse.success(res, { message: "Flash sale updated", data: flashSale })
  },

  async remove(req: Request<{ id: string }>, res: Response) {
    await flashSaleService.deleteFlashSale(req.params.id)
    ApiResponse.success(res, { message: "Flash sale deleted", data: null })
  },

  async addProduct(req: Request<{ id: string }>, res: Response) {
    const parsed = addFlashSaleProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid flash sale product payload", parsed.error.flatten())
    }

    const entry = await flashSaleService.addProduct(req.params.id, parsed.data)
    ApiResponse.success(res, { statusCode: 201, message: "Product added to flash sale", data: entry })
  },

  async updateProduct(req: Request<{ id: string; entryId: string }>, res: Response) {
    const parsed = updateFlashSaleProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid flash sale product payload", parsed.error.flatten())
    }

    const entry = await flashSaleService.updateProduct(req.params.id, req.params.entryId, parsed.data)
    ApiResponse.success(res, { message: "Flash sale product updated", data: entry })
  },

  async removeProduct(req: Request<{ id: string; entryId: string }>, res: Response) {
    await flashSaleService.removeProduct(req.params.id, req.params.entryId)
    ApiResponse.success(res, { message: "Product removed from flash sale", data: null })
  },
}
