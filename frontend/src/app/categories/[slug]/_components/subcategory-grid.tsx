import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { NavCategory } from "@/lib/types/category"

interface SubcategoryGridProps {
  subcategories: NavCategory[]
  activeSlug: string
}

export function SubcategoryGrid({ subcategories, activeSlug }: SubcategoryGridProps) {
  if (subcategories.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-small-semibold text-text-primary">
        Shop by subcategory <span className="text-text-secondary">· {subcategories.length} options</span>
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {subcategories.map((sub) => {
          const isActive = sub.slug === activeSlug
          return (
            <Link
              key={sub.id}
              href={`/categories/${sub.slug}`}
              className={`shadow-e1 group flex items-center justify-between gap-2 rounded-xl border px-4 py-3 transition-colors ${
                isActive
                  ? "border-text-primary bg-text-primary text-white"
                  : "border-border bg-surface text-text-primary hover:border-brand-primary hover:bg-brand-subtle"
              }`}
            >
              <span className="flex items-center gap-2 overflow-hidden">
                <span
                  className={`text-caption flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-bg-section text-text-secondary group-hover:bg-brand-subtle group-hover:text-brand-primary"
                  }`}
                >
                  {sub.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-small-semibold truncate">{sub.name}</span>
              </span>
              <ArrowRight
                size={15}
                aria-hidden="true"
                className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
                  isActive ? "text-white" : "text-text-secondary"
                }`}
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
