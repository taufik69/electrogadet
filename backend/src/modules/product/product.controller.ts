import type { Request, Response } from "express"
import { ApiResponse } from "../../shared/helpers/apiResponse.js"
import { ApiError } from "../../shared/helpers/ApiError.js"
import { productService } from "./product.service.js"
import { createProductSchema, listProductsQuerySchema } from "./product.validation.js"

export const productController = {
  async list(req: Request, res: Response) {
    const parsed = listProductsQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid query params", parsed.error.flatten())
    }

    const { cursor, limit } = parsed.data
    const { data, nextCursor, hasMore } = await productService.listProducts(cursor, limit)

    ApiResponse.success(res, {
      message: "Fetched successfully",
      data,
      meta: { nextCursor, hasMore },
    })
  },

  async create(req: Request, res: Response) {
    const parsed = createProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid product payload", parsed.error.flatten())
    }

    const product = await productService.createProduct(parsed.data)
    ApiResponse.success(res, { statusCode: 201, message: "Product created", data: product })
  },
}
