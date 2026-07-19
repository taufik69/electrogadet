import { apiFetch, apiFetchPaged } from "@/lib/api"
import type { Banner, CreateBannerInput, UpdateBannerInput } from "../types/banner.types"

export function fetchBanners(params?: { cursor?: string; limit?: number; includeInactive?: boolean }) {
  const query = new URLSearchParams()
  if (params?.cursor) query.set("cursor", params.cursor)
  query.set("limit", String(params?.limit ?? 50))
  if (params?.includeInactive) query.set("includeInactive", "true")

  return apiFetchPaged<Banner[]>(`/api/banners?${query.toString()}`)
}

export function fetchBannerById(id: string) {
  return apiFetch<Banner>(`/api/banners/${id}`)
}

export function createBanner(input: CreateBannerInput) {
  return apiFetch<Banner>("/api/banners", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateBanner(id: string, input: UpdateBannerInput) {
  return apiFetch<Banner>(`/api/banners/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function deleteBanner(id: string) {
  return apiFetch<null>(`/api/banners/${id}`, { method: "DELETE" })
}
