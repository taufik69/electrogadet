"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import { cn } from "@/lib/utils"
import { resolveMediaUrl } from "@/lib/media"
import type { Banner } from "@/lib/types/banner"
import "swiper/css"
import "swiper/css/pagination"

interface HeroSlide {
  id: string
  title: string
  imageUrl: string | null
  href: string
  gradientClassName: string
}

const features = [
  { label: "COD", sublabel: "Pay on delivery" },
  { label: "Verified", sublabel: "Sellers only" },
  { label: "7-day", sublabel: "Easy returns" },
]

const gradientClassNames = [
  "from-[#0b0f19] via-[#0f1424] to-[#171523]",
  "from-[#0f1424] via-[#131a2e] to-[#1a1430]",
]

const fallbackHeroSlides: HeroSlide[] = [
  {
    id: "slide-marketplace",
    title: "Online Shopping in Bangladesh, All in One Place",
    imageUrl:
      "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=1600&q=90",
    href: "/products",
    gradientClassName: gradientClassNames[0],
  },
  {
    id: "slide-electronics",
    title: "Premium Electronics, Delivered to Your Door",
    imageUrl:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&q=90",
    href: "/products",
    gradientClassName: gradientClassNames[1],
  },
]

function bannerHref(banner: Banner): string {
  if (banner.product) return `/products/${banner.product.slug}`
  if (banner.category) return `/categories/${banner.category.slug}`
  return "/products"
}

function bannersToSlides(banners: Banner[]): HeroSlide[] {
  return banners.map((banner, index) => ({
    id: banner.id,
    title: banner.title,
    imageUrl: resolveMediaUrl(banner.imageUrl),
    href: bannerHref(banner),
    gradientClassName: gradientClassNames[index % gradientClassNames.length],
  }))
}

interface HeroBannerProps {
  banners?: Banner[]
}

export function HeroBanner({ banners = [] }: HeroBannerProps) {
  const heroSlides = banners.length > 0 ? bannersToSlides(banners) : fallbackHeroSlides

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
            <Link
              href={slide.href}
              className={cn(
                "group relative flex min-h-[320px] flex-col justify-end overflow-hidden bg-gradient-to-br p-8 md:min-h-[420px] md:p-12",
                slide.gradientClassName,
              )}
            >
              {slide.imageUrl && (
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  priority={slideIndex === 0}
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div
                className={cn("absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent")}
                aria-hidden="true"
              />

              <div className="relative flex flex-col items-start gap-6">
                <h1 className="text-display max-w-lg text-white">{slide.title}</h1>

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

                <span className="text-small-semibold flex items-center gap-2 rounded-full bg-white px-5 py-3 text-text-primary transition-colors group-hover:bg-white/90">
                  Shop now
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white">
                    <ArrowRight size={12} aria-hidden="true" />
                  </span>
                </span>
              </div>
            </Link>
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
