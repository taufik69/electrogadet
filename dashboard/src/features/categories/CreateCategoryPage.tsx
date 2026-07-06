import { useNavigate, useSearchParams } from "react-router"

import { CategoryForm } from "./category-form"
import { useCreateCategory } from "./hooks"
import type { CategoryInput } from "./types"

export function CreateCategoryPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const parentId = searchParams.get("parentId") ?? undefined
  const createMutation = useCreateCategory()

  function handleSubmit(input: CategoryInput) {
    createMutation.mutate(input, {
      onSuccess: () => navigate("/categories"),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{parentId ? "Add subcategory" : "New category"}</h1>
        <p className="text-muted-foreground">
          {parentId
            ? "Add a subcategory shown inside its parent's mega menu column."
            : "Add a new top-level category for the storefront's mega navigation."}
        </p>
      </div>
      <CategoryForm
        parentId={parentId}
        isPending={createMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/categories")}
        submitLabel="Create"
      />
    </div>
  )
}
