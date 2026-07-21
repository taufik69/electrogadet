import { apiUpload } from "@/lib/api"
import type { ArticleCoverImage } from "../types/article.types"

/**
 * Uploads (or replaces) an article's cover through the article module's own
 * endpoint rather than the generic POST /api/images.
 *
 * PUT /api/articles/:id/cover is atomic: it swaps the Image row and hands the
 * previous publicId to the worker, which destroys the old Cloudinary asset only
 * after the new upload succeeds (article spec §4.4a). Going through
 * /api/images instead would 409 on the second upload, since an article is
 * capped at one cover.
 *
 * The article must already exist — ownerId is required — which is why the
 * create page does create-then-upload (spec §7.2).
 */
export function uploadArticleCover(articleId: string, file: File) {
  const formData = new FormData()
  formData.set("file", file)

  return apiUpload<ArticleCoverImage>(`/api/articles/${articleId}/cover`, formData, "PUT")
}
