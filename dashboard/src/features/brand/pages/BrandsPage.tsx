import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
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
import { Input } from "@/components/ui/input"
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
import { DeleteBrandDialog } from "../components/delete-brand-dialog"
import { useBrands, useUpdateBrand } from "../hooks/useBrands"
import { resolveBrandIcon } from "../utils/brand-icons"

export function BrandsPage() {
  const { data, isLoading, isError, refetch } = useBrands({ includeInactive: true })
  const brands = data?.data
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const toggleActiveMutation = useUpdateBrand()

  const filteredBrands = useMemo(() => {
    if (!brands) return brands
    const query = search.trim().toLowerCase()
    if (!query) return brands
    return brands.filter((brand) => brand.name.toLowerCase().includes(query))
  }, [brands, search])

  function handleToggleActive(id: string, nextActive: boolean) {
    toggleActiveMutation.mutate({ id, input: { isActive: nextActive } })
  }

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Brand List</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Brand List</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button asChild>
              <Link to="/brands/new">
                <Plus />
                Create Brand
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
              <p className="text-muted-foreground">Failed to load brands.</p>
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : !filteredBrands || filteredBrands.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                {search ? "No brands match your search." : "No brands yet."}
              </p>
              {!search && (
                <Button asChild>
                  <Link to="/brands/new">
                    <Plus />
                    Create your first brand
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
                    <TableHead className="w-10" />
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrands.map((brand, index) => {
                    const Icon = resolveBrandIcon(brand.iconKey)
                    return (
                      <TableRow key={brand.id}>
                        <TableCell className="text-muted-foreground">#{index + 1}</TableCell>
                        <TableCell>
                          {brand.imageUrl ? (
                            <img
                              src={brand.imageUrl}
                              alt=""
                              className="size-6 rounded object-cover"
                            />
                          ) : (
                            Icon && <Icon className="size-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{brand.name}</TableCell>
                        <TableCell className="text-muted-foreground">{brand.slug}</TableCell>
                        <TableCell className="text-muted-foreground">{brand.sortOrder}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={brand.isActive ? "success" : "secondary"}>
                              {brand.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Switch
                              checked={brand.isActive}
                              onCheckedChange={(checked) => handleToggleActive(brand.id, checked)}
                              aria-label={`Toggle ${brand.name} active status`}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/categories?brandId=${brand.id}`}>
                              <Eye />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/brands/${brand.id}/edit`}>
                              <Pencil />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(brand.id)}>
                            <Trash2 className="text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteBrandDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} brandId={deleteId} />
    </div>
  )
}
