# Homepage Redesign — Frontend Spec

Status: **APPROVED — implementing this session** (user asked for spec-then-build, single pass, no cross-app review gate — this is a presentational frontend-only change)
App: `frontend/` (Next.js 16 App Router + Tailwind v4 + shadcn/ui)
Design reference: https://store77.net/ — used **only** as inspiration for IA/layout rhythm/component organization, explicitly not for visual style. See "Design direction" below for how this diverges.

## 0. Context & constraints

- Backend (`backend/src/modules/product`) currently exposes only `Product { id, name, slug, priceCents, createdAt, updatedAt }` via `GET /api/products` (cursor-paginated) — **no images, categories, ratings, stock, brand, or discount fields exist in the Prisma schema yet.**
- `GET /api/announcements/active` exists and is already wired via `src/components/announcement-bar.tsx`.
- There is no products detail page, cart, or checkout in scope for this task — homepage only.
- Given the schema gap, this spec fetches real data where the API supports it (best-sellers/new-arrivals product names+prices+slugs) and uses clearly-isolated local placeholder data for what the schema can't yet provide (category imagery, ratings, discount badges, testimonials). Placeholder data lives in `src/lib/data/` behind the same TypeScript types real API data will eventually satisfy, so swapping later is a data-layer change only, not a component rewrite.
- Placeholder imagery (product cards, category tiles, hero) is sourced from Unsplash (`images.unsplash.com`, allow-listed in `next.config.ts` under `images.remotePatterns`) rather than hand-drawn local SVGs — gives the storefront real product-photo presentation while the backend has no image field yet. Swapping to real uploaded product photography later is a one-line change in `src/lib/data/product-display.ts` / `src/lib/data/categories.ts`, not a component change.
- No shadcn/ui components are initialized yet in this app (deps are installed, `components.json` is not) — this task initializes it.

## 1. Design direction (diverges intentionally from store77.net)

Reference site pattern extracted for **structure only**: sticky header → hero → category grid → best-sellers rail → promo banner → new-arrivals grid → testimonials → newsletter → footer. Everything about the *visual* execution is replaced per project instructions:

