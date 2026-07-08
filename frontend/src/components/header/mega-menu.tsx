"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu } from "lucide-react";
import { Container } from "@/components/layout/container";
import type { NavCategoryTreeNode } from "@/lib/types/category";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  // navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const CLOSE_DELAY_MS = 150;

export function MegaMenu({
  categories,
}: {
  categories: NavCategoryTreeNode[];
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navCategories = categories.filter((category) => !category.isClearance);
  const clearance = categories.find((category) => category.isClearance);

  function cancelClose() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimeoutRef.current = setTimeout(
      () => setPanelOpen(false),
      CLOSE_DELAY_MS,
    );
  }

  return (
    <div
      className="relative border-t border-border"
      onKeyDown={(event) => {
        if (event.key === "Escape") setPanelOpen(false);
      }}
    >
      <Container className="flex items-center gap-6 py-3">
        <div
          className="relative shrink-0"
          onMouseEnter={() => {
            cancelClose();
            setPanelOpen(true);
          }}
          onMouseLeave={scheduleClose}
        >
          <button
            type="button"
            aria-expanded={panelOpen}
            aria-haspopup="true"
            onFocus={() => setPanelOpen(true)}
            className="text-small-semibold flex items-center gap-2 rounded-md bg-text-primary px-3 py-2 text-white transition-colors hover:bg-text-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <Menu size={16} aria-hidden="true" />
            All Categories
            <ChevronDown size={16} aria-hidden="true" />
          </button>

          {panelOpen && categories.length > 0 && (
            <div
              role="menu"
              className="shadow-e2 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 absolute left-0 top-full z-50 mt-1 min-w-56 rounded-md border border-border bg-surface p-2 duration-200"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  onClick={() => setPanelOpen(false)}
                  className="text-small block rounded-md px-3 py-2 text-text-primary transition-colors hover:bg-bg-section hover:text-text-primary"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-6">
          <NavigationMenu className="relative z-50 max-w-none justify-start" viewport={false}>
            <NavigationMenuList className="gap-1">
              {navCategories.map((category) => (
                <NavigationMenuItem key={category.id}>
                  {category.children && category.children.length > 0 ? (
                    <>
                      <NavigationMenuTrigger className="text-small-semibold bg-transparent text-text-primary hover:bg-bg-section hover:text-text-primary focus:bg-bg-section focus:text-text-primary data-[state=open]:bg-bg-section data-[state=open]:text-text-primary data-[state=open]:hover:bg-bg-section data-[state=open]:focus:bg-bg-section">
                        {category.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="border border-border bg-surface shadow-e2 duration-200 data-[motion=from-end]:slide-in-from-right-8 data-[motion=from-start]:slide-in-from-left-8 data-[motion=to-end]:slide-out-to-right-8 data-[motion=to-start]:slide-out-to-left-8">
                        <div className="grid w-[350px] gap-4 bg-surface p-4 md:w-[500px] md:grid-cols-[200px_1fr] lg:w-[600px]">
                          <NavigationMenuLink
                            asChild
                            className="group h-full w-full flex-col justify-end rounded-lg border border-border bg-bg-primary p-5 no-underline outline-none transition-all hover:border-brand-primary/40 hover:bg-bg-primary hover:shadow-sm focus:bg-bg-primary"
                          >
                            <Link href={`/categories/${category.slug}`}>
                              {category.imageUrl && (
                                <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full border border-border shadow-sm transition-transform duration-500 group-hover:scale-105">
                                  <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
                                </div>
                              )}
                              <div className="mb-2 mt-auto text-h5 font-semibold text-text-primary transition-colors group-hover:text-brand-primary">
                                All {category.name}
                              </div>
                              <p className="text-small text-text-secondary">
                                Explore the complete collection of {category.name}.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
                            {category.children.map((child) => (
                              <li key={child.id}>
                                <NavigationMenuLink
                                  asChild
                                  className="rounded-md px-3 py-2.5 leading-none no-underline outline-none transition-colors hover:bg-bg-section hover:text-text-primary focus:bg-bg-section focus:text-text-primary"
                                >
                                  <Link href={`/categories/${child.slug}`}>
                                    <div className="text-small font-medium text-text-primary">{child.name}</div>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <Link href={`/categories/${category.slug}`} legacyBehavior passHref>
                      <NavigationMenuLink className="text-small-semibold inline-flex items-center justify-center rounded-md bg-transparent px-3 py-2 text-text-primary transition-colors hover:bg-bg-section hover:text-text-primary">
                        {category.name}
                      </NavigationMenuLink>
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {clearance && (
            <Link
              href={`/categories/${clearance.slug}`}
              className="text-small-semibold ml-auto shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-danger transition-colors hover:bg-danger/10"
            >
              {clearance.name}
            </Link>
          )}
        </div>
      </Container>
    </div>
  );
}
