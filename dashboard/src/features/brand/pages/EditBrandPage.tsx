import { useNavigate, useParams } from "react-router"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BrandForm } from "../components/brand-form"
import { useBrand, useUpdateBrand } from "../hooks/useBrands"
import type { UpdateBrandInput } from "../types/brand.types"

export function EditBrandPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: brand, isLoading, isError, refetch } = useBrand(id)
  const updateMutation = useUpdateBrand()

  function handleSubmit(input: UpdateBrandInput) {
    if (!id) return
    updateMutation.mutate({ id, input }, { onSuccess: () => navigate("/brands") })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Edit brand</h1>
        <p className="text-muted-foreground">Update this brand&apos;s details.</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 max-w-2xl" />
      ) : isError || !brand ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Failed to load brand.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <BrandForm
          brand={brand}
          isPending={updateMutation.isPending}
          onSubmit={(input) => handleSubmit(input as UpdateBrandInput)}
          onCancel={() => navigate("/brands")}
          submitLabel="Save changes"
        />
      )}
    </div>
  )
}
