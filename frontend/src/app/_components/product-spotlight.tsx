import Image from "next/image"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export interface SpotlightProduct {
  name: string
  imageUrl: string
  priceCents: number
  compareAtCents: number
  discountPercent: number
  badge: string
}

interface ProductSpotlightProps {
  product: SpotlightProduct
  priority?: boolean
}

export function ProductSpotlight({ product, priority }: ProductSpotlightProps) {
  return (
    <div className="w-full max-w-xs shrink-0 overflow-hidden rounded-2xl bg-white text-text-primary shadow-2xl">
      <div className="relative aspect-square bg-bg-section">
        <span className="text-caption absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-semibold text-text-primary shadow-e1">
          <CheckCircle2 size={12} className="text-success" aria-hidden="true" />
          {product.badge}
        </span>
        <span className="text-caption absolute right-3 top-3 z-10 rounded-full bg-danger px-2.5 py-1 font-bold text-white">
          -{product.discountPercent}%
        </span>

        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="320px"
          className="pointer-events-none object-cover"
          priority={priority}
        />
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-small truncate text-text-primary">{product.name}</p>
          <p className="flex items-baseline gap-2">
            <span className="text-h4 font-semibold text-text-primary">
              {formatCurrency(product.priceCents)}
            </span>
            <span className="text-small text-text-secondary line-through">
              {formatCurrency(product.compareAtCents)}
            </span>
          </p>
        </div>
        <button
          type="button"
          aria-label={`View ${product.name}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger text-white transition-colors hover:bg-danger/90"
        >
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
