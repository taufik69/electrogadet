/**
 * Response shape for GET /api/navigation/sidebar — matches
 * frontend/src/lib/data/brands.ts's Brand/BrandCategory/BrandProduct shape
 * exactly (see spec §4.1, §5.3), so the frontend can consume it as a drop-in
 * replacement for the hardcoded array with zero JSX changes.
 */
export interface SidebarProduct {
  id: string
  name: string
  slug: string
}

export interface SidebarCategory {
  id: string
  name: string
  slug: string
  products: SidebarProduct[]
}

export interface SidebarBrand {
  id: string
  name: string
  slug: string
  iconKey: string | null
  imageUrl: string | null
  categories: SidebarCategory[]
}
