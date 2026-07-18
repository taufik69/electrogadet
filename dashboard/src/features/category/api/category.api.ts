import { apiFetch, apiFetchPaged } from "@/lib/api"
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../types/category.types"

export function fetchCategories(params: { brandId: string; cursor?: string; limit?: number; includeInactive?: boolean }) {
  const query = new URLSearchParams()
  query.set("brandId", params.brandId)
  if (params.cursor) query.set("cursor", params.cursor)
  query.set("limit", String(params.limit ?? 50))
  if (params.includeInactive) query.set("includeInactive", "true")

  return apiFetchPaged<Category[]>(`/api/categories?${query.toString()}`)
}

export function fetchCategoryById(id: string) {
  return apiFetch<Category>(`/api/categories/${id}`)
}

export function createCategory(input: CreateCategoryInput) {
  return apiFetch<Category>("/api/categories", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateCategory(id: string, input: UpdateCategoryInput) {
  return apiFetch<Category>(`/api/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function deleteCategory(id: string) {
  return apiFetch<null>(`/api/categories/${id}`, { method: "DELETE" })
}
