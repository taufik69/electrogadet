"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Search, Heart, ShoppingCart, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface NavLink {
  label: string
  href: string
}

interface HeaderAction {
  label: string
  href: string
  icon: typeof Heart
  count?: number
}

const ACTIONS: HeaderAction[] = [
  { label: "Wishlist", href: "/wishlist", icon: Heart, count: 3 },
  { label: "Cart", href: "/cart", icon: ShoppingCart, count: 0 },
  { label: "Account", href: "/account", icon: User },
]

export function HeaderNav({ navLinks }: { navLinks: NavLink[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-1">
      <div className="hidden items-center gap-2 sm:flex">
        {ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              aria-label={
                action.count
                  ? `${action.label}, ${action.count} items`
                  : action.label
              }
              className="group relative flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 transition-colors duration-200 hover:bg-bg-section"
            >
              <span className="relative">
                <Icon className="size-5 text-text-secondary transition-colors duration-200 group-hover:text-text-primary" />
                {action.count !== undefined && action.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-brand-primary text-caption font-semibold tracking-normal text-white">
                    {action.count}
                  </span>
                )}
              </span>
              <span className="text-caption leading-none text-text-secondary transition-colors duration-200 group-hover:text-text-primary">
                {action.label}
              </span>
            </Link>
          )
        })}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="lg:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
        <SheetContent side="right" className="w-full sm:max-w-xs">
          <SheetHeader>
            <SheetTitle className="text-h4">Menu</SheetTitle>
          </SheetHeader>
          <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-body text-text-primary transition-colors duration-200 hover:bg-bg-section"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex items-center gap-1 border-t border-border px-4 py-4">
            <Button variant="ghost" size="icon" aria-label="Search">
              <Search className="size-5" />
            </Button>
            {ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Button key={action.href} variant="ghost" size="icon" asChild>
                  <Link href={action.href} aria-label={action.label}>
                    <Icon className="size-5" />
                  </Link>
                </Button>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
