import { apiUpload } from "@/lib/api"

interface ImageRecord {
  id: string
  status: "pending" | "processing" | "uploaded" | "failed"
}

/**
 * Uploads a local file for a brand's logo image. Returns immediately with
 * status "pending" — the backend's BullMQ worker uploads to Cloudinary
 * asynchronously and writes Brand.imageUrl once done (see
 * backend/src/worker.ts). There is no synchronous "wait for imageUrl" here;
 * the caller just needs to know the upload was queued.
 */
export function uploadBrandImage(brandId: string, file: File) {
  const formData = new FormData()
  formData.set("ownerType", "brand")
  formData.set("ownerId", brandId)
  formData.set("file", file)

  return apiUpload<ImageRecord>("/api/images", formData)
}
