"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { promoSlides } from "@/lib/data/promos";

export function PromoCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-promo-card]");
    const step = (card?.offsetWidth ?? 320) + 16;
    track.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  return (
    <div className="relative flex-1 overflow-hidden rounded-lg ">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden "
      >
        {promoSlides.map((slide) => (
          <Link
            key={slide.title}
            href={slide.href}
            data-promo-card
            className="group relative flex aspect-[4/3] w-full shrink-0 snap-start flex-col justify-end overflow-hidden rounded-lg bg-bg-section transition-opacity duration-250 ease-out hover:opacity-95 sm:w-[calc(50%-2px)]"
          >
            <Image
              src={slide.imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="relative flex flex-col gap-1 p-5 text-white">
              {slide.eyebrow && (
                <span className="text-caption uppercase tracking-wide text-white/85">
                  {slide.eyebrow}
                </span>
              )}
              <h3 className="whitespace-pre-line text-h4">{slide.title}</h3>
              <p className="text-small text-white/85">{slide.subtitle}</p>
            </div>
          </Link>
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
