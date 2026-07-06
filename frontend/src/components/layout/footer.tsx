import Link from "next/link"
import { Apple, Play, Zap } from "lucide-react"
import { Container } from "@/components/layout/container"

interface FooterLinkColumn {
  heading: string
  links: { label: string; href: string }[]
}

const linkColumns: FooterLinkColumn[] = [
  {
    heading: "Shop",
    links: [
      { label: "All Categories", href: "/categories" },
      { label: "Flash Sale", href: "/products?sale=flash" },
      { label: "Smartphones", href: "/categories/smartphones" },
      { label: "Cameras", href: "/categories/cameras" },
      { label: "Smart Home", href: "/categories/smart-home" },
      { label: "Audio & Headphones", href: "/categories/audio" },
    ],
  },
  {
    heading: "Customer Service",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Order Tracking", href: "/orders/track" },
      { label: "Returns & Refunds", href: "/returns" },
      { label: "Shipping Info", href: "/shipping" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    heading: "Sell on Electrogadget",
    links: [
      { label: "Become a Seller", href: "/sell" },
      { label: "Seller Center", href: "/sell/center" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "About Electrogadget", href: "/about" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#0b1120] text-white/70">
      <Container className="flex flex-col gap-10 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="col-span-2 flex flex-col gap-4 sm:col-span-3 lg:col-span-1">
            <Link
              href="/"
              className="text-h4 flex w-fit items-center gap-2 rounded-sm bg-white px-2.5 py-1.5 text-text-primary"
              aria-label="Electrogadget home"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-text-primary text-white">
                <Zap size={14} fill="currentColor" aria-hidden="true" />
              </span>
              electrogadget
            </Link>

            <p className="text-small max-w-xs text-white/50">
              Russia&rsquo;s premium electronics marketplace. Official brand
              stores, verified sellers, and fast delivery to every region.
            </p>

            <div className="flex flex-col gap-2">
              <p className="text-caption font-bold uppercase tracking-wide text-white/40">
                Get the app
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/app/google-play"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
                >
                  <Play size={18} aria-hidden="true" className="text-white" />
                  <span className="flex flex-col leading-tight">
                    <span className="text-[10px] uppercase tracking-wide text-white/40">
                      Get it on
                    </span>
                    <span className="text-small-semibold text-white">
                      Google Play
                    </span>
                  </span>
                </Link>

                <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 opacity-60">
                  <Apple size={18} aria-hidden="true" className="text-white" />
                  <span className="flex flex-col leading-tight">
                    <span className="text-[10px] uppercase tracking-wide text-white/40">
                      Coming soon
                    </span>
                    <span className="text-small-semibold text-white">
                      App Store
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </div>

          {linkColumns.map(({ heading, links }) => (
            <div key={heading} className="flex flex-col gap-3">
              <p className="text-caption font-bold uppercase tracking-wide text-white">
                {heading}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-small text-white/50 transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-white/40">
            © {year} Electrogadget LLC · Made in Moscow 🇷🇺
          </p>

          <div className="flex items-center gap-3">
            <span className="text-caption text-white/40">We accept</span>
            <span className="text-small-semibold rounded-full bg-white px-4 py-2 text-text-primary">
              Card &amp; SBP
            </span>
          </div>
        </div>
      </Container>
    </footer>
  )
}
