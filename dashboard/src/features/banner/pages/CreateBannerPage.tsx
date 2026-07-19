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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BannerForm, type BannerFormSubmitValues } from "../components/banner-form"
import { useCreateBanner, useUploadBannerImage } from "../hooks/useBanners"
import type { CreateBannerInput } from "../types/banner.types"

export function CreateBannerPage() {
  const navigate = useNavigate()
  const createMutation = useCreateBanner()
  const uploadImageMutation = useUploadBannerImage()
  const [error, setError] = useState<string | null>(null)
  const [justCreated, setJustCreated] = useState(false)
  const [resetSignal, setResetSignal] = useState(0)

  function handleSubmit({ input, imageFile }: BannerFormSubmitValues) {
    setError(null)
    setJustCreated(false)
    createMutation.mutate(input as CreateBannerInput, {
      onSuccess: (banner) => {
        // Create-then-upload: the image needs an ownerId, so the banner must
        // exist first (spec §4.2). Fire-and-forget — the worker handles it.
        if (imageFile) {
          uploadImageMutation.mutate({ bannerId: banner.id, file: imageFile })
        }
        // Stay put and blank the form so another banner can be added right away.
        setJustCreated(true)
        setResetSignal((n) => n + 1)
      },
      onError: (err) => setError(err.message),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Create Banner</h1>
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
                <BreadcrumbPage>Create Banner</BreadcrumbPage>
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
          <AlertTitle>Couldn&apos;t create banner</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {justCreated && (
        <Alert>
          <AlertTitle>Banner created</AlertTitle>
          <AlertDescription>The form has been reset — you can add another banner now.</AlertDescription>
        </Alert>
      )}

      <Card className="w-full rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Banner Details</CardTitle>
          <CardDescription>Add a new slide to the storefront homepage carousel.</CardDescription>
        </CardHeader>
        <CardContent>
          <BannerForm
            isPending={createMutation.isPending}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/banners")}
            submitLabel="Create Banner"
            resetSignal={resetSignal}
          />
        </CardContent>
      </Card>
    </div>
  )
}
