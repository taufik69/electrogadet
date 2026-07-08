export interface AnnouncementBar {
  id: string
  message: string
  linkUrl: string | null
  linkText: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AnnouncementInput {
  message: string
  linkUrl?: string
  linkText?: string
  isActive?: boolean
}
