import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router"

import { useBrands } from "@/features/brand"
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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteProductDialog } from "../components/delete-product-dialog"
import { useProducts, useUpdateProduct } from "../hooks/useProducts"

/** Stored in kopeks (1/100 of a ruble), same minor-unit convention as the priceCents column. */
function formatPrice(kopeks: number) {
  return (kopeks / 100).toLocaleString("ru-RU", { style: "currency", currency: "RUB" })
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const brandId = searchParams.get("brandId") ?? undefined
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const { data: brandsData, isLoading: brandsLoading } = useBrands({ includeInactive: true })
  const brands = brandsData?.data

  const { data: productsData, isLoading, isError, refetch } = useProducts({ brandId, includeInactive: true })
  const toggleActiveMutation = useUpdateProduct()

  const filteredProducts = useMemo(() => {
    const products = productsData?.data
    if (!products) return products
    const query = search.trim().toLowerCase()
    const ordered = [...products].reverse()
    if (!query) return ordered
    return ordered.filter((product) => product.name.toLowerCase().includes(query))
  }, [productsData, search])

  function handleBrandChange(value: string) {
    if (value === "all") {
      searchParams.delete("brandId")
      setSearchParams(searchParams)
    } else {
      setSearchParams({ brandId: value })
    }
  }

  function handleToggleActive(id: string, nextActive: boolean) {
    toggleActiveMutation.mutate({ id, input: { isActive: nextActive } })
  }

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Product List</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Product List</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full max-w-xs space-y-1.5">
                <label className="text-sm font-medium">Brand</label>
                <Select value={brandId ?? "all"} onValueChange={handleBrandChange} disabled={brandsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={brandsLoading ? "Loading..." : "All brands"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All brands</SelectItem>
                    {brands?.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative w-full max-w-xs self-end">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Button asChild>
              <Link to="/products/new">
                <Plus />
                Create Product
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
              <p className="text-muted-foreground">Failed to load products.</p>
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : !filteredProducts || filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                {search ? "No products match your search." : "No products yet."}
              </p>
              {!search && (
                <Button asChild>
                  <Link to="/products/new">
                    <Plus />
                    Create the first product
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">S/N</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-muted-foreground">#{index + 1}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.slug}</TableCell>
                      <TableCell>{formatPrice(product.priceCents)}</TableCell>
                      <TableCell className="text-muted-foreground">{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "success" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={product.isActive}
                            onCheckedChange={(checked) => handleToggleActive(product.id, checked)}
                            aria-label={`Toggle ${product.name} active status`}
                            className="data-[state=checked]:bg-success"
                          />
                          <Button variant="outline" size="icon" className="size-9" asChild>
                            <Link to={`/products/${product.id}`}>
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" className="size-9" asChild>
                            <Link to={`/products/${product.id}/edit`}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="size-9"
                            onClick={() => setDeleteId(product.id)}
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

      <DeleteProductDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} productId={deleteId} />
    </div>
  )
}
