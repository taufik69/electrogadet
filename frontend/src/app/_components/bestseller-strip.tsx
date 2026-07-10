import Image from "next/image"
import Link from "next/link"
import { formatPriceCents } from "@/lib/format"
import type { ProductCardData } from "@/lib/types/product"

interface BestsellerStripProps {
  products: ProductCardData[]
}

export function BestsellerStrip({ products }: BestsellerStripProps) {
  if (products.length === 0) return null

  return (
    <section
      aria-labelledby="bestseller-strip-heading"
      className="w-full px-4 py-12 sm:px-6 lg:px-6"
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 id="bestseller-strip-heading" className="text-h3 text-text-primary">
          Bestsellers
        </h2>
        <Link
          href="/products"
          className="text-small-semibold text-brand-primary transition-colors duration-200 hover:text-brand-hover"
        >
          View all
        </Link>
      </div>

      <ol className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, index) => (
          <li key={product.id}>
            <Link
              href={`/products/${product.slug}`}
              className="group flex items-center gap-4 rounded-md py-3 transition-colors duration-200 hover:bg-bg-section"
            >
              <span className="w-5 shrink-0 text-center text-caption text-text-secondary">
                {index + 1}
              </span>

              <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-bg-section">
                <Image
                  src={product.imageUrl}
                  alt=""
                  width={56}
                  height={56}
                  className="size-3/4 object-contain transition-transform duration-300 ease-out group-hover:scale-105"
                />
              </span>

              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="line-clamp-2 text-small text-text-secondary transition-colors duration-200 group-hover:text-text-primary">
                  {product.name}
                </span>
                <span className="text-small-semibold text-text-primary">
                  {formatPriceCents(product.priceCents)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
