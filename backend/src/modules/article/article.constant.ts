export const ARTICLE_CACHE_NAMESPACE = "article"

/** Length of the <meta name="description"> derived from `content` (spec §2.11). */
export const META_DESCRIPTION_LENGTH = 155

// The one-cover-per-article cap lives in image.constant.ts
// (MAX_ARTICLE_COVER_IMAGES), next to the banner/gallery caps it mirrors — the
// check runs in image.service.ts, and cross-module imports are forbidden
// (ARCHITECTURE.md §5).
