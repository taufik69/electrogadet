"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { CartItem } from "@/lib/cart"

interface CartLineItemProps {
  item: CartItem
  onUpdateQuantity: (slug: string, quantity: number) => void
  onRemove: (slug: string) => void
}

export function CartLineItem({ item, onUpdateQuantity, onRemove }: CartLineItemProps) {
  const { slug, name, imageUrl, priceCents, compareAtCents, sellerName, stockCount, quantity } = item
  const maxQty = stockCount ?? Infinity
  const lineTotalCents = priceCents * quantity

  return (
    <div className="flex gap-4 border-b border-border py-5 last:border-b-0">
      <Link
        href={`/products/${slug}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-bg-section sm:h-28 sm:w-28"
      >
        <Image src={imageUrl} alt={name} fill sizes="112px" className="object-cover" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <Link href={`/products/${slug}`} className="text-small-semibold line-clamp-2 text-text-primary hover:text-brand-primary">
              {name}
            </Link>
            {sellerName && <span className="text-caption text-text-secondary">{sellerName}</span>}
          </div>
          <button
            type="button"
            onClick={() => onRemove(slug)}
            aria-label={`Remove ${name} from cart`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center rounded-lg border border-border">
            <button
              type="button"
              onClick={() => onUpdateQuantity(slug, quantity - 1)}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-9 w-9 items-center justify-center text-text-primary transition-colors hover:bg-bg-section disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus size={14} aria-hidden="true" />
            </button>
            <span className="text-small-semibold flex h-9 w-10 items-center justify-center text-text-primary">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(slug, quantity + 1)}
              disabled={quantity >= maxQty}
              aria-label="Increase quantity"
              className="flex h-9 w-9 items-center justify-center text-text-primary transition-colors hover:bg-bg-section disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col items-end gap-0.5">
            <span className="text-small-semibold text-text-primary">{formatCurrency(lineTotalCents)}</span>
            {compareAtCents !== null && (
              <span className="text-caption text-text-secondary line-through">
                {formatCurrency(compareAtCents * quantity)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
