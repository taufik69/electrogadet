"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDragScroll } from "@/hooks/use-drag-scroll"
import type { Banner } from "@/lib/types/banner"

interface PromoCarouselProps {
  banners: Banner[]
}

/** Auto-scroll speed, in CSS pixels per second. */
const AUTO_SCROLL_SPEED = 40

/** Track gap in px — must match the `gap-*` class on the track below. */
const TRACK_GAP = 4

/**
 * Stays a client component because the arrows and drag need refs — the
 * server parent (hero-row.tsx) fetches and passes the data down (spec §8).
 *
 * Banners are display-only: no link destination in the model, so each slide is
 * a plain <div>, not a <Link> (spec §1.3).
 *
 * The track auto-scrolls left→right continuously and pauses on hover/focus/drag.
 * The slide list is rendered twice so that wrapping the scroll position back to
 * the midpoint is visually seamless.
 */
export function PromoCarousel({ banners }: PromoCarouselProps) {
  // Narrow to slides that actually have a usable image, so the render below
  // needs no non-null assertions. fetchActiveBanners already filters these
  // out; this keeps the component correct on its own terms regardless.
  const slides = banners.filter((banner) => banner.image?.status === "uploaded")
  const canLoop = slides.length > 1

  const { trackRef, scrollByItem, trackProps, hoverProps } = useDragScroll({
    loop: canLoop,
    autoScrollSpeed: AUTO_SCROLL_SPEED,
    itemSelector: "[data-promo-card]",
    gap: TRACK_GAP,
  })

  // Nothing to show — render nothing rather than an empty carousel shell.
  if (slides.length === 0) return null

  const rendered = canLoop ? [...slides, ...slides] : slides

  return (
    <div className="relative flex-1 overflow-hidden rounded-lg" {...hoverProps}>
      <div
        ref={trackRef}
        {...trackProps}
        className="flex cursor-grab select-none gap-1 overflow-x-auto [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        {rendered.map((banner, index) => (
          <div
            // Duplicated copies share ids, so the index disambiguates them.
            key={`${banner.id}-${index}`}
            data-promo-card
            aria-hidden={canLoop && index >= slides.length}
            className="group relative flex aspect-4/3 w-full shrink-0 flex-col justify-end overflow-hidden rounded-lg bg-bg-section sm:w-[calc(50%-2px)]"
          >
            <Image
              src={banner.image?.url ?? ""}
              alt={banner.image?.alt ?? ""}
              fill
              draggable={false}
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
            <div className="relative flex flex-col gap-1 p-5 text-white">
              {/* whitespace-pre-line: titles may carry a literal "\n" as an
                  intentional line break, authored in the dashboard. */}
              <h3 className="whitespace-pre-line text-h4">{banner.title}</h3>
              <p className="text-small text-white/85">{banner.description}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="icon"
        aria-label="Previous promotions"
        onClick={() => scrollByItem(-1)}
        className="absolute left-2 top-3 size-8 rounded-full bg-white/90 shadow-e1 hover:bg-white"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        aria-label="Next promotions"
        onClick={() => scrollByItem(1)}
        className="absolute right-2 top-3 size-8 rounded-full bg-white/90 shadow-e1 hover:bg-white"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
