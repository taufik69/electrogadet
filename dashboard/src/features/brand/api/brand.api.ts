import { apiFetch, apiFetchPaged, type CursorMeta } from "@/lib/api"
import type { Brand, CreateBrandInput, UpdateBrandInput } from "../types/brand.types"

export function fetchBrands(params?: { cursor?: string; limit?: number; includeInactive?: boolean }) {
  const query = new URLSearchParams()
  if (params?.cursor) query.set("cursor", params.cursor)
  query.set("limit", String(params?.limit ?? 50))
  if (params?.includeInactive) query.set("includeInactive", "true")

  return apiFetchPaged<Brand[]>(`/api/brands?${query.toString()}`)
}

export function fetchBrandById(id: string) {
  return apiFetch<Brand>(`/api/brands/${id}`)
}

export function createBrand(input: CreateBrandInput) {
  return apiFetch<Brand>("/api/brands", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateBrand(id: string, input: UpdateBrandInput) {
  return apiFetch<Brand>(`/api/brands/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function deleteBrand(id: string) {
  return apiFetch<null>(`/api/brands/${id}`, { method: "DELETE" })
}

export type { CursorMeta }
