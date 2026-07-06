"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown, Menu } from "lucide-react"
import { Container } from "@/components/layout/container"
import type { NavCategoryTreeNode } from "@/lib/types/category"

const CLOSE_DELAY_MS = 150

export function MegaMenu({ categories }: { categories: NavCategoryTreeNode[] }) {
  const [panelOpen, setPanelOpen] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navCategories = categories.filter((category) => !category.isClearance)
  const clearance = categories.find((category) => category.isClearance)

  function cancelClose() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  function scheduleClose() {
    cancelClose()
    closeTimeoutRef.current = setTimeout(() => setPanelOpen(false), CLOSE_DELAY_MS)
  }

  return (
    <div
      className="relative border-t border-border"
      onKeyDown={(event) => {
        if (event.key === "Escape") setPanelOpen(false)
      }}
    >
      <Container className="flex h-12 items-center gap-6">
        <div
          className="shrink-0"
          onMouseEnter={() => {
            cancelClose()
            setPanelOpen(true)
          }}
          onMouseLeave={scheduleClose}
        >
          <button
            type="button"
            aria-expanded={panelOpen}
            aria-haspopup="true"
            onFocus={() => setPanelOpen(true)}
            className="text-small-semibold flex items-center gap-2 rounded-md bg-text-primary px-3 py-2 text-white transition-colors hover:bg-text-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <Menu size={16} aria-hidden="true" />
            All Categories
            <ChevronDown size={16} aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label="Primary"
          className="flex min-w-0 flex-1 items-center gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="text-small-semibold shrink-0 whitespace-nowrap text-text-primary transition-colors hover:text-brand-primary"
            >
              {category.name}
            </Link>
          ))}

          {clearance && (
            <Link
              href={`/categories/${clearance.slug}`}
              className="text-small-semibold ml-auto shrink-0 whitespace-nowrap text-danger transition-colors hover:text-danger/80"
            >
              {clearance.name}
            </Link>
          )}
        </nav>
      </Container>

      {panelOpen && categories.length > 0 && (
        <div
          role="menu"
          className="shadow-e2 absolute left-5 top-full z-50 mt-1 min-w-56 rounded-md border border-border bg-surface p-2 md:left-10"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              onClick={() => setPanelOpen(false)}
              className="text-small block rounded-md px-3 py-2 text-text-primary transition-colors hover:bg-bg-section"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
