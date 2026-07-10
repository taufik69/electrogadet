import Link from "next/link"
import { AnnouncementBarDismissButton } from "./announcement-bar-dismiss-button"
import type { AnnouncementBar as AnnouncementBarData } from "@/lib/types/announcement"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

async function getActiveAnnouncement(): Promise<AnnouncementBarData | null> {
  try {
    const res = await fetch(`${API_URL}/api/announcements/active`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const body = await res.json()
    return body.data ?? null
  } catch {
    return null
  }
}

export async function AnnouncementBar() {
  const announcement = await getActiveAnnouncement()
  if (!announcement) return null

  const style = announcement.backgroundColor
    ? { backgroundColor: announcement.backgroundColor }
    : undefined

  const content = (
    <span className="text-small-semibold">
      {announcement.message}
      {announcement.linkText && (
        <span className="ml-2 underline underline-offset-2">{announcement.linkText}</span>
      )}
    </span>
  )

  return (
    <>
      <script
        // Hides the bar before paint if the visitor already dismissed this exact announcement,
        // avoiding a flash of a bar that's about to be removed on mount.
        dangerouslySetInnerHTML={{
          __html: `(function(){var b=document.getElementById("announcement-bar");if(b&&localStorage.getItem("electromart-announcement-dismissed")===b.dataset.announcementId){b.remove()}})()`,
        }}
      />
      <div
        id="announcement-bar"
        data-announcement-id={announcement.id}
        className="flex items-center justify-center gap-2 bg-brand-primary px-4 py-2 text-center text-white"
        style={style}
      >
        {announcement.linkUrl ? (
          <Link
            href={announcement.linkUrl}
            target={announcement.linkUrl.startsWith("http") ? "_blank" : undefined}
            rel={announcement.linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {content}
          </Link>
        ) : (
          content
        )}
        <AnnouncementBarDismissButton announcementId={announcement.id} />
      </div>
    </>
  )
}
