"use client"

import { ShoppingCart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface MobileStickyCtaProps {
  priceCents: number
  compareAtCents: number | null
}

export function MobileStickyCta({ priceCents, compareAtCents }: MobileStickyCtaProps) {
  return (
    <div className="shadow-e3 fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-border bg-surface/95 p-3 backdrop-blur lg:hidden">
      <div className="flex flex-col leading-tight">
        <span className="text-h4 font-semibold text-text-primary">{formatCurrency(priceCents)}</span>
        {compareAtCents !== null && (
          <span className="text-caption text-text-secondary line-through">{formatCurrency(compareAtCents)}</span>
        )}
      </div>
      <button
        type="button"
        className="text-small-semibold flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-text-primary text-text-primary"
      >
        <ShoppingCart size={16} aria-hidden="true" />
        Cart
      </button>
      <button
        type="button"
        className="text-small-semibold flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-danger text-white"
      >
        Buy Now
      </button>
    </div>
  )
}
