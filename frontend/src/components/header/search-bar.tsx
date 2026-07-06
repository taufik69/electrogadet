"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronDown, Loader2, PackageSearch } from "lucide-react"
import type { Product } from "@/lib/types/product"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })
}

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const requestIdRef = useRef(0)

  const trimmedQuery = query.trim()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (trimmedQuery.length === 0) {
      requestIdRef.current += 1
      return
    }

    const requestId = ++requestIdRef.current
    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/api/products?limit=50`)
        if (!res.ok) throw new Error("Search request failed")
        const body = await res.json()
        const products: Product[] = body.data ?? []
        const q = trimmedQuery.toLowerCase()
        const filtered = products.filter((product) => product.name.toLowerCase().includes(q))
        if (requestId === requestIdRef.current) {
          setResults(filtered)
          setActiveIndex(0)
        }
      } catch {
        if (requestId === requestIdRef.current) setResults([])
      } finally {
        if (requestId === requestIdRef.current) setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timeout)
  }, [trimmedQuery])

  const showDropdown = focused && trimmedQuery.length > 0
  const isLoading = showDropdown && loading

  const goToProduct = useCallback(
    (product: Product) => {
      setFocused(false)
      setQuery("")
      setResults([])
      router.push(`/products/${product.slug}`)
    },
    [router],
  )

  function submitSearch() {
    if (!trimmedQuery) return
    setFocused(false)
    router.push(`/products?q=${encodeURIComponent(trimmedQuery)}`)
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    } else if (event.key === "Enter") {
      event.preventDefault()
      if (showDropdown && results[activeIndex]) {
        goToProduct(results[activeIndex])
      } else {
        submitSearch()
      }
    } else if (event.key === "Escape") {
      setFocused(false)
    }
  }

  return (
    <div ref={containerRef} className="relative flex w-full max-w-2xl items-center">
      <div className="flex h-11 w-full items-center overflow-hidden rounded-full border border-border bg-bg-section focus-within:ring-2 focus-within:ring-brand-primary/40">
        <button
          type="button"
          className="text-small hidden shrink-0 items-center gap-1 border-r border-border px-4 text-text-secondary transition-colors hover:text-text-primary sm:flex"
        >
          All
          <ChevronDown size={14} aria-hidden="true" />
        </button>
        <input
          value={query}
          onChange={(event) => {
            const value = event.target.value
            setQuery(value)
            if (value.trim().length === 0) setResults([])
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleInputKeyDown}
          type="text"
          placeholder="Search phones, beauty, home & more…"
          aria-label="Search products"
          className="text-small h-full flex-1 bg-transparent px-4 text-text-primary outline-none placeholder:text-text-secondary"
        />
        <button
          type="button"
          onClick={submitSearch}
          aria-label="Search"
          className="text-small-semibold flex h-full shrink-0 items-center gap-2 bg-text-primary px-5 text-white transition-colors hover:bg-text-primary/90"
        >
          <Search size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {showDropdown && (
        <div
          role="listbox"
          className="shadow-e3 absolute top-full left-0 z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-lg border border-border bg-surface p-2"
        >
          {isLoading && (
            <div className="text-small flex items-center justify-center gap-2 py-10 text-text-secondary">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Searching…
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <PackageSearch size={24} className="text-text-secondary" aria-hidden="true" />
              <p className="text-small text-text-secondary">
                No products found for &ldquo;{trimmedQuery}&rdquo;
              </p>
            </div>
          )}

          {!isLoading &&
            results.map((product, index) => (
              <button
                key={product.id}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => goToProduct(product)}
                className={`text-small flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors ${
                  index === activeIndex ? "bg-brand-subtle" : "hover:bg-bg-section"
                }`}
              >
                <span className="text-text-primary">{product.name}</span>
                <span className="text-text-secondary">{formatPrice(product.priceCents)}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
