import type { NavCategoryTreeNode } from "@/lib/types/category"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export async function getCategoryTree(): Promise<NavCategoryTreeNode[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories/tree`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const body = await res.json()
    return (body.data ?? []) as NavCategoryTreeNode[]
  } catch {
    return []
  }
}

export function findCategoryBySlug(
  categories: NavCategoryTreeNode[],
  slug: string,
): { category: NavCategoryTreeNode; parent: NavCategoryTreeNode | null } | null {
  for (const category of categories) {
    if (category.slug === slug) return { category, parent: null }
    const child = category.children.find((c) => c.slug === slug)
    if (child) {
      return { category: { ...child, children: [] }, parent: category }
    }
  }
  return null
}
