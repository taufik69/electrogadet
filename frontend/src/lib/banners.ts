import type { Banner } from "@/lib/types/banner"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

interface BannersResponse {
  success: boolean
  data: Banner[]
}

/**
 * Always hits the backend fresh — whatever is active there is what shows.
 * Degrades to an empty array on any failure: the carousel sits in the
 * homepage hero, so a thrown error here would take down the whole page (same
 * pattern as fetchProducts/fetchSidebar).
 *
 * Only banners whose image finished uploading are returned — a `pending` row
 * has an empty url and would render a broken image (spec §8).
 */
export async function fetchActiveBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${API_URL}/api/banners/active`, { cache: "no-store" })
    if (!res.ok) return []
    const body: BannersResponse = await res.json()
    return (body.data ?? []).filter((banner) => banner.image?.status === "uploaded")
  } catch {
    return []
  }
}
