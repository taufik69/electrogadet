import { Pencil, Plus, Search, Trash2 } from "lucide-react"
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
import { DeleteCategoryDialog } from "../components/delete-category-dialog"
import { useCategories, useUpdateCategory } from "../hooks/useCategories"

export function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const brandId = searchParams.get("brandId") ?? undefined
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const { data: brandsData, isLoading: brandsLoading } = useBrands({ includeInactive: true })
  const brands = brandsData?.data
  const selectedBrand = brands?.find((b) => b.id === brandId)

  const { data: categoriesData, isLoading, isError, refetch } = useCategories(brandId, { includeInactive: true })
  const toggleActiveMutation = useUpdateCategory()

  const filteredCategories = useMemo(() => {
    const categories = categoriesData?.data
    if (!categories) return categories
    // Same convention as BrandsPage: newest-created shows first.
    const query = search.trim().toLowerCase()
    const ordered = [...categories].reverse()
    if (!query) return ordered
    return ordered.filter((category) => category.name.toLowerCase().includes(query))
  }, [categoriesData, search])

  function handleBrandChange(value: string) {
    setSearchParams({ brandId: value })
  }

  function handleToggleActive(id: string, nextActive: boolean) {
    toggleActiveMutation.mutate({ id, input: { isActive: nextActive } })
  }

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Category List</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Category List</BreadcrumbPage>
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
                <Select value={brandId} onValueChange={handleBrandChange} disabled={brandsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={brandsLoading ? "Loading..." : "Select a brand"} />
                  </SelectTrigger>
                  <SelectContent>
                    {brands?.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {brandId && (
                <div className="relative w-full max-w-xs self-end">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              )}
            </div>

            <Button asChild>
              <Link to="/categories/new">
                <Plus />
                Create Category
              </Link>
            </Button>
          </div>

          {!brandId ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">Select a brand above to see its categories.</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">Failed to load categories.</p>
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : !filteredCategories || filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                {search
                  ? "No categories match your search."
                  : selectedBrand
                    ? `No categories yet for ${selectedBrand.name}.`
                    : "No categories yet."}
              </p>
              {!search && (
                <Button asChild>
                  <Link to="/categories/new">
                    <Plus />
                    Create the first category
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
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category, index) => (
                    <TableRow key={category.id}>
                      <TableCell className="text-muted-foreground">#{index + 1}</TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                      <TableCell className="text-muted-foreground">{category.sortOrder}</TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? "success" : "secondary"}>
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={category.isActive}
                            onCheckedChange={(checked) => handleToggleActive(category.id, checked)}
                            aria-label={`Toggle ${category.name} active status`}
                            className="data-[state=checked]:bg-success"
                          />
                          <Button variant="outline" size="icon" className="size-9" asChild>
                            <Link to={`/categories/${category.id}/edit?brandId=${brandId}`}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="size-9"
                            onClick={() => setDeleteId(category.id)}
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

      <DeleteCategoryDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        categoryId={deleteId}
      />
    </div>
  )
}
