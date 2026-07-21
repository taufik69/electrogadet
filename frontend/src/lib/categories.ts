import type { Category } from "@/lib/types/category"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

interface CategoriesResponse {
  success: boolean
  data: Category[]
  meta?: { nextCursor: string | null; hasMore: boolean }
}

/**
 * Top-level, active categories for the homepage tile row.
 *
 * Degrades to an empty array on any failure — the tiles sit on the homepage, so
 * throwing here would take down the whole page (same pattern as
 * fetchActiveBanners/fetchProducts).
 *
 * `limit` is capped at 100 by the backend's cursorPaginationSchema and defaults
 * to 10, so it has to be passed explicitly to get a full row's worth. Only the
 * first page is read: this is a bounded display row, not a browsable list.
 *
 * The endpoint has no "top-level only" filter (its `parentId` param requires a
 * non-empty string, so it can't express `parentId IS NULL`), hence the local
 * filter. Inactive rows are already excluded server-side by default.
 */
export async function fetchCategoryTiles(limit = 100): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories?limit=${limit}`, {
      cache: "no-store",
    })
    if (!res.ok) return []

    const body: CategoriesResponse = await res.json()
    return (body.data ?? [])
      .filter((category) => category.parentId === null)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  } catch {
    return []
  }
}
