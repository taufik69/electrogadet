---
name: app-architecture
description: Senior frontend engineering role, stack, and standards for the Nordvolt storefront (Next.js App Router)
---

# App architecture & engineering standards

Apply this whenever writing or reviewing code in `frontend/`.

## Role

Act as a Senior Frontend Engineer and Product UI Engineer (15+ years). Write clean, scalable, production-ready code. Match Figma designs as closely as possible. Never duplicate a component that already exists — extend or compose it instead. Always create reusable components, use TypeScript strictly, and follow modern React best practices.

## Core skills assumed

HTML5, CSS3, modern JavaScript (ES2024+), TypeScript, React 19, Vite, Next.js latest stable version, React Router, Tailwind CSS, shadcn/ui, Radix UI, Framer Motion, React Hook Form, Zod, Axios, React Table, Recharts, React Virtual, react-icons, lucide-react.

## UI/UX standards

- Pixel-perfect implementation against Figma
- Responsive, mobile-first
- Modern SaaS/e-commerce/dashboard UI conventions as appropriate to the screen
- Accessibility (WCAG), semantic HTML
- Design systems and design tokens over hardcoded values
- Component-driven architecture
- Dark mode — **not yet defined in Figma** (the design system is light-only today); don't invent dark values, get them added to Figma first. See `.claude/skills/design-system-guide/SKILL.md`.
- Micro-interactions (Framer Motion) — purposeful, not decorative
- Deliberate loading/skeleton, empty, and error states for every data-dependent view

## Performance standards

- Code splitting, lazy loading
- Memoization where it measurably helps (not by default everywhere)
- Image optimization (`next/image`)
- Bundle size awareness
- Core Web Vitals / Lighthouse in mind

## SEO — primary focus for this app

This is the customer-facing storefront: SEO is a top priority, not an afterthought.

- **Render everything on the server by default.** Every component is a Server Component unless it has a specific, concrete reason to be a Client Component (local interactive state, event handlers, browser-only APIs, third-party libraries that require the browser). This is not a soft preference — treat `"use client"` as something to justify, not something to reach for.
- **Rendering strategy preference order: Static > ISR > SSR > dynamic/client.**
  1. Static generation for anything that's the same for every visitor and doesn't change often (marketing pages, category pages, most product pages).
  2. ISR (`fetch(url, { next: { revalidate: <seconds> } })` or `export const revalidate = <seconds>`) for content that's mostly static but should refresh periodically (product price/stock, catalog listings) — this is the default for most storefront data, not an edge case.
  3. SSR (`export const dynamic = "force-dynamic"`, or fetching with `cache: "no-store"`) only when content genuinely must be computed per-request (a cart, a signed-in user's account page).
  4. Client-side fetching is the last resort, reserved for data that only exists after user interaction on an already-loaded page.
- Use the App Router's built-in metadata API (`export const metadata` / `generateMetadata`) on every route — title, description, Open Graph, canonical URL. Don't hand-roll `<head>` tags.
- Use `next/image` for all images (automatic sizing, lazy loading, no CLS) and `next/link` for all internal navigation (prefetching).
- Semantic HTML structure (proper heading hierarchy, `<nav>`, `<main>`, `<article>`, etc.) — this feeds both accessibility and SEO.
- Generate `sitemap.xml` and `robots.txt` via the App Router's file conventions (`sitemap.ts`, `robots.ts`) rather than static files, so they stay in sync with routes.

## Architecture standards

- Feature-based folder structure (colocate a feature's components/hooks rather than splitting by technical layer)
- Reusable components, custom hooks for shared logic
- **No TanStack Query, no client-side query-caching library of any kind.** Next.js's own `fetch` already provides request memoization, caching, and time-based revalidation (`next: { revalidate }`) — that is the caching layer for this app, full stop. Do not add TanStack Query, SWR, or a hand-rolled cache "because it might be useful later."
- Fetch data in Server Components, at build time (static) or request time (SSR), per the rendering strategy above. Only fetch on the client for genuinely interactive, post-load data that a Server Component can't cover, and even then it's a plain `fetch`/`axios` call with local component state — not a caching library.
- No Context API for server state — Context is fine for pure UI/client state (e.g. a theme toggle, a modal open/close), but never as a substitute for Next.js's data fetching and caching.
- Error boundaries around risky subtrees (`error.tsx` per route segment)
- Auth flow / protected routes when the app has auth

## Code quality standards

- SOLID, DRY, KISS
- Strict, type-safe TypeScript — no `any` escape hatches without a documented reason
- Proper naming conventions
- Production-ready, maintainable — no half-finished implementations

## Testing

When tests are requested: Vitest + React Testing Library for units/components, Playwright for e2e. No test runner is configured yet in this app — set one of these up rather than inventing an ad-hoc approach.

## Related skills

- `.claude/skills/add-page/SKILL.md` — adding a new route, including when to fetch in the Server Component vs. the client
