import { Pencil, List } from "lucide-react"
import { Link, useParams } from "react-router"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useProduct, useProductGallery, useProductThumbnail } from "../hooks/useProducts"

function formatPrice(cents: number | null) {
  if (cents === null) return "—"
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })
}

const availabilityLabel: Record<string, string> = {
  in_stock: "In stock",
  out_of_stock: "Out of stock",
  preorder: "Preorder",
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm">{value ?? "—"}</p>
    </div>
  )
}

export function ViewProductPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading, isError, refetch } = useProduct(id)
  const { data: thumbnails } = useProductThumbnail(id)
  const { data: gallery } = useProductGallery(id)

  const thumbnailUrl = thumbnails?.find((img) => img.status === "uploaded")?.url
  const category = product?.categories?.[0]?.category

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Product Details</h1>
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
                <BreadcrumbPage>{product?.name ?? "View"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/products">
              <List />
              Product List
            </Link>
          </Button>
          {product && (
            <Button asChild>
              <Link to={`/products/${product.id}/edit`}>
                <Pencil />
                Edit Product
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError || !product ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Failed to load product.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Thumbnail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt={product.name} className="w-full rounded-lg border object-cover" />
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                  No thumbnail uploaded
                </div>
              )}

              {gallery && gallery.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {gallery
                    .filter((img) => img.status === "uploaded")
                    .map((img) => (
                      <img key={img.id} src={img.url} alt="" className="aspect-square rounded-md border object-cover" />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{product.name}</CardTitle>
              <Badge variant={product.isActive ? "success" : "secondary"}>
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Slug" value={product.slug} />
              <Field label="Category" value={category?.name} />
              <Field label="Price" value={formatPrice(product.priceCents)} />
              <Field label="Compare-at price" value={formatPrice(product.compareAtCents)} />
              <Field label="Stock" value={product.stock} />
              <Field label="Availability" value={availabilityLabel[product.availabilityStatus]} />
              <Field label="SKU" value={product.sku} />
              <Field label="Barcode" value={product.barcode} />
              <Field label="Rating" value={product.ratingCount > 0 ? `${product.rating} (${product.ratingCount})` : "—"} />
              <Field label="Manufacture country" value={product.manufactureCountry} />
              <Field
                label="Tags"
                value={
                  product.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : undefined
                }
              />
              <Field label="Warranty" value={product.warrantyInformation} />
              <Field label="Shipping information" value={product.shippingInformation} />

              <div className="sm:col-span-2">
                <Field label="Description" value={product.description} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
