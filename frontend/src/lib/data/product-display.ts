import type { Product, ProductCardData } from "@/lib/types/product"

/**
 * Placeholder imagery, ratings, and badges for products until the backend
 * schema grows real columns for them (see homepage.spec.md §4, §9). Every
 * product resolves deterministically from its id so the same product always
 * gets the same placeholder values across renders and requests.
 */
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", // headphones
  "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80", // speaker
  "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80", // earbuds
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", // smartwatch
  "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80", // charger/power bank
  "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80", // keyboard
]

function hashToIndex(id: string, length: number): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return hash % length
}

export function toProductCardData(product: Product, index: number): ProductCardData {
  const imageIndex = hashToIndex(product.id, PLACEHOLDER_IMAGES.length)
  // Prefer the product's own image; fall back to a deterministic placeholder.
  const imageUrl = product.imageUrl ?? PLACEHOLDER_IMAGES[imageIndex]
  const hasRating = hashToIndex(product.id + "rating", 4) !== 0
  const isNew = index < 3
  const isBestseller = !isNew && index < 8 && hashToIndex(product.id + "badge", 3) === 0
  const hasDiscount = hashToIndex(product.id + "discount", 5) === 0

  // Stand-in gallery: 3–5 consecutive placeholder images starting at the product's own.
  const galleryLength = 3 + hashToIndex(product.id + "gallery", 3)
  const imageUrls = Array.from(
    { length: galleryLength },
    (_, offset) => PLACEHOLDER_IMAGES[(imageIndex + offset) % PLACEHOLDER_IMAGES.length]
  )

  return {
    ...product,
    imageUrl,
    imageUrls,
    rating: hasRating ? 3.5 + (hashToIndex(product.id + "rv", 4) * 0.5) : undefined,
    reviewCount: hasRating ? 12 + hashToIndex(product.id + "rc", 240) : undefined,
    discountPercent: hasDiscount ? [10, 15, 20, 25][hashToIndex(product.id + "pct", 4)] : undefined,
    badge: isNew ? "new" : isBestseller ? "bestseller" : null,
    inStock: hashToIndex(product.id + "stock", 6) !== 0,
  }
}

export function toProductCardDataList(products: Product[]): ProductCardData[] {
  return products.map((product, index) => toProductCardData(product, index))
}
