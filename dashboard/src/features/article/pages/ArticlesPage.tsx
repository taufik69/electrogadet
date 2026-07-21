import { Eye, Pencil, Plus, Trash2 } from "lucide-react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeleteArticleDialog } from "../components/delete-article-dialog"
import { useArticles } from "../hooks/useArticles"
import type { Article } from "../types/article.types"

/** The worker fills url/status asynchronously — show what's actually happening rather than a broken <img>. */
function CoverCell({ cover }: { cover: Article["coverImage"] }) {
  if (!cover) {
    return <span className="text-xs text-muted-foreground">No cover</span>
  }
  if (cover.status === "uploaded") {
    return <img src={cover.url} alt="" className="h-12 w-20 rounded-md border object-cover" />
  }
  if (cover.status === "failed") {
    return <Badge variant="destructive">Failed</Badge>
  }
  return <Badge variant="secondary">Processing…</Badge>
}

function StatusBadge({ status }: { status: Article["status"] }) {
  if (status === "published") return <Badge variant="success">Published</Badge>
  if (status === "archived") return <Badge variant="outline">Archived</Badge>
  return <Badge variant="secondary">Draft</Badge>
}

// Intl rather than hand-rolled formatting, to match how the storefront renders
// the same two values on the card (spec §8).
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" })
const numberFormatter = new Intl.NumberFormat("en-US")

export function ArticlesPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { data, isLoading, isError, refetch } = useArticles()

  const articles = data?.data

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Article List</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Article List</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Shown in the storefront articles section, newest published first.
            </p>
            <Button asChild>
              <Link to="/articles/new">
                <Plus />
                Create Article
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
              <p className="text-muted-foreground">Failed to load articles.</p>
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : !articles || articles.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No articles yet.</p>
              <Button asChild>
                <Link to="/articles/new">
                  <Plus />
                  Create the first article
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">S/N</TableHead>
                    <TableHead className="w-28">Cover</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article, index) => (
                    <TableRow key={article.id}>
                      <TableCell className="text-muted-foreground">#{index + 1}</TableCell>
                      <TableCell>
                        <CoverCell cover={article.coverImage} />
                      </TableCell>
                      <TableCell className="max-w-sm">
                        <div className="font-medium">{article.title}</div>
                        <div className="truncate font-mono text-xs text-muted-foreground">/{article.slug}</div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={article.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {article.publishedAt ? dateFormatter.format(new Date(article.publishedAt)) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Eye className="size-3.5" />
                          {numberFormatter.format(article.viewCount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="icon" className="size-9" asChild>
                            <Link to={`/articles/${article.id}/edit`}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="size-9"
                            onClick={() => setDeleteId(article.id)}
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

      <DeleteArticleDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        articleId={deleteId}
      />
    </div>
  )
}
