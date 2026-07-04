# Backend Architecture

Layered, modular architecture for the Nordvolt backend (Express 5 + TypeScript + Prisma 7 + PostgreSQL + Redis cache). This is the binding structure for all backend work — see `backend/.claude/skills/backend-architecture/SKILL.md` for the workflow that enforces it, and `backend/.claude/skills/add-api-route/SKILL.md` for the day-to-day "add one endpoint" steps.

---

## 1. Core flow

```
server.ts → app.ts → routes → controller → service → repository → (Redis cache) → Prisma (model) → PostgreSQL
```

Reads go through the service's cache-through helper first; on a miss, the repository hits Postgres and the result is cached. Mutations go straight to the repository, then bump the module's cache version. Reference implementation: `src/modules/product/`.

---

## 2. Folder structure (strict)

```
src/
  modules/
    product/
      product.controller.ts
      product.service.ts
      product.repository.ts
      product.routes.ts
      product.validation.ts
      product.constant.ts
      product.types.ts
    order/
    user/

  shared/
    lib/            # Prisma client singleton (prisma.ts), Redis client singleton (redis.ts)
    helpers/         # ApiResponse, ApiError
    middlewares/      # errorHandler, auth, rate-limit, etc.
    utils/            # pagination helpers, cache.ts (versioned cache-through helper), generic utils
    types/             # shared zod schemas / types (pagination, etc.)
    constant/           # shared constants (cache.ts — CACHE_TTL)
    config/              # centralized env/config access

  generated/
    prisma/           # Prisma 7 generated client (custom output path — do not hand-edit)

  app.ts
  server.ts
```

There is no `model.ts` per module — Prisma's schema (`prisma/schema.prisma`) is the schema/model layer, and the generated client (`src/generated/prisma`) is the typed model access. A module's `*.types.ts` re-exports/narrows the generated Prisma model type instead of redefining it.

---

## 3. Layer responsibilities

### Controller (`*.controller.ts`)
- Request/response handling only: parse `req`, call the service, shape the response via `ApiResponse`.
- Validates input shape by delegating to a zod schema from `*.validation.ts`, then throws `ApiError.badRequest(...)` on failure — never returns a bespoke error shape inline.
- No Prisma calls. No business rules (e.g. "slug must be unique" belongs in the service, not here).

### Service (`*.service.ts`)
- All business logic and orchestration across one or more repositories.
- No direct Prisma/`prisma.*` calls — always go through the module's repository.
- Throws `ApiError` (`badRequest` / `notFound` / `conflict`) for business-rule violations; the global `errorHandler` middleware turns these into the right HTTP response.

