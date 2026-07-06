import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"

import { API_URL } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Skeleton } from "@/components/ui/skeleton"
import { DeleteCategoryDialog } from "./delete-category-dialog"
import { useCategoryTree } from "./hooks"
import type { CategoryTreeNode } from "./types"

export function CategoriesPage() {
  const { data: tree, isLoading, isError, refetch } = useCategoryTree()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; childCount: number } | null>(null)

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-muted-foreground">Manage the storefront's mega navigation categories.</p>
        </div>
        <Button asChild>
          <Link to="/categories/new">
            <Plus />
            New category
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Failed to load categories.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !tree || tree.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No categories yet.</p>
          <Button asChild>
            <Link to="/categories/new">
              <Plus />
              Create your first category
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {tree.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              expanded={expandedIds.has(category.id)}
              onToggle={() => toggleExpanded(category.id)}
              onDelete={(id, childCount) => setDeleteTarget({ id, childCount })}
            />
          ))}
        </div>
      )}

      <DeleteCategoryDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        categoryId={deleteTarget?.id ?? null}
        childCount={deleteTarget?.childCount ?? 0}
      />
    </div>
  )
}

interface CategoryRowProps {
  category: CategoryTreeNode
  expanded: boolean
  onToggle: () => void
  onDelete: (id: string, childCount: number) => void
}

function CategoryRow({ category, expanded, onToggle, onDelete }: CategoryRowProps) {
  const hasChildren = category.children.length > 0

  return (
    <Collapsible open={expanded} onOpenChange={onToggle} className="rounded-lg border">
      <div className="flex items-center gap-2 p-3">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0" disabled={!hasChildren}>
            <ChevronRight className={hasChildren ? (expanded ? "rotate-90 transition-transform" : "transition-transform") : "opacity-0"} />
          </Button>
        </CollapsibleTrigger>

        {category.imageUrl && (
          <img
            src={`${API_URL}${category.imageUrl}`}
            alt=""
            className="h-8 w-8 shrink-0 rounded-md border object-cover"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{category.name}</span>
            <span className="text-sm text-muted-foreground">/{category.slug}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {category.isClearance && <Badge variant="destructive">Clearance</Badge>}
          <Badge variant={category.showInMegaMenu ? "default" : "secondary"}>
            {category.showInMegaMenu ? "In mega menu" : "Hidden"}
          </Badge>
          <span className="text-sm text-muted-foreground">{category.children.length} subcategories</span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/categories/new?parentId=${category.id}`}>
              <Plus />
              Add subcategory
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/categories/${category.id}/edit`}>
              <Pencil />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(category.id, category.children.length)}>
            <Trash2 />
          </Button>
        </div>
      </div>

      {hasChildren && (
        <CollapsibleContent>
          <div className="divide-y border-t">
            {category.children.map((child) => (
              <div key={child.id} className="flex items-center gap-2 py-2 pl-12 pr-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{child.name}</span>
                    <span className="text-sm text-muted-foreground">/{child.slug}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/categories/${child.id}/edit`}>
                      <Pencil />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(child.id, 0)}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}
