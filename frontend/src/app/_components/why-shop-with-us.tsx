import Link from "next/link"
import { ArrowRight, LayoutGrid, ShieldCheck, Truck, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: LayoutGrid,
    title: "Millions of products",
    description: "Electronics, gadgets, cameras, smart home & accessories",
  },
  {
    icon: Wallet,
    title: "Flexible payment",
    description: "Pay by card, SBP or cash on delivery",
  },
  {
    icon: Truck,
    title: "Nationwide delivery",
    description: "Moscow, St. Petersburg and every region of Russia",
  },
  {
    icon: ShieldCheck,
    title: "Verified sellers",
    description: "Genuine products with easy returns",
  },
]

const quickLinks: { label: string; href: string; primary?: boolean }[] = [
  { label: "Browse all categories", href: "/categories", primary: true },
  { label: "Today's flash deals", href: "/products?sale=flash" },
  { label: "Track your order", href: "/orders/track" },
  { label: "Sell on Electrogadget", href: "/sell" },
]

export function WhyShopWithUs() {
  return (
    <section className="why-shop-gradient relative overflow-hidden rounded-2xl border border-border p-6 sm:p-8">
      <style>{`
        .why-shop-gradient {
          background-image: radial-gradient(
            120% 140% at 0% 0%,
            color-mix(in srgb, var(--color-brand-primary) 16%, transparent) 0%,
            color-mix(in srgb, var(--color-danger) 10%, transparent) 35%,
            var(--color-surface) 70%
          );
          background-size: 180% 180%;
          animation: why-shop-drift 14s ease-in-out infinite;
        }
        @keyframes why-shop-drift {
          0% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 30% 20%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .why-shop-gradient {
            animation: none;
          }
        }
      `}</style>

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <span className="text-caption inline-flex w-fit items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1.5 font-bold uppercase tracking-wide text-danger">
            <span className="h-1.5 w-1.5 rounded-full bg-danger" />
            Why shop on Electrogadget
          </span>

          <h2 className="text-h2 max-w-2xl font-bold text-text-primary">
            Online shopping in Russia, made simple
          </h2>

          <p className="text-small max-w-2xl text-text-secondary">
            Electrogadget is an online marketplace bringing electronics, gadgets,
            cameras, smart home devices and daily essentials into one trusted
            place. Discover genuine products from verified sellers, order in a
            few clicks, and pay by card, SBP or{" "}
            <span className="font-semibold text-text-primary">cash on delivery</span>{" "}
            — with fast delivery across Russia.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-e2"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-section text-text-secondary transition-colors duration-200 group-hover:bg-brand-primary/10 group-hover:text-brand-primary">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="text-small-semibold text-text-primary">{title}</p>
                <p className="text-caption mt-0.5 text-text-secondary">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {quickLinks.map(({ label, href, primary }) => (
            <Link
              key={href}
              href={href}
              className={
                primary
                  ? "text-small-semibold flex items-center gap-2 rounded-full bg-text-primary px-5 py-3 text-white transition-colors hover:bg-text-primary/90"
                  : "text-small-semibold flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-text-primary transition-colors hover:border-brand-primary/30 hover:text-brand-primary"
              }
            >
              {label}
              {primary && <ArrowRight size={16} aria-hidden="true" />}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
