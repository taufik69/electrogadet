import { useNavigate, useParams, useSearchParams } from "react-router"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoryForm } from "../components/category-form"
import { useCategory, useUpdateCategory } from "../hooks/useCategories"
import type { UpdateCategoryInput } from "../types/category.types"

export function EditCategoryPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const brandId = searchParams.get("brandId")
  const navigate = useNavigate()
  const { data: category, isLoading, isError, refetch } = useCategory(id)
  const updateMutation = useUpdateCategory()

  function handleSubmit(input: UpdateCategoryInput) {
    if (!id) return
    updateMutation.mutate({ id, input }, { onSuccess: () => navigate(`/categories?brandId=${brandId}`) })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit category</h1>
        <p className="text-muted-foreground">Update this category&apos;s details.</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 max-w-2xl" />
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
          isPending={updateMutation.isPending}
          onSubmit={(input) => handleSubmit(input as UpdateCategoryInput)}
          onCancel={() => navigate(`/categories?brandId=${brandId}`)}
          submitLabel="Save changes"
        />
      )}
    </div>
  )
}
