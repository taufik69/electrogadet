import { Lock, ShieldCheck } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface CheckoutSummaryProps {
  itemCount: number
  subtotalCents: number
  savingsCents: number
  isSubmitting: boolean
}

const SHIPPING_CENTS = 0

export function CheckoutSummary({
  itemCount,
  subtotalCents,
  savingsCents,
  isSubmitting,
}: CheckoutSummaryProps) {
  const totalCents = subtotalCents + SHIPPING_CENTS

  return (
    <div className="shadow-e1 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-h4 text-text-primary">Total</h2>

      <div className="flex flex-col gap-2.5 border-b border-border pb-4">
        <div className="text-small flex items-center justify-between text-text-secondary">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span className="text-text-primary">{formatCurrency(subtotalCents)}</span>
        </div>
        {savingsCents > 0 && (
          <div className="text-small flex items-center justify-between text-success">
            <span>Savings</span>
            <span>-{formatCurrency(savingsCents)}</span>
          </div>
        )}
        <div className="text-small flex items-center justify-between text-text-secondary">
          <span>Shipping</span>
          <span className="text-success">Free</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-body-lg font-semibold text-text-primary">Total</span>
        <span className="text-h3 font-semibold text-text-primary">{formatCurrency(totalCents)}</span>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="text-small-semibold shadow-e2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-danger to-danger/90 text-white transition-transform hover:scale-[1.02] hover:shadow-e3 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
      >
        <Lock size={16} aria-hidden="true" />
        {isSubmitting ? "Placing Order…" : "Place Order"}
      </button>

      <div className="text-caption flex items-center gap-2 text-text-secondary">
        <ShieldCheck size={15} aria-hidden="true" />
        Your information is safe and secure
      </div>
    </div>
  )
}
