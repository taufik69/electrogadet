# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See the root `../CLAUDE.md` for how this app fits into the overall Nordvolt project.

## Commands

Run from this directory (`backend/`):

```
npm run dev              # start with hot reload (tsx watch)
npm run build             # compile to dist/
npm run start             # run compiled dist/server.js
npm run lint               # eslint
npm run typecheck          # tsc --noEmit
npm run prisma:generate    # regenerate Prisma client after schema changes
npm run prisma:migrate     # create + apply a migration in dev
npm run prisma:studio      # open Prisma Studio GUI
```

There is no test runner configured yet.

Requires a running PostgreSQL instance matching `DATABASE_URL` in `.env` (defaults to `postgresql://postgres:postgres@localhost:5432/electrogadet`). Run `npx prisma dev` for a local throwaway Postgres, or point `DATABASE_URL` at a real one.

Also requires a running Redis instance matching `REDIS_URL` in `.env` (defaults to `redis://localhost:6379`) — used for cache-through reads with TTL + versioned invalidation (see `ARCHITECTURE.md` §8).

## Stack and version notes

- Express 5, TypeScript 6, ESM (`"type": "module"` — all relative imports need explicit `.js` extensions, even though the source files are `.ts`)
- **Prisma 7**: this is a significant departure from older Prisma. `PrismaClient` requires an explicit **driver adapter** — it no longer connects directly from `DATABASE_URL`. See `src/shared/lib/prisma.ts`, which constructs a `PrismaPg` adapter from `@prisma/adapter-pg` and passes it to `new PrismaClient({ adapter })`. The generated client also lives at `src/generated/prisma` (a custom `output` path set in `prisma/schema.prisma`), not the old default location — always import it from there, and re-run `npm run prisma:generate` after editing the schema.
- Config for Prisma CLI (schema path, migrations path, datasource URL) lives in `prisma.config.ts`, not solely in `.env`.
- **Redis (`ioredis`)** for caching — client singleton in `src/shared/lib/redis.ts`. Import the named export `{ Redis }`, not the default export (not constructable under this project's `NodeNext` resolution). All caching goes through `cached()`/`bumpCacheVersion()` in `src/shared/utils/cache.ts` — see Conventions below.
- Request validation uses `zod` — see `src/modules/product/product.validation.ts` for the pattern (`safeParse`, return 400 with `error.flatten()` on failure).
- Express 5 forwards rejected promises from async handlers to error middleware automatically; no need to wrap route handlers in try/catch just to call `next(err)`.

## Structure

This app follows a strict layered, modular architecture — see `ARCHITECTURE.md` for the full spec and `.claude/skills/backend-architecture/SKILL.md` for the enforced workflow. Summary:

- `src/server.ts` — entry point, starts the HTTP listener.
- `src/app.ts` — builds the Express app (middleware + route mounting + global error handler), separate from `server.ts` so it can be imported in tests without binding a port.
- `src/modules/<name>/` — one folder per resource (e.g. `product`), each with `*.routes.ts` → `*.controller.ts` → `*.service.ts` → `*.repository.ts`, plus `*.validation.ts`, `*.types.ts`, `*.constant.ts`. `product` is currently the only module (expect to add `order`, `user`, etc. as features are built).
- `src/shared/` — cross-module infra: `lib/prisma.ts` (Prisma client singleton), `lib/redis.ts` (Redis client singleton), `helpers/` (`ApiResponse`, `ApiError`), `middlewares/` (`errorHandler`), `utils/` (pagination helpers, `cache.ts` versioned cache-through helper), `types/` (shared zod schemas), `constant/` (`CACHE_TTL`).
- `prisma/schema.prisma` — data model.

## Conventions

- Controllers stay thin: validate with zod (`*.validation.ts`), call the service, respond via `ApiResponse.success(...)`. No Prisma calls and no business logic in a controller.
- All Prisma access goes through a module's `*.repository.ts` — never call `prisma.*` from a controller or service directly.
- Throw `ApiError.badRequest/.notFound/.conflict(...)` for error cases; never write an error response directly from a controller — the global `errorHandler` (mounted last in `app.ts`) handles it.
- List endpoints default to cursor pagination (`shared/utils/pagination.ts`) unless the endpoint is a small, bounded, page-numbered admin table.
- Cacheable reads go through `cached({ namespace, key, ttlSeconds }, fetcher)` in the **service** layer (never the repository), with a bounded TTL from `CACHE_TTL`. Every mutation that changes a namespace's data must call `bumpCacheVersion(namespace)` afterward — that's the only invalidation mechanism (no manual key deletion/`SCAN`). See `product.service.ts` and `ARCHITECTURE.md` §8 for the pattern.
- Mount new resources the same way `productRouter` is mounted in `app.ts` — one router per module under `src/modules/<name>/`.
