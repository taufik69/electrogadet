export const IMAGE_CACHE_NAMESPACE = "image"

// UPLOAD_TMP_DIR moved to shared/middlewares/upload.ts alongside the multer
// instance that uses it — the article module mounts the same middleware on its
// own route, and importing sideways between modules is forbidden.

/** A product's gallery (ownerType "product_gallery") is capped at this many images. */
export const MAX_PRODUCT_GALLERY_IMAGES = 10

/** A banner carries exactly one image (banner spec §2.3/§4.2). */
export const MAX_BANNER_IMAGES = 1

/** An article carries exactly one cover image (article spec §2.3/§4.4). */
export const MAX_ARTICLE_COVER_IMAGES = 1
