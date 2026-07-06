import Link from "next/link"
import { Zap, Heart, User } from "lucide-react"
import { SearchBar } from "./search-bar"
import { CartButton } from "./cart-button"
import { MobileNav } from "./mobile-nav"
import { MegaMenu } from "./mega-menu"
import { Container } from "@/components/layout/container"
import type { NavCategoryTreeNode } from "@/lib/types/category"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

async function getNavTree(): Promise<NavCategoryTreeNode[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories/tree`, { cache: "no-store" })
    if (!res.ok) return []
    const body = await res.json()
    return (body.data ?? []) as NavCategoryTreeNode[]
  } catch {
    return []
  }
}

export async function Header() {
  const categories = await getNavTree()

  return (
    <header className="shadow-e1 sticky top-0 z-40 border-b border-border bg-surface">
      <Container className="flex h-16 items-center gap-4">
        <Link
          href="/"
          className="text-h4 flex shrink-0 items-center gap-2 text-text-primary"
          aria-label="Nordvolt home"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-brand-primary text-white">
            <Zap size={16} fill="currentColor" aria-hidden="true" />
          </span>
          nordvolt
        </Link>

        <div className="hidden flex-1 items-center justify-center md:flex">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-4">
          <Link
            href="/account"
            aria-label="Sign in"
            className="hidden flex-col items-center gap-0.5 text-text-primary transition-colors hover:text-brand-primary md:flex"
          >
            <User size={20} aria-hidden="true" />
            <span className="text-caption">Sign in</span>
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden flex-col items-center gap-0.5 text-text-primary transition-colors hover:text-brand-primary md:flex"
          >
            <Heart size={20} aria-hidden="true" />
            <span className="text-caption">Wishlist</span>
          </Link>
          <CartButton />
          <MobileNav categories={categories} />
        </div>
      </Container>

      <div className="hidden md:block">
        <MegaMenu categories={categories} />
      </div>

      <Container className="border-t border-border py-3 md:hidden">
        <SearchBar />
      </Container>
    </header>
  )
}
