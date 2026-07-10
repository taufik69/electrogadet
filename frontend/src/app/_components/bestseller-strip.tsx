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
      className="w-full px-4 py-12 sm:px-6"
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

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.id} className="flex">
            <Link
              href={`/products/${product.slug}`}
              className="group flex flex-1 items-center gap-4 rounded-md bg-bg-section p-4 transition-shadow duration-200 hover:shadow-e1"
            >
              <span className="block size-14 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={product.imageUrl}
                  alt=""
                  width={56}
                  height={56}
                  className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
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
      </ul>
    </section>
  )
}
