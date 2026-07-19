import { Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"

import { Badge } from "@/components/ui/badge"
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
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeleteBannerDialog } from "../components/delete-banner-dialog"
import { useBanners, useUpdateBanner } from "../hooks/useBanners"
import type { Banner } from "../types/banner.types"

/** The worker fills url/status asynchronously — show what's actually happening rather than a broken <img>. */
function ImageCell({ image }: { image: Banner["image"] }) {
  if (!image) {
    return <span className="text-xs text-muted-foreground">No image</span>
  }
  if (image.status === "uploaded") {
    return <img src={image.url} alt="" className="h-12 w-16 rounded-md border object-cover" />
  }
  if (image.status === "failed") {
    return <Badge variant="destructive">Failed</Badge>
  }
  return <Badge variant="secondary">Processing…</Badge>
}

export function BannersPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { data, isLoading, isError, refetch } = useBanners({ includeInactive: true })
  const toggleActiveMutation = useUpdateBanner()

  const banners = data?.data

  function handleToggleActive(id: string, nextActive: boolean) {
    toggleActiveMutation.mutate({ id, input: { isActive: nextActive } })
  }

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Banner List</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Banner List</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Shown in the storefront homepage carousel, newest first.
            </p>
            <Button asChild>
              <Link to="/banners/new">
                <Plus />
                Create Banner
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">Failed to load banners.</p>
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : !banners || banners.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No banners yet.</p>
              <Button asChild>
                <Link to="/banners/new">
                  <Plus />
                  Create the first banner
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">S/N</TableHead>
                    <TableHead className="w-24">Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner, index) => (
                    <TableRow key={banner.id}>
                      <TableCell className="text-muted-foreground">#{index + 1}</TableCell>
                      <TableCell>
                        <ImageCell image={banner.image} />
                      </TableCell>
                      {/* whitespace-pre-line so the newline in the title reads
                          the same here as it does in the storefront overlay. */}
                      <TableCell className="max-w-xs font-medium whitespace-pre-line">{banner.title}</TableCell>
                      <TableCell className="max-w-xs text-muted-foreground">{banner.description}</TableCell>
                      <TableCell>
                        <Badge variant={banner.isActive ? "success" : "secondary"}>
                          {banner.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={banner.isActive}
                            onCheckedChange={(checked) => handleToggleActive(banner.id, checked)}
                            aria-label={`Toggle ${banner.title} active status`}
                            className="data-[state=checked]:bg-success"
                          />
                          <Button variant="outline" size="icon" className="size-9" asChild>
                            <Link to={`/banners/${banner.id}/edit`}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="size-9"
                            onClick={() => setDeleteId(banner.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteBannerDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} bannerId={deleteId} />
    </div>
  )
}
