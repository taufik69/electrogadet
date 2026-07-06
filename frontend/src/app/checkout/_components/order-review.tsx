import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import type { CartItem } from "@/lib/cart"

interface OrderReviewProps {
  items: CartItem[]
}

export function OrderReview({ items }: OrderReviewProps) {
  return (
    <div className="shadow-e1 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-h4 text-text-primary">Order Review</h2>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.slug} className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-bg-section">
              <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" />
              <span className="text-caption absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-text-primary px-1 font-semibold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-small line-clamp-1 text-text-primary">{item.name}</span>
              {item.sellerName && (
                <span className="text-caption text-text-secondary">{item.sellerName}</span>
              )}
            </div>
            <span className="text-small-semibold shrink-0 text-text-primary">
              {formatCurrency(item.priceCents * item.quantity)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
