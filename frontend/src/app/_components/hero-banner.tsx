"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import { cn } from "@/lib/utils"
import { ProductSpotlight, type SpotlightProduct } from "./product-spotlight"
import "swiper/css"
import "swiper/css/pagination"

interface HeroSlide {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  gradientClassName: string
  product: SpotlightProduct
}

const features = [
  { label: "COD", sublabel: "Pay on delivery" },
  { label: "Verified", sublabel: "Sellers only" },
  { label: "7-day", sublabel: "Easy returns" },
]

const heroSlides: HeroSlide[] = [
  {
    id: "slide-marketplace",
    eyebrow: "Bangladesh's marketplace",
    title: "Online Shopping in Bangladesh, All in One Place",
    subtitle: "Buy everything — pay Cash on Delivery",
    ctaLabel: "Shop now",
    ctaHref: "/products",
    secondaryCtaLabel: "Browse categories",
    secondaryCtaHref: "/categories",
    gradientClassName: "from-[#0b0f19] via-[#0f1424] to-[#171523]",
    product: {
      name: "Vega Jeet Matt Black Half Face…",
      imageUrl:
        "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=1200&q=100",
      priceCents: 224900,
      compareAtCents: 345000,
      discountPercent: 35,
      badge: "Fast Gear",
    },
  },
  {
    id: "slide-electronics",
    eyebrow: "New season lineup",
    title: "Premium Electronics, Delivered to Your Door",
    subtitle: "Verified sellers, genuine warranty, fast delivery",
    ctaLabel: "Shop electronics",
    ctaHref: "/products",
    secondaryCtaLabel: "View deals",
    secondaryCtaHref: "/categories",
    gradientClassName: "from-[#0f1424] via-[#131a2e] to-[#1a1430]",
    product: {
      name: "Studds Shifter Full Face Helmet",
      imageUrl:
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&q=100",
      priceCents: 189900,
      compareAtCents: 259900,
      discountPercent: 27,
      badge: "Fast Gear",
    },
  },
]

export function HeroBanner() {
  return (
    <div className="hero-banner relative overflow-hidden rounded-2xl">
      <Swiper
        modules={[Autoplay, Pagination]}
        loop
        speed={600}
        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        grabCursor
      >
        {heroSlides.map((slide, slideIndex) => (
          <SwiperSlide key={slide.id}>
            <div
              className={cn(
                "flex flex-col gap-8 bg-gradient-to-br p-8 md:flex-row md:items-center md:justify-between md:p-12",
                slide.gradientClassName,
              )}
            >
              <div className="flex flex-1 flex-col items-start gap-6">
                <span className="text-caption flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 font-semibold uppercase tracking-wide text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-danger" aria-hidden="true" />
                  {slide.eyebrow}
                </span>

                <h1 className="text-display max-w-lg text-white">{slide.title}</h1>

                <p className="text-body-lg max-w-md text-white/60">{slide.subtitle}</p>

                <div className="flex flex-wrap items-baseline gap-6">
                  {features.map((feature, i) => (
                    <div key={feature.label} className="flex items-baseline gap-6">
                      {i > 0 && <span className="h-4 w-px bg-white/20" aria-hidden="true" />}
                      <div>
                        <p className="text-h4 text-white">{feature.label}</p>
                        <p className="text-caption uppercase tracking-wide text-white/50">
                          {feature.sublabel}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={slide.ctaHref}
                    className="text-small-semibold flex items-center gap-2 rounded-full bg-white px-5 py-3 text-text-primary transition-colors hover:bg-white/90"
                  >
                    {slide.ctaLabel}
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white">
                      <ArrowRight size={12} aria-hidden="true" />
                    </span>
                  </Link>
                  <Link
                    href={slide.secondaryCtaHref}
                    className="text-small-semibold rounded-full border border-white/20 px-5 py-3 text-white transition-colors hover:bg-white/10"
                  >
                    {slide.secondaryCtaLabel}
                  </Link>
                </div>
              </div>

              <ProductSpotlight product={slide.product} priority={slideIndex === 0} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .hero-banner .swiper-pagination {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 20;
        }
        .hero-banner .swiper-pagination-bullet {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.3);
          opacity: 1;
          margin: 0;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .hero-banner .swiper-pagination-bullet:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        .hero-banner .swiper-pagination-bullet-active {
          width: 24px;
          background: #ffffff;
        }
      `}</style>
    </div>
  )
}
