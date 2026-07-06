"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ChevronDown } from "lucide-react"
import type { NavCategoryTreeNode } from "@/lib/types/category"

export function MobileNav({ categories }: { categories: NavCategoryTreeNode[] }) {
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const clearance = categories.find((category) => category.isClearance)
  const navCategories = categories.filter((category) => !category.isClearance)

  function close() {
    setOpen(false)
    setExpandedId(null)
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-bg-section"
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      {open && (
        <nav
          aria-label="Mobile"
          className="shadow-e2 absolute inset-x-0 top-full flex max-h-[calc(100vh-4rem)] flex-col gap-1 overflow-y-auto border-t border-border bg-surface p-4"
        >
          <Link
            href="/products"
            onClick={close}
            className="text-small-semibold rounded-md px-3 py-2.5 text-text-primary transition-colors hover:bg-bg-section"
          >
            All products
          </Link>

          {navCategories.map((category) => {
            const isExpanded = expandedId === category.id
            const hasChildren = category.children.length > 0

            return (
              <div key={category.id}>
                <div className="flex items-center">
                  <Link
                    href={`/categories/${category.slug}`}
                    onClick={close}
                    className="text-small-semibold flex-1 rounded-md px-3 py-2.5 text-text-primary transition-colors hover:bg-bg-section"
                  >
                    {category.name}
                  </Link>
                  {hasChildren && (
                    <button
                      type="button"
                      aria-label={isExpanded ? `Collapse ${category.name}` : `Expand ${category.name}`}
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedId(isExpanded ? null : category.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-bg-section"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>

                {hasChildren && isExpanded && (
                  <div className="ml-3 flex flex-col gap-1 border-l border-border pl-3">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/categories/${child.slug}`}
                        onClick={close}
                        className="text-small rounded-md px-3 py-2 text-text-secondary transition-colors hover:bg-bg-section hover:text-text-primary"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {clearance && (
            <Link
              href={`/categories/${clearance.slug}`}
              onClick={close}
              className="text-small-semibold rounded-md px-3 py-2.5 text-danger transition-colors hover:bg-bg-section"
            >
              {clearance.name}
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}
