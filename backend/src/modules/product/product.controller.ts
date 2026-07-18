import type { Request, Response } from "express"
import { ApiResponse } from "../../shared/helpers/apiResponse.js"
import { ApiError } from "../../shared/helpers/ApiError.js"
import { productService } from "./product.service.js"
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  upsertProductSeoSchema,
} from "./product.validation.js"

export const productController = {
  async list(req: Request, res: Response) {
    const parsed = listProductsQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid query params", parsed.error.flatten())
    }

    const { cursor, limit, brandId, includeInactive } = parsed.data
    const { data, nextCursor, hasMore } = await productService.listProducts(cursor, limit, {
      brandId,
      includeInactive,
    })

    ApiResponse.success(res, {
      message: "Fetched successfully",
      data,
      meta: { nextCursor, hasMore },
    })
  },

  async getById(req: Request<{ id: string }>, res: Response) {
    const product = await productService.getProductById(req.params.id)
    ApiResponse.success(res, { message: "Fetched successfully", data: product })
  },

  async create(req: Request, res: Response) {
    const parsed = createProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid product payload", parsed.error.flatten())
    }

    const product = await productService.createProduct(parsed.data)
    ApiResponse.success(res, { statusCode: 201, message: "Product created", data: product })
  },

  async update(req: Request<{ id: string }>, res: Response) {
    const parsed = updateProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid product payload", parsed.error.flatten())
    }

    const product = await productService.updateProduct(req.params.id, parsed.data)
    ApiResponse.success(res, { message: "Product updated", data: product })
  },

  async remove(req: Request<{ id: string }>, res: Response) {
    await productService.deleteProduct(req.params.id)
    ApiResponse.success(res, { message: "Product deleted", data: null })
  },

  async upsertSeo(req: Request<{ id: string }>, res: Response) {
    const parsed = upsertProductSeoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid SEO payload", parsed.error.flatten())
    }

    const seo = await productService.upsertProductSeo(req.params.id, parsed.data)
    ApiResponse.success(res, { message: "Product SEO saved", data: seo })
  },
}
