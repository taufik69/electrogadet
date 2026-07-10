"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Zap } from "lucide-react"
import { brands } from "@/lib/data/brands"

export function CategorySidebar() {
  const [activeBrand, setActiveBrand] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const brand = brands.find((b) => b.slug === activeBrand) ?? null
  const category = brand?.categories.find((c) => c.slug === activeCategory) ?? null

  function close() {
    setActiveBrand(null)
    setActiveCategory(null)
  }

  return (
    <div
      className="sticky top-0 z-30 hidden h-screen shrink-0 self-start flex-col bg-gradient-to-b from-sidebar-elevated to-sidebar lg:flex"
      onMouseLeave={close}
    >
      {/* Brand mark — sits at the top of the sidebar column */}
      <Link
        href="/"
        aria-label="Electromart — home"
        className="flex h-16 shrink-0 items-center gap-2 px-5"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-primary">
          <Zap className="size-4 fill-white text-white" />
        </span>
        <span className="text-h4 font-semibold tracking-tight text-white">
          Electromart
        </span>
      </Link>

      <div className="flex min-h-0 flex-1">
        {/* Brand logo rail */}
        <div
          aria-hidden
          className="flex h-full w-16 shrink-0 flex-col items-center overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Spacer matching the nav's "Shop by brand" heading so icons align with rows */}
          <span aria-hidden className="h-9 shrink-0" />
          {brands.map((b) => {
            const Logo = b.icon
            return (
              <span
                key={b.slug}
                className={`flex h-[46px] shrink-0 items-center justify-center transition-colors duration-150 ${
                  b.slug === activeBrand ? "text-white" : "text-white/50"
                }`}
              >
                <Logo className="size-5" />
              </span>
            )
          })}
        </div>

        {/* Brand names */}
        <nav
          aria-label="Shop by brand"
          className="flex h-full w-[250px] shrink-0 flex-col overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <span className="px-5 pt-2 pb-3 text-caption uppercase text-white/40">
            Shop by brand
          </span>

          {brands.map((b) => {
            const isActive = b.slug === activeBrand
            return (
              <Link
                key={b.slug}
                href={`/products?brand=${b.slug}`}
                onMouseEnter={() => {
                  setActiveBrand(b.slug)
                  setActiveCategory(b.categories[0]?.slug ?? null)
                }}
                className={`relative flex h-[46px] shrink-0 items-center justify-between px-5 text-small-semibold transition-colors duration-150 ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-y-0 left-0 w-0.5 bg-brand-primary" />
                )}
                <span className="flex-1 truncate">{b.name}</span>
                {b.categories.length > 0 && (
                  <ChevronRight
                    className={`size-3.5 shrink-0 transition-transform duration-150 ${
                      isActive ? "translate-x-0.5 text-white/70" : "text-white/35"
                    }`}
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Flyouts — brand categories, then that category's products */}
      {brand && brand.categories.length > 0 && (
        <div className="absolute top-[102px] bottom-0 left-[314px] z-50 flex">
          <div className="flex w-[245px] shrink-0 flex-col overflow-y-auto bg-gradient-to-b from-sidebar-elevated to-sidebar pt-1.5 pb-2 shadow-e3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {brand.categories.map((cat) => {
              const isActive = cat.slug === activeCategory
              return (
                <Link
                  key={cat.slug}
                  href={`/products?brand=${brand.slug}&category=${cat.slug}`}
                  onMouseEnter={() => setActiveCategory(cat.slug)}
                  className={`flex h-[46px] shrink-0 items-center justify-between px-5 text-small-semibold transition-colors duration-150 ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex-1 truncate">{cat.name}</span>
                  {cat.products.length > 0 && (
                    <ChevronRight
                      className={`size-3.5 shrink-0 ${isActive ? "text-white/70" : "text-white/35"}`}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {category && category.products.length > 0 && (
            <div className="flex w-[245px] shrink-0 flex-col overflow-y-auto bg-gradient-to-b from-sidebar-elevated to-sidebar pt-1.5 pb-2 shadow-e3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {category.products.map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="flex min-h-[46px] items-center px-5 text-small text-white/85 transition-colors duration-150 hover:bg-white/10 hover:text-white"
                >
                  {product.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
