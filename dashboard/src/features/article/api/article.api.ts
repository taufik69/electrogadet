import { apiFetch, apiFetchPaged } from "@/lib/api"
import type {
  Article,
  ArticleSeo,
  ArticleStatus,
  CreateArticleInput,
  UpdateArticleInput,
  UpsertArticleSeoInput,
} from "../types/article.types"

export function fetchArticles(params?: { cursor?: string; limit?: number; status?: ArticleStatus }) {
  const query = new URLSearchParams()
  if (params?.cursor) query.set("cursor", params.cursor)
  query.set("limit", String(params?.limit ?? 50))
  if (params?.status) query.set("status", params.status)

  return apiFetchPaged<Article[]>(`/api/articles?${query.toString()}`)
}

export function fetchArticleById(id: string) {
  return apiFetch<Article>(`/api/articles/${id}`)
}

export function createArticle(input: CreateArticleInput) {
  return apiFetch<Article>("/api/articles", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateArticle(id: string, input: UpdateArticleInput) {
  return apiFetch<Article>(`/api/articles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function upsertArticleSeo(id: string, input: UpsertArticleSeoInput) {
  return apiFetch<ArticleSeo>(`/api/articles/${id}/seo`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export function deleteArticle(id: string) {
  return apiFetch<null>(`/api/articles/${id}`, { method: "DELETE" })
}
