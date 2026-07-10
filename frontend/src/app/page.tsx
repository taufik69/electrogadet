import { HeroRow } from "@/app/_components/hero-row"
import { ProductRail } from "@/app/_components/product-rail"
import { BestsellerStrip } from "@/app/_components/bestseller-strip"
import { CategoryTiles } from "@/app/_components/category-tiles"
import { Benefits } from "@/app/_components/benefits"
import { Articles } from "@/app/_components/articles"
import { FootPromos } from "@/app/_components/foot-promos"
import { Testimonials } from "@/app/_components/testimonials"
import { Newsletter } from "@/app/_components/newsletter"
import { fetchProducts } from "@/lib/products"
import { toProductCardDataList } from "@/lib/data/product-display"

export default async function Home() {
  const products = await fetchProducts(16)
  const cardData = toProductCardDataList(products)

  const newArrivals = [...cardData]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  // Distinct slices so each section shows different products.
  const newArrivalIds = new Set(newArrivals.map((product) => product.id))
  const remaining = cardData.filter((product) => !newArrivalIds.has(product.id))

  const popular = remaining.slice(0, 8)
  const bestSellers = cardData.slice(0, 8)

  return (
    <>
      <HeroRow />

      <ProductRail
        id="new-arrivals"
        title="New arrivals"
        description="Just landed — the latest additions to the catalog."
        products={newArrivals}
        viewAllHref="/products"
      />

      <BestsellerStrip products={bestSellers} />

      <CategoryTiles />

      <ProductRail
        id="popular"
        title="Popular"
        description="What everyone's buying this week."
        products={popular}
        viewAllHref="/products"
      />

      <Benefits />

      <Articles />

      <FootPromos />

      <Testimonials />
      <Newsletter />
    </>
  )
}
