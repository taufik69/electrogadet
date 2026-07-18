# Sidebar Navigation — Implementation Plan

Backend-driven navigation for the storefront's three-level sidebar (Brand → Category → Product), with dashboard management, preserving the current UI exactly.

**Status:** plan only — no code written yet.

---

## 1. Current frontend analysis

### 1.1 What renders today

`frontend/src/components/category-sidebar.tsx` is a **client component** (`"use client"`) importing a hardcoded array from `frontend/src/lib/data/brands.ts` (14 brands, ~35 categories, ~90 products).

The shape it consumes:

```ts
interface Brand {
  name: string        // "Apple products" — display label, not the bare brand name
  slug: string        // "apple"
  icon: IconType      // react-icons/si component reference
  categories: BrandCategory[]
}
interface BrandCategory { name: string; slug: string; products: BrandProduct[] }
interface BrandProduct  { name: string; slug: string }
```

### 1.2 Layout and interaction contract

Three columns, fixed widths — any API design must preserve these:

| Region | Width | Behavior |
|---|---|---|
| Icon rail | `w-16` (64px) | `aria-hidden`, brand logos only, index-aligned to name rows |
| Brand names | `250px` | `onMouseEnter` → sets `activeBrand` **and** auto-selects `categories[0]` |
| Category flyout | `245px` | absolute at `left-[314px]`, `top-[102px]`; `onMouseEnter` → `activeCategory` |
| Product flyout | `245px` | renders only when `category.products.length > 0` |

Critical details the backend must respect:

- **Row height is fixed at `h-[46px]`** for brands and categories. The icon rail aligns to brand rows purely by array index and a `h-9` spacer. If the icon rail and the name list ever receive different orderings or lengths, the rail silently misaligns. **Ordering must be identical and server-authoritative.**
- **Hover state is 100% client-side.** `useState` + `onMouseEnter`, closed by `onMouseLeave` on the container. The backend supplies *data*, never hover state.
- **`categories[0]` auto-select** means "first" is meaningful — sort order is a data concern, not cosmetic.
- **Chevron visibility** is driven by `b.categories.length > 0` and `cat.products.length > 0`. Empty children must be *absent or empty arrays*, never `null`, or the chevron logic breaks.
- Links are `/products?brand=<slug>`, `/products?brand=<slug>&category=<slug>`, `/products/<slug>`.

### 1.3 Findings worth flagging

**`frontend/src/lib/data/categories.ts` is dead code.** Nothing imports it (verified by grep across `src/`). It describes a *different* hierarchy (Category → Subgroup → Leaf, with `by-brand`/`by-type` facet groups) than the sidebar's Brand → Category → Product. It appears to be an earlier design. **Recommend deleting it** as part of this work — leaving two contradictory navigation models in the tree guarantees future confusion. Confirm before removing.

**Icons cannot come from the database as components.** `icon: IconType` is a React component reference (`SiApple`). A database can only store a string key. This is the single biggest frontend change required — see §5.2.

**The generated Prisma client already contains a richer schema than `schema.prisma`.** `src/generated/prisma/models/` has `Brand` (with `image`, `isActive`) and `Category` (with `parentId`, `sortOrder`, `isClearance`, `showInMegaMenu`), plus `Banner`, `FlashSale`, `FlashSaleProduct`. `prisma/schema.prisma` defines only `Product` and `AnnouncementBar`. **The next `prisma generate` will delete those models.** This plan reinstates and extends them deliberately — but the drift should be acknowledged as a pre-existing hazard, not silently overwritten.

---

## 2. Database schema

### 2.1 Design decision: adjacency list, not a join-table hierarchy

The sidebar is Brand → Category → Product, but categories are conceptually a *tree* (the generated client already had `parentId`). Two options:

| Option | Pros | Cons |
|---|---|---|
| **A. Flat `Category.brandId`** | Dead simple; exactly matches today's 2-level need | No sub-categories ever; a schema migration to add depth later |
| **B. Adjacency list (`parentId`) + `brandId`** | Supports today's flat case *and* future nesting; matches prior art in the generated client | Recursive queries if depth > 2 |

