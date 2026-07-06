import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductSpotlight } from "./product-spotlight"

const features = [
  { label: "COD", sublabel: "Pay on delivery" },
  { label: "Verified", sublabel: "Sellers only" },
  { label: "7-day", sublabel: "Easy returns" },
]

export function HeroBanner() {
  return (
    <div className="relative flex flex-col gap-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b0f19] via-[#0f1424] to-[#171523] p-8 md:flex-row md:items-center md:justify-between md:p-12">
      <div className="flex flex-1 flex-col items-start gap-6">
        <span className="text-caption flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 font-semibold uppercase tracking-wide text-white/80">
          <span className="h-1.5 w-1.5 rounded-full bg-danger" aria-hidden="true" />
          Bangladesh&rsquo;s marketplace
        </span>

        <h1 className="text-display max-w-lg text-white">
          Online Shopping in Bangladesh, All in One Place
        </h1>

        <p className="text-body-lg max-w-md text-white/60">
          Buy everything — pay Cash on Delivery
        </p>

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
            href="/products"
            className="text-small-semibold flex items-center gap-2 rounded-full bg-white px-5 py-3 text-text-primary transition-colors hover:bg-white/90"
          >
            Shop now
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white">
              <ArrowRight size={12} aria-hidden="true" />
            </span>
          </Link>
          <Link
            href="/categories"
            className="text-small-semibold rounded-full border border-white/20 px-5 py-3 text-white transition-colors hover:bg-white/10"
          >
            Browse categories
          </Link>
        </div>
      </div>

      <ProductSpotlight />
    </div>
  )
}
