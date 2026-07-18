import { Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteBrandDialog } from "../components/delete-brand-dialog"
import { useBrands } from "../hooks/useBrands"
import { resolveBrandIcon } from "../utils/brand-icons"

export function BrandsPage() {
  const { data, isLoading, isError, refetch } = useBrands({ includeInactive: true })
  const brands = data?.data
  const [deleteId, setDeleteId] = useState<string | null>(null)

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Brands</h1>
          <p className="text-muted-foreground">
            Manage the brands shown in the storefront sidebar, in display order.
          </p>
        </div>
        <Button asChild>
          <Link to="/brands/new">
            <Plus />
            Create
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
      ) : !brands || brands.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No brands yet.</p>
          <Button asChild>
            <Link to="/brands/new">
              <Plus />
              Create your first brand
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => {
                const Icon = resolveBrandIcon(brand.iconKey)
                return (
                  <TableRow key={brand.id}>
                    <TableCell>{Icon && <Icon className="size-4 text-muted-foreground" />}</TableCell>
                    <TableCell>
                      <Link to={`/categories?brandId=${brand.id}`} className="hover:underline">
                        {brand.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{brand.slug}</TableCell>
                    <TableCell className="text-muted-foreground">{brand.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant={brand.isActive ? "default" : "secondary"}>
                        {brand.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/brands/${brand.id}/edit`}>
                          <Pencil />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(brand.id)}>
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteBrandDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} brandId={deleteId} />
    </div>
  )
}
