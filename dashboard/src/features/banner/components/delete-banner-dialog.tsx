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
import { useDeleteBanner } from "../hooks/useBanners"

interface DeleteBannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bannerId: string | null
  onDeleted?: () => void
}

export function DeleteBannerDialog({ open, onOpenChange, bannerId, onDeleted }: DeleteBannerDialogProps) {
  const deleteMutation = useDeleteBanner()

  function handleDelete() {
    if (!bannerId) return
    deleteMutation.mutate(bannerId, {
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
          <AlertDialogTitle>Delete banner?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this banner and its uploaded image, and remove it from the storefront
            carousel. This action cannot be undone.
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
