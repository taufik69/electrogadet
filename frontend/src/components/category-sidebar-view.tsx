"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { resolveBrandIcon } from "@/lib/brand-icons";
import type { SidebarBrand } from "@/lib/types/navigation";

export function CategorySidebarView({ brands }: { brands: SidebarBrand[] }) {
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const brand = brands.find((b) => b.slug === activeBrand) ?? null;
  const category =
    brand?.categories.find((c) => c.slug === activeCategory) ?? null;

  function close() {
    setActiveBrand(null);
    setActiveCategory(null);
  }

  return (
    // Outer wrapper stretches the dark surface down past the footer;
    // the inner column sticks to the viewport as you scroll.
    <div className="relative z-30 hidden w-[330px] shrink-0 border-r border-sidebar-border bg-gradient-to-b from-sidebar-elevated to-sidebar lg:block">
      <div className="sticky top-0 flex h-screen flex-col" onMouseLeave={close}>
        {/* Brand mark — centered at the top of the sidebar column */}
        <BrandMark />

        {/* One scroll container for both columns, so the icon rail can never
            drift out of sync with the brand rows it labels. */}
        <div className="flex min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Brand logo rail */}
          <div
            aria-hidden
            className="flex w-20 shrink-0 flex-col items-center border-r border-sidebar-border py-2"
          >
            {/* Spacer matching the nav's "Shop by brand" heading so icons align with rows */}
            <span aria-hidden className="h-9 shrink-0" />
            {brands.map((b) => {
              const Logo = resolveBrandIcon(b.iconKey);
              const isActive = b.slug === activeBrand;
              return (
                <span
                  key={b.slug}
                  className={`flex h-[64px] w-full shrink-0 items-center justify-center border-b border-sidebar-border/50 transition-colors duration-150 ${
                    isActive ? "text-white" : "text-white/50"
                  }`}
                >
                  {/* An uploaded logo wins over the bundled react-icons glyph:
                      iconKey only covers the 14 brands in brand-icons.ts, while
                      imageUrl is whatever the dashboard uploaded. Falls back to
                      the glyph, then to the brand's initial, so the rail never
                      renders an empty cell and stays aligned with its rows. */}
                  {b.imageUrl ? (
                    <Image
                      src={b.imageUrl}
                      alt=""
                      width={96}
                      height={96}
                      // object-contain + explicit box: logos arrive at wildly
                      // different aspect ratios, so letterbox them into a
                      // square rather than letting a wide logo dictate the row.
                      className={`size-12 rounded-sm object-contain transition-opacity duration-150 ${
                        isActive ? "opacity-100" : "opacity-70"
                      }`}
                    />
                  ) : Logo ? (
                    <Logo className="size-7" />
                  ) : (
                    <span className="text-small-semibold">
                      {b.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
              );
            })}
          </div>

          {/* Brand names */}
          <nav
            aria-label="Shop by brand"
            className="flex w-[250px] shrink-0 flex-col py-2"
          >
            <span className="px-5 pt-2 pb-3 text-caption uppercase text-white/40">
              Shop by brand
            </span>

            {brands.map((b) => {
              const isActive = b.slug === activeBrand;
              return (
                <Link
                  key={b.slug}
                  href={`/products?brand=${b.slug}`}
                  onMouseEnter={() => {
                    setActiveBrand(b.slug);
                    setActiveCategory(b.categories[0]?.slug ?? null);
                  }}
                  className={`relative flex h-[64px] shrink-0 items-center justify-between border-b border-sidebar-border/50 px-5 text-small-semibold transition-colors duration-150 ${
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
                        isActive
                          ? "translate-x-0.5 text-white/70"
                          : "text-white/35"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Flyouts — brand categories, then that category's products */}
        {brand && brand.categories.length > 0 && (
          <div className="absolute top-[102px] bottom-0 left-[330px] z-50 flex">
            <div className="flex w-[245px] shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-gradient-to-b from-sidebar-elevated to-sidebar pt-11 pb-2 shadow-e3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {brand.categories.map((cat) => {
                const isActive = cat.slug === activeCategory;
                return (
                  <Link
                    key={cat.slug}
                    href={`/products?brand=${brand.slug}&category=${cat.slug}`}
                    onMouseEnter={() => setActiveCategory(cat.slug)}
                    className={`flex h-[46px] shrink-0 items-center justify-between border-b border-sidebar-border/50 px-5 text-small-semibold transition-colors duration-150 ${
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
                );
              })}
            </div>

            {category && category.products.length > 0 && (
              <div className="flex w-[245px] shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-gradient-to-b from-sidebar-elevated to-sidebar pt-11 pb-2 shadow-e3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {category.products.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    className="flex min-h-[46px] items-center border-b border-sidebar-border/50 px-5 text-small text-white/85 transition-colors duration-150 hover:bg-white/10 hover:text-white"
                  >
                    {product.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