**Choose B.** It renders identically today (query `WHERE parentId IS NULL` for the top level) and does not require a migration when someone inevitably asks for a third level. Depth is bounded in application code (see §9.4).

### 2.2 Schema

```prisma
model Brand {
  id        String  @id @default(cuid())
  name      String              // "Apple products" — the display label
  slug      String  @unique     // "apple"
  iconKey   String?             // "SiApple" — resolved to a component client-side
  imageUrl  String?             // denormalized CDN url of the uploaded logo; see §2.3c
  isActive  Boolean @default(true)
  sortOrder Int     @default(0)

  categories Category[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([isActive, sortOrder])   // the exact sidebar query shape
}

model Category {
  id        String  @id @default(cuid())
  name      String
  slug      String
  imageUrl  String?
  isActive  Boolean @default(true)
  sortOrder Int     @default(0)

  brandId   String
  brand     Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)

  parentId  String?
  parent    Category?  @relation("CategoryTree", fields: [parentId], references: [id], onDelete: Cascade)
  children  Category[] @relation("CategoryTree")

  products  ProductCategory[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([brandId, slug])              // slug unique per brand, not globally
  @@index([brandId, isActive, sortOrder])
  @@index([parentId])
}

enum ImageStatus {
  pending
  processing
  uploaded
  failed
}

enum ImageOwnerType {
  product_gallery    // one of many — ordered by sortOrder
  product_thumbnail  // at most one per product
  seo_og             // the og:image for a product's SEO row
  brand              // brand logo/mark
  category           // category tile
}

/// Deferred-upload image record. Rows are created immediately with
/// status=pending and a localPath, then a worker uploads to the CDN and fills
/// url/publicId. `tries`/`lastError` let the worker retry with backoff and
/// surface failures in the dashboard instead of losing them silently.
///
/// One polymorphic table rather than an image column on every model: uploads
/// are processed by a single worker that queries `status: pending` across all
/// owners, which a per-model column layout cannot express.
model Image {
  id        String      @id @default(cuid())
  url       String      @default("")
  publicId  String      @default("")
  status    ImageStatus @default(pending)
  localPath String      @default("")
  tries     Int         @default(0)
  lastError String      @default("")

  ownerType ImageOwnerType
  ownerId   String
  sortOrder Int         @default(0)
  alt       String?     // accessibility + SEO; absent from the Mongo original

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ownerType, ownerId, sortOrder])  // fetch one owner's images, ordered
  @@index([status, tries])                  // the upload worker's queue scan
}

/// Search-engine + social-share metadata. Split into its own table rather than
/// ~13 columns inlined on Product: it is written rarely, read only on the PDP,
/// and keeps the hot Product row narrow for list/sidebar queries.
model ProductSeo {
  id              String   @id @default(cuid())
  productId       String   @unique
  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  metaTitle       String?  @db.VarChar(70)
  metaDescription String?  @db.VarChar(200)
  metaKeywords    String[]                    // native Postgres array
  canonicalUrl    String?
  focusKeyword    String?
  ogTitle         String?  @db.VarChar(70)
  ogDescription   String?  @db.VarChar(200)
  twitterCard     TwitterCard @default(summary_large_image)
  structuredData  Json?                       // JSON-LD
  noIndex         Boolean  @default(false)
  noFollow        Boolean  @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum TwitterCard {
  summary
  summary_large_image
  app
  player
}

model Product {
  id             String  @id @default(cuid())
  name           String
  slug           String  @unique          // globally unique — /products/<slug>
  description    String?
  priceCents     Int
  compareAtCents Int?
  isActive       Boolean @default(true)

  // Merchandising / PDP fields worth carrying over from the Mongo model
  sku                 String?  @unique      // nullable + unique = Postgres allows many NULLs
  barcode             String?  @unique
  rating              Float    @default(0)
  ratingCount         Int      @default(0)
  stock               Int      @default(0)
  availabilityStatus  AvailabilityStatus @default(in_stock)
  warrantyInformation String?
  shippingInformation String?
  manufactureCountry  String?
  tags                String[]

  // Physical dimensions — flat columns, not a nested object: they are queried
  // and filtered individually (shipping-cost rules), which Json cannot index.
  weightGrams Int?
  widthMm     Int?
  heightMm    Int?
  depthMm     Int?

  brandId    String?
  brand      Brand?  @relation(fields: [brandId], references: [id], onDelete: SetNull)

  categories ProductCategory[]
  seo        ProductSeo?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([brandId, isActive])
  @@index([isActive, createdAt(sort: Desc)])  // default catalog listing
  @@index([priceCents])                       // price sort/filter
}

enum AvailabilityStatus {
  in_stock
  out_of_stock
  preorder
}

// Explicit join table — carries per-category ordering, which an implicit
// many-to-many cannot.
model ProductCategory {
  productId  String
  categoryId String
  sortOrder  Int    @default(0)

  product  Product  @relation(fields: [productId],  references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([productId, categoryId])
  @@index([categoryId, sortOrder])   // drives the product flyout ordering
}
```

