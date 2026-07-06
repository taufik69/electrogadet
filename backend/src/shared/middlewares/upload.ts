import path from "node:path"
import fs from "node:fs"
import { fileURLToPath } from "node:url"
import multer from "multer"
import { ApiError } from "../helpers/ApiError.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const PUBLIC_DIR = path.resolve(__dirname, "../../../public")
export const CATEGORY_UPLOAD_DIR = path.join(PUBLIC_DIR, "uploads", "categories")

fs.mkdirSync(CATEGORY_UPLOAD_DIR, { recursive: true })

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"])
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, CATEGORY_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${crypto.randomUUID()}${ext}`)
  },
})

export const categoryImageUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new ApiError(400, "Image must be JPEG, PNG, WebP, or AVIF"))
      return
    }
    cb(null, true)
  },
})
