import { apiFetch } from "@/lib/api"
import type { AnnouncementBar, AnnouncementInput } from "./types"

export function fetchAnnouncements() {
  return apiFetch<AnnouncementBar[]>("/api/announcements?limit=50")
}

export function fetchActiveAnnouncement() {
  return apiFetch<AnnouncementBar | null>("/api/announcements/active")
}

export function fetchAnnouncementById(id: string) {
  return apiFetch<AnnouncementBar>(`/api/announcements/${id}`)
}

export function createAnnouncement(input: AnnouncementInput) {
  return apiFetch<AnnouncementBar>("/api/announcements", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateAnnouncement(id: string, input: Partial<AnnouncementInput>) {
  return apiFetch<AnnouncementBar>(`/api/announcements/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function deleteAnnouncement(id: string) {
  return apiFetch<null>(`/api/announcements/${id}`, { method: "DELETE" })
}
