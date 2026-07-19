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
 * No caching — always reflects whatever's currently in the backend.
 */
export async function fetchSidebar(): Promise<SidebarBrand[]> {
  try {
    const res = await fetch(`${API_URL}/api/navigation/sidebar`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const body: SidebarResponse = await res.json()
    return body.data ?? []
  } catch {
    return []
  }
}