- **Color**: only tokens already in `globals.css` — `brand-primary` (#2563EB) as the single accent, `surface`/`bg-primary`/`bg-section` neutrals, `text-primary`/`text-secondary` for type. No gradients, no multi-accent sections. `accent` (cyan) reserved for a single sparing use (e.g. a "New" badge) — not a second brand color.
- **Type**: Inter via existing `text-display/h1/h2/h3/h4/body*/small*/caption/overline` classes — no arbitrary sizes.
- **Spacing**: 8pt scale tokens (`spacing-*` → `gap-*`, `py-*`, `px-*`) exclusively. Section vertical rhythm: `py-16` (mobile) / `py-20` (desktop) between major sections, `gap-6`/`gap-8` inside grids.
- **Radius/elevation**: `rounded-md` (12px) default for cards/buttons, `rounded-lg` (16px) for large panels (hero, promo banner), `shadow-e1` resting → `shadow-e2` on hover, transitions 200–250ms ease-out.
- **Density**: significantly lower than a typical template — fewer simultaneous CTAs, larger whitespace margins, max content width 1280px (per layout-grid token), generous section padding. Feel: Apple/Stripe/Linear, not a bargain electronics store.

## 2. Information architecture (route: `/`)

**Revision 2 (this pass)**: user supplied a closer full-bleed screenshot of store77.net's actual homepage hero and asked to match it more precisely — still structure/layout only, not the literal Russian copy, icons, or colors. Three refinements over Revision 1:

1. **Edge-to-edge hero row**: the sidebar + promo carousel sit flush against each other and against the page's content edges — no gap card-to-card, no rounded outer container around the pair, no vertical padding above the row (it starts right under the header/announcement bar). Individual promo cards still have a small gap between them (reference shows ~0, but a hairline `gap-px`/`gap-1` reads better against pure white than true 0 — keep it minimal, not decorative).
2. **Taller, narrower sidebar**: sidebar height matches the promo carousel's height exactly (they're one visual block, not sidebar-shorter-than-carousel like Revision 1). Category rows get a colored icon chip (small rounded-square, `bg-brand-subtle`/`text-brand-primary`) on the left rather than a bare icon — reference uses varied per-category colors, we use one consistent brand-tinted chip per §1's single-accent rule.
3. **Lighter promo card treatment**: reference cards use soft pastel/photo backgrounds (light blue, tan/cream, navy, dark charcoal) with text sitting directly on the image — no heavy dark gradient scrim across the whole card, just enough contrast behind the text block (a short bottom-anchored gradient, shorter/lighter than Revision 1's). Cards are taller/more landscape (reference ~ 5:6 to 3:4) with the product photo occupying most of the frame, headline + subcopy stacked at the bottom-left, no eyebrow chip background — plain uppercase caption text.

Still governed by §1's visual-divergence rules (our tokens/colors/type only, single brand-blue accent) — this revision only tightens the layout geometry and card treatment to match the reference more closely.

Single Server Component page (`src/app/page.tsx`) composing section components from `src/app/_components/`:

1. **Header** (shared chrome, `src/components/header.tsx`) — sticky, above page content, below `AnnouncementBar`.
2. **Hero row** — full-bleed two-region layout directly below the header (no section padding above it), matching the reference's sidebar + promo-carousel pairing:
   - **Category sidebar** (`category-sidebar.tsx`) — left column, `hidden lg:flex`, dark surface (`bg-text-primary`, our darkest neutral token — not a new color), vertical list of category rows (brand-tinted icon chip + label), fixed width (~280px), height matches the carousel exactly via `stretch` alignment. Collapses away below `lg`; mobile users reach categories via the header's mobile sheet menu instead (no separate mobile treatment needed — avoids a second nav pattern).
   - **Promo carousel** (`promo-carousel.tsx`, CLIENT — needs scroll-position state + arrow controls) — right column, flex-1, shows 2–4 promo cards at once (responsive: 1 on mobile, 2 on tablet, up to 4 on desktop) in a horizontally scrollable/paged track with prev/next arrow buttons, matching the reference's card carousel. Each card: photo-filled background (pastel/muted tones, not our brand blue — product photography sets the color, per reference), short bottom gradient, eyebrow caption + headline + one-line subcopy anchored bottom-left — no per-card CTA button (the whole card is a `next/link`). This *is* the hero — no separate headline/CTA hero block above or beside it.
3. **Best sellers** — product rail with **arrow-navigated horizontal scroll** (`product-rail.tsx` gains prev/next buttons over a `overflow-x-auto` track, snap-scrolling), sourced from real `GET /api/products` (first page, treated as "best sellers" ordering placeholder until the backend adds a real ranking field — noted as a follow-up, not invented silently).
4. **New arrivals** — same arrow-navigated rail pattern, sourced from the same product fetch sorted by `createdAt desc` (this ordering *is* real and accurate to the schema).
5. **Testimonials** — 3-card static grid, placeholder copy (no reviews table in schema), clearly simple/quiet styling (avatar initial, name, quote, star rating) — de-emphasized relative to product sections.
6. **Newsletter** — centered single-column signup panel, email input + submit, client-side only (no backend endpoint exists — see open question).
7. **Footer** (shared chrome, `src/components/footer.tsx`) — link columns (Shop, Company, Support), payment/social row, copyright.

The standalone "Featured categories" icon-grid section from v1 is removed — its job is now done by the category sidebar in the hero row, avoiding showing the same category list twice on one page.

## 3. Component inventory & placement

Per `add-page`/`app-architecture` conventions: cross-route chrome → `src/components/`, homepage-only sections → `src/app/_components/`.

```
src/
  app/
    page.tsx                          # composes sections, Server Component, fetches products
    layout.tsx                        # add metadata, mount Header/Footer
    _components/
      hero-row.tsx                    # server, lays out sidebar + carousel side by side
      category-sidebar.tsx            # server, maps local category data into the dark vertical rail
      promo-carousel.tsx              # CLIENT — arrow controls + active slide state
      product-rail.tsx                # CLIENT — generic "section with heading + arrow-navigated product scroller", takes products as props
      testimonials.tsx                # server, maps local testimonial data
      newsletter-form.tsx             # CLIENT — needs form state/submit handler
  components/
    header.tsx                        # server shell
    header-nav.tsx                    # CLIENT — mobile menu (sheet) open/close state
    footer.tsx                        # server, static
    product-card.tsx                  # server-renderable; wishlist/add-to-cart buttons are the only interactive bits
    product-card-actions.tsx          # CLIENT — wishlist toggle + add-to-cart button (isolated so ProductCard stays server-rendered)
    ui/                                # shadcn/ui output (button, badge, card, input, sheet, navigation-menu, skeleton, separator)
  lib/
    data/
      categories.ts                   # typed placeholder category data (icon + label, used by category-sidebar)
      promos.ts                       # typed placeholder promo-carousel slide data
      testimonials.ts                 # typed placeholder testimonial data
    types/
      product.ts                      # Product type (matches backend) + ProductCardData (extends with optional display-only fields: imageUrl, rating, discountPercent, badge — all optional/placeholder until backend supports them)
    products.ts                       # fetchProducts() — server-side fetch wrapper, ISR revalidate
    format.ts                         # formatPriceCents() helper (cents → "$1,299.00")
```

`product-rail.tsx` moved from server to CLIENT in this revision because arrow-navigation requires scroll-position state — it still receives already-fetched `products` as a plain prop from the server-rendered `page.tsx`, so no data-fetching moves to the client, only the scroll interaction.

## 4. Data contracts

```ts
// src/lib/types/product.ts
interface Product {
  id: string
  name: string
  slug: string
  priceCents: number
  createdAt: string
  updatedAt: string
}

// Display-only extension — fields the schema doesn't have yet.
// Populated from local placeholder data keyed by product id/slug fallback (a deterministic
// hash-based picker, not random per-render) until the backend adds real columns.
interface ProductCardData extends Product {
  imageUrl: string
  rating?: number          // 0-5, optional
  reviewCount?: number
  discountPercent?: number // optional badge
  badge?: "new" | "bestseller" | null
}
```

`fetchProducts()` in `src/lib/products.ts`:
```ts
async function fetchProducts(limit = 12): Promise<Product[]> {
  const res = await fetch(`${API_URL}/api/products?limit=${limit}`, { next: { revalidate: 120 } })
  if (!res.ok) return []
  const body = await res.json()
  return body.data ?? []
}
```
Called once in `page.tsx`; best-sellers = first N, new-arrivals = same set re-sorted by `createdAt`. If the API returns an empty list (e.g. backend not running, or DB empty), sections render an empty state (see §7), not mock products silently standing in for real ones.

## 5. Header spec

- Sticky (`sticky top-0 z-40`), `bg-surface`, `border-b border-border`, backdrop-blur on scroll (subtle, not required for v1 — nice-to-have if trivial with Tailwind's `backdrop-blur` + `bg-surface/90`).
- Desktop: logo (left) · primary nav links (center: Shop, Categories, About) · search icon, wishlist icon, cart icon (right).
- Mobile: logo · hamburger → `Sheet` (shadcn) slide-over with nav links + search.
- Height: `h-16` (64px, matches `spacing-16` token).
- No account/login flow in scope — icon omitted rather than half-built.

## 6. Product card spec

- Image (next/image, 1:1 aspect, `bg-bg-section` fill behind an Unsplash product photo, `object-contain` with whitespace padding per "lots of whitespace around images" instruction).
- Wishlist icon button — top-right overlay on image, appears on hover (desktop) / always visible (mobile), `ProductCardActions` client island, local state only (no persistence backend — noted as follow-up).
- Discount/new badge — top-left overlay, only rendered if `discountPercent` or `badge` present.
- Title — `text-small-semibold`, 1-line clamp.
- Rating — small star row + review count, only rendered if `rating` present (many won't have it since it's placeholder-only).
- Price — `text-h4`, with a struck-through original price beside it if `discountPercent` present.
- Add-to-cart — icon button, bottom-right of card or full-width on mobile; click is a **stub handler** (no cart backend exists) that shows a toast-free disabled/no-op state for this task — do not fabricate a working cart.
- Hover: `shadow-e1 → shadow-e2`, image slight `scale-[1.02]`, 200ms ease-out. No layout shift.

## 7. States

- **Empty product list** (API down/empty): best-sellers/new-arrivals sections render a quiet "Check back soon" message instead of the grid — not hidden entirely, so the section heading/IA stays intact for SEO and layout stability.
- **Loading**: none needed — page is a Server Component, data resolves before render (no client waterfall/spinner for this content).
- **Newsletter submit**: client-side only success/error message state (no backend endpoint — see open question #2).

## 8. SEO / metadata

- `src/app/layout.tsx` gets real `metadata` (title template, description, OG basics) replacing the current "Create Next App" default.
- `page.tsx` semantic structure: one `<h1>` in the hero, `<section>` per IA block with `aria-label` or a visually-present `<h2>`, `<main>` wrapping page content (header/footer outside `<main>`).
- All images via `next/image` with descriptive `alt`; all internal links via `next/link`.

## 9. Out of scope (explicit)

- `/products`, `/products/[slug]`, `/cart`, `/checkout`, auth — not built this task; links that would point there are either omitted or left as visually-present but non-destination placeholders where the IA requires them (e.g. "Shop all" → can point to `/products` even though that route doesn't exist yet, matching normal incremental frontend build order).
- Real category/brand/rating/review/discount data — backend schema follow-up, tracked via this spec's placeholder-data isolation, not silently invented as if real.
- Cart/wishlist persistence — client-local UI state only.
- Dark mode — design system is light-only per `design-system-guide`.

## 10. Verification

- `npm run build` and `npm run lint` clean.
- Manual: run `backend` + `frontend` together; confirm best-sellers/new-arrivals reflect real DB products; confirm empty-state renders correctly with `backend` stopped; check responsive behavior at 390/834/1440 (grid tokens); keyboard nav through header/cards; Lighthouse pass on LCP (hero image priority-loaded) and CLS (no layout shift from images/fonts).

## Open questions (noted, not blocking — reasonable defaults taken above)

1. Newsletter has no backend endpoint — implemented as local-only client state (success message, no persistence). Flag for backend follow-up if real capture is wanted.
2. "Best sellers" ordering is really just "first page of products" today — no ranking field exists. Follow-up: add a `salesRank` or similar to `Product` if true best-seller sorting is wanted.
3. Category/rating/discount/badge data is placeholder — follow-up: extend Prisma schema (`Category` model, `Product.imageUrl`, `Product.rating`, etc.) when ready to make this real.
