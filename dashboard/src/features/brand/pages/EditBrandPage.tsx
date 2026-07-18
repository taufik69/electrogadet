import { List } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BrandForm } from "../components/brand-form"
import { useBrand, useUpdateBrand, useUploadBrandImage } from "../hooks/useBrands"
import type { UpdateBrandInput } from "../types/brand.types"

export function EditBrandPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: brand, isLoading, isError, refetch } = useBrand(id)
  const updateMutation = useUpdateBrand()
  const uploadImageMutation = useUploadBrandImage()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(input: UpdateBrandInput, imageFile: File | null) {
    if (!id) return
    setError(null)
    updateMutation.mutate(
      { id, input },
      {
        onSuccess: () => {
          if (imageFile) {
            uploadImageMutation.mutate({ brandId: id, file: imageFile })
          }
          navigate("/brands")
        },
        onError: (err) => setError(err.message),
      },
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Edit Brand</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/brands">Brand List</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button variant="outline" asChild>
          <Link to="/brands">
            <List />
            Brand List
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t save brand</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
        <Card>
          <CardContent className="pt-6">
            <BrandForm
              brand={brand}
              isPending={updateMutation.isPending}
              onSubmit={(input, imageFile) => handleSubmit(input as UpdateBrandInput, imageFile)}
              onCancel={() => navigate("/brands")}
              submitLabel="Save changes"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
