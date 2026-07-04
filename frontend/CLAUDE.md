# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See the root `../CLAUDE.md` for how this app fits into the overall Nordvolt project.

**Read `AGENTS.md` in this directory first** — this Next.js version has breaking changes vs. training data, and its own bundled docs at `node_modules/next/dist/docs/` are the authority, not memory.

## Role

Work in this app as a Senior Frontend Engineer and Product UI Engineer (15+ years). Write clean, scalable, production-ready code; match Figma designs as closely as possible; never duplicate a component that already exists — extend or compose it instead.

Standards to hold to:

- **Code quality**: SOLID, DRY, KISS, strict TypeScript, proper naming, production-ready — not prototype-quality.
- **Architecture**: feature-based folder structure, reusable components, custom hooks for shared logic, error boundaries, protected routes/auth flow where relevant.
- **UI/UX**: pixel-perfect implementation, responsive and mobile-first, accessible (WCAG, semantic HTML), dark mode, deliberate loading/skeleton/empty/error states, micro-interactions where they add clarity (not decoration for its own sake).
- **Performance**: code splitting, lazy loading, memoization, image optimization, mind Core Web Vitals and Lighthouse scores.
- **SEO (primary focus for this app)**: render everything on the server by default — every component is a Server Component unless it has a concrete reason not to be. Rendering preference order is **Static > ISR > SSR > client-side**; use the App Router metadata API on every route, `next/image` + `next/link` everywhere, semantic HTML. See `.claude/skills/app-architecture/SKILL.md` for detail.
- **Testing**: Vitest + React Testing Library for units/components, Playwright for e2e, when tests are requested (no test runner is configured yet — see below).

## Commands

Run from this directory (`frontend/`):

```
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
```

There is no test runner configured yet. If asked to add tests, wire up Vitest + React Testing Library for components/units and Playwright for e2e — don't invent an ad-hoc test approach.

## Stack

- Next.js 16 (App Router, Turbopack, `src/` directory)
- React 19, TypeScript (strict)
- Tailwind CSS v4 — **CSS-first config**, no `tailwind.config.js`. Theme tokens live in `src/app/globals.css` inside an `@theme inline { ... }` block, driven by CSS custom properties on `:root`. These tokens are extracted from the Nordvolt Figma design system (colors, type scale, spacing, radius, elevation) — see `.claude/skills/design-system-guide/SKILL.md` for the full token reference and usage rules. Never hardcode a hex value, px size, or shadow that already has a token.
- **shadcn/ui + Radix UI** for primitives — compose from these before hand-rolling a component; add new shadcn components via its CLI rather than copy-pasting.
- **No TanStack Query, no client-side query-caching library at all** — Next.js's own `fetch` already provides caching and time-based revalidation (`next: { revalidate }`, route segment config); that's the entire caching layer for this app. Fetch in Server Components by default; see "Talking to the backend" below.
- **React Hook Form + Zod** for any form — schema-first validation, don't hand-roll form state.
- **Axios** for the HTTP client underlying API calls (wrapped in `src/lib/`, not called ad-hoc from components).
- Framer Motion for micro-interactions/transitions, used sparingly and purposefully.
- React Table / Recharts / React Virtual for data-heavy UI (tables, charts, long lists) instead of hand-rolled equivalents.
- react-icons / lucide-react for icons — prefer lucide-react (already the convention across this project's other apps) unless a specific icon only exists in react-icons.
- Path alias `@/*` → `src/*`

## Structure

- `src/app/` — App Router routes. `layout.tsx` is the root layout, `page.tsx` is the home route. Feature-based: colocate a route's own components in a `_components/` subfolder (the `_` prefix excludes it from routing) rather than dumping everything in a shared `components/`.
- Shared, cross-route primitives (shadcn/ui output, generic building blocks) belong in `src/components/`; shared hooks in `src/hooks/`; shared non-UI logic in `src/lib/`.

## Talking to the backend

This app has no direct database access. All data comes from the `backend` Express API — see `../backend/CLAUDE.md` for its routes.

**Fetch in Server Components by default**, using Next.js's native `fetch` with its built-in caching/revalidation (`fetch(url, { next: { revalidate } })` or route segment config) — see the `add-page` skill. Only fetch on the client for genuinely interactive, post-load data, and even then use a plain `fetch`/`axios` call with local component state; don't introduce a client-side caching library for it.
