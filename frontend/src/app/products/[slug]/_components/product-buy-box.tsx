"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BadgeCheck,
  Boxes,
  CreditCard,
  Flame,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import type { ProductDetail } from "@/lib/mock/mock-product-detail"

interface ProductBuyBoxProps {
  product: ProductDetail
}

export function ProductBuyBox({ product }: ProductBuyBoxProps) {
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const { add } = useCart()
  const { isWishlisted, toggle } = useWishlist()

  const {
    slug,
    name,
    sellerName,
    isVerifiedSeller,
    rating,
    reviewCount,
    priceCents,
    compareAtCents,
    discountPercent,
    stockCount,
    soldCount,
    images,
    specs,
  } = product

  const wishlisted = isWishlisted(slug)

  function handleAddToCart() {
    add(
      {
        slug,
        name,
        imageUrl: images[0],
        priceCents,
        compareAtCents,
        sellerName,
        stockCount,
      },
      quantity,
    )
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  function handleToggleWishlist() {
    toggle({
      slug,
      name,
      imageUrl: images[0],
      priceCents,
      compareAtCents,
      discountPercent,
      sellerName,
      stockCount,
    })
  }

  const highlightSpecs = specs.filter((spec) =>
    ["Brand", "Model", "Color"].includes(spec.label),
  )

  const savingsCents = compareAtCents !== null ? compareAtCents - priceCents : 0
  const isLowStock = stockCount <= 15

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="#"
            className="text-small-semibold flex items-center gap-1.5 text-brand-primary transition-colors hover:text-brand-hover"
          >
            {sellerName}
            {isVerifiedSeller && <BadgeCheck size={14} aria-hidden="true" />}
            <span className="text-text-secondary">· Official</span>
          </Link>
          <Link
            href="#"
            className="text-small-semibold flex items-center gap-1 text-danger transition-colors hover:text-danger/80"
          >
            Visit store →
          </Link>
        </div>

        <h1 className="text-h3 sm:text-h2 text-text-primary">{name}</h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex items-center gap-1 rounded-md bg-warning/10 px-2 py-1">
            <Star size={14} className="fill-warning text-warning" aria-hidden="true" />
            <span className="text-small-semibold text-text-primary">{rating}</span>
          </div>
          <span className="text-small text-text-secondary">{reviewCount} reviews</span>
          <span className="text-border" aria-hidden="true">
            |
          </span>
          <span className="text-small flex items-center gap-1 text-text-secondary">
            <Flame size={14} className="text-danger" aria-hidden="true" />
            {soldCount} sold
          </span>
        </div>
      </div>

      <div className="shadow-e1 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-h1 sm:text-display font-semibold text-text-primary">{formatCurrency(priceCents)}</span>
          {compareAtCents !== null && (
            <span className="text-body-lg text-text-secondary line-through">{formatCurrency(compareAtCents)}</span>
          )}
          {discountPercent !== null && (
            <span className="text-small-semibold rounded-full bg-danger px-2.5 py-1 text-white">
              -{discountPercent}%
            </span>
          )}
        </div>
        {savingsCents > 0 && (
          <p className="text-small-semibold text-success">
            You save {formatCurrency(savingsCents)} on this order
          </p>
        )}
        <div className="text-small-semibold flex w-fit items-center gap-2 rounded-full bg-success px-4 py-2 text-white">
          <CreditCard size={15} aria-hidden="true" />
          Cash on Delivery — pay only when it arrives
        </div>

        {highlightSpecs.length > 0 && (
          <dl className="mt-1 grid grid-cols-3 gap-3 border-t border-border pt-3">
            {highlightSpecs.map((spec) => (
              <div key={spec.label} className="flex flex-col gap-0.5">
                <dt className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
                  {spec.label}
                </dt>
                <dd className="text-small-semibold truncate text-text-primary">{spec.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
            <Boxes size={18} aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="text-small-semibold flex items-center gap-1.5 text-text-primary">
              <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
              In stock, ready to ship
            </span>
            <span className="text-caption text-text-secondary">{soldCount} sold so far</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={cn("text-h4 font-semibold", isLowStock ? "text-danger" : "text-text-primary")}>
            {stockCount}
          </span>
          <span className="text-caption text-text-secondary">units left</span>
        </div>
      </div>
      {isLowStock && (
        <p className="text-caption -mt-4 font-semibold text-danger">
          Hurry! Only {stockCount} left in stock — order soon.
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-caption font-bold uppercase tracking-wider text-text-secondary">Quantity</span>
          <div className="flex items-center rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-11 w-11 items-center justify-center text-text-primary transition-colors hover:bg-bg-section disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus size={16} aria-hidden="true" />
            </button>
            <span className="text-small-semibold flex h-11 w-12 items-center justify-center text-text-primary">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(stockCount, q + 1))}
              disabled={quantity >= stockCount}
              aria-label="Increase quantity"
              className="flex h-11 w-11 items-center justify-center text-text-primary transition-colors hover:bg-bg-section disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          className={cn(
            "text-small-semibold flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 transition-colors",
            justAdded
              ? "border-success bg-success text-white"
              : "border-text-primary text-text-primary hover:bg-text-primary hover:text-white",
          )}
        >
          <ShoppingCart size={17} aria-hidden="true" />
          {justAdded ? "Added!" : "Add to Cart"}
        </button>
        <button
          type="button"
          className="text-small-semibold shadow-e2 flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-danger to-danger/90 text-white transition-transform hover:scale-[1.02] hover:shadow-e3 active:scale-[0.99]"
        >
          Buy Now
        </button>
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-text-primary transition-colors hover:bg-bg-section"
        >
          <Heart size={18} aria-hidden="true" className={wishlisted ? "fill-danger text-danger" : ""} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-xl border border-border px-4 py-3.5">
        <div className="flex flex-col items-center gap-1 text-center">
          <Truck size={18} className="text-brand-primary" aria-hidden="true" />
          <span className="text-caption font-semibold text-text-primary">Fast delivery</span>
          <span className="text-caption text-text-secondary">3–4 days</span>
        </div>
        <span className="h-10 w-px bg-border" aria-hidden="true" />
        <div className="flex flex-col items-center gap-1 text-center">
          <RotateCcw size={18} className="text-brand-primary" aria-hidden="true" />
          <span className="text-caption font-semibold text-text-primary">7-day returns</span>
          <span className="text-caption text-text-secondary">Buyer Protection</span>
        </div>
        <span className="h-10 w-px bg-border" aria-hidden="true" />
        <div className="flex flex-col items-center gap-1 text-center">
          <ShieldCheck size={18} className="text-brand-primary" aria-hidden="true" />
          <span className="text-caption font-semibold text-text-primary">Verified seller</span>
          <span className="text-caption text-text-secondary">Buyer safe</span>
        </div>
      </div>
    </div>
  )
}
