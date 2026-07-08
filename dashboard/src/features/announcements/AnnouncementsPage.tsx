import { Eye, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteAnnouncementDialog } from "./delete-announcement-dialog"
import { useAnnouncements } from "./hooks"

export function AnnouncementsPage() {
  const { data: announcements, isLoading, isError, refetch } = useAnnouncements()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Announcement Bar</h1>
          <p className="text-muted-foreground">Manage the site-wide announcement bar shown on the storefront.</p>
        </div>
        <Button asChild>
          <Link to="/announcements/new">
            <Plus />
            Create
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Failed to load announcements.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !announcements || announcements.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No announcement bars yet.</p>
          <Button asChild>
            <Link to="/announcements/new">
              <Plus />
              Create your first announcement
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="max-w-xs truncate">
                    <Link to={`/announcements/${announcement.id}`} className="hover:underline">
                      {announcement.message}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={announcement.isActive ? "default" : "secondary"}>
                      {announcement.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(announcement.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/announcements/${announcement.id}`}>
                        <Eye />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/announcements/${announcement.id}/edit`}>
                        <Pencil />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(announcement.id)}>
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteAnnouncementDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        announcementId={deleteId}
      />
    </div>
  )
}
