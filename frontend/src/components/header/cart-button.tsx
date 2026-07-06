"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

export function CartButton() {
  const { itemCount: count } = useCart()

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
