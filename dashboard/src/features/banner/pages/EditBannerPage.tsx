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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BannerForm, type BannerFormSubmitValues } from "../components/banner-form"
import { useBanner, useDeleteBannerImage, useUpdateBanner, useUploadBannerImage } from "../hooks/useBanners"
import type { UpdateBannerInput } from "../types/banner.types"

export function EditBannerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: banner, isLoading, isError, refetch } = useBanner(id)
  const updateMutation = useUpdateBanner()
  const uploadImageMutation = useUploadBannerImage()
  const deleteImageMutation = useDeleteBannerImage()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit({ input, imageFile }: BannerFormSubmitValues) {
    if (!id || !banner) return
    setError(null)

    updateMutation.mutate(
      { id, input: input as UpdateBannerInput },
      {
        onSuccess: () => {
          if (imageFile) {
            // A banner holds exactly one image — the backend 409s on a second
            // upload, so an existing image must be deleted before the new one
            // is queued (spec §4.2). Awaited via the mutation callback rather
            // than fired in parallel, or the upload races the delete.
            const existingImageId = banner.image?.id
            if (existingImageId) {
              deleteImageMutation.mutate(existingImageId, {
                onSuccess: () => uploadImageMutation.mutate({ bannerId: id, file: imageFile }),
                onError: (err) => setError(`Couldn't replace the image: ${err.message}`),
              })
            } else {
              uploadImageMutation.mutate({ bannerId: id, file: imageFile })
            }
          }

          navigate("/banners")
        },
        onError: (err) => setError(err.message),
      },
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Edit Banner</h1>
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
                  <Link to="/banners">Banner List</Link>
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
          <Link to="/banners">
            <List />
            Banner List
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t save banner</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError || !banner ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Failed to load banner.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <Card className="w-full rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Banner Details</CardTitle>
            <CardDescription>Update this carousel slide.</CardDescription>
          </CardHeader>
          <CardContent>
            <BannerForm
              banner={banner}
              isPending={updateMutation.isPending}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/banners")}
              submitLabel="Save changes"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
