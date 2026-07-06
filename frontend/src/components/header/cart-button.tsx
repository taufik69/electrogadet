"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

const CART_STORAGE_KEY = "electrogadget-cart"
const CART_UPDATED_EVENT = "electrogadget-cart-updated"

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(CART_UPDATED_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(CART_UPDATED_EVENT, onStoreChange)
  }
}

const DEFAULT_DEMO_COUNT = 3

function getSnapshot(): number {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return DEFAULT_DEMO_COUNT
    const items = JSON.parse(raw) as Array<{ quantity: number }>
    return items.reduce((total, item) => total + item.quantity, 0)
  } catch {
    return DEFAULT_DEMO_COUNT
  }
}

function getServerSnapshot(): number {
  return DEFAULT_DEMO_COUNT
}

export function CartButton() {
  const count = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className="relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-text-primary transition-colors hover:bg-bg-section hover:text-brand-primary"
    >
      <span className="relative">
        <ShoppingCart size={20} aria-hidden="true" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="text-caption absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 font-semibold text-white"
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </span>
      <span className="text-caption hidden md:inline">Cart</span>
    </Link>
  )
}
