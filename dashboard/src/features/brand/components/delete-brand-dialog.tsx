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
import { useDeleteBrand } from "../hooks/useBrands"

interface DeleteBrandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brandId: string | null
  onDeleted?: () => void
}

export function DeleteBrandDialog({ open, onOpenChange, brandId, onDeleted }: DeleteBrandDialogProps) {
  const deleteMutation = useDeleteBrand()

  function handleDelete() {
    if (!brandId) return
    deleteMutation.mutate(brandId, {
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
          <AlertDialogTitle>Delete brand?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this brand and cascade-delete all of its categories. Products under it are
            kept but unlinked from the brand. This action cannot be undone.
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
