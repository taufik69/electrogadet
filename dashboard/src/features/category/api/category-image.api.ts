import { apiUpload } from "@/lib/api"

interface ImageRecord {
  id: string
  status: "pending" | "processing" | "uploaded" | "failed"
}

/**
 * Uploads a local file for a category's image. Same fire-and-forget pattern
 * as brand-image.api.ts — the backend's BullMQ worker uploads to Cloudinary
 * asynchronously and writes Category.imageUrl once done.
 */
export function uploadCategoryImage(categoryId: string, file: File) {
  const formData = new FormData()
  formData.set("ownerType", "category")
  formData.set("ownerId", categoryId)
  formData.set("file", file)

  return apiUpload<ImageRecord>("/api/images", formData)
}
