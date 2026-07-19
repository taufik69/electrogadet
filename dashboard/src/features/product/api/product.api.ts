import { apiFetch, apiFetchPaged } from "@/lib/api"
import type { CreateProductInput, Product, ProductSeo, UpdateProductInput, UpsertProductSeoInput } from "../types/product.types"

export function fetchProducts(params: {
  cursor?: string
  limit?: number
  brandId?: string
  includeInactive?: boolean
}) {
  const query = new URLSearchParams()
  if (params.cursor) query.set("cursor", params.cursor)
  query.set("limit", String(params.limit ?? 50))
  if (params.brandId) query.set("brandId", params.brandId)
  if (params.includeInactive) query.set("includeInactive", "true")

  return apiFetchPaged<Product[]>(`/api/products?${query.toString()}`)
}

export function fetchProductById(id: string) {
  return apiFetch<Product>(`/api/products/${id}`)
}

export function createProduct(input: CreateProductInput) {
  return apiFetch<Product>("/api/products", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateProduct(id: string, input: UpdateProductInput) {
  return apiFetch<Product>(`/api/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function deleteProduct(id: string) {
  return apiFetch<null>(`/api/products/${id}`, { method: "DELETE" })
}

export function upsertProductSeo(productId: string, input: UpsertProductSeoInput) {
  return apiFetch<ProductSeo>(`/api/products/${productId}/seo`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

/** Attaches a product to a category — the many-to-many join (see backend spec §4.2). */
export function attachProductToCategory(categoryId: string, productId: string) {
  return apiFetch<unknown>(`/api/categories/${categoryId}/products`, {
    method: "POST",
    body: JSON.stringify({ productId }),
  })
}

export function detachProductFromCategory(categoryId: string, productId: string) {
  return apiFetch<null>(`/api/categories/${categoryId}/products/${productId}`, { method: "DELETE" })
}
