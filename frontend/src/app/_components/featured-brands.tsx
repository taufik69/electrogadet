import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface Brand {
  name: string
  slug: string
  wordmarkClassName: string
}

const brands: Brand[] = [
  { name: "SAMSUNG", slug: "samsung", wordmarkClassName: "text-[1.05rem] font-bold tracking-tight" },
  { name: "sony", slug: "sony", wordmarkClassName: "text-xl font-black italic" },
  { name: "LG", slug: "lg", wordmarkClassName: "text-2xl font-extrabold text-brand-primary" },
  { name: "xiaomi", slug: "xiaomi", wordmarkClassName: "text-lg font-bold text-danger" },
  { name: "Canon", slug: "canon", wordmarkClassName: "text-xl font-serif italic" },
  { name: "logitech", slug: "logitech", wordmarkClassName: "text-lg font-semibold uppercase tracking-widest" },
  { name: "JBL", slug: "jbl", wordmarkClassName: "text-2xl font-black" },
  { name: "HUAWEI", slug: "huawei", wordmarkClassName: "text-base font-bold tracking-wide text-danger" },
]

export function FeaturedBrands() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-danger">
            Shop by brand
          </p>
          <h2 className="text-h3 text-text-primary">Featured brands</h2>
          <p className="text-small mt-1 text-text-secondary">
            Authentic products from official and verified brand partners.
          </p>
        </div>

        <Link
          href="/brands"
          className="text-small-semibold flex shrink-0 items-center gap-1.5 text-text-primary transition-colors hover:text-brand-primary"
        >
          Browse all
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border p-4">
        <div className="brand-marquee-viewport overflow-hidden">
          <div className="brand-marquee flex w-max shrink-0 items-center gap-3">
            {brands.map((brand) => (
              <BrandTile key={`a-${brand.slug}`} brand={brand} />
            ))}
            {brands.map((brand) => (
              <BrandTile key={`b-${brand.slug}`} brand={brand} hidden />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .brand-marquee {
          animation: brand-marquee-loop 28s linear infinite;
        }
        .brand-marquee-viewport:hover .brand-marquee {
          animation-play-state: paused;
        }
        @keyframes brand-marquee-loop {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .brand-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}

function BrandTile({ brand, hidden }: { brand: Brand; hidden?: boolean }) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      aria-label={`Shop ${brand.name}`}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className="flex h-20 w-40 shrink-0 items-center justify-center rounded-xl bg-bg-section px-4 text-text-primary transition-all hover:-translate-y-0.5 hover:bg-surface hover:shadow-e2 sm:w-48"
    >
      <span className={brand.wordmarkClassName}>{brand.name}</span>
    </Link>
  )
}
