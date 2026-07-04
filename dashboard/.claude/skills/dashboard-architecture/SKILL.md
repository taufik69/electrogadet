---
name: dashboard-architecture
description: Enforces the feature-based modular architecture, code-splitting, and design-consistency rules for the Nordvolt admin dashboard (Vite + React 19 + TypeScript + TanStack Query + shadcn/ui)
---

# Dashboard architecture

Use this whenever adding, moving, or refactoring code in `dashboard/` — new features, new pages, new API calls, new shared components, or any structural change. This is the binding architecture contract for the app; `add-dashboard-view` (scaffolding a single page) and `table-list` (list/table/form generation) both build on top of the rules here.

## Current state vs. target — read this first

The dashboard was scaffolded minimally and has **not yet grown into** the structure below: today there is only `src/App.tsx`, `src/main.tsx`, `src/components/ui/`, `src/lib/utils.ts`, no router, and no `src/features/`. `axios`, `zod`, `react-hook-form`, and a router are **not installed yet**.

Do not treat the absence of `features/`, `routes/`, `services/`, `store/` as "not applicable here" — it means **you migrate toward the target structure as you touch each area**, not that you keep adding flat files to `src/components` or `src/lib`. When a task is the first to need a piece of this structure (first feature, first router, first form), create that piece then, following the rules below — don't wait for a separate "setup" task.

## Folder structure (mandatory)

```
src/
  app/                  # app bootstrap (providers, router setup, global config)
  components/           # shared, feature-agnostic UI components only (shadcn/ui lives in components/ui)
  features/             # business modules (CORE — most work happens here)
    users/
      components/
      hooks/
      api/
      types/
      utils/
      pages/
      index.ts
    products/
    orders/
    analytics/
  hooks/                # global reusable hooks (not tied to one feature)
  services/             # axios instance + base API layer (shared HTTP client, interceptors)
  lib/                  # generic utilities/helpers (e.g. existing cn() in lib/utils.ts)
  routes/               # route definitions (lazy loaded)
  store/                # minimal global state (only for state that is truly cross-feature)
  styles/               # global styles (index.css lives here or at src root, keep as-is)
```

A component, hook, type, or util that only serves one business domain belongs inside that feature's folder, not in the shared `components/`, `hooks/`, or `lib/` directories. Promote something to shared space only once a second feature actually needs it — don't pre-emptively generalize.

## Feature isolation rule

Each folder under `features/` MUST be self-contained:

- **No cross-feature imports.** `features/orders` must never import from `features/products/components/...` or vice versa. If two features need the same thing, the thing belongs in `components/`, `hooks/`, or `lib/` instead.
- API calls for a feature live in `features/<name>/api/` and go through the shared client in `services/` — never inline a raw `fetch`/`axios` call in a component.
- UI belongs in `features/<name>/components/` (or `pages/` for route-level screens); don't leak feature UI into the shared `components/` tree.
- Feature-specific hooks live in `features/<name>/hooks/`; only hooks with no dependency on a specific domain graduate to the top-level `hooks/`.
- Types stay in `features/<name>/types/`; only truly cross-cutting types (e.g. a shared `Paginated<T>` envelope) belong in `lib/` or a root `types/`.
- Each feature exposes its public surface through `index.ts` — import from `@/features/products` from outside the feature, not from its internal file paths.

## Code splitting (mandatory)

All routes must be lazy loaded and defined in `routes/`, not inlined in `App.tsx`:

```tsx
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'))
```

Wrap route outlets in `<Suspense>` with a loading fallback consistent with the design system (see below) — don't ship a bare blank screen while a chunk loads.

## Data fetching

- All server state goes through **TanStack Query** (`useQuery`/`useMutation`). Never use `useEffect` + manual `fetch`/`axios` + `useState` for server data.
- The actual HTTP client (base URL, headers, interceptors, error normalization) lives in `services/` (e.g. `services/apiClient.ts`, built on `axios` once installed). Feature `api/` modules call into this client — they don't construct their own.
- Query keys are namespaced per feature (e.g. `["products", "list"]`, `["products", id]`) so invalidation after a mutation stays scoped and predictable.

## Forms and validation

- Use **React Hook Form** for form state and **Zod** for schema validation, wired together via `@hookform/resolvers/zod`. Define each feature's schema in `features/<name>/types/` or a sibling `schema.ts` next to it, and reuse it for both the form resolver and any API payload shape.
- Don't hand-roll form state with `useState` per field once a form has more than one or two fields.

## Design consistency (MANDATORY)

The Figma file **"Nordvolt · Design System + Screens"** is the single source of truth for color, type scale, spacing, radius, and elevation across the whole Nordvolt project (see root `CLAUDE.md`). The dashboard must visually stay in lockstep with it and with the storefront's token conventions:

- Never hardcode colors, spacing, or radii in a feature component. Use the Tailwind utility classes backed by the CSS variables in `src/index.css` (`bg-card`, `text-muted-foreground`, `border-border`, etc.). If a value you need isn't tokenized yet, add the token to `src/index.css`'s `:root`/`.dark` blocks and the `@theme inline` mapping — don't inline a raw hex/px value as a workaround.
- Build UI from **shadcn/ui** primitives in `src/components/ui/`. If a primitive is missing, add it with `npx shadcn@latest add <component>` rather than hand-rolling a look-alike — this is what keeps every feature visually consistent without manual review.
- When a Figma frame exists for the screen you're building, pull exact values (spacing, type, color token names) from that frame instead of eyeballing them from a screenshot.
- Keep light/dark parity: any new token or component variant must work in both `:root` and `.dark`, since the dashboard shares the theme system with the storefront.
- Loading, empty, and error states per feature should reuse the same shared primitives (skeletons, `Alert`, `EmptyState` if one exists) rather than each feature inventing its own — check `components/` for an existing pattern before adding a new one.

## Verification

After structural changes, run from `dashboard/`:

```
npm run build   # tsc -b && vite build — catches path/import errors from moving files
npm run lint    # oxlint
```
