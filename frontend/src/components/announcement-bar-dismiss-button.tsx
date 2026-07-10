"use client"

import { X } from "lucide-react"

const STORAGE_KEY = "electrogadget-announcement-dismissed"

export function AnnouncementBarDismissButton({ announcementId }: { announcementId: string }) {
  return (
    <button
      type="button"
      aria-label="Dismiss announcement"
      onClick={() => {
        localStorage.setItem(STORAGE_KEY, announcementId)
        document.getElementById("announcement-bar")?.remove()
      }}
      className="ml-2 shrink-0 rounded-full p-1 transition-opacity hover:opacity-70"
    >
      <X size={16} />
    </button>
  )
}
