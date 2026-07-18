import type { SidebarBrand } from "@/lib/types/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

interface SidebarResponse {
  success: boolean
  data: SidebarBrand[]
}

/**
 * The sidebar lives in the root layout, so it renders on every page — a
 * thrown error here would take down the whole site. Degrades to an empty
 * array on any failure, same pattern as fetchProducts/getActiveAnnouncement.
 *
 * revalidate: 300 matches the backend's CACHE_TTL.LONG for this endpoint
 * (spec §9.2) — no point revalidating more often than the origin cache changes.
 */
export async function fetchSidebar(): Promise<SidebarBrand[]> {
  try {
    const res = await fetch(`${API_URL}/api/navigation/sidebar`, {
      next: { revalidate: 300, tags: ["navigation"] },
    })
    if (!res.ok) return []
    const body: SidebarResponse = await res.json()
    return body.data ?? []
  } catch {
    return []
  }
}
