import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Container } from "@/components/layout/container"
import { getCategoryTree, findCategoryBySlug } from "@/lib/categories"
import { CategoryHero } from "./_components/category-hero"
import { SubcategoryGrid } from "./_components/subcategory-grid"
import { ShopView } from "./_components/shop-view"
import { generateMockProducts } from "./_components/mock-shop-products"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const categories = await getCategoryTree()
  const match = findCategoryBySlug(categories, slug)

  if (!match) return { title: "Category not found" }

  return {
    title: `${match.category.name} — Shop | Electrogadget`,
    description: `Browse ${match.category.name} at Electrogadget — verified sellers, fast delivery, and the best prices.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const categories = await getCategoryTree()
  const match = findCategoryBySlug(categories, slug)

  if (!match) notFound()

  const { category, parent } = match
  const subcategories = parent ? parent.children : category.children ?? []
  const products = generateMockProducts(category.name, 12)

  return (
    <Container className="flex flex-col gap-6 py-6 sm:gap-8 sm:py-10">
      <CategoryHero
        categoryName={category.name}
        parentName={parent?.name ?? null}
        parentSlug={parent?.slug ?? null}
        productCount={products.length}
      />

      <SubcategoryGrid subcategories={subcategories} activeSlug={slug} />

      <ShopView products={products} />
    </Container>
  )
}
