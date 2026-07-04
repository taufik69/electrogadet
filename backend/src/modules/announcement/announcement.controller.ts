import type { Request, Response } from "express"
import { ApiResponse } from "../../shared/helpers/apiResponse.js"
import { ApiError } from "../../shared/helpers/ApiError.js"
import { announcementService } from "./announcement.service.js"
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  listAnnouncementsQuerySchema,
} from "./announcement.validation.js"

export const announcementController = {
  async list(req: Request, res: Response) {
    const parsed = listAnnouncementsQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid query params", parsed.error.flatten())
    }

    const { cursor, limit } = parsed.data
    const { data, nextCursor, hasMore } = await announcementService.listAnnouncements(cursor, limit)

    ApiResponse.success(res, {
      message: "Fetched successfully",
      data,
      meta: { nextCursor, hasMore },
    })
  },

  async getActive(_req: Request, res: Response) {
    const announcement = await announcementService.getActiveAnnouncement()
    ApiResponse.success(res, { message: "Fetched successfully", data: announcement ?? null })
  },

  async getById(req: Request<{ id: string }>, res: Response) {
    const announcement = await announcementService.getAnnouncementById(req.params.id)
    ApiResponse.success(res, { message: "Fetched successfully", data: announcement })
  },

  async create(req: Request, res: Response) {
    const parsed = createAnnouncementSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid announcement payload", parsed.error.flatten())
    }

    const announcement = await announcementService.createAnnouncement(parsed.data)
    ApiResponse.success(res, { statusCode: 201, message: "Announcement created", data: announcement })
  },

  async update(req: Request<{ id: string }>, res: Response) {
    const parsed = updateAnnouncementSchema.safeParse(req.body)
    if (!parsed.success) {
      throw ApiError.badRequest("Invalid announcement payload", parsed.error.flatten())
    }

    const announcement = await announcementService.updateAnnouncement(req.params.id, parsed.data)
    ApiResponse.success(res, { message: "Announcement updated", data: announcement })
  },

  async remove(req: Request<{ id: string }>, res: Response) {
    await announcementService.deleteAnnouncement(req.params.id)
    ApiResponse.success(res, { message: "Announcement deleted", data: null })
  },
}
