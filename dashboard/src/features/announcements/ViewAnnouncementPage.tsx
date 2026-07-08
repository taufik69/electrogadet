import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DeleteAnnouncementDialog } from "./delete-announcement-dialog"
import { useAnnouncement } from "./hooks"

export function ViewAnnouncementPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: announcement, isLoading, isError, refetch } = useAnnouncement(id)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link to="/announcements">
          <ArrowLeft />
          Back to announcements
        </Link>
      </Button>

      {isLoading ? (
        <Skeleton className="h-64 max-w-2xl" />
      ) : isError || !announcement ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Failed to load announcement.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="max-w-2xl space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Announcement details</h1>
              <p className="text-muted-foreground">Updated {new Date(announcement.updatedAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/announcements/${announcement.id}/edit`}>
                  <Pencil />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setDeleteOpen(true)}>
                <Trash2 />
                Delete
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2 text-center text-background">
            <span className="text-sm font-semibold">{announcement.message}</span>
            {announcement.linkText && (
              <span className="underline underline-offset-2">{announcement.linkText}</span>
            )}
          </div>

          <dl className="grid grid-cols-[140px_1fr] gap-y-3 rounded-lg border p-4 text-sm">
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <Badge variant={announcement.isActive ? "default" : "secondary"}>
                {announcement.isActive ? "Active" : "Inactive"}
              </Badge>
            </dd>

            <dt className="text-muted-foreground">Message</dt>
            <dd>{announcement.message}</dd>

            <dt className="text-muted-foreground">Link URL</dt>
            <dd>{announcement.linkUrl ?? "—"}</dd>

            <dt className="text-muted-foreground">Link text</dt>
            <dd>{announcement.linkText ?? "—"}</dd>

            <dt className="text-muted-foreground">Created</dt>
            <dd>{new Date(announcement.createdAt).toLocaleString()}</dd>
          </dl>
        </div>
      )}

      <DeleteAnnouncementDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        announcementId={announcement?.id ?? null}
        onDeleted={() => navigate("/announcements")}
      />
    </div>
  )
}
