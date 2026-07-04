import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDeleteAnnouncement } from "./hooks"

interface DeleteAnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcementId: string | null
  onDeleted?: () => void
}

export function DeleteAnnouncementDialog({ open, onOpenChange, announcementId, onDeleted }: DeleteAnnouncementDialogProps) {
  const deleteMutation = useDeleteAnnouncement()

  function handleDelete() {
    if (!announcementId) return
    deleteMutation.mutate(announcementId, {
      onSuccess: () => {
        onOpenChange(false)
        onDeleted?.()
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this announcement bar. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
