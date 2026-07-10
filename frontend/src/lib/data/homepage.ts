import type { LucideIcon } from "lucide-react"
import {
  PackageOpen,
  Wrench,
  Sparkles,
  Truck,
  RefreshCw,
  Tag,
} from "lucide-react"

/** Category tiles shown between the bestseller strip and the popular rail. */
export interface CategoryTile {
  name: string
  slug: string
  imageUrl: string
}

export const categoryTiles: CategoryTile[] = [
  {
    name: "Tablets",
    slug: "tablets",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
  },
  {
    name: "Smartphones",
    slug: "smartphones",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
  },
  {
    name: "Laptops",
    slug: "laptops",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
  },
  {
    name: "Smartwatch",
    slug: "smartwatch",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
  },
]

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

/** Editorial articles. */
export interface Article {
  title: string
  slug: string
  imageUrl: string
  publishedAt: string
  views: number
}

export const articles: Article[] = [
  {
    title: "iPhone 17 Pro vs iPhone 16 Pro: is the upgrade worth it in 2026?",
    slug: "iphone-17-pro-vs-16-pro",
    imageUrl: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800&q=80",
    publishedAt: "2026-06-14",
    views: 15300,
  },
  {
    title: "Which iPhone 17 case actually protects your phone?",
    slug: "best-iphone-17-cases",
    imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80",
    publishedAt: "2026-06-02",
    views: 9716,
  },
  {
    title: "Setting up a new Mac: the first ten things to do",
    slug: "new-mac-setup-guide",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    publishedAt: "2026-05-21",
    views: 7420,
  },
]

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
