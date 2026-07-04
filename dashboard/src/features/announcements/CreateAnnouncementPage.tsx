import { useNavigate } from "react-router"

import { AnnouncementForm } from "./announcement-form"
import { useCreateAnnouncement } from "./hooks"
import type { AnnouncementInput } from "./types"

export function CreateAnnouncementPage() {
  const navigate = useNavigate()
  const createMutation = useCreateAnnouncement()

  function handleSubmit(input: AnnouncementInput) {
    createMutation.mutate(input, {
      onSuccess: (announcement) => navigate(`/announcements/${announcement.id}`),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Create announcement</h1>
        <p className="text-muted-foreground">Add a new announcement bar for the storefront.</p>
      </div>
      <AnnouncementForm
        isPending={createMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/announcements")}
        submitLabel="Create"
      />
    </div>
  )
}
