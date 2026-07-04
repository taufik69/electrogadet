# Announcement Bar — Backend Spec

Status: **DRAFT — pending review**
Figma: https://www.figma.com/design/gEkUH2nWXoepam205EWQ2S/Nordvolt-%E2%80%94-Premium-Electronics-E-commerce--Copy-?node-id=6-7 (node `6:7`)
App: `backend/` (Express 5 + Prisma 7 + PostgreSQL + Redis)

Related specs: `dashboard/.claude/spec/announcement/announcement.spec.md`, `frontend/.claude/spec/announcement/announcement.spec.md`. This backend spec is implemented **first** — dashboard and frontend both consume this API.

> Note: the Figma MCP tool hit the Starter-plan rate limit while drafting this spec, so field choices below are inferred from Nordvolt's existing patterns and standard announcement-bar functionality, not pulled live from node `6:7`. Re-run `get_design_context`/`get_screenshot` on that node before/while implementing and reconcile.

## Shared data shape

This is the contract both `dashboard` and `frontend` depend on:

```ts
interface AnnouncementBar {
  id: string
  message: string
  linkUrl: string | null
  linkText: string | null
  isActive: boolean        // only one bar should be "live" on the storefront at a time
  startsAt: string | null  // ISO date — optional scheduling window
  endsAt: string | null
  backgroundColor: string | null // optional override hex; falls back to design-system token if null
  createdAt: string
  updatedAt: string
}
```

## 1. Data model

Add to `backend/prisma/schema.prisma`, following the existing `Product` model's conventions (cuid id, `createdAt`/`updatedAt`):

```prisma
model AnnouncementBar {
  id              String    @id @default(cuid())
  message         String
  linkUrl         String?
  linkText        String?
  isActive        Boolean   @default(false)
  startsAt        DateTime?
  endsAt          DateTime?
  backgroundColor String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

- No relations to `Product` needed.
- Migration: `npm run prisma:migrate` (dev migration), then `npm run prisma:generate` (auto-triggered by migrate, re-run standalone only if schema-only edits).

### Business rule: single active bar

The storefront only ever shows one bar. Rather than a hard DB constraint, enforce "at most one active bar" in the **service** layer: when a bar is created/updated with `isActive: true`, the service deactivates any other currently-active bar in the same transaction. This keeps the rule enforceable/observable at the app layer per `backend-architecture` conventions (no DB triggers).

## 2. Module: `src/modules/announcement/`

Mirrors `src/modules/product/` exactly:

- `announcement.constant.ts` — `export const ANNOUNCEMENT_CACHE_NAMESPACE = "announcement"`
- `announcement.types.ts` — `AnnouncementBar` type from `../../generated/prisma/models.js`, plus `CreateAnnouncementInput` / `UpdateAnnouncementInput` interfaces
- `announcement.validation.ts` — zod schemas:
  - `createAnnouncementSchema`: `message` (min 1), `linkUrl` (optional, `.url()`), `linkText` (optional string), `isActive` (optional boolean, default `false`), `startsAt`/`endsAt` (optional ISO datetime strings), `backgroundColor` (optional string, e.g. validate `#RRGGBB` pattern)
  - `updateAnnouncementSchema`: same shape, all fields `.partial()`
  - `listAnnouncementsQuerySchema`: reuse `cursorPaginationSchema` (admin list is likely small/bounded — see open question below on whether to paginate at all)
- `announcement.repository.ts` — only file touching `prisma.announcementBar.*`:
  - `findManyByCursor(cursor, limit)`
  - `findById(id)`
  - `findActive()` — `where: { isActive: true, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }] }` (respects scheduling window)
  - `create(data)`
  - `update(id, data)`
  - `deactivateAllExcept(id)` — bulk `updateMany` used by the single-active-bar rule
  - `delete(id)`
- `announcement.service.ts`:
  - `listAnnouncements(cursor, limit)` — cached via `cached({ namespace: ANNOUNCEMENT_CACHE_NAMESPACE, ... })`, same pattern as `productService.listProducts`
  - `getActiveAnnouncement()` — cached read, short TTL (e.g. `CACHE_TTL.SHORT` if it exists, else `CACHE_TTL.DEFAULT`); this is the hot path hit by the public storefront on every page load, so it must be cached
  - `createAnnouncement(input)` — if `input.isActive`, call `repository.deactivateAllExcept()` after creating; `bumpCacheVersion(ANNOUNCEMENT_CACHE_NAMESPACE)` after
  - `updateAnnouncement(id, input)` — `ApiError.notFound` if missing; same deactivate-others-if-activating logic; bump cache version
  - `deleteAnnouncement(id)` — `ApiError.notFound` if missing; bump cache version
- `announcement.controller.ts` — thin, same shape as `product.controller.ts`:
  - `list` (GET, paginated)
  - `getActive` (GET, public — no auth, used by storefront)
  - `create` (POST)
  - `update` (PATCH)
  - `remove` (DELETE)
- `announcement.routes.ts`:
  ```ts
  export const announcementRouter = Router()
  announcementRouter.get("/", announcementController.list)
  announcementRouter.get("/active", announcementController.getActive)
  announcementRouter.post("/", announcementController.create)
  announcementRouter.patch("/:id", announcementController.update)
  announcementRouter.delete("/:id", announcementController.remove)
  ```
  Note: `/active` must be registered before any `/:id`-style route to avoid Express matching "active" as an `:id` param — confirm ordering when writing routes.ts (not an issue here since there's no bare `GET /:id`, but keep in mind if one is added later).

## 3. Mount

In `src/app.ts`, add alongside `productRouter`:
```ts
app.use("/api/announcements", announcementRouter)
```

## 4. Response contract

Standard `ApiResponse.success(res, { message, data, ... })` for all endpoints, matching `product.controller.ts`. `getActive` returns `data: null` (200, not 404) when no bar is currently active/in-window — the frontend treats `null` as "render nothing."

## 5. Verification

- `npm run typecheck`, `npm run lint`
- Manual: `npm run dev`, then:
  - `curl -X POST localhost:<port>/api/announcements -H "Content-Type: application/json" -d '{"message":"Free shipping over $50","isActive":true}'`
  - `curl localhost:<port>/api/announcements/active` → should return the bar just created
  - create a second `isActive: true` bar → `curl .../active` should now return only the newest one, confirming the deactivate-others rule
  - `curl -X PATCH localhost:<port>/api/announcements/<id> -d '{"isActive":false}'` → `active` should then return `data: null`

## Open questions (resolve during review)

1. Does the Figma design (node `6:7`) show a **dismiss (×) button**? If so, dismissal is client-only state (localStorage/cookie, keyed by announcement `id`) — no backend field needed, but worth confirming before the frontend spec is finalized.
2. Does the design show **multiple rotating messages** in one bar, or strictly one message at a time? Current model assumes one active row = one message. If rotation is required, this becomes an `AnnouncementBar` (container, one active) → `AnnouncementItem[]` (ordered messages) relation instead.
3. Is scheduling (`startsAt`/`endsAt`) actually needed, or should it be dropped for a simpler `isActive`-only toggle? Included above as a reasonable default but easy to cut if out of scope.
4. Should `GET /api/announcements` (list) require auth? Skill notes say "keep authorization out of scope unless asked" — flagging in case the dashboard needs a real admin gate before shipping.

## Review gate

Per user instruction: **do not implement anything until all three per-app spec files (backend/dashboard/frontend) are reviewed and explicitly approved.** Next command after approval triggers implementation.
