import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"
import type { ProductCardData } from "@/components/product/types"

const IMAGE_PARAMS = "w=800&q=90&auto=format&fit=crop"

const bestSellerProducts: ProductCardData[] = [
  {
    slug: "mirrorless-camera-4k-vlogging-kit",
    name: "Mirrorless 4K Vlogging Camera Kit with 16-45mm Lens",
    imageUrl: `https://images.unsplash.com/photo-1516035069371-29a1b244cc32?${IMAGE_PARAMS}`,
    priceCents: 4890000,
    compareAtCents: 8990000,
    discountPercent: 46,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "hot",
    soldCount: 12,
    stockCount: 40,
  },
  {
    slug: "dslr-prime-lens-50mm-f1-8",
    name: "50mm f/1.8 Prime Lens for DSLR Cameras - Portrait",
    imageUrl: `https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?${IMAGE_PARAMS}`,
    priceCents: 1250000,
    compareAtCents: 2100000,
    discountPercent: 40,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "new",
    soldCount: 34,
    stockCount: 60,
  },
  {
    slug: "action-camera-waterproof-4k",
    name: "Waterproof 4K Action Camera with Stabilization",
    imageUrl: `https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?${IMAGE_PARAMS}`,
    priceCents: 890000,
    compareAtCents: 2200000,
    discountPercent: 60,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "new",
    soldCount: 22,
    stockCount: 50,
  },
  {
    slug: "camera-lens-wide-angle-pro",
    name: "Wide-Angle Pro Lens for Mirrorless Cameras",
    imageUrl: `https://images.unsplash.com/photo-1580852300513-9b50125bf293?${IMAGE_PARAMS}`,
    priceCents: 450000,
    compareAtCents: 1120000,
    discountPercent: 60,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "new",
    soldCount: 9,
    stockCount: 45,
  },
  {
    slug: "instant-print-camera-retro",
    name: "Instant Print Camera - Retro Edition with Film Pack",
    imageUrl: `https://images.unsplash.com/photo-1612547036242-77002603e5aa?${IMAGE_PARAMS}`,
    priceCents: 720000,
    compareAtCents: 1650000,
    discountPercent: 56,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "hot",
    soldCount: 41,
    stockCount: 80,
  },
  {
    slug: "wireless-lavalier-mic-camera",
    name: "Wireless Lavalier Microphone System for Cameras",
    imageUrl: `https://images.unsplash.com/photo-1590602847861-f357a9332bbc?${IMAGE_PARAMS}`,
    priceCents: 380000,
    compareAtCents: 950000,
    discountPercent: 60,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: null,
    soldCount: 16,
    stockCount: 35,
  },
  {
    slug: "camera-backpack-anti-theft",
    name: "Anti-Theft Camera Backpack with Laptop Compartment",
    imageUrl: `https://images.unsplash.com/photo-1547949003-9792a18a2601?${IMAGE_PARAMS}`,
    priceCents: 340000,
    compareAtCents: 680000,
    discountPercent: 50,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "new",
    soldCount: 27,
    stockCount: 55,
  },
  {
    slug: "camera-gimbal-3-axis-stabilizer",
    name: "3-Axis Handheld Gimbal Stabilizer for Smartphones",
    imageUrl: `https://images.unsplash.com/photo-1638243292863-3744d6a7e021?${IMAGE_PARAMS}`,
    priceCents: 560000,
    compareAtCents: 1400000,
    discountPercent: 60,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "hot",
    soldCount: 31,
    stockCount: 60,
  },
  {
    slug: "camera-lens-filter-kit-uv-cpl",
    name: "UV + CPL + ND Lens Filter Kit - 77mm",
    imageUrl: `https://images.unsplash.com/photo-1545424273-4dd93a233016?${IMAGE_PARAMS}`,
    priceCents: 210000,
    compareAtCents: 480000,
    discountPercent: 56,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: null,
    soldCount: 19,
    stockCount: 40,
  },
  {
    slug: "sd-card-256gb-high-speed",
    name: "256GB High-Speed Memory Card for Cameras - U3 V30",
    imageUrl: `https://images.unsplash.com/photo-1589532768434-a92c95dad7cb?${IMAGE_PARAMS}`,
    priceCents: 180000,
    compareAtCents: 320000,
    discountPercent: 44,
    sellerName: "ct tech",
    isVerifiedSeller: true,
    badge: "new",
    soldCount: 63,
    stockCount: 100,
  },
]

export function BestSellers() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-danger">
            What everyone&rsquo;s buying
          </p>
          <h2 className="text-h3 text-text-primary">Best sellers this week</h2>
          <p className="text-small mt-1 text-text-secondary">
            Ranked by verified purchases &amp; customer reviews — updated every
            Monday.
          </p>
        </div>

        <Link
          href="/products?sort=bestsellers"
          className="text-small-semibold flex shrink-0 items-center gap-1.5 text-text-primary transition-colors hover:text-brand-primary"
        >
          View all
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {bestSellerProducts.map((product) => (
          <ProductCard key={product.slug} {...product} />
        ))}
      </div>
    </section>
  )
}
