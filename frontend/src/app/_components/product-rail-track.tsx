"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import type { ProductCardData } from "@/lib/types/product"

export function ProductRailTrack({ products }: { products: ProductCardData[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>("[data-product-card]")
    const step = (card?.offsetWidth ?? 260) + 16
    track.scrollBy({ left: step * direction, behavior: "smooth" })
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-product-card
            className="w-[calc(50%-8px)] shrink-0 snap-start sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Scroll left"
          onClick={() => scrollByCard(-1)}
          className="size-9 rounded-full"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Scroll right"
          onClick={() => scrollByCard(1)}
          className="size-9 rounded-full"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
