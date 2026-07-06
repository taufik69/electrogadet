# Mega Navigation — Frontend Spec

Status: **DRAFT — pending review**
Design source: user-provided screenshot (mega nav demo mockup), no Figma node available this session — see caveat below.
App: `frontend/` (Next.js 16 App Router + Tailwind v4 + shadcn/ui)

Related specs: `backend/.claude/spec/mega-nav/mega-nav.spec.md` (this component depends on that API being implemented first), `dashboard/.claude/spec/mega-nav/mega-nav.spec.md`.

> Design caveat: the screenshot shows a rough Figma mockup ("Mega Navigation" annotation, edit-mode chrome visible), not a final visual spec — treat spacing/exact colors as approximate and map onto existing `design-system-guide` tokens rather than copying pixel values. Re-pull from Figma once a node-id is available.

## Shared data shape (consumed from backend)

```ts
interface NavCategory {
  id: string
  name: string
  slug: string
  parentId: string | null
  sortOrder: number
  isClearance: boolean
  showInMegaMenu: boolean
  createdAt: string
  updatedAt: string
}
```

`GET /api/categories/tree` returns top-level `NavCategory[]`, each with a nested `children: NavCategory[]`.

## 1. Current state → what changes

`src/components/header/header.tsx` currently renders a static `HEADER_NAV_LINKS` array (`Deals`, `Support`, `For business`) via `header-nav-links.ts`. The screenshot shows a materially different nav: a leading **"All products"** dropdown trigger, then top-level category links (`Laptops`, `Smartphones`, `Audio`, `Cameras`, `Wearables`, `Smart home`, `Gaming`, `Accessories`), then a right-aligned **Clearance** link in red/danger. Hovering/focusing a category link opens a 4-column **mega panel** below the whole header bar (full-width, not just under the trigger) showing that category's siblings-as-columns — per the screenshot the panel shows all 4 groups simultaneously (Computing / Mobile & Wearables / Audio & Imaging / Home & Gaming), not just the one hovered, so treat it as: **one shared mega panel, driven by whichever top-level item currently has hover/focus, always rendering all top-level categories as columns**.

This replaces the static nav in `header.tsx`; `header-nav-links.ts`'s static array goes away in favor of data fetched from the backend.

## 2. Data fetching

`Header` becomes an `async` **Server Component** (already is one — no `"use client"` today) that fetches the nav tree server-side:

```ts
const res = await fetch(`${API_URL}/api/categories/tree`, { next: { revalidate: 3600 } })
```

