import fs from "node:fs"
import type { Request, Response } from "express"
import { ApiResponse } from "../../shared/helpers/apiResponse.js"
import { ApiError } from "../../shared/helpers/ApiError.js"
import { categoryService } from "./category.service.js"
import {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesQuerySchema,
} from "./category.validation.js"

function uploadedImageUrl(req: Request): string | undefined {
  if (!req.file) return undefined
  return `/public/uploads/categories/${req.file.filename}`
}

function cleanupUploadedFile(req: Request) {
  if (req.file) {
    fs.unlink(req.file.path, () => {})
  }
}

export const categoryController = {
  async list(req: Request, res: Response) {
    const parsed = listCategoriesQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid query params", parsed.error.flatten())
    }

    const { cursor, limit } = parsed.data
    const { data, nextCursor, hasMore } = await categoryService.listCategories(cursor, limit)

    ApiResponse.success(res, {
      message: "Fetched successfully",
      data,
      meta: { nextCursor, hasMore },
    })
  },

  async getTree(_req: Request, res: Response) {
    const tree = await categoryService.getNavTree()
    ApiResponse.success(res, { message: "Fetched successfully", data: tree })
  },

  async getById(req: Request<{ id: string }>, res: Response) {
    const category = await categoryService.getCategoryById(req.params.id)
    ApiResponse.success(res, { message: "Fetched successfully", data: category })
  },

  async create(req: Request, res: Response) {
    const parsed = createCategorySchema.safeParse(req.body)
    if (!parsed.success) {
      cleanupUploadedFile(req)
      throw ApiError.badRequest("Invalid category payload", parsed.error.flatten())
    }

    const imageUrl = uploadedImageUrl(req)
    const category = await categoryService.createCategory({
      ...parsed.data,
      ...(imageUrl ? { imageUrl } : {}),
    })
    ApiResponse.success(res, { statusCode: 201, message: "Category created", data: category })
  },

  async update(req: Request<{ id: string }>, res: Response) {
    const parsed = updateCategorySchema.safeParse(req.body)
    if (!parsed.success) {
      cleanupUploadedFile(req)
      throw ApiError.badRequest("Invalid category payload", parsed.error.flatten())
    }

    const imageUrl = uploadedImageUrl(req)
    const category = await categoryService.updateCategory(req.params.id, {
      ...parsed.data,
      ...(imageUrl ? { imageUrl } : {}),
    })
    ApiResponse.success(res, { message: "Category updated", data: category })
  },

  async remove(req: Request<{ id: string }>, res: Response) {
    await categoryService.deleteCategory(req.params.id)
    ApiResponse.success(res, { message: "Category deleted", data: null })
  },
}
