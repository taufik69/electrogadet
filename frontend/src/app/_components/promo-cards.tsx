import Link from "next/link"
import { Banknote, Truck, type LucideIcon } from "lucide-react"

interface PromoCard {
  title: string
  description: string
  href: string
  icon: LucideIcon
  className: string
  iconClassName: string
}

const promoCards: PromoCard[] = [
  {
    title: "100% Cash on Delivery",
    description: "Pay in cash when your order arrives",
    href: "/products",
    icon: Banknote,
    className: "bg-gradient-to-br from-danger/15 to-danger/5",
    iconClassName: "bg-danger text-white",
  },
  {
    title: "Nationwide Delivery",
    description: "Fast delivery across Bangladesh",
    href: "/products",
    icon: Truck,
    className: "bg-gradient-to-br from-brand-primary/15 to-brand-primary/5",
    iconClassName: "bg-brand-primary text-white",
  },
]

export function PromoCards() {
  return (
    <div className="flex h-full flex-col gap-6">
      {promoCards.map((card) => (
        <div
          key={card.title}
          className={`relative flex flex-1 items-center justify-between gap-4 overflow-hidden rounded-2xl p-6 ${card.className}`}
        >
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="text-h4 text-text-primary">{card.title}</h3>
              <p className="text-small mt-1 text-text-secondary">{card.description}</p>
            </div>
            <Link
              href={card.href}
              className="text-small-semibold inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-text-primary shadow-e1 transition-colors hover:bg-bg-section"
            >
              Shop now
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.iconClassName}`}
          >
            <card.icon size={24} aria-hidden="true" />
          </span>
        </div>
      ))}
    </div>
  )
}
