import { Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link, useSearchParams } from "react-router"

import { useBrands } from "@/features/brand"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteCategoryDialog } from "../components/delete-category-dialog"
import { useCategories } from "../hooks/useCategories"

export function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const brandId = searchParams.get("brandId") ?? undefined
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: brandsData, isLoading: brandsLoading } = useBrands({ includeInactive: true })
  const brands = brandsData?.data
  const selectedBrand = brands?.find((b) => b.id === brandId)

  const { data: categoriesData, isLoading, isError, refetch } = useCategories(brandId, { includeInactive: true })
  const categories = categoriesData?.data

  function handleBrandChange(value: string) {
    setSearchParams({ brandId: value })
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-muted-foreground">
            Manage a brand&apos;s categories, in the order they appear in the storefront flyout.
          </p>
        </div>
        {brandId && (
          <Button asChild>
            <Link to={`/categories/new?brandId=${brandId}`}>
              <Plus />
              Create
            </Link>
          </Button>
        )}
      </div>

      <div className="max-w-xs space-y-2">
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
      ) : !categories || categories.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            {selectedBrand ? `No categories yet for ${selectedBrand.name}.` : "No categories yet."}
          </p>
          <Button asChild>
            <Link to={`/categories/new?brandId=${brandId}`}>
              <Plus />
              Create the first category
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className="text-muted-foreground">{category.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/categories/${category.id}/edit?brandId=${brandId}`}>
                        <Pencil />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(category.id)}>
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteCategoryDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        categoryId={deleteId}
      />
    </div>
  )
}
