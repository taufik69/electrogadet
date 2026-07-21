"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDragScroll } from "@/hooks/use-drag-scroll"
import type { Category } from "@/lib/types/category"

interface CategoryCarouselProps {
  categories: Category[]
}

/** Track gap in px — must match the `gap-*` class on the track below. */
const TRACK_GAP = 24

/**
 * Client component: owns only the scroll/drag/arrow interaction. The server
 * parent (category-tiles.tsx) fetches and passes the data down.
 *
 * Single row, horizontally scrollable, with arrows that page by a full viewport
 * of tiles. No auto-scroll — the hero carousel directly above already drifts,
 * and a second moving row makes the category names hard to read.
 */
export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const { trackRef, canScrollBefore, canScrollAfter, scrollByItem, trackProps, hoverProps } =
    useDragScroll({ itemSelector: "[data-category-tile]", gap: TRACK_GAP })

  if (categories.length === 0) return null

  return (
    <div className="relative" {...hoverProps}>
      <div
        ref={trackRef}
        {...trackProps}
        className="flex cursor-grab select-none gap-6 overflow-x-auto pb-1 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => (
          <Link
            // Slugs are unique per brand, not globally, so id is the only safe key.
            key={category.id}
            href={`/products?category=${category.slug}`}
            data-category-tile
            className="group w-[45%] shrink-0 sm:w-[30%] md:w-[22%] lg:w-[18%]"
          >
            <span className="block aspect-4/3 overflow-hidden rounded-md bg-bg-section">
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt=""
                  width={400}
                  height={300}
                  draggable={false}
                  className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <span aria-hidden className="flex size-full items-center justify-center">
                  <ImageIcon className="size-8 text-text-secondary/40" />
                </span>
              )}
            </span>
            <span className="mt-3 block text-small-semibold text-text-primary">
              {category.name}
            </span>
          </Link>
        ))}

        {/* Delivery promo — the one accented tile, riding along at the end */}
        <Link
          href="/delivery"
          data-category-tile
          className="group flex aspect-4/3 w-[45%] shrink-0 flex-col justify-between self-start rounded-md bg-brand-subtle p-5 sm:w-[30%] md:w-[22%] lg:w-[18%]"
        >
          <span className="text-small-semibold text-brand-primary">Free delivery</span>
          <span className="flex items-center justify-between text-small text-text-secondary">
            On orders over $50
            <ArrowRight className="size-4 text-brand-primary transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      {/* Hidden when there's nothing to scroll to, rather than sitting there dead. */}
      {canScrollBefore && (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Previous categories"
          onClick={() => scrollByItem(-1, true)}
          className="absolute -left-2 top-[calc(50%-1.25rem)] size-9 -translate-y-1/2 rounded-full bg-white/90 shadow-e1 hover:bg-white"
        >
          <ChevronLeft className="size-4" />
        </Button>
      )}
      {canScrollAfter && (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Next categories"
          onClick={() => scrollByItem(1, true)}
          className="absolute -right-2 top-[calc(50%-1.25rem)] size-9 -translate-y-1/2 rounded-full bg-white/90 shadow-e1 hover:bg-white"
        >
          <ChevronRight className="size-4" />
        </Button>
      )}
    </div>
  )
}