### 2.3 Rationale for the non-obvious choices

**`slug` unique per-brand, not global.** The real data has `slug: "phones"` under Samsung, Xiaomi, Google, and OnePlus simultaneously; `"headphones"` under Sony, Bose, JBL, Samsung. A global unique constraint would reject the existing dataset outright. `@@unique([brandId, slug])` matches the URL contract `?brand=samsung&category=phones`.

**`ProductCategory` is an explicit join table.** A product can sit in multiple categories, and the flyout needs a defined order *within each category*. An implicit Prisma m-n relation has nowhere to hang `sortOrder`. This also makes reordering a single-row update.

**`sortOrder` is `Int`, not a float or linked list.** Reordering strategy in §6.3.

**`onDelete` differs per relation deliberately.** Category→Brand cascades (a brand's categories are meaningless without it). Product→Brand is `SetNull` (deleting a brand must not delete sellable inventory). This asymmetry is intentional and should be preserved.

### 2.3b Translating the Mongoose model to Postgres

A reference Mongoose `productSchema` was supplied as the source of ideas. Postgres is not Mongo, so it is adapted rather than transcribed. What carried over, and what deliberately did not:

**Subdocuments → tables.** `imageSchema` and `seoSchema` are Mongo subdocuments (`{ _id: false }`). Postgres has no such concept. Two honest options: embed as `Json`, or normalize into tables. Chose **tables** — `Json` columns cannot be indexed usefully for the queries these actually serve (the upload worker scanning `status: pending` across every product; ordering a gallery). `Json` is kept only for `structuredData`, which is genuinely schemaless JSON-LD and is never queried by shape.

**`Image` is one polymorphic table, not an `images` column per model.** The status/tries/lastError design implies a background worker that picks up pending uploads. That worker needs one query — `WHERE status = 'pending' ORDER BY tries` — across products, brands, and categories alike. A per-model image column makes that query impossible without a union across every table. Cost of the polymorphic approach: `ownerId` cannot have a real foreign key, so orphan cleanup is application-level (a periodic sweep, or delete-on-owner-delete in the service).

**Gallery + thumbnail are the same table**, separated by `ownerType` (`product_gallery` / `product_thumbnail`), rather than the Mongo model's separate `image[]` array and `thumbnail` object. One upload pipeline, one worker, one set of retry semantics. The "at most one thumbnail" rule is a service-layer invariant, not a DB constraint.

**`maxlength` → `@db.VarChar(n)`.** `metaTitle` (70) and `metaDescription` (200) become real column constraints, enforced by Postgres, and mirrored in zod so the error is a clean 400 rather than a database exception.

**`metaKeywords` and `tags` use native `String[]`.** Postgres arrays are a genuine type here, not a Mongo emulation — no join table needed for what is a flat, unordered, non-queried-by-relation list.

**Enums are real Postgres enums** (`ImageStatus`, `TwitterCard`, `AvailabilityStatus`) instead of Mongo's string `enum:` validation. The database rejects invalid values, not just the ORM. Values are snake_case because `"In Stock"` with a space is a poor enum identifier.

**`sku`/`barcode` are `String? @unique`.** This reproduces Mongo's `sparse: true` semantics exactly — Postgres permits unlimited `NULL`s in a unique column, so products without a SKU do not collide.

**Deliberately omitted, and why.** The reference model is a full POS/inventory system; this storefront is not, yet. Left out: `purchasePrice`, `wholesalePrice`, profit-margin fields, `purchaseReturnStock` / `salesReturnStock` / `posSold` / `webSold`, `warehouseLocation`, `SalesReturn` / `ByReturn` / `CourierReturn` relations, `groupUnit` / `unit`, `qrCode`, `sizeChart`, `variantType`. These belong to purchasing, POS, and returns domains that have no module here. Adding them now would create wide tables nothing reads. `variant` is also omitted — product variants are a substantial subsystem (per-variant stock, price, images) and deserve their own design pass, not a field bolted on.

**Mongoose behaviors with no schema equivalent.** These become application code, and are noted so they are not lost:

| Mongoose feature | Where it goes in this stack |
|---|---|
| `pre("save")` auto-slug via `slugify` | `product.service.ts` on create/update |
| Duplicate-key (`11000`) → friendly error | Prisma `P2002` → `ApiError.conflict` in `errorHandler` |
| Virtuals (`retailProfitMarginByAmount`, etc.) | Computed in the service response mapper, not stored |
| `text` index on name/keywords | Postgres `tsvector` + GIN index — a separate search task |
| `timestamps: true` | `@default(now())` / `@updatedAt` |

The removed `post("find")` N+1 hook in the reference model is a good warning: **do not** add Prisma middleware that fetches related totals on every read. Aggregate on demand in a dedicated endpoint.

### 2.3c `imageUrl` columns vs. the `Image` table

Brand and Category keep a plain `imageUrl String?` *in addition to* having `Image` rows. That looks like duplication, so the rule must be explicit or it will rot:

- **`Image` is the system of record** — upload state, retries, publicId, failures.
- **`imageUrl` on Brand/Category is a denormalized read cache** of the resolved CDN url for the single display image, maintained by the service when an upload reaches `status: uploaded`.

The reason is the sidebar query. It is the hottest read in the app, runs on every page (root layout), and needs exactly one url per brand. Joining `Image` for that turns a clean two-level `include` into a three-way join returning worker bookkeeping the sidebar never uses. A denormalized column keeps §9.1's query shape intact.

The cost is a consistency rule: **whenever a brand/category image transitions to `uploaded`, the service must write `imageUrl` in the same transaction.** If that is missed, the sidebar shows a stale or missing logo while the `Image` row looks healthy. If this bookkeeping proves error-prone in practice, drop the columns and pay for the join — but decide deliberately, do not let both drift.

Product intentionally has **no** `imageUrl` column: the PDP and card already need the full ordered gallery, so they join `Image` regardless and there is nothing to save.

**Indexes mirror the actual query.** `@@index([isActive, sortOrder])` on Brand and `@@index([brandId, isActive, sortOrder])` on Category are composite in the exact filter-then-sort order the sidebar query uses, so Postgres can satisfy both the `WHERE` and `ORDER BY` from one index scan.

### 2.4 Migration note

Adding `brandId String` (non-null) to an existing `Product` table with rows will fail. Sequence: add nullable → backfill → (optionally) tighten. Here `brandId` is designed nullable on Product anyway, so this is safe.

---

## 3. Backend module design

Follows the layered architecture in `backend/ARCHITECTURE.md` strictly.

### 3.1 Module layout

```
src/modules/
  brand/       brand.{routes,controller,service,repository,validation,types,constant}.ts
  category/    category.{routes,controller,service,repository,validation,types,constant}.ts
  navigation/  navigation.{routes,controller,service,constant}.ts   # read-only aggregate
```

**Why a separate `navigation` module.** The sidebar needs one denormalized tree in a single request. Building that inside `brand.service` would make it depend on category *and* product internals — a cross-module import, which §5 of `ARCHITECTURE.md` forbids. `navigation` is a read-only composition module that owns its own cache namespace and its own repository (it queries via Prisma directly in `navigation.repository.ts`, which is legal — it is *its own* repository, not another module's).

### 3.2 Cache namespaces

```ts
BRAND_CACHE_NAMESPACE      = "brand"
CATEGORY_CACHE_NAMESPACE   = "category"
NAVIGATION_CACHE_NAMESPACE = "navigation"
```

`navigation` is separate so a product-name edit can invalidate the tree without dumping unrelated brand/category caches.

**Cross-namespace invalidation rule:** any mutation to Brand, Category, Product, or ProductCategory must bump **both** its own namespace **and** `navigation`. This is the single most likely source of stale-data bugs; it belongs in a documented helper:

```ts
// shared/utils/cache.ts
export async function bumpCacheVersions(...namespaces: string[]): Promise<void>
```

---

## 4. REST API design

### 4.1 The sidebar endpoint (the important one)

```
GET /api/navigation/sidebar
```

One request, entire tree, no N+1. Response:

```jsonc
{
  "success": true,
  "message": "Fetched successfully",
  "data": [
    {
      "id": "clx...",
      "name": "Apple products",
      "slug": "apple",
      "iconKey": "SiApple",
      "imageUrl": null,
      "categories": [
        {
          "id": "clx...",
          "name": "Apple iPad",
          "slug": "ipad",
          "products": [
            { "id": "clx...", "name": "iPad Pro 13\" M5 (2025)", "slug": "ipad-pro-13-m5-2025" }
          ]
        }
      ]
    }
  ]
}
```

Deliberately **not paginated** — it is a bounded navigation menu, not a list. Bounding is enforced by caps (§9.2) instead.

Only active rows, already sorted by `sortOrder`, so the frontend renders the array as-is with zero client-side sorting. `products` is always an array (possibly empty) — never `null` — to keep the `.length > 0` chevron checks working.

### 4.2 Management endpoints

Standard CRUD per resource, cursor-paginated lists per `ARCHITECTURE.md` §6:

```
GET    /api/brands            ?cursor=&limit=&includeInactive=
POST   /api/brands
GET    /api/brands/:id
PATCH  /api/brands/:id
DELETE /api/brands/:id
PATCH  /api/brands/reorder            { items: [{ id, sortOrder }] }

GET    /api/categories        ?brandId=&parentId=&cursor=&limit=
POST   /api/categories
GET    /api/categories/:id
PATCH  /api/categories/:id
DELETE /api/categories/:id
PATCH  /api/categories/reorder        { items: [{ id, sortOrder }] }

POST   /api/categories/:id/products   { productId, sortOrder }   # attach
DELETE /api/categories/:id/products/:productId                   # detach
PATCH  /api/categories/:id/products/reorder
```

**Reorder is a dedicated bulk endpoint, not N sequential PATCHes** — one transaction, one cache bump, no torn intermediate ordering visible to the storefront.

### 4.2b Image endpoints

The `status`/`tries`/`lastError` design implies uploads are asynchronous, so the API must expose the lifecycle rather than pretending upload is instant:

```
POST   /api/images                    { ownerType, ownerId, localPath }  → 201, status=pending
GET    /api/images?ownerType=&ownerId=
PATCH  /api/images/:id                { sortOrder, alt }
DELETE /api/images/:id
PATCH  /api/images/reorder            { items: [{ id, sortOrder }] }
```

The dashboard creates the row, gets back `status: pending`, and shows a placeholder with a spinner. A worker (out of scope for this plan — likely a separate process, not an Express route) transitions `pending → processing → uploaded | failed`, incrementing `tries` and writing `lastError` on failure. The dashboard polls or refetches to reveal the final image.

**The dashboard must render `failed` explicitly** — a retry button, with `lastError` visible. The whole point of persisting `tries`/`lastError` is that failures surface instead of vanishing; a UI that only handles `uploaded` throws that away.

### 4.3 Route ordering hazard

`announcement.routes.ts` already gets this right, and it must be repeated: `GET /sidebar` must be registered **before** `GET /:id`, or Express 5 matches `:id = "sidebar"`.

---

## 5. Frontend consumption

### 5.1 Server Component conversion

Per `frontend/CLAUDE.md`, everything is a Server Component by default and there is no client-side query library. Today the sidebar is `"use client"` *only* because hover needs `useState`. Split it:

```
category-sidebar.tsx          → Server Component: fetches, renders nothing interactive
  └── category-sidebar-view.tsx → "use client": receives data as props, owns hover state
```

```tsx
// category-sidebar.tsx (server)
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

async function getSidebar(): Promise<SidebarBrand[]> {
  try {
    const res = await fetch(`${API_URL}/api/navigation/sidebar`, {
      next: { revalidate: 300, tags: ["navigation"] },
    })
    if (!res.ok) return []
    return (await res.json()).data ?? []
  } catch {
    return []          // degrade to no sidebar, never crash the layout
  }
}
```

This matches the existing resilience pattern in `lib/products.ts` and `announcement-bar.tsx` — both already swallow errors and fall back. The sidebar lives in the root layout, so an unhandled throw would take down **every** page.

### 5.2 The icon problem

`icon: IconType` is a component reference and cannot be serialized from JSON. Solution — an explicit allowlist map on the client:

```ts
// frontend/src/lib/brand-icons.ts
import { SiApple, SiSamsung, /* ... */ } from "react-icons/si"

const BRAND_ICONS: Record<string, IconType> = { SiApple, SiSamsung, /* ... */ }

export function resolveBrandIcon(key: string | null): IconType | null {
  return key ? BRAND_ICONS[key] ?? null : null
}
```

Why a map and not dynamic import: it keeps tree-shaking intact, and an unknown `iconKey` from the database degrades to `null` rather than crashing. **The icon rail must render a placeholder for `null`** — it aligns to brand rows by index, so a skipped icon would shift every subsequent logo out of alignment (§1.2).

The dashboard should offer this key list as a dropdown, not a free-text field.

### 5.3 What does not change

The entire JSX tree, all Tailwind classes, all fixed widths, hover handlers, and href formats stay byte-identical. Only the data *source* changes — `brands` import becomes a `brands` prop.

---

## 6. Dashboard management

### 6.1 Feature structure

Mirrors the existing `dashboard/src/features/announcements/` convention exactly (`api.ts`, `hooks.ts`, `types.ts`, page components), which is already proven in this codebase.

```
dashboard/src/features/brands/
dashboard/src/features/categories/
dashboard/src/features/navigation/     # tree view + drag-to-reorder
```

Routes: `/brands`, `/brands/new`, `/brands/:id/edit`, `/categories`, `/navigation`.

### 6.2 The navigation tree screen

The highest-value screen: a three-pane view mirroring the storefront sidebar, with inline reorder, an active/inactive toggle, and product attach/detach. Editing navigation in a UI shaped like the thing being edited removes an entire class of mistakes.

### 6.3 Reordering strategy

Client sends the **full ordered list of ids** for the affected sibling group; the server rewrites `sortOrder` as `0..n-1` in one transaction.

Rejected alternatives: fractional ranking (`sortOrder` as float) drifts toward precision loss and needs periodic renormalization; per-row PATCH loops leave the storefront observably half-reordered mid-flight. Sibling groups here are small (≤ ~50), so a full rewrite is cheap and always consistent.

### 6.4 Critical `apiFetch` fix

`dashboard/src/lib/api.ts` returns `body.data` and **discards `body.meta`**, where `nextCursor`/`hasMore` live. `fetchAnnouncements` currently papers over this with a hardcoded `?limit=50` — it silently truncates at 50 rows.

Brands/categories will hit this immediately. Fix before building on it:

```ts
export async function apiFetch<T>(path, init): Promise<T>                  // unwraps data
export async function apiFetchPaged<T>(path, init): Promise<{ data: T; meta?: Meta }>
```

---

## 7. Dashboard → storefront propagation

Four layers must all invalidate, or an admin edit appears to do nothing:

| Layer | Mechanism | Staleness |
|---|---|---|
| Redis | `bumpCacheVersions("brand", "navigation")` after every mutation | immediate |
| Next.js `fetch` | `next: { revalidate: 300, tags: ["navigation"] }` | ≤ 5 min |
| Dashboard | TanStack Query `invalidateQueries` | immediate |
| Browser | no client cache on the endpoint | n/a |

**Layer 2 is the weak link.** Redis clears instantly, but Next.js still serves its own cached fetch for up to 5 minutes, so an admin sees no change and assumes failure.

Two options:

- **Simple:** drop `revalidate` to 60s and document the delay.
- **Correct (recommended):** add `POST /api/revalidate` to the frontend (shared-secret protected) that calls `revalidateTag("navigation")`; the backend pings it after mutations. Propagation becomes sub-second.

Recommend shipping the simple version first and the webhook as a fast follow — the webhook adds a frontend→backend coupling that deserves its own review.

---

## 8. Hover, nesting, ordering, visibility

**Hover stays entirely client-side.** The backend must not model hover, "active", or "open" state — those are per-user, per-moment UI concerns. Sending them from the server would make the response uncacheable, which defeats the whole design. `activeBrand`/`activeCategory` remain `useState`.

**Ordering** is server-authoritative: every level is returned pre-sorted by `(sortOrder ASC, name ASC)`. The `name` tiebreaker guarantees a stable, deterministic order when an admin leaves several `sortOrder`s at the default `0` — without it, Postgres may return equal-`sortOrder` rows in a different order per query and the icon rail alignment (§1.2) becomes nondeterministic.

**Visibility** is `isActive` at all three levels, filtered server-side. Additional rule: **a category with zero active products still renders** (it is a valid link target, and the chevron correctly hides via `products.length > 0`), but **a brand with zero active categories is excluded** — it would render an unresponsive dead row.

**Nesting** — `parentId` exists but the v1 sidebar query fetches only `parentId: null`. Deeper levels are storable but not yet displayed; rendering them is a follow-up requiring a fourth flyout column, which is a UI change and therefore out of scope here.

---

## 9. Performance, caching, validation, scalability

### 9.1 Query strategy

One `findMany` on Brand with nested `include` for categories → products → a Prisma-generated join, not N+1. `select` only the six fields the sidebar renders; never `include: { products: true }` with full rows — the flyout needs `id`, `name`, `slug` only, and pulling `priceCents`/timestamps/SEO for ~90 products inflates the payload for nothing.

**Do not join `Image` in this query.** Product images are irrelevant to the sidebar (it renders text rows), and brand logos come from the denormalized `Brand.imageUrl` column precisely so this query stays a two-level include (§2.3c). Adding `include: { images: true }` here would multiply the row count by the gallery size and pull upload bookkeeping into the hottest read in the app.

Expected: ~14 brands × ~3 categories × ~4 products ≈ 200 rows, one round trip, well under 50ms warm.

### 9.2 Caching and payload bounds

`CACHE_TTL.LONG` — navigation is reference data that changes rarely. Cache key is static (`"sidebar"`) since the response is identical for every visitor; correctness comes from version bumping (§3.2), not key variation.

Because the endpoint is unpaginated, bound it explicitly: **cap products per category at 12** (`take: 12` in the query) and treat >100 brands as a design smell. Twelve rows fill the 46px-row flyout past a typical viewport; more is unusable UI anyway. Without this cap, one category with 5,000 products silently produces a multi-megabyte navigation payload.

### 9.3 Validation

Zod schemas per `ARCHITECTURE.md`. Notable rules:

- `slug`: `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` — URL-safe, matches existing data.
- `iconKey`: `z.enum([...])` against the same allowlist the frontend map uses, so an unrenderable key cannot be persisted.
- `parentId`: must not equal the row's own `id`, and must not create a cycle.
- `sortOrder`: `z.number().int().min(0)`.

### 9.4 Scalability guards

- **Cycle prevention:** before setting `parentId`, walk ancestors; reject if the target is a descendant. Without this, one bad edit makes the recursive read hang forever.
- **Depth cap:** hard limit of 3 levels in the service, rejected with `ApiError.badRequest`.
- **Slug immutability:** changing a slug breaks live URLs and any external link. Either forbid it after creation or add a redirect table. Recommend forbidding in v1.

### 9.5 Seeding

The 14 brands / ~35 categories / ~90 products in `brands.ts` become `prisma/seed.ts`, preserving array order as `sortOrder` so the seeded sidebar is pixel-identical to today's. This doubles as the migration's acceptance test: seed, load, compare against the current render.

---

## 10. Maintainability improvements (no UI change)

1. **Delete `frontend/src/lib/data/categories.ts`** — dead code describing a contradictory hierarchy (§1.3). Confirm first.
2. **Split the sidebar into server/client halves** (§5.1) — better SEO and less client JS, identical output.
3. **Extract the repeated flyout column** — the category and product flyouts share a long, duplicated `className`. One `<FlyoutColumn>` component, same markup.
4. **Fix `apiFetch` meta discarding** (§6.4) — a latent bug that this feature will expose.
5. **Reconcile `schema.prisma` with the generated client** (§1.3) — the drift is real today and will cause a confusing "where did Banner go" moment on the next `prisma generate`.
6. **Extract the magic numbers** — `top-[102px]` and `left-[314px]` are hand-computed from the 64px rail + 250px column and the brand-mark height. As named constants (or CSS variables) they stop being silently wrong when a width changes.

---

## 11. Suggested sequencing

| Phase | Work | Ships |
|---|---|---|
| 1 | Schema + migration + seed; reconcile drift (§1.3) | DB matches current data |
| 2 | `brand` + `category` modules, CRUD + reorder | API testable via curl |
| 3 | `navigation` module + `/sidebar` + caching | Endpoint returns exact tree |
| 4 | Frontend: server/client split, icon map, consume API | **UI identical, now dynamic** |
| 5 | Dashboard: brands, categories, tree screen | Admins can manage |
| 6 | `revalidateTag` webhook (§7); optional deeper nesting | Sub-second propagation |
| 7 | `Image` + `ProductSeo` tables, image endpoints, upload worker | Media + SEO manageable |

Phases 1–6 deliver the sidebar; **phase 7 is the product-media/SEO work** and is independent of it. The sidebar renders text rows only and never touches `Image` or `ProductSeo` (§9.1), so the two tracks can proceed in either order — or in parallel. Sequenced last here because the sidebar is the stated goal; promote it if the PDP is the higher priority.

Phase 4 is the verification gate: the storefront must be visually indistinguishable from today. Screenshot before and after.

---

## 12. Open questions

1. **Delete `categories.ts`?** Confident it is dead, but it may be scaffolding for planned work.
2. **`name` vs. display label** — "Apple products" is a label; the brand is "Apple". Store both (`name` + `displayName`), or keep one? Affects whether `/products?brand=apple` pages can show a clean "Apple" heading.
3. **Product ↔ category cardinality** — this plan allows many-to-many. If a product only ever belongs to one category, a simple `categoryId` FK is meaningfully simpler.
4. **Auth** — there is no auth middleware anywhere in the backend today. The management endpoints are write-capable and currently would be **fully public**. This needs resolving before deployment, and is arguably a prerequisite rather than a follow-up.

5. **Who runs the upload worker?** The `Image` design assumes a process transitioning `pending → uploaded`. Options: a `setInterval` inside the API process (simple, but couples upload throughput to request handling and breaks with >1 replica), a separate Node process, or a real queue (BullMQ — Redis is already a dependency). Recommend BullMQ, but it is a genuine infrastructure decision.

6. **Which CDN?** `publicId` is Cloudinary's vocabulary. If Cloudinary is the target, the field is right; if it is S3/R2, `publicId` should be `objectKey` and the worker differs. Worth settling before the worker is written.

7. **Should `Product.rating` be stored?** Kept as a denormalized column here (matching the reference model), but with no `Review` table it can only be set manually. Once reviews exist, it must become a maintained aggregate or a computed value — otherwise it silently drifts from reality.

8. **Variants** — deliberately excluded (§2.3b). If products genuinely need per-variant stock/price/images, that is a design pass of its own and should be planned before the product module is built, not retrofitted after.
