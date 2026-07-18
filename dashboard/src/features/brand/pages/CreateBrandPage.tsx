import { useNavigate } from "react-router"

import { BrandForm } from "../components/brand-form"
import { useCreateBrand } from "../hooks/useBrands"
import type { CreateBrandInput } from "../types/brand.types"

export function CreateBrandPage() {
  const navigate = useNavigate()
  const createMutation = useCreateBrand()

  function handleSubmit(input: CreateBrandInput) {
    createMutation.mutate(input, {
      onSuccess: () => navigate("/brands"),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Create brand</h1>
        <p className="text-muted-foreground">Add a new brand to the storefront sidebar.</p>
      </div>
      <BrandForm
        isPending={createMutation.isPending}
        onSubmit={(input) => handleSubmit(input as CreateBrandInput)}
        onCancel={() => navigate("/brands")}
        submitLabel="Create"
      />
    </div>
  )
}
