"use client"

import { useMemo, useState } from "react"
import { PackageSearch } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { MockProduct } from "./mock-shop-products"
import { ShopFilters, DEFAULT_FILTERS, matchesFilters, PRICE_RANGES, type ShopFiltersState } from "./shop-filters"
import { ShopToolbar, type SortOption } from "./shop-toolbar"

function sortProducts(products: MockProduct[], sort: SortOption): MockProduct[] {
  const copy = [...products]
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.priceCents - b.priceCents)
    case "price-desc":
      return copy.sort((a, b) => b.priceCents - a.priceCents)
    case "discount":
      return copy.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0))
    case "newest":
      return copy.reverse()
    default:
      return copy
  }
}

interface ShopViewProps {
  products: MockProduct[]
}

export function ShopView({ products }: ShopViewProps) {
  const [filters, setFilters] = useState<ShopFiltersState>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortOption>("relevance")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filtered = useMemo(() => {
    const withRating = products.filter((p) => p.rating >= filters.minRating)
    const withFilters = withRating.filter((p) => matchesFilters(p, filters))
    return sortProducts(withFilters, sort)
  }, [products, filters, sort])

  const priceCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const range of PRICE_RANGES) {
      counts[range.id] = products.filter((p) => p.priceCents >= range.min && p.priceCents < range.max).length
    }
    return counts
  }, [products])

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products],
  )
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const brand of brands) {
      counts[brand] = products.filter((p) => p.brand === brand).length
    }
    return counts
  }, [products, brands])

  const offersCount = useMemo(
    () => products.filter((p) => (p.discountPercent ?? 0) >= 20).length,
    [products],
  )

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      <div className="hidden lg:block">
        <ShopFilters
          filters={filters}
          onChange={setFilters}
          priceCounts={priceCounts}
          brands={brands}
          brandCounts={brandCounts}
          offersCount={offersCount}
        />
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="overflow-y-auto p-4">
          <SheetHeader className="p-0">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <ShopFilters
            filters={filters}
            onChange={setFilters}
            priceCounts={priceCounts}
            brands={brands}
            brandCounts={brandCounts}
            offersCount={offersCount}
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-col gap-5">
        <ShopToolbar
          totalCount={products.length}
          visibleCount={filtered.length}
          sort={sort}
          onSortChange={setSort}
          onOpenMobileFilters={() => setMobileFiltersOpen(true)}
        />

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
            <PackageSearch size={32} className="text-text-secondary" aria-hidden="true" />
            <p className="text-small-semibold text-text-primary">No products match your filters</p>
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-small font-semibold text-brand-primary transition-colors hover:text-brand-hover"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.slug} {...product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
