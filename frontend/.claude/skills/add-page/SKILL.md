---
name: add-page
description: Add a new route/page to the Nordvolt storefront (Next.js App Router)
---

# Add a page

Use this when asked to add a new storefront route (e.g. "add a /products page", "add a checkout page").

## Steps

1. Create a folder under `src/app/` matching the URL path, e.g. `src/app/products/` for `/products`, `src/app/products/[slug]/` for a dynamic product page.
2. Add a `page.tsx` inside it exporting a default React component (Server Component by default — only add `"use client"` at the top if the component needs state, effects, or browser APIs).
3. If the route needs its own layout (shared nav/footer variant), add a `layout.tsx` alongside it. Otherwise it inherits `src/app/layout.tsx`.
4. Style with Tailwind utility classes using the design tokens already defined in `src/app/globals.css`'s `@theme inline` block (e.g. `bg-background`, `text-foreground`). Don't hardcode hex colors — if a needed token doesn't exist yet, add it to `globals.css` first, ideally matching the Nordvolt Figma design system.
5. If the page needs data from the API, fetch it in the Server Component (`async function Page()`), calling the backend directly (e.g. `fetch(process.env.NEXT_PUBLIC_API_URL + "/api/products")`). Don't introduce a client-side data-fetching library unless the page needs interactivity after load.
6. Run `npm run build` to confirm the route compiles and check `npm run lint`.

## Notes

- This Next.js version (16) may differ from training data — check `node_modules/next/dist/docs/01-app/` for App Router API specifics if something doesn't behave as expected.
- Keep components colocated: page-specific components can live in a `_components/` subfolder next to the route's `page.tsx` (the `_` prefix excludes it from routing).
