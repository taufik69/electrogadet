import { NAVIGATION_CACHE_NAMESPACE } from "../../shared/constant/namespaces.js"

export { NAVIGATION_CACHE_NAMESPACE }

/**
 * Cap on products returned per category in the sidebar tree (spec §9.2).
 * Twelve rows fill the 46px-row flyout past a typical viewport; without a cap,
 * one large category would silently bloat the unpaginated /sidebar payload.
 */
export const SIDEBAR_PRODUCTS_PER_CATEGORY = 12
