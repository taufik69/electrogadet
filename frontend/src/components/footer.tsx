import Link from "next/link"
import { Zap } from "lucide-react"
// lucide-react has no brand marks (trademarks); Simple Icons does.
import { SiFacebook, SiInstagram, SiYoutube } from "react-icons/si"

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

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", icon: SiFacebook },
  { label: "Instagram", href: "https://instagram.com", icon: SiInstagram },
  { label: "YouTube", href: "https://youtube.com", icon: SiYoutube },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface">
      {/* Matches <main>'s lg:px-6 plus each section's own px-4/sm:px-6, so the
          footer's columns line up with the content above it. */}
      <div className="w-full px-4 py-16 sm:px-6 lg:px-12">
        {/* Brand + link columns */}
        <div className="grid grid-cols-2 gap-8 pb-10 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-4 sm:col-span-1">
            <span className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-primary">
                <Zap className="size-4 fill-white text-white" />
              </span>
              <span className="text-h4 font-semibold text-text-primary">ElectroGadget</span>
            </span>
            <p className="text-small text-text-secondary">
              Premium electronics, thoughtfully curated.
            </p>

            <div className="flex items-center gap-2">
              {SOCIALS.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-9 items-center justify-center rounded-full bg-bg-section text-text-secondary transition-colors duration-200 hover:bg-brand-subtle hover:text-brand-primary"
                  >
                    <Icon className="size-4" />
                  </a>
                )
              })}
            </div>
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
            &copy; {year} ElectroGadget. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/legal/privacy"
              className="text-caption text-text-secondary hover:text-text-primary"
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              className="text-caption text-text-secondary hover:text-text-primary"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
