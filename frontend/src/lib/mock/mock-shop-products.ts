import type { ProductCardData } from "@/components/product/types"

export interface MockProduct extends ProductCardData {
  brand: string
  rating: number
}

const IMAGE_PARAMS = "w=800&q=90&auto=format&fit=crop"

const SELLERS = [
  { name: "gadget home", verified: true },
  { name: "ct tech", verified: true },
  { name: "Gadget Ministry", verified: true },
  { name: "TechBazaar BD", verified: false },
]

const IMAGE_POOL = [
  "photo-1585386959984-a4155224a1ad",
  "photo-1546435770-a3e426bf472b",
  "photo-1583394838336-acd977736f90",
  "photo-1484704849700-f032a568e944",
  "photo-1519677100203-a0e668c92439",
  "photo-1608156639585-b3a032ef9689",
  "photo-1600294037681-c80b4cb5b434",
  "photo-1583863788434-e58a36330cf0",
  "photo-1546868871-7041f2a55e12",
  "photo-1592921870789-04563d55041c",
  "photo-1650295579054-7a2e698d34fd",
  "photo-1625480860249-b7cf88ad9f78",
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

const NAME_TEMPLATES = [
  "{brand} Wireless Bluetooth {noun} with Fast Charging",
  "{brand} {noun} Pro - Extended Battery Life",
  "{brand} Premium {noun} with Noise Cancellation",
  "{brand} Smart {noun} 2-in-1 Combo Pack",
  "{brand} Portable {noun} for Home & Travel",
  "{brand} High-Speed {noun} - 1 Year Warranty",
  "{brand} Compact {noun} with LED Display",
  "{brand} {noun} Extensive Range Edition",
]

const BRANDS = ["TP-Link", "Xiaomi", "Apple", "OnePlus", "Tenda", "HOCO", "Anker", "Google", "Samsung", "Sony"]

export function generateMockProducts(categoryName: string, count = 9): MockProduct[] {
  const rand = seededRandom(categoryName.length * 97 + count)
  const noun = categoryName.replace(/s$/i, "")

  return Array.from({ length: count }, (_, i) => {
    const brand = BRANDS[Math.floor(rand() * BRANDS.length)]
    const template = NAME_TEMPLATES[i % NAME_TEMPLATES.length]
    const name = template.replace("{brand}", brand).replace("{noun}", noun)
    const seller = SELLERS[i % SELLERS.length]
    const hasDiscount = rand() > 0.25
    const discountPercent = hasDiscount ? Math.round(15 + rand() * 60) : null
    const priceCents = Math.round(300 + rand() * 4500) * 100
    const compareAtCents = discountPercent
      ? Math.round(priceCents / (1 - discountPercent / 100) / 100) * 100
      : null
    const stockCount = Math.round(30 + rand() * 70)
    const soldCount = Math.round(rand() * stockCount * 0.8)
    const image = IMAGE_POOL[(i + categoryName.length) % IMAGE_POOL.length]
    const rating = Math.round((3 + rand() * 2) * 10) / 10

    return {
      slug: `${slugify(name)}-${i}`,
      name,
      imageUrl: `https://images.unsplash.com/${image}?${IMAGE_PARAMS}`,
      priceCents,
      compareAtCents,
      discountPercent,
      sellerName: seller.name,
      isVerifiedSeller: seller.verified,
      badge: rand() > 0.8 ? "hot" : rand() > 0.5 ? "new" : null,
      soldCount,
      stockCount,
      brand,
      rating,
    }
  })
}
