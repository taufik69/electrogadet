"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, ListChecks, MessageCircleQuestion, Sparkles, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProductDetail } from "@/lib/mock/mock-product-detail"

const TABS = ["Description", "Specifications", "Questions & Answers", "Reviews"] as const
type Tab = (typeof TABS)[number]

interface ProductTabsProps {
  product: ProductDetail
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Description")

  return (
    <div className="shadow-e1 flex flex-col gap-6 rounded-2xl border border-border bg-surface p-5 sm:p-8">
      <div role="tablist" aria-label="Product details" className="flex gap-6 overflow-x-auto border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "text-small-semibold relative shrink-0 whitespace-nowrap pb-3 pt-1 transition-colors",
              activeTab === tab ? "text-text-primary" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.span
                layoutId="product-tab-underline"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === "Description" && (
        <div className="flex flex-col gap-3">
          {product.descriptionBullets.map((bullet) => (
            <div key={bullet} className="flex items-start gap-2.5">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-brand-primary" aria-hidden="true" />
              <p className="text-small text-text-primary">{bullet}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Specifications" && (
        <div className="flex flex-col gap-2">
          <div className="mb-1 flex items-center gap-2">
            <ListChecks size={16} className="text-brand-primary" aria-hidden="true" />
            <span className="text-small-semibold text-text-primary">Technical details</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left">
              <tbody>
                {product.specs.map((spec, index) => (
                  <tr key={spec.label} className={index % 2 === 0 ? "bg-bg-section" : "bg-surface"}>
                    <th scope="row" className="text-small w-1/3 px-4 py-3 font-semibold text-text-secondary">
                      {spec.label}
                    </th>
                    <td className="text-small px-4 py-3 text-text-primary">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Questions & Answers" && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <MessageCircleQuestion size={28} className="text-text-secondary" aria-hidden="true" />
          <p className="text-small-semibold text-text-primary">No questions yet</p>
          <p className="text-small max-w-sm text-text-secondary">
            Be the first to ask a question about this product.
          </p>
        </div>
      )}

      {activeTab === "Reviews" && (
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex shrink-0 flex-col items-center justify-center gap-2 rounded-xl bg-bg-section px-8 py-6 sm:w-56">
            <span className="text-display font-semibold text-text-primary">{product.rating}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={16}
                  aria-hidden="true"
                  className={i < Math.round(product.rating) ? "fill-warning text-warning" : "text-border"}
                />
              ))}
            </div>
            <span className="text-caption text-text-secondary">{product.reviewCount} reviews</span>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const ratio = ratingBarRatio(product.rating, star)
              return (
                <div key={star} className="flex items-center gap-2.5">
                  <span className="text-caption flex w-10 shrink-0 items-center gap-1 text-text-secondary">
                    {star} <Star size={11} className="fill-text-secondary text-text-secondary" aria-hidden="true" />
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-section">
                    <div
                      className="h-full rounded-full bg-warning"
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>
                  <span className="text-caption w-8 shrink-0 text-right text-text-secondary">
                    {Math.round(ratio * 100)}%
                  </span>
                </div>
              )
            })}
            <div className="mt-2 flex items-center gap-2 text-success">
              <CheckCircle2 size={15} aria-hidden="true" />
              <span className="text-small">Most buyers recommend this product</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ratingBarRatio(avgRating: number, star: number): number {
  const distance = Math.abs(avgRating - star)
  return Math.max(0.03, 1 - distance / 3)
}
