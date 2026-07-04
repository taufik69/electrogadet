---
name: backend-architecture
description: Enforces the layered, modular backend architecture (controller/service/repository, design patterns, pagination, Redis caching, global response system) for the Nordvolt backend (Express 5 + Prisma 7 + PostgreSQL + Redis)
---

# Backend architecture

Use this whenever adding, moving, or refactoring backend code — new modules, new endpoints, new business rules, or any structural change to `backend/src`. This is the binding architecture contract; see `backend/ARCHITECTURE.md` for the full rationale and `add-api-route` for the narrower "scaffold one endpoint" checklist. When the two disagree on a mechanical step, `add-api-route` wins for quick execution — this skill governs structure and layering.

## Reference implementation

`src/modules/product/` is the canonical example of every rule below:
`product.controller.ts` → `product.service.ts` → `product.repository.ts`, plus `product.routes.ts`, `product.validation.ts`, `product.types.ts`, `product.constant.ts`. Copy this shape for every new module.

## Adding a new module (e.g. "orders")

1. Create `src/modules/<name>/` with these files (only add the ones the module actually needs — don't create an empty `*.constant.ts` if there's nothing to put in it):
   - `<name>.routes.ts` — `Router()` wiring only, exported as `<name>Router`
   - `<name>.controller.ts` — parses/validates request, calls service, responds via `ApiResponse`
   - `<name>.service.ts` — business logic, calls repository, throws `ApiError` on rule violations
   - `<name>.repository.ts` — the only file that calls `prisma.<model>.*` for this module
   - `<name>.validation.ts` — zod schemas for request bodies/query params
   - `<name>.types.ts` — narrows/re-exports the generated Prisma model type
   - `<name>.constant.ts` — module-scoped constants (default page size, etc.)
2. Add/edit the Prisma model in `prisma/schema.prisma` if new data is involved, then `npm run prisma:migrate` (creates + applies migration + regenerates client) or `npm run prisma:generate` if syncing types only.
3. Mount the router in `src/app.ts`: `app.use("/api/<resource>", <name>Router)` — **before** the `errorHandler` line, which must always stay last.
4. Run `npm run typecheck` and `npm run lint`, then sanity-check with `npm run dev` + `curl`.

## Layer rules (do not violate)

