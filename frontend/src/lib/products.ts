import type { Product } from "@/lib/types/product"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

interface ProductsResponse {
  success: boolean
  data: Product[]
}

/** Always hits the backend fresh — whatever's uploaded there is what shows, no cache and no static filler. */
export async function fetchProducts(limit = 12): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/products?limit=${limit}`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const body: ProductsResponse = await res.json()
    return body.data ?? []
  } catch {
    return []
  }
}
