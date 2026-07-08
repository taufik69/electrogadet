"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"
import { resolveMediaUrl } from "@/lib/media"
import type { FlashSale } from "@/lib/types/flash-sale"

function getRemaining(deadline: number) {
  const totalSeconds = Math.max(0, Math.floor((deadline - Date.now()) / 1000))
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

function pad(value: number): string {
  return value.toString().padStart(2, "0")
}

interface FlashSaleBannerProps {
  flashSale: FlashSale | null
}

export function FlashSaleBanner({ flashSale }: FlashSaleBannerProps) {
  const deadline = flashSale ? new Date(flashSale.endsAt).getTime() : 0
  const [remaining, setRemaining] = useState(() => getRemaining(deadline))

  useEffect(() => {
    if (!flashSale) return
    const interval = setInterval(() => setRemaining(getRemaining(deadline)), 1000)
    return () => clearInterval(interval)
  }, [deadline, flashSale])

  if (!flashSale || flashSale.products.length === 0) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-[#3a0d14] via-[#2a0a10] to-[#1a0509] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger text-white">
            <Zap size={20} fill="currentColor" aria-hidden="true" />
          </span>
          <div>
            <p className="text-caption font-semibold uppercase tracking-wide text-white/50">
              Limited time
            </p>
            <p className="text-h4 text-white">{flashSale.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2" aria-label="Time remaining">
            <TimeUnit value={pad(remaining.hours)} label="Hrs" />
            <span className="text-h4 text-white/30">:</span>
            <TimeUnit value={pad(remaining.minutes)} label="Min" />
            <span className="text-h4 text-white/30">:</span>
            <TimeUnit value={pad(remaining.seconds)} label="Sec" />
          </div>

          <Link
            href="/products"
            className="text-small-semibold flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-text-primary transition-colors hover:bg-white/90"
          >
            View all
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {flashSale.products.map((entry) => {
          const discountPercent =
            entry.product.compareAtCents && entry.product.compareAtCents > 0
              ? Math.round((1 - entry.salePriceCents / entry.product.compareAtCents) * 100)
              : null

          return (
            <ProductCard
              key={entry.id}
              slug={entry.product.slug}
              name={entry.product.name}
              imageUrl={resolveMediaUrl(entry.product.imageUrl) ?? ""}
              priceCents={entry.salePriceCents}
              compareAtCents={entry.product.compareAtCents}
              discountPercent={discountPercent}
              sellerName={null}
              isVerifiedSeller={false}
              badge={null}
              soldCount={null}
              stockCount={null}
            />
          )
        })}
      </div>
    </div>
  )
}

function TimeUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-14 flex-col items-center gap-0.5 rounded-lg bg-white/10 px-3 py-2">
      <span className="text-h4 tabular-nums text-white">{value}</span>
      <span className="text-caption uppercase tracking-wide text-white/50">{label}</span>
    </div>
  )
}
