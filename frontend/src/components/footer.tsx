import Link from "next/link"
import { Phone, MapPin, Star } from "lucide-react"

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Catalog",
    links: [
      { label: "Phones", href: "/products?category=phones" },
      { label: "Laptops", href: "/products?category=laptops" },
      { label: "Tablets", href: "/products?category=tablets" },
      { label: "Headphones", href: "/products?category=headphones" },
      { label: "Wearables", href: "/products?category=wearables" },
    ],
  },
  {
    title: "Customers",
    links: [
      { label: "Delivery", href: "/delivery" },
      { label: "Payment", href: "/payment" },
      { label: "Warranty", href: "/warranty" },
      { label: "Trade-in", href: "/trade-in" },
      { label: "Gift cards", href: "/gift-cards" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Articles", href: "/blog" },
      { label: "Careers", href: "/about" },
    ],
  },
]

const REVIEW_SCORES = [
  { source: "Yandex", score: "4.8" },
  { source: "Google", score: "4.9" },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface">
      <div className="w-full px-4 py-16 sm:px-6 lg:px-6">
        {/* Contact + reviews */}
        <div className="flex flex-col justify-between gap-8 border-b border-border pb-10 lg:flex-row lg:items-start">
          <div className="flex flex-col gap-3">
            <a
              href="tel:+18005551234"
              className="flex items-center gap-2 text-h3 text-text-primary transition-colors duration-200 hover:text-brand-primary"
            >
              <Phone className="size-5 text-text-secondary" />
              +1 (800) 555-1234
            </a>
            <p className="flex items-center gap-2 text-small text-text-secondary">
              <MapPin className="size-4 shrink-0" />
              128 Harbour Street, Oslo, Norway
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-small-semibold text-text-primary">Customer rating</span>
            <div className="flex items-center gap-6">
              {REVIEW_SCORES.map((review) => (
                <span key={review.source} className="flex items-center gap-1.5">
                  <Star className="size-4 fill-warning text-warning" />
                  <span className="text-small-semibold text-text-primary">{review.score}</span>
                  <span className="text-small text-text-secondary">{review.source}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <span className="text-h4 font-semibold text-text-primary">Electromart</span>
            <p className="mt-3 text-small text-text-secondary">
              Premium electronics, thoughtfully curated.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-small-semibold text-text-primary">{column.title}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-small text-text-secondary transition-colors duration-200 hover:text-text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-caption text-text-secondary">
            &copy; {year} Electromart. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/legal/privacy" className="text-caption text-text-secondary hover:text-text-primary">
              Privacy
            </Link>
            <Link href="/legal/terms" className="text-caption text-text-secondary hover:text-text-primary">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
