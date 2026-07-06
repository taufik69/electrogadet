"use client"

import { Heart } from "lucide-react"
import { useWishlist } from "@/hooks/use-wishlist"
import { cn } from "@/lib/utils"
import type { ProductCardData } from "./types"

interface WishlistButtonProps {
  product: Pick<
    ProductCardData,
    "slug" | "name" | "imageUrl" | "priceCents" | "compareAtCents" | "discountPercent" | "sellerName" | "stockCount"
  >
}

export function WishlistButton({ product }: WishlistButtonProps) {
  const { isWishlisted, toggle } = useWishlist()
  const active = isWishlisted(product.slug)

  function handleClick(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    toggle(product)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-text-primary shadow-e1 transition-colors hover:text-danger"
    >
      <Heart size={16} aria-hidden="true" className={cn(active && "fill-danger text-danger")} />
    </button>
  )
}
