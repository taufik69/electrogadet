"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

const CART_STORAGE_KEY = "nordvolt-cart"
const CART_UPDATED_EVENT = "nordvolt-cart-updated"

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(CART_UPDATED_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(CART_UPDATED_EVENT, onStoreChange)
  }
}

function getSnapshot(): number {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return 0
    const items = JSON.parse(raw) as Array<{ quantity: number }>
    return items.reduce((total, item) => total + item.quantity, 0)
  } catch {
    return 0
  }
}

function getServerSnapshot(): number {
  return 0
}

export function CartButton() {
  const count = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className="relative flex flex-col items-center gap-0.5 text-text-primary transition-colors hover:text-brand-primary"
    >
      <span className="relative">
        <ShoppingCart size={20} aria-hidden="true" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="text-caption absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 font-semibold text-white"
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </span>
      <span className="text-caption hidden md:inline">Cart</span>
    </Link>
  )
}
