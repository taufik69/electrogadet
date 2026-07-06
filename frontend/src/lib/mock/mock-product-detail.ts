export interface ProductDetail {
  slug: string
  name: string
  brand: string
  images: string[]
  priceCents: number
  compareAtCents: number | null
  discountPercent: number | null
  rating: number
  reviewCount: number
  sellerName: string
  isVerifiedSeller: boolean
  stockCount: number
  soldCount: number
  categoryName: string
  categorySlug: string
  descriptionBullets: string[]
  specs: { label: string; value: string }[]
}

const IMAGE_PARAMS = "w=1000&q=90&auto=format&fit=crop"

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

const SELLERS = [
  { name: "gadget home", verified: true },
  { name: "ct tech", verified: true },
  { name: "Gadget Ministry", verified: true },
  { name: "TechBazaar BD", verified: false },
]

const BRANDS = ["TP-Link", "Xiaomi", "Apple", "OnePlus", "Tenda", "HOCO", "Anker", "Google", "Samsung", "Sony"]

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

function seedFromString(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  }
  return hash
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter((part) => !/^\d+$/.test(part))
    .join(" ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function generateMockProductDetail(slug: string): ProductDetail {
  const seed = seedFromString(slug)
  const rand = seededRandom(seed)

  const brand = BRANDS[Math.floor(rand() * BRANDS.length)]
  const seller = SELLERS[Math.floor(rand() * SELLERS.length)]
  const name = titleFromSlug(slug) || `${brand} Product`

  const priceCents = Math.round(300 + rand() * 4500) * 100
  const hasDiscount = rand() > 0.2
  const discountPercent = hasDiscount ? Math.round(15 + rand() * 55) : null
  const compareAtCents = discountPercent
    ? Math.round(priceCents / (1 - discountPercent / 100) / 100) * 100
    : null

  const stockCount = Math.round(30 + rand() * 70)
  const soldCount = Math.round(rand() * stockCount * 0.8)
  const rating = Math.round((3.5 + rand() * 1.5) * 10) / 10
  const reviewCount = Math.round(8 + rand() * 400)

  const imageCount = 2 + Math.floor(rand() * 3)
  const images = Array.from({ length: imageCount }, (_, i) => {
    const image = IMAGE_POOL[(seed + i) % IMAGE_POOL.length]
    return `https://images.unsplash.com/${image}?${IMAGE_PARAMS}`
  })

  const categoryName = "Charger & Cable"
  const categorySlug = "charger-cable"

  const descriptionBullets = [
    `${name} delivers fast, reliable charging with premium build quality.`,
    `Supports high-speed charging with intelligent temperature control.`,
    `Compact and travel-friendly design, compatible with most modern devices.`,
    `Backed by ${seller.name}'s ${seller.verified ? "verified" : "standard"} seller warranty.`,
  ]

  const specs = [
    { label: "Brand", value: brand },
    { label: "Model", value: name.split(" ").slice(0, 3).join(" ") },
    { label: "Color", value: "White" },
    { label: "Warranty", value: "1 Year" },
    { label: "Input Voltage", value: "100-240V" },
    { label: "Country of Origin", value: "China" },
  ]

  return {
    slug,
    name,
    brand,
    images,
    priceCents,
    compareAtCents,
    discountPercent,
    rating,
    reviewCount,
    sellerName: seller.name,
    isVerifiedSeller: seller.verified,
    stockCount,
    soldCount,
    categoryName,
    categorySlug,
    descriptionBullets,
    specs,
  }
}
