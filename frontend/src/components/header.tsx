import Link from "next/link"
import { Phone, Clock, Zap } from "lucide-react"
import { HeaderNav } from "@/components/header-nav"
import { HeaderSearch } from "@/components/header-search"

const NAV_LINKS = [
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/products" },
  { label: "About", href: "/about" },
]

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
      {/* Utility strip — contact + hours, hidden on mobile */}
      <div className="hidden border-b border-border bg-bg-section lg:block">
        <div className="flex h-9 w-full items-center justify-between gap-6 px-6 lg:px-6">
          <p className="text-caption text-text-secondary">
            Free next-day delivery on orders over $50
          </p>

          <div className="flex items-center gap-6">
            <a
              href="tel:+18005551234"
              className="flex items-center gap-1.5 text-caption text-text-secondary transition-colors duration-200 hover:text-text-primary"
            >
              <Phone className="size-3.5" />
              +1 (800) 555-1234
            </a>
            <span className="flex items-center gap-1.5 text-caption text-text-secondary">
              <Clock className="size-3.5" />
              Mon&ndash;Fri, 9am&ndash;6pm
            </span>
          </div>
        </div>
      </div>

      {/* Main row — search, nav, actions. The logo lives in the sidebar on desktop. */}
      <div className="flex h-16 w-full items-center gap-4 px-4 sm:px-6 lg:gap-8 lg:px-6">
        <Link
          href="/"
          aria-label="ElectroGadget — home"
          className="flex shrink-0 items-center gap-2 lg:hidden"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-brand-primary">
            <Zap className="size-4 fill-white text-white" />
          </span>
          <span className="text-h4 font-semibold tracking-tight text-text-primary">
            ElectroGadget
          </span>
        </Link>

        <HeaderSearch />

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="text-small-semibold whitespace-nowrap text-text-secondary transition-colors duration-200 hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <HeaderNav navLinks={NAV_LINKS} />
      </div>
    </header>
  )
}
