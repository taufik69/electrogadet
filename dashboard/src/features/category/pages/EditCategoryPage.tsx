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
import { CategoryForm } from "../components/category-form"
import { useCategory, useUpdateCategory, useUploadCategoryImage } from "../hooks/useCategories"
import type { UpdateCategoryInput } from "../types/category.types"

export function EditCategoryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: category, isLoading, isError, refetch } = useCategory(id)
  const updateMutation = useUpdateCategory()
  const uploadImageMutation = useUploadCategoryImage()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(input: UpdateCategoryInput, imageFile: File | null) {
    if (!id || !category) return
    setError(null)
    updateMutation.mutate(
      { id, input },
      {
        onSuccess: () => {
          if (imageFile) {
            uploadImageMutation.mutate({ categoryId: id, file: imageFile })
          }
          navigate(`/categories?brandId=${category.brandId}`)
        },
        onError: (err) => setError(err.message),
      },
    )
  }

  const backHref = category ? `/categories?brandId=${category.brandId}` : "/categories"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Edit Category</h1>
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
                  <Link to={backHref}>Category List</Link>
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
          <Link to={backHref}>
            <List />
            Category List
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t save category</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
        <Card>
          <CardContent className="pt-6">
            <CategoryForm
              category={category}
              isPending={updateMutation.isPending}
              onSubmit={(input, imageFile) => handleSubmit(input as UpdateCategoryInput, imageFile)}
              onCancel={() => navigate(backHref)}
              submitLabel="Save changes"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
