/** Mirrors backend/src/modules/navigation/navigation.types.ts — the GET /api/navigation/sidebar response shape. */
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
