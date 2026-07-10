"use client"

import { useState } from "react"
import { Heart, ShoppingCart, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function WishlistButton({ productName }: { productName: string }) {
  const [wished, setWished] = useState(false)

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={wished ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
      aria-pressed={wished}
      onClick={(e) => {
        e.preventDefault()
        setWished((prev) => !prev)
      }}
      className="size-8 rounded-full bg-surface/85 shadow-e1 backdrop-blur-sm hover:bg-surface"
    >
      <Heart
        className={cn(
          "size-4 transition-colors duration-200",
          wished ? "fill-brand-primary text-brand-primary" : "text-text-secondary"
        )}
      />
    </Button>
  )
}

export function CompareButton({ productName }: { productName: string }) {
  const [compared, setCompared] = useState(false)

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={compared ? `Remove ${productName} from comparison` : `Add ${productName} to comparison`}
      aria-pressed={compared}
      onClick={(e) => {
        e.preventDefault()
        setCompared((prev) => !prev)
      }}
      className="size-8 rounded-full bg-surface/85 shadow-e1 backdrop-blur-sm hover:bg-surface"
    >
      <BarChart2
        className={cn(
          "size-4 transition-colors duration-200",
          compared ? "text-brand-primary" : "text-text-secondary"
        )}
      />
    </Button>
  )
}

export function AddToCartButton({ productName }: { productName: string }) {
  return (
    <Button
      type="button"
      variant="default"
      aria-label={`Add ${productName} to cart`}
      onClick={(e) => e.preventDefault()}
      className="w-full gap-2"
    >
      <ShoppingCart className="size-4" />
      Add to cart
    </Button>
  )
}