### Repository (`*.repository.ts`)
- The only place that calls `prisma.<model>.*`.
- CRUD, aggregation, and pagination queries live here as plain async functions returning Prisma results — no response shaping, no business rules (e.g. don't throw "already exists" here; return data/null and let the service decide).

### Validation (`*.validation.ts`)
- zod schemas for request bodies/query params. Reuse shared schemas from `shared/types/pagination.ts` for list endpoints instead of redefining `page`/`limit`/`cursor` per module.

### Routes (`*.routes.ts`)
- Thin `Router()` wiring: HTTP verb + path → controller method. No logic.

### Types / Constants (`*.types.ts`, `*.constant.ts`)
- `*.types.ts`: module-local types, narrowed from the generated Prisma model (see `product.types.ts`).
- `*.constant.ts`: magic numbers/strings scoped to the module (default page size, etc.).

---

## 4. Design patterns

### Must use

1. **Repository pattern** — all Prisma access isolated behind `*.repository.ts`; nothing outside a module's repository file imports `shared/lib/prisma.ts` for that module's models.
2. **Service layer pattern** — business logic lives only in `*.service.ts`; controllers stay thin.
3. **Lightweight dependency direction** — controller → service → repository, one direction only. A repository never calls a service; a service never calls another module's repository directly (see module isolation below).
4. **DTO/validation pattern** — zod schemas in `*.validation.ts` are the input contract; controllers never trust `req.body`/`req.query` directly.

### Optional (use when the problem actually calls for it)

- **Factory pattern** — dynamic service creation, e.g. picking a payment gateway or shipping provider implementation at runtime.
- **Strategy pattern** — interchangeable algorithms, e.g. a discount/pricing engine with multiple rule sets.
- **Singleton** — already used for the Prisma client (`shared/lib/prisma.ts`) and the Redis client (`shared/lib/redis.ts`); apply the same for a future logger instance.
- **Adapter pattern** — wrapping external services (SMS, payment gateways) behind a stable internal interface.
- **Middleware pattern** — cross-cutting concerns (auth, request logging, rate limiting) as Express middleware in `shared/middlewares/`.

Don't reach for the optional patterns speculatively — add them when a module actually needs dynamic dispatch or an external integration, not by default.

---

## 5. Module isolation

- No cross-module imports between `src/modules/*`. If `order` needs product data, it calls the product **service** through a well-defined function, or (preferably) the two stay decoupled and the controller/orchestration layer composes them — don't reach into `modules/product/product.repository.ts` from `modules/order/*`.
- Shared logic goes in `shared/`, not by importing sideways between modules.
- No circular dependencies between modules or between a module and `shared/`.

---

## 6. Pagination

Two supported patterns, both implemented in `shared/utils/pagination.ts` and `shared/types/pagination.ts`:

### Offset pagination (simple, low-traffic endpoints)

```
GET /api/products?page=1&limit=10
```

Repository:

```ts
const { skip, take } = toSkipTake({ page, limit })
return prisma.product.findMany({ skip, take })
```

### Cursor pagination (production-grade default for list endpoints — ⭐ preferred)

```
GET /api/products?cursor=<lastId>&limit=10
```

Repository (see `product.repository.ts` for the real version):

```ts
findManyByCursor: async (cursor: string | undefined, limit: number) => {
  return prisma.product.findMany({
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    take: limit + 1, // fetch one extra row to detect hasMore without a count query
    orderBy: { id: "asc" },
  })
}
```

Service turns the raw rows into the standard cursor result via `toCursorResult(rows, limit)`:

```ts
{ data: T[], nextCursor: string | null, hasMore: boolean }
```

**Default to cursor pagination for any list endpoint that a frontend will infinite-scroll or that can grow large (products, orders).** Use offset pagination only for small, bounded, page-numbered admin tables where jumping to an arbitrary page number matters more than scroll performance.

---

## 7. Fetch-to-scroll / infinite scroll contract

Frontend flow: scroll → request with last `nextCursor` → append `data` → repeat while `hasMore`.

Standard response shape for every cursor-paginated endpoint:

```ts
{
  success: true,
  message: "Fetched successfully",
  data: [...],
  meta: {
    nextCursor: "clx...",
    hasMore: true
  }
}
```

Produced via:

```ts
ApiResponse.success(res, {
  message: "Fetched successfully",
  data,
  meta: { nextCursor, hasMore },
})
```

---

## 8. Redis caching (versioned, TTL-bound)

Every cacheable read goes through Redis with two invalidation mechanisms stacked together:

1. **TTL** — every cache entry has a bounded lifetime (`shared/constant/cache.ts` → `CACHE_TTL.SHORT/DEFAULT/LONG`). Nothing is cached forever; a cache entry that's never explicitly invalidated still expires on its own.
2. **Version-based invalidation** — each module owns a cache **namespace** (e.g. `"product"`). A per-namespace version counter lives in Redis (`cache:version:<namespace>`). Every cache key embeds the namespace's current version: `cache:<namespace>:v<version>:<key>`. A mutation calls `bumpCacheVersion(namespace)`, which does `INCR` on the counter — every key built with the old version is instantly orphaned (never read again) without deleting anything. Orphaned keys are reclaimed for free once their TTL elapses.

This means **cache destruction is versioning, not deletion** — there's no `DEL`/`SCAN`-by-pattern anywhere in the cache layer, which avoids the classic "cache invalidation by key pattern" foot-gun (blocking `SCAN`/`KEYS` calls, missed key patterns, race conditions between delete and re-populate).

### Implementation — `shared/utils/cache.ts`

```ts
// Read path: cache-through
export async function cached<T>(options: { namespace: string; key: string; ttlSeconds: number }, fetcher: () => Promise<T>): Promise<T>

// Write path: call after any mutation affecting this namespace's cached reads
export async function bumpCacheVersion(namespace: string): Promise<void>
```

### Usage pattern (see `product.service.ts`)

```ts
// Read — service layer decides what's cacheable, not the repository
async listProducts(cursor, limit) {
  return cached(
    { namespace: PRODUCT_CACHE_NAMESPACE, key: `list:cursor=${cursor ?? "start"}:limit=${limit}`, ttlSeconds: CACHE_TTL.DEFAULT },
    () => productRepository.findManyByCursor(cursor, limit).then(rows => toCursorResult(rows, limit)),
  )
}

// Mutation — bump the namespace version after the write succeeds
async createProduct(input) {
  const product = await productRepository.create(input)
  await bumpCacheVersion(PRODUCT_CACHE_NAMESPACE)
  return product
}
```

### Rules

- **Cache in the service layer, not the repository.** The service decides what's cacheable and for how long; the repository stays a pure data-access layer.
- **Every cache key must vary with its query parameters** (cursor, limit, filters) — never cache a list under one flat key that ignores pagination/filter state, or different pages will collide.
- **Every mutation that changes a namespace's underlying data must call `bumpCacheVersion(namespace)`** after the write succeeds — create, update, delete, and bulk operations alike. Bump once per namespace touched, even if the mutation writes through multiple repository calls.
- **Pick TTL by volatility**, not uniformly: fast-changing data → `CACHE_TTL.SHORT`; typical list/detail reads → `CACHE_TTL.DEFAULT`; rarely-changing reference data → `CACHE_TTL.LONG`. Add a new tier to `shared/constant/cache.ts` rather than inlining a raw number.
- One namespace per module by default (`PRODUCT_CACHE_NAMESPACE = "product"` in `product.constant.ts`); a module with genuinely independent sub-resources (e.g. `order` and `order-stats`) may use more than one namespace so a mutation to one doesn't over-invalidate the other.

---

## 9. Global response and error system

### Success — `shared/helpers/apiResponse.ts`

```ts
ApiResponse.success(res, { statusCode: 200, message: "Success", data })
```

Always `{ success: true, message, data, meta? }` — never return a bare array or bare object from a controller.

### Errors — `shared/helpers/ApiError.ts` + `shared/middlewares/errorHandler.ts`

- Controllers/services throw `ApiError.badRequest/.notFound/.conflict(...)` (or `new ApiError(status, message)` for anything else). Express 5 auto-forwards rejected async handlers to error middleware — don't wrap handlers in try/catch just to call `next(err)`.
- The global `errorHandler`, mounted last in `app.ts`, is the only place that writes an error response. It returns the structured `ApiError` shape for known errors and a generic `500 Internal server error` (logged server-side, never leaking a raw stack trace to the client) for anything unexpected.
- Never let a raw Prisma/Node error reach `res.json()` directly from a controller.

---

## 10. Strict rules — do not break

**Architecture violations**
- ❌ Prisma calls in a controller
- ❌ Prisma calls in a service (must go through the repository)
- ❌ Business logic in a repository (uniqueness checks, authorization, computed fields)
- ❌ Validation logic in a controller (must be a zod schema in `*.validation.ts`)

**Design violations**
- ❌ Fat controllers (anything beyond parse → call service → respond)
- ❌ Fat services that also do response shaping
- ❌ Mixed responsibilities in one file

**Dependency violations**
- ❌ Cross-module imports (`modules/order` importing from `modules/product/*` internals)
- ❌ Circular dependencies

**Code violations**
- ❌ Duplicate Prisma queries copy-pasted across modules — extract to the repository or `shared/`
- ❌ Inline `prisma.*` calls outside a repository file
- ❌ Hardcoded business rules inside a controller (e.g. price thresholds, discount %) — belongs in the service or a constants file

**Caching violations**
- ❌ Caching in a repository (caching decisions belong in the service layer)
- ❌ A `cached(...)` call with no `ttlSeconds`, or a hardcoded raw number instead of a `CACHE_TTL` tier
- ❌ A mutation that changes data without calling `bumpCacheVersion(namespace)` afterward — this is the #1 way to serve stale reads
- ❌ Manually deleting/scanning cache keys by pattern instead of bumping the namespace version

---

## 11. Scalability rules

- Modules must be independent and removable without breaking another module.
- Repositories must be reusable — no request/response objects (`req`/`res`) ever passed into a repository or service.
- Services must be stateless — no module-level mutable state; everything needed comes in as a function argument.
- Config is centralized (`shared/config/`, `.env`, `prisma.config.ts`) — don't read `process.env` scattered across modules.
- Logging is global (`shared/middlewares/errorHandler.ts` today; extend with a request logger in `shared/middlewares/` rather than ad hoc `console.log` per module).
- Every list endpoint uses one of the two standard pagination shapes from `shared/utils/pagination.ts` — don't invent a third shape per module.
- No cache entry is ever unbounded — every `cached(...)` call requires an explicit `ttlSeconds` from `CACHE_TTL`; cache destruction is version bumps, not manual key deletion (see §8).

---

## 12. Final request flow

```
Request
  ↓
Middleware (helmet, cors, json body parser; auth/rate-limit as added)
  ↓
Router (*.routes.ts)
  ↓
Controller (parse + validate via zod, call service, respond via ApiResponse)
  ↓
Service (business logic, throws ApiError on rule violations)
  ↓            ↘
  |          Redis (cache read/write for GET-style reads; version bump on mutations)
  ↓
Repository (the only Prisma access point)
  ↓
PostgreSQL (via Prisma 7 + PrismaPg driver adapter)
  ↓
Response (ApiResponse.success / errorHandler)
```

## 13. Prisma/Postgres specifics (read before adding a model)

- Prisma 7 requires the explicit `PrismaPg` driver adapter — never call `new PrismaClient()` with just a `DATABASE_URL`. The one shared instance lives at `shared/lib/prisma.ts`; import it from there in every repository, never construct a second `PrismaClient`.
- The generated client lives at `src/generated/prisma` (custom `output` in `prisma/schema.prisma`) — import model types from `generated/prisma/models.js`, not from `@prisma/client`.
- After editing `prisma/schema.prisma`: run `npm run prisma:migrate` (dev migration + regenerates the client) or `npm run prisma:generate` if you only need to resync types against an already-correct DB.
- This is ESM (`"type": "module"`): every relative import needs an explicit `.js` extension, including type-only imports, even though the source is `.ts`.
- Cursor pagination assumes an indexed, unique, orderable column (Prisma's default `id` via `@default(cuid())` works). If a module needs cursor pagination on a non-`id` column, add an explicit `@@index` in the schema for it.

## 14. Redis specifics (read before adding caching to a module)

- The shared client lives at `shared/lib/redis.ts` (`ioredis`, connects via `REDIS_URL` env var, defaults to `redis://localhost:6379`). Import it from there — never construct a second `Redis` instance.
- Import the named export: `import { Redis } from "ioredis"`. The default export is not constructable under this project's `NodeNext` module resolution.
- Cache key format is fixed: `cache:<namespace>:v<version>:<key>` — don't hand-build cache keys outside `shared/utils/cache.ts`'s `cached()`/`bumpCacheVersion()` helpers.
- A namespace's version counter (`cache:version:<namespace>`) starts unset (treated as version `0`); the first `bumpCacheVersion` call brings it to `1`. Don't special-case "version not set yet" logic elsewhere — `cached()` and `bumpCacheVersion()` already handle it consistently.
