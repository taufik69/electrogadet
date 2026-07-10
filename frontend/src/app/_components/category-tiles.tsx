import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { categoryTiles } from "@/lib/data/homepage"

export function CategoryTiles() {
  return (
    <section
      aria-labelledby="category-tiles-heading"
      className="w-full px-4 py-12 sm:px-6 lg:px-6"
    >
      <h2 id="category-tiles-heading" className="sr-only">
        Shop by category
      </h2>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
        {categoryTiles.map((tile) => (
          <Link key={tile.slug} href={`/products?category=${tile.slug}`} className="group">
            <span className="flex aspect-4/3 items-center justify-center overflow-hidden rounded-md bg-bg-section">
              <Image
                src={tile.imageUrl}
                alt=""
                width={400}
                height={300}
                className="size-3/4 object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              />
            </span>
            <span className="mt-3 block text-small-semibold text-text-primary">
              {tile.name}
            </span>
          </Link>
        ))}

        {/* Delivery promo — the one accented tile in the row */}
        <Link
          href="/delivery"
          className="group flex aspect-4/3 flex-col justify-between rounded-md bg-brand-subtle p-5"
        >
          <span className="text-small-semibold text-brand-primary">Free delivery</span>
          <span className="flex items-center justify-between text-small text-text-secondary">
            On orders over $50
            <ArrowRight className="size-4 text-brand-primary transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </section>
  )
}
