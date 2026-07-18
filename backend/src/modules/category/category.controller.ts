import type { Request, Response } from "express"
import { ApiResponse } from "../../shared/helpers/apiResponse.js"
import { ApiError } from "../../shared/helpers/ApiError.js"
import { categoryService } from "./category.service.js"
import {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesQuerySchema,
  reorderCategoriesSchema,
  attachProductSchema,
  reorderCategoryProductsSchema,
} from "./category.validation.js"

export const categoryController = {
  async list(req: Request, res: Response) {
    const parsed = listCategoriesQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid query params", parsed.error.flatten())
    }

    const { cursor, limit, brandId, parentId, includeInactive } = parsed.data
    const { data, nextCursor, hasMore } = await categoryService.listCategories(cursor, limit, {
      brandId,
      parentId,
      includeInactive,
    })

    ApiResponse.success(res, {
      message: "Fetched successfully",
      data,
      meta: { nextCursor, hasMore },
    })
  },

  async getById(req: Request<{ id: string }>, res: Response) {
    const category = await categoryService.getCategoryById(req.params.id)
    ApiResponse.success(res, { message: "Fetched successfully", data: category })
  },

  async create(req: Request, res: Response) {
    const parsed = createCategorySchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid category payload", parsed.error.flatten())
    }

    const category = await categoryService.createCategory(parsed.data)
    ApiResponse.success(res, { statusCode: 201, message: "Category created", data: category })
  },

  async update(req: Request<{ id: string }>, res: Response) {
    const parsed = updateCategorySchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid category payload", parsed.error.flatten())
    }

    const category = await categoryService.updateCategory(req.params.id, parsed.data)
    ApiResponse.success(res, { message: "Category updated", data: category })
  },

  async remove(req: Request<{ id: string }>, res: Response) {
    await categoryService.deleteCategory(req.params.id)
    ApiResponse.success(res, { message: "Category deleted", data: null })
  },

  async reorder(req: Request, res: Response) {
    const parsed = reorderCategoriesSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid reorder payload", parsed.error.flatten())
    }

    await categoryService.reorderCategories(parsed.data.items)
    ApiResponse.success(res, { message: "Categories reordered", data: null })
  },

  async attachProduct(req: Request<{ id: string }>, res: Response) {
    const parsed = attachProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid attach-product payload", parsed.error.flatten())
    }

    const link = await categoryService.attachProduct(req.params.id, parsed.data)
    ApiResponse.success(res, { statusCode: 201, message: "Product attached to category", data: link })
  },

  async detachProduct(req: Request<{ id: string; productId: string }>, res: Response) {
    await categoryService.detachProduct(req.params.id, req.params.productId)
    ApiResponse.success(res, { message: "Product detached from category", data: null })
  },

  async reorderProducts(req: Request<{ id: string }>, res: Response) {
    const parsed = reorderCategoryProductsSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid reorder payload", parsed.error.flatten())
    }

    await categoryService.reorderCategoryProducts(req.params.id, parsed.data.items)
    ApiResponse.success(res, { message: "Category products reordered", data: null })
  },
}
