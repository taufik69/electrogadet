"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { useWishlist } from "@/hooks/use-wishlist"

export function WishlistButton() {
  const { itemCount: count } = useWishlist()

  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist, ${count} item${count === 1 ? "" : "s"}`}
      className="relative hidden flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-text-primary transition-colors hover:bg-bg-section hover:text-brand-primary md:flex"
    >
      <span className="relative">
        <Heart size={20} aria-hidden="true" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="text-caption absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 font-semibold text-white"
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </span>
      <span className="text-caption">Wishlist</span>
    </Link>
  )
}
