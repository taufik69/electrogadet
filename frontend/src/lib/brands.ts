import type { Brand } from "@/lib/types/brand"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export async function getBrands(): Promise<Brand[]> {
  try {
    const res = await fetch(`${API_URL}/api/brands?limit=100`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const body = await res.json()
    return (body.data ?? []) as Brand[]
  } catch {
    return []
  }
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  try {
    const res = await fetch(`${API_URL}/api/brands/slug/${slug}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const body = await res.json()
    return (body.data ?? null) as Brand | null
  } catch {
    return null
  }
}
