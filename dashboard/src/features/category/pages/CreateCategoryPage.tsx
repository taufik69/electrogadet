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
import { CategoryForm } from "../components/category-form"
import { useCreateCategory, useUploadCategoryImage } from "../hooks/useCategories"
import type { CreateCategoryInput } from "../types/category.types"

export function CreateCategoryPage() {
  const navigate = useNavigate()
  const createMutation = useCreateCategory()
  const uploadImageMutation = useUploadCategoryImage()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(input: CreateCategoryInput, imageFile: File | null) {
    setError(null)
    createMutation.mutate(input, {
      onSuccess: (category) => {
        // Fire-and-forget, same pattern as CreateBrandPage: the category is
        // already created, no need to block navigation on the async upload.
        if (imageFile) {
          uploadImageMutation.mutate({ categoryId: category.id, file: imageFile })
        }
        navigate(`/categories?brandId=${category.brandId}`)
      },
      onError: (err) => setError(err.message),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Create Category</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create Category</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button variant="outline" asChild>
          <Link to="/categories">
            <List />
            Category List
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t create category</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <CategoryForm
            isPending={createMutation.isPending}
            onSubmit={(input, imageFile) => handleSubmit(input as CreateCategoryInput, imageFile)}
            onCancel={() => navigate("/categories")}
            submitLabel="Create Category"
          />
        </CardContent>
      </Card>
    </div>
  )
}
