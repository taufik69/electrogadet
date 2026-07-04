import { useNavigate, useParams } from "react-router"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AnnouncementForm } from "./announcement-form"
import { useAnnouncement, useUpdateAnnouncement } from "./hooks"
import type { AnnouncementInput } from "./types"

export function EditAnnouncementPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: announcement, isLoading, isError, refetch } = useAnnouncement(id)
  const updateMutation = useUpdateAnnouncement()

  function handleSubmit(input: AnnouncementInput) {
    if (!id) return
    updateMutation.mutate(
      { id, input },
      { onSuccess: () => navigate(`/announcements/${id}`) },
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit announcement</h1>
        <p className="text-muted-foreground">Update this announcement bar.</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 max-w-2xl" />
      ) : isError || !announcement ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Failed to load announcement.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <AnnouncementForm
          announcement={announcement}
          isPending={updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/announcements/${id}`)}
          submitLabel="Save changes"
        />
      )}
    </div>
  )
}
