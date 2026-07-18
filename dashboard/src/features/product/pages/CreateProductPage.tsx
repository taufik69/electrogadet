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
import { ProductForm, type ProductFormSubmitValues } from "../components/product-form"
import { useAttachProductCategory, useCreateProduct, useUploadProductThumbnail } from "../hooks/useProducts"
import type { CreateProductInput } from "../types/product.types"

export function CreateProductPage() {
  const navigate = useNavigate()
  const createMutation = useCreateProduct()
  const uploadThumbnailMutation = useUploadProductThumbnail()
  const attachCategoryMutation = useAttachProductCategory()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit({ input, categoryId, thumbnailFile }: ProductFormSubmitValues) {
    setError(null)
    createMutation.mutate(input as CreateProductInput, {
      onSuccess: (product) => {
        // Fire-and-forget, same pattern as brand/category image uploads: the
        // product already exists, no need to block navigation on these.
        if (thumbnailFile) {
          uploadThumbnailMutation.mutate({ productId: product.id, file: thumbnailFile })
        }
        if (categoryId) {
          attachCategoryMutation.mutate({ categoryId, productId: product.id })
        }
        navigate("/products")
      },
      onError: (err) => setError(err.message),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Create Product</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create Product</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button variant="outline" asChild>
          <Link to="/products">
            <List />
            Product List
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t create product</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <ProductForm
            isPending={createMutation.isPending}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/products")}
            submitLabel="Create Product"
          />
        </CardContent>
      </Card>
    </div>
  )
}
