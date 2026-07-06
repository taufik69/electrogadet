import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Container } from "@/components/layout/container"
import { generateMockProductDetail } from "@/lib/mock/mock-product-detail"
import { generateMockProducts } from "@/lib/mock/mock-shop-products"
import { ProductGallery } from "./_components/product-gallery"
import { ProductBuyBox } from "./_components/product-buy-box"
import { ProductTabs } from "./_components/product-tabs"
import { RelatedProducts } from "./_components/related-products"
import { MobileStickyCta } from "./_components/mobile-sticky-cta"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = generateMockProductDetail(slug)

  return {
    title: `${product.name} | Electrogadget`,
    description: `Buy ${product.name} at Electrogadget — verified sellers, Cash on Delivery, and fast nationwide shipping.`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = generateMockProductDetail(slug)
  const relatedProducts = generateMockProducts(product.categoryName, 5)
  const recentlyViewed = generateMockProducts(`${product.categoryName}-recent`, 5)

  return (
    <>
      <Container className="flex flex-col gap-8 pb-24 pt-6 sm:gap-10 sm:pb-10 sm:pt-10">
        <nav aria-label="Breadcrumb" className="text-small flex items-center gap-1.5 text-text-secondary">
          <Link href="/" className="transition-colors hover:text-brand-primary">
            Home
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link
            href={`/categories/${product.categorySlug}`}
            className="transition-colors hover:text-brand-primary"
          >
            {product.categoryName}
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span className="line-clamp-1 text-text-primary">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1fr] xl:grid-cols-[minmax(0,540px)_1fr]">
          <div className="lg:sticky lg:top-24">
            <ProductGallery images={product.images} name={product.name} discountPercent={product.discountPercent} />
          </div>
          <ProductBuyBox product={product} />
        </div>

        <ProductTabs product={product} />

        <RelatedProducts title="You may also like" products={relatedProducts} />
        <RelatedProducts title="Recently viewed" products={recentlyViewed} />
      </Container>

      <MobileStickyCta priceCents={product.priceCents} compareAtCents={product.compareAtCents} />
    </>
  )
}
