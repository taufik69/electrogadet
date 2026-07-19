"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Banner } from "@/lib/types/banner";

interface PromoCarouselProps {
  banners: Banner[];
}

/**
 * Stays a client component because the arrows need useRef/scrollBy — the
 * server parent (hero-row.tsx) fetches and passes the data down (spec §8).
 *
 * Banners are display-only: no link destination in the model, so each slide is
 * a plain <div>, not a <Link> (spec §1.3).
 */
export function PromoCarousel({ banners }: PromoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-promo-card]");
    const step = (card?.offsetWidth ?? 320) + 16;
    track.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  // Narrow to slides that actually have a usable image, so the render below
  // needs no non-null assertions. fetchActiveBanners already filters these
  // out; this keeps the component correct on its own terms regardless.
  const slides = banners.filter((banner) => banner.image?.status === "uploaded");

  // Nothing to show — render nothing rather than an empty carousel shell.
  if (slides.length === 0) return null;

  return (
    <div className="relative flex-1 overflow-hidden rounded-lg ">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden "
      >
        {slides.map((banner) => (
          <div
            key={banner.id}
            data-promo-card
            className="group relative flex aspect-[4/3] w-full shrink-0 snap-start flex-col justify-end overflow-hidden rounded-lg bg-bg-section sm:w-[calc(50%-2px)]"
          >
            <Image
              src={banner.image?.url ?? ""}
              alt={banner.image?.alt ?? ""}
              fill
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
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
        onClick={() => scrollByCard(-1)}
        className="absolute left-2 top-3 size-8 rounded-full bg-white/90 shadow-e1 hover:bg-white"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        aria-label="Next promotions"
        onClick={() => scrollByCard(1)}
        className="absolute right-2 top-3 size-8 rounded-full bg-white/90 shadow-e1 hover:bg-white"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
