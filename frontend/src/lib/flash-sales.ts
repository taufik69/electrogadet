import type { FlashSale } from "@/lib/types/flash-sale"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export async function getActiveFlashSale(): Promise<FlashSale | null> {
  try {
    const res = await fetch(`${API_URL}/api/flash-sales/active`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    const body = await res.json()
    return (body.data ?? null) as FlashSale | null
  } catch {
    return null
  }
}
