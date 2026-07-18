import { useNavigate, useSearchParams } from "react-router"

import { Button } from "@/components/ui/button"
import { CategoryForm } from "../components/category-form"
import { useCreateCategory } from "../hooks/useCategories"
import type { CreateCategoryInput } from "../types/category.types"

export function CreateCategoryPage() {
  const [searchParams] = useSearchParams()
  const brandId = searchParams.get("brandId")
  const navigate = useNavigate()
  const createMutation = useCreateCategory()

  function handleSubmit(input: CreateCategoryInput) {
    createMutation.mutate(input, {
      onSuccess: () => navigate(`/categories?brandId=${brandId}`),
    })
  }

  if (!brandId) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No brand selected. Go back and pick a brand first.</p>
        <Button variant="outline" onClick={() => navigate("/categories")}>
          Back to categories
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Create category</h1>
        <p className="text-muted-foreground">Add a new category under this brand.</p>
      </div>
      <CategoryForm
        brandId={brandId}
        isPending={createMutation.isPending}
        onSubmit={(input) => handleSubmit(input as CreateCategoryInput)}
        onCancel={() => navigate(`/categories?brandId=${brandId}`)}
        submitLabel="Create"
      />
    </div>
  )
}
