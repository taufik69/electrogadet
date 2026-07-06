import Link from "next/link";
import { Phone } from "lucide-react";
import { AnnouncementBarDismissButton } from "./announcement-bar-dismiss-button";
import type { AnnouncementBar as AnnouncementBarData } from "@/lib/types/announcement";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const HOTLINE_NUMBER = "+7 (495) 123-45-67";

async function getActiveAnnouncement(): Promise<AnnouncementBarData | null> {
  try {
    const res = await fetch(`${API_URL}/api/announcements/active`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.data ?? null;
  } catch {
    return null;
  }
}

export async function AnnouncementBar() {
  const announcement = await getActiveAnnouncement();
  if (!announcement) return null;

  const content = (
    <span className="text-small-semibold">
      {announcement.message}
      {announcement.linkText && (
        <span className="ml-2 underline underline-offset-2">
          {announcement.linkText}
        </span>
      )}
    </span>
  );

  const messageBlock = announcement.linkUrl ? (
    <Link
      href={announcement.linkUrl}
      target={announcement.linkUrl.startsWith("http") ? "_blank" : undefined}
      rel={
        announcement.linkUrl.startsWith("http")
          ? "noopener noreferrer"
          : undefined
      }
    >
      {content}
    </Link>
  ) : (
    content
  );

  const hotlineBlock = (
    <span className="text-small-semibold flex shrink-0 items-center gap-2">
      <Phone size={14} className="animate-pulse" aria-hidden="true" />
      Hotline: <span className="tabular-nums">{HOTLINE_NUMBER}</span>
    </span>
  );

  function renderTrack(hidden: boolean) {
    return (
      <div
        className="flex shrink-0 items-center gap-12 pr-12"
        aria-hidden={hidden || undefined}
      >
        {messageBlock}
        {hotlineBlock}
      </div>
    );
  }

  return (
    <>
      <script
        // Hides the bar before paint if the visitor already dismissed this exact announcement,
        // avoiding a flash of a bar that's about to be removed on mount.
        dangerouslySetInnerHTML={{
          __html: `(function(){var b=document.getElementById("announcement-bar");if(b&&localStorage.getItem("electrogadget-announcement-dismissed")===b.dataset.announcementId){b.remove()}})()`,
        }}
      />
      <div
        id="announcement-bar"
        data-announcement-id={announcement.id}
        className="relative flex items-center gap-4 overflow-hidden bg-[#0b1120] py-2 text-white"
      >
        <div className="flex min-w-0 flex-1 overflow-hidden">
          <div className="announcement-marquee flex shrink-0 items-center">
            {renderTrack(false)}
            {renderTrack(true)}
          </div>
        </div>

        <div className="pr-4">
          <AnnouncementBarDismissButton announcementId={announcement.id} />
        </div>
      </div>

      <style>{`
        .announcement-marquee {
          animation:
            announcement-marquee-enter 25s linear 1,
            announcement-marquee-loop 35s linear 34s infinite;
        }
        @keyframes announcement-marquee-enter {
          from {
            transform: translateX(100vw);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes announcement-marquee-loop {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .announcement-marquee {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
