"use client"

import Link from "next/link"
import { Heart, Trash2 } from "lucide-react"
import { Container } from "@/components/layout/container"
import { ProductCard } from "@/components/product/product-card"
import { useWishlist } from "@/hooks/use-wishlist"

export default function WishlistPage() {
  const { items, itemCount, clear } = useWishlist()

  if (items.length === 0) {
    return (
      <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-section text-text-secondary">
          <Heart size={28} aria-hidden="true" />
        </span>
        <h1 className="text-h3 text-text-primary">Your wishlist is empty</h1>
        <p className="text-body text-text-secondary">
          Save items you love by tapping the heart icon on any product.
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
          Wishlist <span className="text-text-secondary">({itemCount})</span>
        </h1>
        <button
          type="button"
          onClick={clear}
          className="text-small-semibold flex items-center gap-1.5 text-text-secondary transition-colors hover:text-danger"
        >
          <Trash2 size={15} aria-hidden="true" />
          Clear wishlist
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <ProductCard
            key={item.slug}
            slug={item.slug}
            name={item.name}
            imageUrl={item.imageUrl}
            priceCents={item.priceCents}
            compareAtCents={item.compareAtCents}
            discountPercent={item.discountPercent}
            sellerName={item.sellerName}
            isVerifiedSeller={false}
            badge={null}
            soldCount={null}
            stockCount={item.stockCount}
          />
        ))}
      </div>
    </Container>
  )
}
