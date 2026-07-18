/**
 * Cross-module cache namespace shared by every module that composes the
 * sidebar tree (brand, category, product, navigation). Any mutation to
 * Brand/Category/Product/ProductCategory must bump this alongside its own
 * namespace — see navigation.spec.md §3.2 and §7.
 */
export const NAVIGATION_CACHE_NAMESPACE = "navigation"
