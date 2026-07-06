# Mega Navigation — Backend Spec

Status: **DRAFT — pending review**
Design source: user-provided screenshot (mega nav demo mockup), no Figma node available this session — see caveat below.
App: `backend/` (Express 5 + Prisma 7 + PostgreSQL + Redis)

Related specs: `dashboard/.claude/spec/mega-nav/mega-nav.spec.md`, `frontend/.claude/spec/mega-nav/mega-nav.spec.md`. This backend spec is implemented **first** — dashboard and frontend both consume this API.

> Design caveat: no Figma URL/node-id was given for this feature (only a screenshot of a rough Figma mockup showing an editable "Mega Navigation" region with 4 columns: Computing, Mobile & Wearables, Audio & Imaging, Home & Gaming, each with 6-8 links + "See all"). Structure below is inferred from that screenshot plus the existing `Product`/`AnnouncementBar` conventions. Re-pull from Figma once a node-id is available and reconcile before/while implementing.

## Shared data shape

This is the contract `dashboard` and `frontend` both depend on:

```ts
interface NavCategory {
  id: string
  name: string          // e.g. "Computing" (top-level) or "Laptops" (child)
  slug: string          // unique, used for /categories/[slug] and product filtering
  parentId: string | null
  sortOrder: int        // display order within its siblings
  isClearance: boolean  // marks the standalone "Clearance" link (top-level only, no children expected)
  showInMegaMenu: boolean // top-level rows only: whether this heads a mega-menu column
  createdAt: string
  updatedAt: string
}
```

Two levels only (top-level nav item → column heading, its children → the links inside that column + a "See all" link to the parent). No third level, per the screenshot.

## 1. Data model

Add to `backend/prisma/schema.prisma`, self-referential like a standard adjacency-list tree, following `Product`'s cuid/timestamps convention:

```prisma
model Category {
  id             String     @id @default(cuid())
  name           String
  slug           String     @unique
  parentId       String?
  parent         Category?  @relation("CategoryChildren", fields: [parentId], references: [id], onDelete: Cascade)
  children       Category[] @relation("CategoryChildren")
  sortOrder      Int        @default(0)
  isClearance    Boolean    @default(false)
  showInMegaMenu Boolean    @default(true)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  @@index([parentId])
}
```

- `onDelete: Cascade` on the self-relation: deleting a top-level category removes its children (matches "See all" column being meaningless without its parent). Confirm this is acceptable during review — alternative is `Restrict` and require the dashboard to empty a column before deleting its parent.
- No relation to `Product` yet — the existing `Product` model has no `categoryId`. Adding that FK is **out of scope** for this spec (nav structure only); flag as a natural follow-up once `/categories/[slug]` product listing is built.
- Migration: `npm run prisma:migrate`, then `npm run prisma:generate` (auto-triggered).

### Business rule: two-level depth

Enforced in the **service** layer, not the DB: `createCategory`/`updateCategory` reject (`ApiError.badRequest`) if `parentId` is set to a category that itself already has a `parentId` (i.e. no grandchildren). Keeps the mega-menu's fixed 2-level shape intact.

## 2. Module: `src/modules/category/`

Mirrors `src/modules/announcement/` exactly:

- `category.constant.ts` — `export const CATEGORY_CACHE_NAMESPACE = "category"`
- `category.types.ts` — `Category` type from `../../generated/prisma/models.js`, plus `CreateCategoryInput` / `UpdateCategoryInput` interfaces, plus a `CategoryTree` shape (`Category & { children: Category[] }`) for the nav-tree response
- `category.validation.ts`:
  - `createCategorySchema`: `name` (min 1), `slug` (min 1, `.regex(/^[a-z0-9-]+$/)` matching typical slug format), `parentId` (optional string), `sortOrder` (optional int, default 0), `isClearance` (optional boolean, default false), `showInMegaMenu` (optional boolean, default true)
  - `updateCategorySchema`: same shape, all fields `.partial()`
  - `listCategoriesQuerySchema`: reuse `cursorPaginationSchema` for the flat admin list
