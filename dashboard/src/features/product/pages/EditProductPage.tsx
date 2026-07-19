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
import { ProductForm, type ProductFormSubmitValues } from "../components/product-form"
import {
  useAttachProductCategory,
  useDetachProductCategory,
  useProduct,
  useUpdateProduct,
  useUploadProductGalleryImage,
  useUploadProductThumbnail,
  useUpsertProductSeo,
} from "../hooks/useProducts"
import type { UpdateProductInput } from "../types/product.types"

export function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, isError, refetch } = useProduct(id)
  const updateMutation = useUpdateProduct()
  const uploadThumbnailMutation = useUploadProductThumbnail()
  const uploadGalleryImageMutation = useUploadProductGalleryImage()
  const attachCategoryMutation = useAttachProductCategory()
  const detachCategoryMutation = useDetachProductCategory()
  const upsertSeoMutation = useUpsertProductSeo()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit({ input, categoryId, thumbnailFile, galleryFiles, seo }: ProductFormSubmitValues) {
    if (!id || !product) return
    setError(null)

    updateMutation.mutate(
      { id, input: input as UpdateProductInput },
      {
        onSuccess: () => {
          if (thumbnailFile) {
            uploadThumbnailMutation.mutate({ productId: id, file: thumbnailFile })
          }
          for (const file of galleryFiles) {
            uploadGalleryImageMutation.mutate({ productId: id, file })
          }

          const previousCategory = product.categories?.[0]?.category
          if (categoryId !== previousCategory?.id) {
            if (previousCategory) {
              detachCategoryMutation.mutate({ categoryId: previousCategory.id, productId: id })
            }
            if (categoryId) {
              attachCategoryMutation.mutate({ categoryId, productId: id })
            }
          }

          if (Object.values(seo).some((v) => (Array.isArray(v) ? v.length > 0 : v !== undefined))) {
            upsertSeoMutation.mutate({ productId: id, input: seo })
          }

          navigate("/products")
        },
        onError: (err) => setError(err.message),
      },
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Edit Product</h1>
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
                  <Link to="/products">Product List</Link>
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
          <Link to="/products">
            <List />
            Product List
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t save product</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Skeleton className="h-96 max-w-2xl" />
      ) : isError || !product ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Failed to load product.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <ProductForm
              product={product}
              existingGalleryCount={product.gallery.length}
              isPending={updateMutation.isPending}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/products")}
              submitLabel="Save changes"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
