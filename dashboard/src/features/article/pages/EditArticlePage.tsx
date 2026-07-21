import { List } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router"

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
import { Skeleton } from "@/components/ui/skeleton"
import { ArticleForm, type ArticleFormSubmitValues } from "../components/article-form"
import { useArticle, useUpdateArticle, useUploadArticleCover } from "../hooks/useArticles"
import type { UpdateArticleInput } from "../types/article.types"

export function EditArticlePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: article, isLoading, isError, refetch } = useArticle(id)
  const updateMutation = useUpdateArticle()
  const uploadCoverMutation = useUploadArticleCover()

  // `async` + `mutateAsync` on purpose. The earlier fire-and-forget version
  // called `uploadCoverMutation.mutate(...)` and `navigate(...)` in the same
  // tick, which unmounted this page while the multipart PUT was still in
  // flight — React Query aborts the request, so the new cover never reached
  // the backend and the old Cloudinary asset was never replaced. Await the
  // upload, then navigate.
  async function handleSubmit({ input, coverFile }: ArticleFormSubmitValues) {
    if (!id || !article) return

    try {
      await updateMutation.mutateAsync({ id, input: input as UpdateArticleInput })

      // No delete-then-upload dance here (unlike banner): PUT
      // /api/articles/:id/cover swaps the row atomically and hands the old
      // publicId to the worker, which removes the previous Cloudinary asset
      // only once the new upload succeeds (spec §4.4a).
      if (coverFile) {
        await uploadCoverMutation.mutateAsync({ articleId: id, file: coverFile })
      }

      navigate("/articles")
    } catch {
      // Errors surface as toasts from the mutation hooks (spec §7.5); staying
      // on the page keeps the user's input so they can retry.
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Edit Article</h1>
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
                  <Link to="/articles">Article List</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button variant="outline" asChild>
          <Link to="/articles">
            <List />
            Article List
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError || !article ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Failed to load article.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <Card className="w-full rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Article Details</CardTitle>
            <CardDescription>Update this article.</CardDescription>
          </CardHeader>
          <CardContent>
            <ArticleForm
              article={article}
              isPending={updateMutation.isPending || uploadCoverMutation.isPending}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/articles")}
              submitLabel="Save changes"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
