import type { AnnouncementBarModel } from "../../generated/prisma/models.js"

export type AnnouncementBar = AnnouncementBarModel

export interface CreateAnnouncementInput {
  message: string
  linkUrl?: string
  linkText?: string
  isActive?: boolean
  startsAt?: string
  endsAt?: string
  backgroundColor?: string
}

export type UpdateAnnouncementInput = Partial<CreateAnnouncementInput>
