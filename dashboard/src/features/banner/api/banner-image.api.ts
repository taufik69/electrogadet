import { apiFetch, apiUpload } from "@/lib/api"
import type { BannerImage } from "../types/banner.types"

/**
 * Uploads a banner's image via the generic image endpoint. The banner must
 * already exist — ownerId is required, which is why the create page does
 * create-then-upload (banner spec §4.2/§7.2).
 *
 * A banner holds exactly one image: the backend rejects a second upload with
 * 409, so replacing means deleting the existing one first.
 */
export function uploadBannerImage(bannerId: string, file: File) {
  const formData = new FormData()
  formData.set("ownerType", "banner")
  formData.set("ownerId", bannerId)
  formData.set("file", file)

  return apiUpload<BannerImage>("/api/images", formData)
}

export function deleteBannerImage(imageId: string) {
  return apiFetch<null>(`/api/images/${imageId}`, { method: "DELETE" })
}
