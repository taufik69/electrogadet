import type { Request, Response } from "express"
import { z } from "zod"
import { ApiResponse } from "../../shared/helpers/apiResponse.js"
import { ApiError } from "../../shared/helpers/ApiError.js"
import { articleService } from "./article.service.js"
import {
  createArticleSchema,
  updateArticleSchema,
  listArticlesQuerySchema,
  upsertArticleSeoSchema,
} from "./article.validation.js"

const publishedQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(3),
})

export const articleController = {
  async list(req: Request, res: Response) {
    const parsed = listArticlesQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid query params", parsed.error.flatten())
    }

    const { cursor, limit, status, tag } = parsed.data
    const { data, nextCursor, hasMore } = await articleService.listArticles(cursor, limit, { status, tag })

    ApiResponse.success(res, {
      message: "Fetched successfully",
      data,
      meta: { nextCursor, hasMore },
    })
  },

  async listPublished(req: Request, res: Response) {
    const parsed = publishedQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid query params", parsed.error.flatten())
    }

    const articles = await articleService.listPublishedArticles(parsed.data.limit)
    ApiResponse.success(res, { message: "Fetched successfully", data: articles })
  },

  async getBySlug(req: Request<{ slug: string }>, res: Response) {
    const article = await articleService.getArticleBySlug(req.params.slug)
    ApiResponse.success(res, { message: "Fetched successfully", data: article })
  },

  async getById(req: Request<{ id: string }>, res: Response) {
    const article = await articleService.getArticleById(req.params.id)
    ApiResponse.success(res, { message: "Fetched successfully", data: article })
  },

  async create(req: Request, res: Response) {
    const parsed = createArticleSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid article payload", parsed.error.flatten())
    }

    const article = await articleService.createArticle(parsed.data)
    ApiResponse.success(res, { statusCode: 201, message: "Article created", data: article })
  },

  async update(req: Request<{ id: string }>, res: Response) {
    const parsed = updateArticleSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid article payload", parsed.error.flatten())
    }

    const article = await articleService.updateArticle(req.params.id, parsed.data)
    ApiResponse.success(res, { message: "Article updated", data: article })
  },

  async upsertSeo(req: Request<{ id: string }>, res: Response) {
    const parsed = upsertArticleSeoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid SEO payload", parsed.error.flatten())
    }

    const seo = await articleService.upsertSeo(req.params.id, parsed.data)
    ApiResponse.success(res, { message: "SEO settings saved", data: seo })
  },

  /**
   * Multipart (field `file`), staged to disk by multer. Responds as soon as the
   * row is queued — Cloudinary hasn't been contacted yet, so the message says
   * "queued", not "uploaded" (spec §7.5).
   */
  async replaceCover(req: Request<{ id: string }>, res: Response) {
    if (!req.file) {
      throw ApiError.badRequest("A file is required")
    }

    const cover = await articleService.replaceCover(req.params.id, req.file.path)
    ApiResponse.success(res, { statusCode: 201, message: "Cover image queued for upload", data: cover })
  },

  async remove(req: Request<{ id: string }>, res: Response) {
    await articleService.deleteArticle(req.params.id)
    ApiResponse.success(res, { message: "Article deleted", data: null })
  },
}