- Long revalidation window (1hr) since nav structure changes rarely (mirrors backend spec's `CACHE_TTL.LONG` reasoning) — admins won't see instant updates in the storefront, acceptable per the announcement-bar precedent.
- If the fetch fails or returns `[]`, render the header **without** a mega menu (no trigger, no panel) rather than erroring — nav must never break page render.
- `API_URL` reads the same `process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"` pattern already used in `search-bar.tsx`.

## 3. Components

New files under `src/components/header/` (extends the existing header module, doesn't duplicate it):

- `mega-menu.tsx` — **Client Component** (`"use client"`), receives `categories: NavCategory[]` as a server-fetched prop. Owns the open/closed state and which top-level item is "active" (hover or focus), keyed by category `id`. Renders:
  - The row of top-level triggers (replacing the static `HEADER_NAV_LINKS.map(...)` block in `header.tsx`)
  - The full-width panel (`absolute inset-x-0 top-full`, positioned relative to the `<header>`, matching `search-bar.tsx`'s existing overlay pattern) — visible when any trigger is hovered/focused, or when the panel itself has focus/hover (so users can move the mouse from trigger down into the panel without it closing — needs a small close-delay, not instant `onMouseLeave`)
  - Four `<div>` columns from `categories.filter(c => c.showInMegaMenu)`, each showing `category.name` as an `text-overline` heading, then `category.children` as links, then a "See all →" link to `/categories/${category.slug}`
- `mega-menu-trigger.tsx` (optional, or inline in `mega-menu.tsx` — decide during implementation based on size): individual top-level link/button, `aria-expanded`, `aria-haspopup="true"`
- `header-nav-links.ts` — **delete** (data now comes from the API, not a static const). Confirm nothing else imports it before removing (currently only `header.tsx` and `mobile-nav.tsx` do, per existing code).
- `mobile-nav.tsx` — needs updating to accept `NavCategory[]` instead of the old static `HeaderNavLink[]`, and to render an accordion/disclosure (top-level category → expand to show its children inline) rather than a flat link list, since the mega-menu's 2-level structure doesn't collapse to a flat list on mobile. Use a simple `<details>`/`<summary>` pair or a small local `useState` per top-level item — no need for a new dependency.
- **"All products"** dropdown (leftmost item in the screenshot) — separate from the mega menu; simplest read is it's the same category tree in a simple dropdown list (not columned), or it could just link to a `/products` catalog page. Flag as an open question below rather than guessing its exact behavior.
- **Clearance** link — a plain `next/link` styled with `text-danger` (existing design-system token), pointing to whichever category has `isClearance: true` (or a hardcoded `/clearance` route if no such category exists yet — reconcile with backend spec's open question #2).

## 4. Interaction behavior

- **Desktop (md+)**: hover opens the panel with a short delay-on-close (~150ms) so moving the cursor from trigger to panel doesn't flicker-close it. Keyboard: `Tab` into a trigger opens the panel (via `:focus-within` or explicit state), `Escape` closes it and returns focus to the trigger, `Tab`/`Shift+Tab` moves through panel links normally.
- **Mobile (< md)**: no hover/mega-panel — folds into `MobileNav`'s existing slide-down disclosure, updated per above to show the 2-level accordion.
- Panel closes on: `Escape`, click-outside (mirror `search-bar.tsx`'s `onClick` on a full-screen absolute overlay `<div>`), route navigation.
- No transition library needed for open/close — simple CSS opacity/translate transition is enough; don't reach for Framer Motion here (`app-architecture` says "used sparingly, only when it adds clarity" — a menu open/close isn't a case that needs spring physics).

## 5. Styling

All values from existing `design-system-guide` tokens — no new hardcoded values:
- Panel: `bg-surface`, `shadow-e3` (overlay elevation), `border-t border-border`, `rounded-b-lg` at most (screenshot shows square corners meeting the header, acceptable to skip rounding on this specific edge)
- Column heading: `text-overline text-text-secondary uppercase` (matches "COMPUTING" style in screenshot — caps, small, muted)
- Column links: `text-small text-text-primary hover:text-brand-primary`
- "See all →": `text-small-semibold text-brand-primary` with an arrow icon (`ArrowRight` from `lucide-react`, already the icon convention here)
- Column gutter/grid: CSS grid, 4 columns, using the 8pt spacing scale (`gap-8` or `gap-10` — confirm against real Figma spacing once available)
- Clearance link: `text-danger` per the token table

## 6. SEO

Nav links are plain `next/link` (`<a href>` under the hood) so all category URLs remain crawlable — no client-only routing that would hide links from search engines. No metadata API changes needed here (this is chrome, not a route).

## 7. Verification

- `npm run build`, `npm run lint`
- Manual: run `frontend` + `backend` together, seed categories via the dashboard (or direct `curl POST`), confirm:
  - Mega panel renders all 4 columns from real data
  - Hover/focus/keyboard-nav opens and closes correctly, `Escape` works, click-outside works
  - Mobile view collapses to the accordion `MobileNav` correctly
  - Header still renders (no mega menu, no crash) when `/api/categories/tree` returns `[]` or the backend is down

## Open questions (resolve during review)

1. **"All products" dropdown** — what does it actually contain? Full category tree in a simple list? Link to a catalog page with filters? Screenshot shows it as a separate trigger from the mega-menu-triggering category links; behavior isn't specified. Needs either a real Figma node or explicit product decision.
2. Does the mega panel really show **all 4 columns simultaneously regardless of which top-level link is hovered** (as the screenshot suggests), or should hovering `Laptops` show only a `Computing`-relevant panel and hovering `Audio` show a different, single-column-relevant panel? This materially changes the component's state model — current spec assumes "always show all columns," please confirm.
3. Confirm the exact set/order of top-level links vs. mega-menu column headings — screenshot's top nav row (`Laptops, Smartphones, Audio, Cameras, Wearables, Smart home, Gaming, Accessories`) doesn't 1:1 match the mega panel's column headings (`Computing, Mobile & Wearables, Audio & Imaging, Home & Gaming`), i.e. top nav items look like they might be **children-level** items while the panel columns are **parent-level** — needs reconciling against the real design before implementation, since it affects whether the top bar renders top-level or second-level names.
4. Close-delay timing (150ms proposed) — fine as a default, adjust after manual testing feels off.

## Review gate

Per user instruction: **do not implement anything until all three per-app spec files (backend/dashboard/frontend) are reviewed and explicitly approved.** Next command after approval triggers implementation.
