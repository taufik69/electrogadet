import slugify from "slugify"

/**
 * Derives a URL-safe slug from a display name. Used by any module that
 * generates its own slug server-side rather than accepting one from the
 * client (brand.service.ts, category.service.ts) — kept here instead of
 * duplicated per module, or reached into cross-module (forbidden by
 * ARCHITECTURE.md §5).
 */
export function generateSlug(name: string): string {
  return slugify(name, { lower: true, strict: true })
}
