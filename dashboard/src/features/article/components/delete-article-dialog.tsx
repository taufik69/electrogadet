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
import { useDeleteArticle } from "../hooks/useArticles"

interface DeleteArticleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  articleId: string | null
  onDeleted?: () => void
}

export function DeleteArticleDialog({ open, onOpenChange, articleId, onDeleted }: DeleteArticleDialogProps) {
  const deleteMutation = useDeleteArticle()

  function handleDelete() {
    if (!articleId) return
    deleteMutation.mutate(articleId, {
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
          <AlertDialogTitle>Delete article?</AlertDialogTitle>
          {/* Steers toward Archive: deleting a published article breaks every
              inbound link and search result pointing at its URL (spec §4.5). */}
          <AlertDialogDescription>
            This permanently deletes the article, its SEO settings and its cover image. Anyone following an
            existing link to it will get a 404. To retire an article while keeping its URL working, set its
            status to <strong>Archived</strong> instead. This action cannot be undone.
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
