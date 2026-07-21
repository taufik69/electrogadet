import type { Article } from "@/lib/types/article"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

interface ArticlesResponse {
  success: boolean
  data: Article[]
}

interface ArticleResponse {
  success: boolean
  data: Article
}

/**
 * Homepage/listing read. Degrades to an empty array on any failure — the
 * articles row sits mid-page, so a thrown error here would take down the whole
 * homepage (same pattern as fetchProducts/fetchActiveBanners).
 *
 * Only articles whose cover finished uploading are returned: a `pending` row
 * has an empty url, and next/image throws on an empty src rather than rendering
 * a gap (backend spec §8).
 */
export async function fetchPublishedArticles(limit = 3): Promise<Article[]> {
  try {
    const res = await fetch(`${API_URL}/api/articles/published?limit=${limit}`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const body: ArticlesResponse = await res.json()
    return (body.data ?? []).filter((article) => article.coverImage?.status === "uploaded")
  } catch {
    return []
  }
}

/**
 * Detail read. Returns null rather than throwing so the page can call
 * notFound() — a 404 from the backend (draft, or no such slug) is a routing
 * outcome, not an error to surface.
 *
 * Note this endpoint increments the article's view counter backend-side, so it
 * must not be called speculatively for anything other than an actual page view.
 */
export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_URL}/api/articles/slug/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    const body: ArticleResponse = await res.json()
    return body.data ?? null
  } catch {
    return null
  }
}
