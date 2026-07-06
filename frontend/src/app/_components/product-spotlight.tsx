"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"

interface SpotlightProduct {
  name: string
  imageUrl: string
  priceCents: number
  compareAtCents: number
  discountPercent: number
  badge: string
}

const spotlightProducts: SpotlightProduct[] = [
  {
    name: "Vega Jeet Matt Black Half Face…",
    imageUrl:
      "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600&q=80",
    priceCents: 224900,
    compareAtCents: 345000,
    discountPercent: 35,
    badge: "Fast Gear",
  },
  {
    name: "Studds Shifter Full Face Helmet",
    imageUrl:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=80",
    priceCents: 189900,
    compareAtCents: 259900,
    discountPercent: 27,
    badge: "Fast Gear",
  },
]

function formatTaka(cents: number): string {
  return `৳${(cents / 100).toLocaleString("en-US")}`
}

export function ProductSpotlight() {
  const [index, setIndex] = useState(0)
  const product = spotlightProducts[index]

  function goTo(next: number) {
    setIndex((next + spotlightProducts.length) % spotlightProducts.length)
  }

  return (
    <div className="w-full max-w-xs shrink-0 overflow-hidden rounded-2xl bg-white text-text-primary shadow-2xl">
      <div className="relative aspect-square bg-bg-section">
        <span className="text-caption absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-semibold text-text-primary shadow-e1">
          <CheckCircle2 size={12} className="text-success" aria-hidden="true" />
          {product.badge}
        </span>
        <span className="text-caption absolute right-3 top-3 z-10 rounded-full bg-danger px-2.5 py-1 font-bold text-white">
          -{product.discountPercent}%
        </span>

        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="320px"
          className="object-cover"
        />

        <button
          type="button"
          aria-label="Previous product"
          onClick={() => goTo(index - 1)}
          className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-text-primary shadow-e1 transition-colors hover:bg-bg-section"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Next product"
          onClick={() => goTo(index + 1)}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-text-primary shadow-e1 transition-colors hover:bg-bg-section"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1">
          {spotlightProducts.map((item, dotIndex) => (
            <span
              key={item.name}
              className={`h-1.5 rounded-full transition-all ${
                dotIndex === index ? "w-4 bg-danger" : "w-1.5 bg-text-secondary/30"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-small truncate text-text-primary">{product.name}</p>
          <p className="flex items-baseline gap-2">
            <span className="text-h4 font-semibold text-text-primary">
              {formatTaka(product.priceCents)}
            </span>
            <span className="text-small text-text-secondary line-through">
              {formatTaka(product.compareAtCents)}
            </span>
          </p>
        </div>
        <button
          type="button"
          aria-label={`View ${product.name}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger text-white transition-colors hover:bg-danger/90"
        >
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
