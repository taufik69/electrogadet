# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Nordvolt is a premium electronics e-commerce platform, built as three independent apps in one repo (no shared workspace tooling — each has its own `node_modules` and lockfile):

- `frontend/` — customer-facing storefront (Next.js 16, App Router, Turbopack)
- `backend/` — REST API (Express 5, Prisma 7, PostgreSQL)
- `dashboard/` — admin panel for managing products/orders (Vite + React 19, shadcn/ui, TanStack Query)

Each app has its own `CLAUDE.md` with stack-specific detail and its own `.claude/skills/` for common workflows in that app. Read the relevant app's `CLAUDE.md` before working in it — the root file only covers what's shared.

The design source of truth is the Figma file **"Nordvolt · Design System + Screens"**, which defines color tokens, type scale, spacing, radius and elevation. When implementing UI, prefer pulling values from there over guessing.

## Bleeding-edge dependency versions — read this first

This repo was scaffolded with very recent major versions of its core frameworks (Next.js 16, Express 5, React 19, Prisma 7, Tailwind v4, TypeScript 6). These have breaking changes vs. what's in most training data. **Do not assume APIs or conventions from older versions still apply.** Concretely:

- **Next.js**: `frontend/CLAUDE.md` references `frontend/AGENTS.md`, which warns that this version has breaking changes and docs are bundled at `frontend/node_modules/next/dist/docs/` — check there before writing App Router code you're not sure about.
- **Tailwind v4**: no `tailwind.config.js` — configuration is CSS-first via `@theme` blocks directly in the stylesheet (see `frontend/src/app/globals.css` and `dashboard/src/index.css`). PostCSS uses the `@tailwindcss/postcss` plugin, not the `tailwindcss` package directly.
- **Prisma 7**: `PrismaClient` no longer connects directly from a `DATABASE_URL` string — it requires an explicit **driver adapter** (`@prisma/adapter-pg` here). See `backend/src/lib/prisma.ts`. The client also generates into `src/generated/prisma` (custom output path), not the old `node_modules/.prisma/client`.
- **Express 5**: async route handlers that reject now forward to error-handling middleware automatically; don't add unnecessary try/catch wrappers copied from Express 4 patterns.

When in doubt about any of these, check the installed package's own docs/types rather than relying on memory.

## Cross-app conventions

- All three apps use **TypeScript** and npm (not yarn/pnpm).
- The backend is the single source of truth for data; both `frontend` and `dashboard` talk to it over HTTP — there is no direct DB access from either frontend app.
- Path alias `@/*` maps to each app's own `src/*` (configured per-app in `tsconfig.json`).

## Working across apps

There is no root-level build/test/lint command — run these from within the relevant app directory. See each app's `CLAUDE.md` for exact commands.
