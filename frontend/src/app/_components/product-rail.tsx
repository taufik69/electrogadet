import Link from "next/link"
import { ProductRailTrack } from "@/app/_components/product-rail-track"
import type { ProductCardData } from "@/lib/types/product"

interface ProductRailProps {
  id: string
  title: string
  description: string
  products: ProductCardData[]
  viewAllHref?: string
  sectionClassName?: string
}

export function ProductRail({
  id,
  title,
  description,
  products,
  viewAllHref,
  sectionClassName,
}: ProductRailProps) {
  const headingId = `${id}-heading`

  return (
    <section
      aria-labelledby={headingId}
      className={`w-full px-4 py-16 sm:px-6 lg:px-6 ${sectionClassName ?? ""}`}
    >
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 id={headingId} className="text-h2 text-text-primary">
            {title}
          </h2>
          <p className="text-body text-text-secondary">{description}</p>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-small-semibold text-brand-primary transition-colors duration-200 hover:text-brand-hover"
          >
            View all
          </Link>
        )}
      </div>

      {products.length > 0 ? (
        <ProductRailTrack products={products} />
      ) : (
        <p className="rounded-md bg-bg-section px-6 py-12 text-center text-body text-text-secondary">
          Check back soon — new products are on the way.
        </p>
      )}
    </section>
  )
}
