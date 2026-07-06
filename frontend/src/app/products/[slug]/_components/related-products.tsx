import { ProductCard } from "@/components/product/product-card"
import type { ProductCardData } from "@/components/product/types"

interface RelatedProductsProps {
  title: string
  products: ProductCardData[]
}

export function RelatedProducts({ title, products }: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <span className="h-6 w-1.5 rounded-full bg-brand-primary" aria-hidden="true" />
        <h2 className="text-h3 text-text-primary">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.slug} {...product} />
        ))}
      </div>
    </section>
  )
}
