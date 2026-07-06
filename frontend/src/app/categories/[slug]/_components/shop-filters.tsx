"use client"

import { useId } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ShopFiltersState {
  priceRange: string | null
  brands: string[]
  minRating: number
  offersOnly: boolean
}

export const DEFAULT_FILTERS: ShopFiltersState = {
  priceRange: null,
  brands: [],
  minRating: 0,
  offersOnly: false,
}

const PRICE_RANGES = [
  { id: "under-1000", label: "Under ৳1,000", min: 0, max: 100000 },
  { id: "1000-5000", label: "৳1,000 - ৳5,000", min: 100000, max: 500000 },
  { id: "5000-20000", label: "৳5,000 - ৳20,000", min: 500000, max: 2000000 },
  { id: "20000-50000", label: "৳20,000 - ৳50,000", min: 2000000, max: 5000000 },
  { id: "over-50000", label: "Over ৳50,000", min: 5000000, max: Infinity },
]

const RATINGS = [4.5, 4, 3]

function FilterSection({
  title,
  first,
  children,
}: {
  title: string
  first?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-3 pb-5", !first && "border-t border-border pt-5")}>
      <p className="text-caption font-bold uppercase tracking-wider text-text-secondary">{title}</p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function FilterCheckboxRow({
  checked,
  onChange,
  label,
  count,
  type = "checkbox",
  name,
}: {
  checked: boolean
  onChange: () => void
  label: React.ReactNode
  count?: number
  type?: "checkbox" | "radio"
  name?: string
}) {
  return (
    <label className="group flex cursor-pointer items-center justify-between gap-2 rounded-md px-1.5 py-1.5 -mx-1.5 transition-colors hover:bg-bg-section">
      <span className="flex items-center gap-2.5">
        <input
          type={type}
          name={name}
          checked={checked}
          onChange={onChange}
          className={cn(
            "h-4 w-4 shrink-0 border-border accent-brand-primary",
            type === "checkbox" ? "rounded" : "rounded-full",
          )}
        />
        <span
          className={cn(
            "text-small flex items-center gap-1 transition-colors",
            checked ? "text-small-semibold text-brand-primary" : "text-text-primary",
          )}
        >
          {label}
        </span>
      </span>
      {count !== undefined && (
        <span className="text-caption tabular-nums text-text-secondary">{count}</span>
      )}
    </label>
  )
}

interface ShopFiltersProps {
  filters: ShopFiltersState
  onChange: (next: ShopFiltersState) => void
  priceCounts: Record<string, number>
  brands: string[]
  brandCounts: Record<string, number>
  offersCount: number
}

export function ShopFilters({
  filters,
  onChange,
  priceCounts,
  brands,
  brandCounts,
  offersCount,
}: ShopFiltersProps) {
  const ratingGroupId = useId()

  const hasActiveFilters =
    filters.priceRange || filters.brands.length > 0 || filters.minRating > 0 || filters.offersOnly

  function toggleBrand(brand: string) {
    const next = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand]
    onChange({ ...filters, brands: next })
  }

  return (
    <aside className="shadow-e1 flex flex-col rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-h4 text-text-primary">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-caption font-semibold text-brand-primary transition-colors hover:text-brand-hover"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Price" first>
        {PRICE_RANGES.map((range) => (
          <FilterCheckboxRow
            key={range.id}
            checked={filters.priceRange === range.id}
            onChange={() =>
              onChange({
                ...filters,
                priceRange: filters.priceRange === range.id ? null : range.id,
              })
            }
            label={range.label}
            count={priceCounts[range.id] ?? 0}
          />
        ))}
      </FilterSection>

      <FilterSection title="Rating">
        {RATINGS.map((rating) => (
          <FilterCheckboxRow
            key={rating}
            type="radio"
            name={ratingGroupId}
            checked={filters.minRating === rating}
            onChange={() => onChange({ ...filters, minRating: rating })}
            label={
              <>
                {rating}
                <Star size={13} className="fill-warning text-warning" aria-hidden="true" />
                &amp; up
              </>
            }
          />
        ))}
        <FilterCheckboxRow
          type="radio"
          name={ratingGroupId}
          checked={filters.minRating === 0}
          onChange={() => onChange({ ...filters, minRating: 0 })}
          label="All ratings"
        />
      </FilterSection>

      <FilterSection title="Brand">
        {brands.map((brand) => (
          <FilterCheckboxRow
            key={brand}
            checked={filters.brands.includes(brand)}
            onChange={() => toggleBrand(brand)}
            label={brand}
            count={brandCounts[brand] ?? 0}
          />
        ))}
      </FilterSection>

      <div className="flex flex-col gap-3 border-t border-border pt-5">
        <p className="text-caption font-bold uppercase tracking-wider text-text-secondary">Discount</p>
        <div className="flex flex-col gap-0.5">
          <FilterCheckboxRow
            checked={filters.offersOnly}
            onChange={() => onChange({ ...filters, offersOnly: !filters.offersOnly })}
            label="20%+ off"
            count={offersCount}
          />
        </div>
      </div>
    </aside>
  )
}

export function matchesFilters(
  product: { priceCents: number; discountPercent: number | null; brand: string },
  filters: ShopFiltersState,
): boolean {
  if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false
  if (filters.offersOnly && (product.discountPercent ?? 0) < 20) return false
  if (filters.priceRange) {
    const range = PRICE_RANGES.find((r) => r.id === filters.priceRange)
    if (range && (product.priceCents < range.min || product.priceCents >= range.max)) return false
  }
  return true
}

export { PRICE_RANGES }
