import { List } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router"

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
import { BrandForm } from "../components/brand-form"
import { useCreateBrand, useUploadBrandImage } from "../hooks/useBrands"
import type { CreateBrandInput } from "../types/brand.types"

export function CreateBrandPage() {
  const navigate = useNavigate()
  const createMutation = useCreateBrand()
  const uploadImageMutation = useUploadBrandImage()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(input: CreateBrandInput, imageFile: File | null) {
    setError(null)
    createMutation.mutate(input, {
      onSuccess: (brand) => {
        // Fire-and-forget: the upload is processed asynchronously by the
        // worker (see useUploadBrandImage) — the brand is already created and
        // the admin shouldn't wait on Cloudinary before leaving this page.
        if (imageFile) {
          uploadImageMutation.mutate({ brandId: brand.id, file: imageFile })
        }
        navigate("/brands")
      },
      onError: (err) => setError(err.message),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Create Brand</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create Brand</BreadcrumbPage>
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
          <AlertTitle>Couldn&apos;t create brand</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <BrandForm
            isPending={createMutation.isPending}
            onSubmit={(input, imageFile) => handleSubmit(input as CreateBrandInput, imageFile)}
            onCancel={() => navigate("/brands")}
            submitLabel="Create Brand"
          />
        </CardContent>
      </Card>
    </div>
  )
}
