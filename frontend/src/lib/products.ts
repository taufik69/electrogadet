import type { Product } from "@/lib/types/product"
import { demoProducts } from "@/lib/data/demo-catalog"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

interface ProductsResponse {
  success: boolean
  data: Product[]
}

/**
 * Backend products come first; the placeholder catalog tops the list up so the
 * homepage rails aren't near-empty while the real catalog is unseeded.
 * Drop the top-up (and `demo-catalog.ts`) once the backend has enough products.
 */
function topUpWithDemoProducts(products: Product[], limit: number): Product[] {
  if (products.length >= limit) return products.slice(0, limit)

  const seenSlugs = new Set(products.map((product) => product.slug))
  const filler = demoProducts.filter((product) => !seenSlugs.has(product.slug))

  return [...products, ...filler].slice(0, limit)
}

export async function fetchProducts(limit = 12): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/products?limit=${limit}`, {
      next: { revalidate: 120 },
    })
    if (!res.ok) return topUpWithDemoProducts([], limit)
    const body: ProductsResponse = await res.json()
    return topUpWithDemoProducts(body.data ?? [], limit)
  } catch {
    return topUpWithDemoProducts([], limit)
  }
}
