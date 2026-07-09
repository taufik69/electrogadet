import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Container } from "@/components/layout/container"
import { getBrandBySlug } from "@/lib/brands"
import { resolveMediaUrl } from "@/lib/media"

interface BrandPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)

  if (!brand) return { title: "Brand not found" }

  return {
    title: `${brand.name} — Shop | Nordvolt`,
    description: `Browse ${brand.name} products at Nordvolt — authentic, verified, and delivered fast.`,
  }
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)

  if (!brand || !brand.isActive) notFound()

  const imageUrl = resolveMediaUrl(brand.image)

  return (
    <Container className="flex flex-col gap-6 py-6 sm:gap-8 sm:py-10">
      <div className="shadow-e1 flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-10 text-center">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={brand.name}
            width={160}
            height={64}
            className="h-16 w-auto object-contain"
          />
        ) : null}
        <h1 className="text-h3 text-text-primary">{brand.name}</h1>
        <p className="text-small text-text-secondary">
          Authentic {brand.name} products from an official, verified brand partner.
        </p>
      </div>

      <p className="text-small text-text-secondary">
        Products from {brand.name} are coming soon.
      </p>
    </Container>
  )
}
