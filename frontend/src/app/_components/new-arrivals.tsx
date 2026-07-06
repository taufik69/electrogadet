import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"
import type { ProductCardData } from "@/components/product/types"

const IMAGE_PARAMS = "w=800&q=90&auto=format&fit=crop"

const newArrivalProducts: ProductCardData[] = [
  {
    slug: "smartwatch-touchscreen-fitness",
    name: "Touchscreen Smartwatch with Fitness & Health Tracking",
    imageUrl: `https://images.unsplash.com/photo-1579586337278-3befd40fd17a?${IMAGE_PARAMS}`,
    priceCents: 349000,
    compareAtCents: 620000,
    discountPercent: 44,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "new",
    soldCount: 8,
    stockCount: 40,
  },
  {
    slug: "portable-bluetooth-speaker-waterproof",
    name: "Portable Waterproof Bluetooth Speaker - Deep Bass",
    imageUrl: `https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?${IMAGE_PARAMS}`,
    priceCents: 289000,
    compareAtCents: 450000,
    discountPercent: 36,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "new",
    soldCount: 14,
    stockCount: 50,
  },
  {
    slug: "wireless-earbuds-noise-cancelling",
    name: "Wireless Earbuds with Active Noise Cancellation",
    imageUrl: `https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?${IMAGE_PARAMS}`,
    priceCents: 199000,
    compareAtCents: 380000,
    discountPercent: 48,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "new",
    soldCount: 21,
    stockCount: 60,
  },
  {
    slug: "power-bank-20000mah-fast-charge",
    name: "20000mAh Power Bank with 22.5W Fast Charging",
    imageUrl: `https://images.unsplash.com/photo-1566554738544-d962991c3fee?${IMAGE_PARAMS}`,
    priceCents: 145000,
    compareAtCents: 260000,
    discountPercent: 44,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "new",
    soldCount: 6,
    stockCount: 45,
  },
  {
    slug: "hd-webcam-1080p-streaming",
    name: "1080p HD Webcam with Autofocus for Streaming",
    imageUrl: `https://images.unsplash.com/photo-1623949556303-b0d17d198863?${IMAGE_PARAMS}`,
    priceCents: 165000,
    compareAtCents: 290000,
    discountPercent: 43,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "new",
    soldCount: 11,
    stockCount: 35,
  },
  {
    slug: "wireless-gaming-mouse-rgb",
    name: "Wireless Gaming Mouse with RGB & Programmable Buttons",
    imageUrl: `https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?${IMAGE_PARAMS}`,
    priceCents: 129000,
    compareAtCents: 240000,
    discountPercent: 46,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "new",
    soldCount: 17,
    stockCount: 55,
  },
  {
    slug: "mechanical-keyboard-hotswap-65",
    name: "65% Hot-Swappable Mechanical Keyboard",
    imageUrl: `https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?${IMAGE_PARAMS}`,
    priceCents: 385000,
    compareAtCents: 620000,
    discountPercent: 38,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "new",
    soldCount: 9,
    stockCount: 30,
  },
  {
    slug: "camera-drone-4k-gps",
    name: "4K GPS Camera Drone with 30-Min Flight Time",
    imageUrl: `https://images.unsplash.com/photo-1521405924368-64c5b84bec60?${IMAGE_PARAMS}`,
    priceCents: 1890000,
    compareAtCents: 2900000,
    discountPercent: 35,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "new",
    soldCount: 3,
    stockCount: 20,
  },
  {
    slug: "vr-headset-all-in-one",
    name: "All-in-One VR Headset - 4K Ultra Clear Display",
    imageUrl: `https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?${IMAGE_PARAMS}`,
    priceCents: 2450000,
    compareAtCents: 3600000,
    discountPercent: 32,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "new",
    soldCount: 5,
    stockCount: 25,
  },
  {
    slug: "smart-home-speaker-voice-assistant",
    name: "Smart Home Speaker with Voice Assistant",
    imageUrl: `https://images.unsplash.com/photo-1529359744902-86b2ab9edaea?${IMAGE_PARAMS}`,
    priceCents: 420000,
    compareAtCents: 680000,
    discountPercent: 38,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "new",
    soldCount: 13,
    stockCount: 40,
  },
]

export function NewArrivals() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-danger">
            Fresh in stock
          </p>
          <h2 className="text-h3 text-text-primary">New arrivals</h2>
          <p className="text-small mt-1 text-text-secondary">
            The latest gadgets and camera gear, just added to the store.
          </p>
        </div>

        <Link
          href="/products?sort=newest"
          className="text-small-semibold flex shrink-0 items-center gap-1.5 text-text-primary transition-colors hover:text-brand-primary"
        >
          View all
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {newArrivalProducts.map((product) => (
          <ProductCard key={product.slug} {...product} />
        ))}
      </div>
    </section>
  )
}
