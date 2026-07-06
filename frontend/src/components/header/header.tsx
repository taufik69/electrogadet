import Link from "next/link";
import { User } from "lucide-react";
import { SearchBar } from "./search-bar";
import { CartButton } from "./cart-button";
import { WishlistButton } from "./wishlist-button";
import { MobileNav } from "./mobile-nav";
import { MegaMenu } from "./mega-menu";
import { Container } from "@/components/layout/container";
import { getCategoryTree } from "@/lib/categories";

export async function Header() {
  const categories = await getCategoryTree();

  return (
    <header className="shadow-e1 sticky top-0 z-40 border-b border-border bg-surface">
      <Container className="flex h-20 items-center gap-4">
        <Link
          href="/"
          className="text-h4 flex shrink-0 items-center gap-2 text-text-primary"
          aria-label="Electrogadget home"
        >
          Electrogadget
        </Link>

        <div className="hidden flex-1 items-center justify-center md:flex">
          <SearchBar categories={categories} />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-2">
          <Link
            href="/account"
            aria-label="Sign in"
            className="hidden flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-text-primary transition-colors hover:bg-bg-section hover:text-brand-primary md:flex"
          >
            <User size={20} aria-hidden="true" />
            <span className="text-caption">Sign in</span>
          </Link>
          <WishlistButton />
          <CartButton />
          <MobileNav categories={categories} />
        </div>
      </Container>

      <div className="hidden md:block">
        <MegaMenu categories={categories} />
      </div>

      <Container className="border-t border-border py-3 md:hidden">
        <SearchBar categories={categories} />
      </Container>
    </header>
  );
}
