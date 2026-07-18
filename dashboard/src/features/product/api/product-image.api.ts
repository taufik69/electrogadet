import { apiFetch, apiUpload } from "@/lib/api"

export interface ImageRecord {
  id: string
  url: string
  status: "pending" | "processing" | "uploaded" | "failed"
  sortOrder: number
  alt: string | null
}

/**
 * Uploads a local file as a product's thumbnail (single, at-most-one image).
 * Same fire-and-forget pattern as brand/category image uploads — the
 * backend's BullMQ worker uploads to Cloudinary asynchronously.
 */
export function uploadProductThumbnail(productId: string, file: File) {
  const formData = new FormData()
  formData.set("ownerType", "product_thumbnail")
  formData.set("ownerId", productId)
  formData.set("file", file)

  return apiUpload<ImageRecord>("/api/images", formData)
}

/** Uploads a local file into a product's ordered gallery (many per product). */
export function uploadProductGalleryImage(productId: string, file: File) {
  const formData = new FormData()
  formData.set("ownerType", "product_gallery")
  formData.set("ownerId", productId)
  formData.set("file", file)

  return apiUpload<ImageRecord>("/api/images", formData)
}

export function fetchProductThumbnail(productId: string) {
  return apiFetch<ImageRecord[]>(`/api/images?ownerType=product_thumbnail&ownerId=${productId}`)
}

export function fetchProductGallery(productId: string) {
  return apiFetch<ImageRecord[]>(`/api/images?ownerType=product_gallery&ownerId=${productId}`)
}

export function deleteProductImage(imageId: string) {
  return apiFetch<null>(`/api/images/${imageId}`, { method: "DELETE" })
}