- `category.repository.ts` — only file touching `prisma.category.*`:
  - `findManyByCursor(cursor, limit)` — flat list, admin table
  - `findById(id)`
  - `findBySlug(slug)`
  - `findTree()` — `findMany({ where: { parentId: null }, orderBy: { sortOrder: "asc" }, include: { children: { orderBy: { sortOrder: "asc" } } } })` — this is the public nav-tree read
  - `create(data)`
  - `update(id, data)`
  - `delete(id)`
- `category.service.ts`:
  - `listCategories(cursor, limit)` — cached via `cached({ namespace: CATEGORY_CACHE_NAMESPACE, ... }, ...)`, mirrors `productService.listProducts`
  - `getNavTree()` — cached read, `CACHE_TTL.LONG` (nav structure changes rarely — admin edits, not per-order); this is the hot path hit by the storefront header on every page load via the root layout, so it must be cached
  - `createCategory(input)` — `ApiError.conflict` if slug exists; enforce two-level-depth rule; `bumpCacheVersion(CATEGORY_CACHE_NAMESPACE)` after
  - `updateCategory(id, input)` — `ApiError.notFound` if missing; re-check two-level-depth rule if `parentId` changes; bump cache version
  - `deleteCategory(id)` — `ApiError.notFound` if missing; bump cache version
- `category.controller.ts` — thin, same shape as `announcement.controller.ts`:
  - `list` (GET, paginated, admin)
  - `getTree` (GET, public — no auth, used by storefront nav)
  - `create` (POST)
  - `update` (PATCH)
  - `remove` (DELETE)
- `category.routes.ts`:
  ```ts
  export const categoryRouter = Router()
  categoryRouter.get("/tree", categoryController.getTree)
  categoryRouter.get("/", categoryController.list)
  categoryRouter.post("/", categoryController.create)
  categoryRouter.patch("/:id", categoryController.update)
  categoryRouter.delete("/:id", categoryController.remove)
  ```
  `/tree` registered before any `/:id`-style route, same ordering caution noted in the announcement spec.

## 3. Mount

In `src/app.ts`, add alongside `productRouter`/`announcementRouter`:
```ts
app.use("/api/categories", categoryRouter)
```

## 4. Response contract

Standard `ApiResponse.success(res, { message, data, ... })` throughout, matching existing controllers. `getTree` returns `data: []` (200, not 404) if no categories exist yet — frontend treats an empty array as "render nav links with no mega-menu panel."

## 5. Verification

- `npm run typecheck`, `npm run lint`
- Manual: `npm run dev`, then:
  - Create 4 top-level categories (`Computing`, `Mobile & Wearables`, `Audio & Imaging`, `Home & Gaming`) via `POST /api/categories`
  - Create children under each (e.g. `Laptops`, `Desktops` under `Computing`) via `POST /api/categories` with `parentId`
  - `curl localhost:<port>/api/categories/tree` → should return the 4 top-level rows, each with its `children` array, ordered by `sortOrder`
  - Attempt to create a grandchild (parent = one of the children above) → should 400
  - `PATCH` a category's `sortOrder`/`name`, confirm `tree` reflects it after cache invalidation
  - `DELETE` a top-level category with children → confirm children are cascade-deleted, confirm `tree` no longer shows that column

## Open questions (resolve during review)

1. Should `Product` gain a `categoryId` FK now, or is this purely a nav-structure feature for this pass? Screenshot only shows nav labels, no product-count badges, so leaning toward **out of scope**, but flag since "See all" links imply a future `/categories/[slug]` product-listing page that will need this FK eventually.
2. Is `isClearance` the right modeling for the standalone red "Clearance" link, or should that just be a plain top-level category with `showInMegaMenu: false` and a `highlight`/`variant` field instead? Current spec special-cases it as a boolean flag; simplest alternative is dropping `isClearance` entirely and just checking `slug === "clearance"` in the frontend — cheaper, but less explicit. Lean toward keeping the explicit flag unless review disagrees.
3. Confirm cascade-delete-on-parent-removal (option A above) vs. restrict-until-empty (option B) — A is fewer clicks for admins, B is safer against accidental data loss.
4. Any max column-count or max-links-per-column constraint to enforce server-side (screenshot shows 4 columns × 6-8 links), or is this left to admin discretion with no hard limit?

## Review gate

Per user instruction: **do not implement anything until all three per-app spec files (backend/dashboard/frontend) are reviewed and explicitly approved.** Next command after approval triggers implementation.