- **Controller**: no Prisma calls, no business logic. Validate with a zod schema from `*.validation.ts`; on failure throw `ApiError.badRequest(message, parsed.error.flatten())` — don't hand-roll a different error shape.
- **Service**: no direct `prisma.*` calls — always through the repository. Throws `ApiError.notFound/.conflict/.badRequest(...)` for business-rule violations (e.g. duplicate slug). Stateless — no module-level mutable state.
- **Repository**: the only place with `prisma.<model>.*`. No business rules here (e.g. don't throw "already exists" in the repository — return `null`/data and let the service decide).
- **No cross-module imports.** A module must never import another module's controller/service/repository internals. If two modules need the same data, compose at a higher layer or put the shared piece in `shared/`.

## Pagination — pick cursor by default

For any list endpoint that can grow large or that the frontend will infinite-scroll (products, orders, etc.), use **cursor pagination** via `shared/utils/pagination.ts`:

```ts
// repository
findManyByCursor: async (cursor: string | undefined, limit: number) => {
  return prisma.<model>.findMany({
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    take: limit + 1,
    orderBy: { id: "asc" },
  })
}

// service
const rows = await repository.findManyByCursor(cursor, limit)
return toCursorResult(rows, limit) // { data, nextCursor, hasMore }
```

Reuse `cursorPaginationSchema` from `shared/types/pagination.ts` in the module's `*.validation.ts` rather than redefining `cursor`/`limit` per module. Only use offset pagination (`page`/`limit` via `toSkipTake`) for small, bounded, page-numbered admin tables where jumping to an arbitrary page matters more than scroll performance.

## Redis caching — TTL + version, always both

Cache reads in the **service** layer (never the repository) via `cached()` from `shared/utils/cache.ts`, and bump the module's cache version on every mutation via `bumpCacheVersion()`:

```ts
// service — read path
async listProducts(cursor, limit) {
  return cached(
    { namespace: PRODUCT_CACHE_NAMESPACE, key: `list:cursor=${cursor ?? "start"}:limit=${limit}`, ttlSeconds: CACHE_TTL.DEFAULT },
    () => productRepository.findManyByCursor(cursor, limit).then(rows => toCursorResult(rows, limit)),
  )
}

// service — mutation path: bump AFTER the write succeeds
async createProduct(input) {
  const product = await productRepository.create(input)
  await bumpCacheVersion(PRODUCT_CACHE_NAMESPACE)
  return product
}
```

Rules:
- Every cache key must encode its query params (cursor/limit/filters) — a flat key for a paginated list will collide across pages.
- Every `cached(...)` call needs an explicit `ttlSeconds` from `CACHE_TTL` (`SHORT`/`DEFAULT`/`LONG` in `shared/constant/cache.ts`) — pick by data volatility, don't default to one tier everywhere.
- **Every mutation that changes a namespace's data must call `bumpCacheVersion(namespace)`** — this is the invalidation mechanism. There is no manual `DEL`/`SCAN`-by-pattern anywhere; version bumps orphan old keys instantly and TTL reclaims them from Redis.
- One namespace per module by default (e.g. `PRODUCT_CACHE_NAMESPACE` in `product.constant.ts`); split into more than one only if a module has genuinely independent sub-resources that shouldn't invalidate each other.
- Forgetting the version bump after a mutation is the most common bug here — it silently serves stale cached reads. When adding any create/update/delete to a cached module, grep the service file for existing `bumpCacheVersion` calls before assuming one isn't needed.

## Response contract (mandatory)

Every controller responds through `shared/helpers/apiResponse.ts` — never `res.json(...)` directly, never return a bare array/object:

```ts
ApiResponse.success(res, { message: "Fetched successfully", data, meta: { nextCursor, hasMore } })
```

Errors are never written from a controller. Throw `ApiError.badRequest/.notFound/.conflict(message, details?)` (or `new ApiError(status, message)`); the global `errorHandler` in `app.ts` (mounted last) is the only place that writes an error response. Express 5 auto-forwards rejected async handlers to it — don't wrap handlers in try/catch just to call `next(err)`.

## Design patterns

**Always applied**: repository pattern, service layer pattern, one-directional dependency flow (controller → service → repository), zod-based DTO/validation.

**Reach for only when the problem calls for it** — don't add speculatively:
- Factory pattern — dynamic provider selection (payment gateways, shipping providers)
- Strategy pattern — interchangeable algorithms (discount/pricing rules)
- Singleton — already used for the Prisma client (`shared/lib/prisma.ts`) and Redis client (`shared/lib/redis.ts`); apply the same for a future logger
- Adapter pattern — wrapping external services (SMS, payment gateways) behind a stable interface
- Middleware pattern — cross-cutting concerns (auth, logging, rate limiting) in `shared/middlewares/`

## Prisma/Postgres notes

- Always import the shared singleton from `shared/lib/prisma.ts` — never construct a second `PrismaClient`. It already wires the required `PrismaPg` driver adapter (Prisma 7 doesn't connect from a bare `DATABASE_URL`).
- Import generated model types from `src/generated/prisma/models.js` (custom output path) — note Prisma 7's naming: the model type is `<Model>Model` (e.g. `ProductModel`), not `<Model>`.
- ESM project — every relative import needs an explicit `.js` extension, including type-only imports, even though source files are `.ts`.
- Cursor pagination needs an indexed, unique, orderable column. The default `id` (`@default(cuid())`) works out of the box; add an explicit `@@index` in `prisma/schema.prisma` if cursoring on a different column.

## Redis notes

- Always import the shared singleton from `shared/lib/redis.ts` — never construct a second `Redis` instance. Connection string comes from `REDIS_URL` (defaults to `redis://localhost:6379`).
- Import `{ Redis }` (named export) from `ioredis`, not the default export — the default isn't constructable under this project's `NodeNext` module resolution.
- Cache keys are always built through `cached()`/`bumpCacheVersion()` in `shared/utils/cache.ts` — never hand-construct a `cache:...` key elsewhere.

## Verification

After any structural change, from `backend/`:

```
npm run typecheck
npm run lint
npm run dev   # then curl the affected endpoint(s) manually
```
