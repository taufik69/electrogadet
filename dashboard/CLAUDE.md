# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See the root `../CLAUDE.md` for how this app fits into the overall Nordvolt project.

## Commands

Run from this directory (`dashboard/`):

```
npm run dev        # start Vite dev server
npm run build       # tsc -b && vite build
npm run preview     # preview the production build
npm run lint        # oxlint (not eslint)
```

There is no test runner configured yet.

## Stack and version notes

- Vite + React 19 + TypeScript 6, no router installed yet (add one, e.g. `react-router`, when multi-page navigation is needed)
- Tailwind CSS v4 — **CSS-first config**, no `tailwind.config.js`. Design tokens (HSL CSS variables used by shadcn/ui: `--background`, `--primary`, etc.) are defined on `:root`/`.dark` in `src/index.css` and mapped into Tailwind via an `@theme inline` block in the same file. Add new tokens there.
- **shadcn/ui** for components — config in `components.json`. Add new components with `npx shadcn@latest add <component>`; they land in `src/components/ui/` and pull colors from the CSS variables above. Don't hand-roll a component that shadcn already provides.
- **TanStack Query** for all server state — `QueryClientProvider` is set up in `src/main.tsx`. Use `useQuery`/`useMutation` for any data fetched from the backend; don't reach for `useEffect` + manual `fetch` + `useState` for server data.
- Linter is **oxlint**, not ESLint — don't add an `eslint.config.js` expecting it to be picked up.
- Path alias `@/*` → `src/*` (configured in both `tsconfig.app.json`/`tsconfig.json` and `vite.config.ts`).

## Structure

- `src/main.tsx` — entry point, wraps `<App />` in `QueryClientProvider`.
- `src/components/ui/` — shadcn/ui primitives (generated, don't hand-edit beyond minor tweaks — regenerate via the CLI instead if a component needs a base update).
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge), used by shadcn components for conditional classNames.

## Talking to the backend

This app has no direct database access — all data comes from the `backend` Express API (see `../backend/CLAUDE.md`). Fetch it through TanStack Query hooks; keep the actual `fetch`/API-base-URL logic in a dedicated `src/lib/api.ts` (create it if it doesn't exist yet) rather than inlining URLs in components.
