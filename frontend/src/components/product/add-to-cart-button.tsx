"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import type { ProductCardData } from "./types"

interface AddToCartButtonProps {
  product: Pick<
    ProductCardData,
    "slug" | "name" | "imageUrl" | "priceCents" | "compareAtCents" | "sellerName" | "stockCount"
  >
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { add } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  function handleClick(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    add(product, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-small-semibold flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-text-primary text-white transition-colors hover:bg-text-primary/90"
    >
      <ShoppingCart size={14} aria-hidden="true" />
      {justAdded ? "Added!" : "Add to Cart"}
    </button>
  )
}
