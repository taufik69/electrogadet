import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { getBrands } from "@/lib/brands"
import { resolveMediaUrl } from "@/lib/media"

export const metadata: Metadata = {
  title: "All Brands | Nordvolt",
  description: "Browse every brand available at Nordvolt — authentic products from official and verified brand partners.",
}

export default async function BrandsPage() {
  const brands = (await getBrands()).filter((brand) => brand.isActive)

  return (
    <Container className="flex flex-col gap-6 py-6 sm:gap-8 sm:py-10">
      <div>
        <p className="text-caption font-semibold uppercase tracking-wide text-danger">
          Shop by brand
        </p>
        <h1 className="text-h3 text-text-primary">All brands</h1>
        <p className="text-small mt-1 text-text-secondary">
          Authentic products from official and verified brand partners.
        </p>
      </div>

      {brands.length === 0 ? (
        <p className="text-small text-text-secondary">No brands available right now.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {brands.map((brand) => {
            const imageUrl = resolveMediaUrl(brand.image)
            return (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                aria-label={`Shop ${brand.name}`}
                className="shadow-e1 flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-center transition-all hover:-translate-y-0.5 hover:border-brand-primary hover:bg-brand-subtle hover:shadow-e2"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={brand.name}
                    width={96}
                    height={40}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <span className="text-small-semibold text-text-primary">{brand.name}</span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </Container>
  )
}
