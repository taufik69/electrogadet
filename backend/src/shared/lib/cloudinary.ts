import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadResult {
  optimizeUrl: string
  result: { public_id: string }
}

/**
 * Uploads a local file to Cloudinary and returns an f_auto,q_auto delivery url
 * alongside the raw result. Caller owns the local file's lifecycle — this never
 * deletes it (the worker retries against the same localPath on failure).
 */
export async function cloudinaryFileUpload(
  localPath: string,
  options: { folder?: string } = {},
): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(localPath, {
    folder: options.folder ?? "nordvolt",
    resource_type: "image",
  })

  const optimizeUrl = cloudinary.url(result.public_id, {
    fetch_format: "auto",
    quality: "auto",
  })

  return { optimizeUrl, result: { public_id: result.public_id } }
}

export async function deleteCloudinaryFile(publicId: string): Promise<void> {
  if (!publicId) return
  await cloudinary.uploader.destroy(publicId)
}
