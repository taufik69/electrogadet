"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDownAZ, Check, ChevronDown, SlidersHorizontal } from "lucide-react"

export type SortOption = "relevance" | "price-asc" | "price-desc" | "discount" | "newest"

const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Relevance",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  discount: "Biggest Discount",
  newest: "Newest First",
}

const SORT_OPTIONS = Object.entries(SORT_LABELS) as [SortOption, string][]

interface ShopToolbarProps {
  totalCount: number
  visibleCount: number
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  onOpenMobileFilters: () => void
}

export function ShopToolbar({ totalCount, visibleCount, sort, onSortChange, onOpenMobileFilters }: ShopToolbarProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onOpenMobileFilters}
        className="text-small-semibold flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-text-primary lg:hidden"
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        Filters
      </button>

      <p className="text-small hidden text-text-secondary sm:block">
        Showing <span className="text-small-semibold text-text-primary">{visibleCount}</span> of {totalCount}
      </p>

      <div ref={containerRef} className="relative ml-auto">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="text-small-semibold shadow-e1 flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text-primary transition-colors hover:border-brand-primary/60"
        >
          <ArrowDownAZ size={15} className="text-text-secondary" aria-hidden="true" />
          <span className="text-text-secondary">Sort by</span>
          {SORT_LABELS[sort]}
          <ChevronDown
            size={15}
            aria-hidden="true"
            className={`text-text-secondary transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div
            role="listbox"
            className="shadow-e3 absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface p-1.5"
          >
            {SORT_OPTIONS.map(([value, label]) => {
              const isActive = value === sort
              return (
                <button
                  key={value}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onSortChange(value)
                    setOpen(false)
                  }}
                  className={`text-small flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? "text-small-semibold bg-brand-subtle text-brand-primary"
                      : "text-text-primary hover:bg-bg-section"
                  }`}
                >
                  {label}
                  {isActive && <Check size={15} aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
