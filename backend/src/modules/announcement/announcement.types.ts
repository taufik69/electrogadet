import type { AnnouncementBarModel } from "../../generated/prisma/models.js"

export type AnnouncementBar = AnnouncementBarModel

export interface CreateAnnouncementInput {
  message: string
  linkUrl?: string
  linkText?: string
  isActive?: boolean
}

export type UpdateAnnouncementInput = Partial<CreateAnnouncementInput>
