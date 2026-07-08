import type { Banner } from "@/lib/types/banner"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export async function getActiveBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${API_URL}/api/banners/active`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const body = await res.json()
    return (body.data ?? []) as Banner[]
  } catch {
    return []
  }
}
