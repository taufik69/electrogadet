import { apiFetch, apiFetchFormData } from "@/lib/api"
import type { Category, CategoryInput, CategoryTreeNode } from "./types"

function toFormData(input: Partial<CategoryInput>) {
  const formData = new FormData()
  if (input.name !== undefined) formData.set("name", input.name)
  if (input.slug !== undefined) formData.set("slug", input.slug)
  if (input.parentId !== undefined) formData.set("parentId", input.parentId)
  if (input.sortOrder !== undefined) formData.set("sortOrder", String(input.sortOrder))
  if (input.isClearance !== undefined) formData.set("isClearance", String(input.isClearance))
  if (input.showInMegaMenu !== undefined) formData.set("showInMegaMenu", String(input.showInMegaMenu))
  if (input.image) formData.set("image", input.image)
  return formData
}

export function fetchCategories() {
  return apiFetch<Category[]>("/api/categories?limit=100")
}

export function fetchCategoryTree() {
  return apiFetch<CategoryTreeNode[]>("/api/categories/tree")
}

export function fetchCategoryById(id: string) {
  return apiFetch<Category>(`/api/categories/${id}`)
}

export function createCategory(input: CategoryInput) {
  return apiFetchFormData<Category>("/api/categories", toFormData(input), "POST")
}

export function updateCategory(id: string, input: Partial<CategoryInput>) {
  return apiFetchFormData<Category>(`/api/categories/${id}`, toFormData(input), "PATCH")
}

export function deleteCategory(id: string) {
  return apiFetch<null>(`/api/categories/${id}`, { method: "DELETE" })
}
