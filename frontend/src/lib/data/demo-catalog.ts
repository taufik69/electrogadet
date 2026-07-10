import type { Product } from "@/lib/types/product"

/**
 * Placeholder catalog used to fill the homepage rails while the backend
 * has only a handful of products seeded. These are display-only and never
 * written anywhere — remove this module (and its use in `fetchProducts`)
 * once the real catalog is populated.
 */
interface DemoProduct extends Product {
  imageUrl: string
}

const DAY = 24 * 60 * 60 * 1000

/** Fixed epoch so `createdAt` ordering is stable across renders/requests. */
const EPOCH = Date.parse("2026-07-01T00:00:00.000Z")

function daysAgo(days: number): string {
  return new Date(EPOCH - days * DAY).toISOString()
}

const CATALOG: Omit<DemoProduct, "createdAt" | "updatedAt">[] = [
  {
    id: "demo-airpods-pro-3",
    name: "AirPods Pro 3 Wireless Earbuds",
    slug: "airpods-pro-3",
    priceCents: 24900,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
  },
  {
    id: "demo-sony-wh1000xm6",
    name: "Sony WH-1000XM6 Noise Cancelling Headphones",
    slug: "sony-wh-1000xm6",
    priceCents: 39900,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  },
  {
    id: "demo-galaxy-watch-8",
    name: "Samsung Galaxy Watch 8 Smartwatch",
    slug: "galaxy-watch-8",
    priceCents: 32900,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  },
  {
    id: "demo-keychron-k2",
    name: "Keychron K2 Mechanical Keyboard",
    slug: "keychron-k2",
    priceCents: 9900,
    imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80",
  },
  {
    id: "demo-jbl-charge-6",
    name: "JBL Charge 6 Portable Speaker",
    slug: "jbl-charge-6",
    priceCents: 17900,
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
  },
  {
    id: "demo-anker-powerbank",
    name: "Anker 20K Power Bank with USB-C",
    slug: "anker-20k-power-bank",
    priceCents: 5900,
    imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
  },
  {
    id: "demo-macbook-air-m4",
    name: 'Apple MacBook Air 13" M4',
    slug: "macbook-air-13-m4",
    priceCents: 109900,
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
  },
  {
    id: "demo-ipad-air-11",
    name: 'Apple iPad Air 11" (2025)',
    slug: "ipad-air-11-2025",
    priceCents: 59900,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
  },
  {
    id: "demo-iphone-17-pro",
    name: "Apple iPhone 17 Pro",
    slug: "iphone-17-pro",
    priceCents: 119900,
    imageUrl: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800&q=80",
  },
  {
    id: "demo-galaxy-s25-ultra",
    name: "Samsung Galaxy S25 Ultra",
    slug: "galaxy-s25-ultra",
    priceCents: 129900,
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
  },
  {
    id: "demo-bose-qc-ultra",
    name: "Bose QuietComfort Ultra Headphones",
    slug: "bose-quietcomfort-ultra",
    priceCents: 42900,
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
  },
  {
    id: "demo-logitech-mx-master",
    name: "Logitech MX Master 4 Wireless Mouse",
    slug: "logitech-mx-master-4",
    priceCents: 11900,
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
  },
  {
    id: "demo-galaxy-buds-4-pro",
    name: "Samsung Galaxy Buds 4 Pro",
    slug: "galaxy-buds-4-pro",
    priceCents: 19900,
    imageUrl: "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800&q=80",
  },
  {
    id: "demo-thinkpad-x1",
    name: "Lenovo ThinkPad X1 Carbon Gen 13",
    slug: "thinkpad-x1-carbon-gen-13",
    priceCents: 159900,
    imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80",
  },
  {
    id: "demo-xiaomi-band-10",
    name: "Xiaomi Smart Band 10 Fitness Tracker",
    slug: "xiaomi-smart-band-10",
    priceCents: 4900,
    imageUrl: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80",
  },
  {
    id: "demo-asus-rog-monitor",
    name: "Asus ROG Swift OLED Gaming Monitor",
    slug: "asus-rog-swift-oled",
    priceCents: 89900,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
  },
]

/** Newest first, spaced a day apart so date sorting is deterministic. */
export const demoProducts: Product[] = CATALOG.map((product, index) => ({
  ...product,
  createdAt: daysAgo(index),
  updatedAt: daysAgo(index),
}))
