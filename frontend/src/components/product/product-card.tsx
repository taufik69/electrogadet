import Image from "next/image"
import Link from "next/link"
import { BadgeCheck, Eye, Heart, ShoppingCart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { ProductCardData } from "./types"

const badgeLabel: Record<NonNullable<ProductCardData["badge"]>, string> = {
  new: "New",
  hot: "Hot",
}

export function ProductCard({
  slug,
  name,
  imageUrl,
  priceCents,
  compareAtCents,
  discountPercent,
  sellerName,
  isVerifiedSeller,
  badge,
  soldCount,
  stockCount,
}: ProductCardData) {
  const hasStock = soldCount !== null && stockCount !== null && stockCount > 0
  const soldRatio = hasStock ? Math.min(1, soldCount! / stockCount!) : 0

  return (
    <div className="group relative flex w-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-e2">
      <div className="relative aspect-square overflow-hidden bg-bg-section">
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5">
          {discountPercent !== null && (
            <span className="text-caption rounded-full bg-danger px-2 py-1 font-bold text-white">
              -{discountPercent}%
            </span>
          )}
          {badge && (
            <span className="text-caption rounded-full bg-success px-2 py-1 font-semibold text-white">
              {badgeLabel[badge]}
            </span>
          )}
        </div>

        <button
          type="button"
          aria-label="Add to wishlist"
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-text-primary shadow-e1 transition-colors hover:text-danger"
        >
          <Heart size={16} aria-hidden="true" />
        </button>

        <Link href={`/products/${slug}`} className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 20vw"
            className="object-cover"
          />
        </Link>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex translate-y-full items-center gap-2 p-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            className="text-small-semibold flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-text-primary text-white transition-colors hover:bg-text-primary/90"
          >
            <ShoppingCart size={14} aria-hidden="true" />
            Add to Cart
          </button>
          <Link
            href={`/products/${slug}`}
            aria-label={`Quick view ${name}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-text-primary shadow-e1 transition-colors hover:bg-bg-section"
          >
            <Eye size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3">
        {sellerName && (
          <div className="text-caption flex items-center gap-1 text-brand-primary">
            <span className="truncate">{sellerName}</span>
            {isVerifiedSeller && (
              <span className="flex items-center gap-0.5 text-text-secondary">
                · <BadgeCheck size={12} className="text-brand-primary" aria-hidden="true" />
                Verified
              </span>
            )}
          </div>
        )}

        <Link href={`/products/${slug}`}>
          <p className="text-small line-clamp-2 text-text-primary">{name}</p>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-h4 font-semibold text-text-primary">
            {formatCurrency(priceCents)}
          </span>
          {compareAtCents !== null && (
            <span className="text-small text-text-secondary line-through">
              {formatCurrency(compareAtCents)}
            </span>
          )}
        </div>

        {hasStock && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-section">
              <div
                className="h-full rounded-full bg-danger"
                style={{ width: `${soldRatio * 100}%` }}
              />
            </div>
            <span className="text-caption shrink-0 text-text-secondary">
              {soldCount}/{stockCount}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
