import { List } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router"

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
import { ArticleForm, type ArticleFormSubmitValues } from "../components/article-form"
import { useCreateArticle, useUploadArticleCover } from "../hooks/useArticles"
import type { CreateArticleInput } from "../types/article.types"

export function CreateArticlePage() {
  const navigate = useNavigate()
  const createMutation = useCreateArticle()
  const uploadCoverMutation = useUploadArticleCover()
  const [resetSignal, setResetSignal] = useState(0)

  async function handleSubmit({ input, coverFile }: ArticleFormSubmitValues) {
    try {
      // Create-then-upload: the cover needs an ownerId, so the article must
      // exist first (spec §7.2).
      const article = await createMutation.mutateAsync(input as CreateArticleInput)

      // Awaited, not fire-and-forget: the form is blanked below, so a rejected
      // upload has to be known before the user's file selection is thrown away.
      if (coverFile) {
        await uploadCoverMutation.mutateAsync({ articleId: article.id, file: coverFile })
      }

      // Stay put and blank the form so another article can be added right away.
      setResetSignal((n) => n + 1)
    } catch {
      // Errors surface as toasts from the mutation hooks (spec §7.5); the form
      // keeps its values so the user can retry.
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Create Article</h1>
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
                <BreadcrumbPage>Create Article</BreadcrumbPage>
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

      <Card className="w-full rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Article Details</CardTitle>
          <CardDescription>
            Write a new article for the storefront. The URL slug is generated from the title automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArticleForm
            isPending={createMutation.isPending || uploadCoverMutation.isPending}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/articles")}
            submitLabel="Create Article"
            resetSignal={resetSignal}
          />
        </CardContent>
      </Card>
    </div>
  )
}
