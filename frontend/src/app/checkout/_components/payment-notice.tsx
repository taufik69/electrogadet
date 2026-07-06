import { Banknote } from "lucide-react"

export function PaymentNotice() {
  return (
    <div className="shadow-e1 flex items-center gap-3 rounded-2xl border border-border bg-surface p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
        <Banknote size={18} aria-hidden="true" />
      </span>
      <div className="flex flex-col">
        <span className="text-small-semibold text-text-primary">Cash on Delivery</span>
        <span className="text-caption text-text-secondary">Pay only when your order arrives</span>
      </div>
    </div>
  )
}
