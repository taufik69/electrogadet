export interface AnnouncementBar {
  id: string
  message: string
  linkUrl: string | null
  linkText: string | null
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
  backgroundColor: string | null
  createdAt: string
  updatedAt: string
}
