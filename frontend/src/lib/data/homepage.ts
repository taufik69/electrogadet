import type { LucideIcon } from "lucide-react"
import {
  PackageOpen,
  Wrench,
  Sparkles,
  Truck,
  RefreshCw,
  Tag,
} from "lucide-react"

/** Service benefits row. */
export interface Benefit {
  title: string
  description: string
  icon: LucideIcon
}

export const benefits: Benefit[] = [
  {
    title: "Pickup",
    description: "Collect your order from our store the same day it's ready.",
    icon: PackageOpen,
  },
  {
    title: "Service",
    description: "Certified technicians for setup, transfer, and diagnostics.",
    icon: Wrench,
  },
  {
    title: "Repair",
    description: "Out-of-warranty repairs with genuine replacement parts.",
    icon: Sparkles,
  },
  {
    title: "Delivery",
    description: "Free next-day delivery on every order over $50.",
    icon: Truck,
  },
  {
    title: "Trade-in",
    description: "Trade your old device and put its value toward a new one.",
    icon: RefreshCw,
  },
  {
    title: "Price match",
    description: "Find it cheaper elsewhere and we'll match the price.",
    icon: Tag,
  },
]

// Editorial articles now come from the backend — see src/lib/articles.ts and
// src/lib/types/article.ts. The hardcoded array that used to live here was
// deleted with the API integration: leaving a stale copy alongside live data is
// how the two silently diverge.

/** Wide promo banners near the page foot. */
export interface FootPromo {
  title: string
  subtitle?: string
  href: string
  imageUrl: string
  /** Tailwind classes for the tile's background tint. */
  toneClassName: string
}

export const footPromos: FootPromo[] = [
  {
    title: "Gift cards",
    subtitle: "Any amount, delivered instantly.",
    href: "/gift-cards",
    imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80",
    toneClassName: "bg-warning/15",
  },
  {
    title: "Accessories for every device",
    subtitle: "Cases, cables, chargers and more.",
    href: "/products?category=accessories",
    imageUrl: "https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=800&q=80",
    toneClassName: "bg-brand-subtle",
  },
]
