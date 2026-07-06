import { useNavigate, useParams } from "react-router"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoryForm } from "./category-form"
import { useCategory, useUpdateCategory } from "./hooks"
import type { CategoryInput } from "./types"

export function EditCategoryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: category, isLoading, isError, refetch } = useCategory(id)
  const updateMutation = useUpdateCategory()

  function handleSubmit(input: CategoryInput) {
    if (!id) return
    updateMutation.mutate(
      { id, input },
      { onSuccess: () => navigate("/categories") },
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit category</h1>
        <p className="text-muted-foreground">Update this category.</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 max-w-xl" />
      ) : isError || !category ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Failed to load category.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <CategoryForm
          category={category}
          parentId={category.parentId ?? undefined}
          isPending={updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/categories")}
          submitLabel="Save changes"
        />
      )}
    </div>
  )
}
