"use client"

import Link from "next/link"
import { ShoppingCart, Trash2 } from "lucide-react"
import { Container } from "@/components/layout/container"
import { useCart } from "@/hooks/use-cart"
import { CartLineItem } from "./_components/cart-line-item"
import { CartSummary } from "./_components/cart-summary"

export default function CartPage() {
  const { items, itemCount, subtotalCents, savingsCents, updateQuantity, remove, clear } = useCart()

  if (items.length === 0) {
    return (
      <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-section text-text-secondary">
          <ShoppingCart size={28} aria-hidden="true" />
        </span>
        <h1 className="text-h3 text-text-primary">Your cart is empty</h1>
        <p className="text-body text-text-secondary">
          Looks like you haven&apos;t added anything yet. Start exploring our products.
        </p>
        <Link
          href="/"
          className="text-small-semibold mt-2 flex h-11 items-center justify-center rounded-xl bg-brand-primary px-6 text-white transition-colors hover:bg-brand-hover"
        >
          Continue Shopping
        </Link>
      </Container>
    )
  }

  return (
    <Container className="flex flex-col gap-6 py-8 md:py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-h3 sm:text-h2 text-text-primary">
          Shopping Cart <span className="text-text-secondary">({itemCount})</span>
        </h1>
        <button
          type="button"
          onClick={clear}
          className="text-small-semibold flex items-center gap-1.5 text-text-secondary transition-colors hover:text-danger"
        >
          <Trash2 size={15} aria-hidden="true" />
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="shadow-e1 rounded-2xl border border-border bg-surface px-5">
          {items.map((item) => (
            <CartLineItem
              key={item.slug}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={remove}
            />
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <CartSummary itemCount={itemCount} subtotalCents={subtotalCents} savingsCents={savingsCents} />
        </div>
      </div>
    </Container>
  )
}
