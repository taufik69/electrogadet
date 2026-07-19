# Banner — Implementation Plan

Backend-driven promo banners for the storefront's homepage carousel, with dashboard management and worker-based image upload.

**Status:** implemented — backend, dashboard, and storefront all wired and verified end-to-end.

---

## 1. Current frontend analysis

### 1.1 What renders today

`frontend/src/app/_components/promo-carousel.tsx` is a **client component** (`"use client"`) importing a hardcoded array from `frontend/src/lib/data/promos.ts` (4 slides). It's rendered by `hero-row.tsx` on the homepage.

The shape it consumes today — this is the **legacy hardcoded shape being replaced**, not the new model (see §2.2 for that):

```ts
interface PromoSlide {
  eyebrow?: string; // ✗ DROPPED — "NEW SEASON" kicker, not in the new model
  title: string; // ✓ kept — supports "\n" for a manual line break
  subtitle: string; // ✓ kept — becomes `description`
  imageUrl: string; // ✓ kept — but as an Image row, not a column (§2.1)
  href: string; // ✗ DROPPED — banners become display-only
}
```

### 1.2 Layout and interaction contract

| Detail        | Value                                                        | Notes                                     |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- |
| Card aspect   | `aspect-[4/3]`                                               | fixed; images are `fill` + `object-cover` |
| Cards visible | 1 on mobile, 2 on `sm:` (`w-[calc(50%-2px)]`)                | horizontal snap-scroll track              |
| Scroll        | `snap-x snap-mandatory`, `overflow-x-auto`, scrollbar hidden | arrows call `scrollBy`                    |
| Text overlay  | absolute, bottom-anchored, over a `from-black/55` gradient   | white text                                |

Critical details the backend must respect:

- **Scroll/arrow state is 100% client-side.** `useRef` + `scrollBy`. The backend supplies _data_, never carousel position.
- **`title` currently contains a literal `\n`** (`"Premium sound,\nengineered for calm."`) rendered via `whitespace-pre-line`. A DB-sourced title can carry `\n` the same way — the CSS already handles it, no frontend change needed.
- **Images are `fill`** inside a fixed `4/3` box, so any uploaded aspect ratio crops to fit. Worth surfacing in the dashboard upload hint.

### 1.3 Scope decisions (confirmed)

Two fields present in the current UI are **deliberately dropped** from the model, per requirements:

| Dropped   | Consequence                                                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `eyebrow` | The uppercase "NEW SEASON" / "NEW" kicker is removed from the carousel design. `promo-carousel.tsx` loses its `{slide.eyebrow && ...}` block. |
| `href`    | Banners are **display-only** — the card stops being a `<Link>` and becomes a plain `<div>`. Clicking a banner no longer navigates anywhere.   |

Both are intentional simplifications. Flagging them because the rendered result will visibly differ from the current design — if either is wanted later it's an additive migration (nullable column + optional render), not a rewrite.

**`frontend/src/lib/data/promos.ts` becomes dead code** once the carousel is wired to the API. Delete it in the same change, the way `demo-catalog.ts` was flagged — leaving a stale hardcoded copy alongside live data is how the two silently diverge.

---

## 2. Database schema

### 2.1 Design decision: no denormalized `imageUrl`

Two precedents exist in this codebase:

| Model                | Approach                                              | Why                                                                                              |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `Brand` / `Category` | denormalized `imageUrl` column, written by the worker | the sidebar query must stay a two-level `include` and never join `Image` (navigation spec §2.3c) |
| `Product`            | **no image column**, joins `Image` by `ownerId`       | the PDP already fetches the full gallery, so a denormalized column saves nothing                 |

**Banner follows `Product`.** The requirement is explicitly "image property similar to product". The carousel query fetches at most a handful of rows and needs exactly one image each — the same batched `findImagesByOwners` merge that `product.service.ts` already does covers it, with no extra column to keep in sync. This also means the worker needs **no** `writeDenormalizedImageUrl` branch for banners.

Trade-off: one extra query per banner-list read (batched, not N+1). Accepted — banners are cached (§6) and the list is small.

### 2.2 Schema

```prisma
model Banner {
  id          String  @id @default(cuid())
  title       String
  description String
  isActive    Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([isActive, createdAt(sort: Desc)])
}
```

That is the whole model — no `slug` (banners are never addressable by URL), no `sortOrder` (ordering is `createdAt`, §2.4), no image column (§2.1), no link/eyebrow (§1.3).

`description` is **required** (`String`, not `String?`) because the carousel always renders a subtitle line; a nullable column would let a banner render with an empty gap.

### 2.3 Image ownership

Add one value to the existing enum:

```prisma
enum ImageOwnerType {
  product_gallery
  product_thumbnail
  seo_og
  brand
  category
  banner        // ← new
}
```

`Image.ownerId` holds the `Banner.id`. As with every other owner type there is **no FK** — that's the documented trade-off of the polymorphic table (schema.prisma "Media" section), and it means banner deletion must clean up its own images (§4.4).

A banner has **exactly one** image. Enforced in the service (§4.2), not the schema — the `Image` table has no per-owner uniqueness constraint and adding one would be a partial unique index across two columns for a single owner type, which is more machinery than a service-level check.

### 2.4 Ordering

`createdAt DESC` — newest banner first. No `sortOrder` column, per requirements. The `@@index([isActive, createdAt(sort: Desc)])` serves the storefront's exact query (`WHERE isActive = true ORDER BY createdAt DESC`).

**Known limitation:** the admin cannot manually reorder banners. To move a banner to the front they must recreate it. If reordering is requested later, it's an additive migration (`sortOrder Int @default(0)`) mirroring `Brand`/`Category`.

### 2.5 Migration

One migration, two changes:

```sql
-- add the enum value
ALTER TYPE "ImageOwnerType" ADD VALUE 'banner';

-- create the table
CREATE TABLE "Banner" ( ... );
CREATE INDEX "Banner_isActive_createdAt_idx" ON "Banner"("isActive", "createdAt" DESC);
```

Non-destructive — new table, new enum value, no existing column touched.

> **Postgres note:** `ALTER TYPE ... ADD VALUE` cannot run inside a transaction block in older Postgres versions, and Prisma wraps migrations in one. If `prisma migrate dev` fails on this, split it into two migration files (enum first, table second). Verify on the actual instance rather than assuming.

---

## 3. Module layout

Mirrors every other module (`ARCHITECTURE.md` §5 — no cross-module imports):

```
src/modules/banner/
  banner.routes.ts       thin wiring
  banner.controller.ts   zod-validate → service → ApiResponse
  banner.service.ts      business rules, cache-through, ApiError
  banner.repository.ts   the only place calling prisma.*
  banner.validation.ts   zod schemas
  banner.types.ts        Create/Update input types
  banner.constant.ts     BANNER_CACHE_NAMESPACE
```

Mounted at `/api/banners` in `app.ts`, alongside the existing routers.

**Image reads stay inside the module.** Like `product.repository.ts:findImagesByOwners`, `banner.repository.ts` queries `prisma.image` directly rather than importing `imageRepository` — cross-module imports are forbidden and `navigation.repository.ts` sets the precedent for this kind of read.

---

## 4. API surface

All responses use the standard envelope (`ApiResponse.success` → `{ success, message, data, meta? }`).

| Method   | Path                  | Purpose                                                                        |
| -------- | --------------------- | ------------------------------------------------------------------------------ |
| `GET`    | `/api/banners`        | cursor-paginated list; `?includeInactive=true` for the dashboard               |
| `GET`    | `/api/banners/active` | **storefront endpoint** — active banners only, `createdAt DESC`, no pagination |
| `GET`    | `/api/banners/:id`    | single banner                                                                  |
| `POST`   | `/api/banners`        | create                                                                         |
| `PATCH`  | `/api/banners/:id`    | update                                                                         |
| `DELETE` | `/api/banners/:id`    | delete (+ image cleanup, §4.4)                                                 |

Route order: `/active` **must** be registered before `/:id`, or Express 5 matches `"active"` as an id — the same hazard already commented in `category.routes.ts` for `/reorder`.

### 4.1 Validation (`banner.validation.ts`)

```ts
export const createBannerSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(200),
  isActive: z.boolean().optional().default(true),
});

export const updateBannerSchema = createBannerSchema.partial();

export const listBannersQuerySchema = cursorPaginationSchema.extend({
  includeInactive: z.coerce.boolean().optional().default(false),
});
```

`max(120)` / `max(200)` are display-driven: the title sits in a fixed `4/3` card over an image, and the subtitle is a single `text-small` line. Longer strings overflow the gradient and look broken. These are the same style of constraint as `ProductSeo.metaTitle @db.VarChar(70)`.

### 4.2 Image upload flow

**No new endpoint.** Reuse the existing generic `POST /api/images` with `ownerType: "banner"`, `ownerId: <bannerId>` — exactly how the dashboard already uploads brand, category, and product images.

Ordering constraint, same as product create: **the banner must exist before its image can be uploaded**, because `ownerId` is required. The dashboard therefore does create → then upload (§7.2).

Single-image enforcement goes in `image.service.ts:createImage`, extending the check already there for `product_gallery`:

```ts
if (input.ownerType === "banner") {
  const count = await imageRepository.countByOwner("banner", input.ownerId);
  if (count >= 1) throw ApiError.conflict("A banner can only have one image");
}
```

Replacing a banner image is therefore delete-then-upload, not upload-and-replace. Simpler than a swap, and the delete already enqueues Cloudinary cleanup.

### 4.3 Response shape

`banner.service.ts` merges the image in before responding, mirroring `product.service.ts:attachImages`:

```jsonc
{
  "id": "clx...",
  "title": "Premium sound,\nengineered for calm.",
  "description": "Precision audio built to last.",
  "isActive": true,
  "createdAt": "2026-07-19T...",
  "updatedAt": "2026-07-19T...",
  "image": {
    // null until the worker finishes
    "id": "clx...",
    "url": "https://res.cloudinary.com/...",
    "status": "uploaded", // pending | processing | uploaded | failed
    "alt": null,
  },
}
```

`image` is `null` — never omitted — when no image exists yet, so the frontend's `banner.image?.status` check is stable.

### 4.4 Deletion and orphan cleanup

`Image.ownerId` has no FK, so deleting a `Banner` row leaves its `Image` row behind, and the Cloudinary asset behind that. `banner.service.ts:deleteBanner` must:

1. find the banner's images (`ownerType: "banner"`, `ownerId: id`)
2. delete the `Image` rows
3. enqueue a Cloudinary delete for each non-empty `publicId`
4. delete the `Banner` row
5. bump caches

This is the documented responsibility of the owning service ("orphan cleanup is handled in the service when an owner is deleted" — schema.prisma "Media" section).

> **Pre-existing gap worth noting:** brand, category, and product deletion do **not** currently do this — their images orphan silently. Banner should be written correctly, and the others are worth a follow-up fix, but that's out of scope here.

---

## 5. Worker changes

**Almost none.** `worker.ts` already handles any `ownerType` generically: it uploads to `nordvolt/<ownerType>` (→ `nordvolt/banner`), sets `url`/`publicId`/`status`, and retries 3× with backoff.

Two touch points:

1. **`writeDenormalizedImageUrl`** — no change. Its `if brand / else if category` chain already no-ops for anything else, which is correct for banner (§2.1).
2. **`cacheNamespacesForOwner`** — add a `banner` case returning `[BANNER_CACHE_NAMESPACE, IMAGE_CACHE_NAMESPACE]`. Without this the banner list cache serves a stale `image: null` for up to the TTL after an upload completes, which is exactly the "uploads never appear" class of bug already hit once on the product side.

---

## 6. Caching

Namespace `"banner"`, versioned cache-through via the existing `cached()` / `bumpCacheVersions()` helpers.

| Read            | Key                                | TTL                 |
| --------------- | ---------------------------------- | ------------------- |
| `listBanners`   | `list:cursor=…:limit=…:inactive=…` | `CACHE_TTL.DEFAULT` |
| `activeBanners` | `active`                           | `CACHE_TTL.DEFAULT` |

Bump `BANNER_CACHE_NAMESPACE` on create, update, delete, **and** on image-upload completion (§5). Banners are not part of the sidebar tree, so `NAVIGATION_CACHE_NAMESPACE` is **not** bumped — same reasoning as `upsertProductSeo`.

---

## 7. Dashboard

### 7.1 Feature layout

New feature folder mirroring `brand/`, per the dashboard's feature-based architecture:

```
dashboard/src/features/banner/
  api/banner.api.ts, api/banner-image.api.ts
  hooks/useBanners.ts
  components/banner-form.tsx, components/delete-banner-dialog.tsx
  pages/BannersPage.tsx, CreateBannerPage.tsx, EditBannerPage.tsx
  types/banner.types.ts
  index.ts
```

Routes `/banners`, `/banners/new`, `/banners/:id/edit`, lazy-loaded through the barrel like every other feature. Sidebar nav entry added in `app-sidebar.tsx`.

### 7.2 Create flow

Same create-then-upload sequence as product, for the §4.2 ordering reason:

1. `POST /api/banners` → get `id`
2. `POST /api/images` with `ownerType: "banner"`, `ownerId: id` (fire-and-forget)
3. stay on the page, reset the form (matching the product create page's current behavior)

### 7.3 Form fields and validation

| Field       | Required | Notes                                                                                      |
| ----------- | -------- | ------------------------------------------------------------------------------------------ |
| Title       | ✅       | max 120; textarea, since `\n` is meaningful (§1.2)                                         |
| Description | ✅       | max 200                                                                                    |
| Image       | ✅       | client-side gate — the file isn't an RHF field, same manual check as the product thumbnail |
| Active      | —        | switch, defaults on                                                                        |

Required fields get the red `*` marker already used across the product/brand/category forms.

### 7.4 Image polling

`useBanner`/`useBanners` poll at 1.5s while `image.status` is `pending` or `processing`, stopping once settled — the exact pattern `useProduct` uses. Without it the dashboard shows a blank thumbnail until manual refresh.

---

## 8. Frontend (storefront) changes

| File                      | Change                                                                                                                                                                                                                                                                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/banners.ts`      | **new** — `fetchActiveBanners()` hitting `/api/banners/active` with `cache: "no-store"`, degrading to `[]` on failure (same pattern as `fetchProducts`/`fetchSidebar`)                                                                                                                                                                        |
| `src/lib/types/banner.ts` | **new** — `Banner` type matching §4.3                                                                                                                                                                                                                                                                                                         |
| `promo-carousel.tsx`      | becomes a **server component** that fetches, or keeps `"use client"` and receives `banners` as a prop from a server parent. **Prefer the latter** — the arrows need `useRef`/`useState`, so the interactive shell must stay client-side; `hero-row.tsx` fetches and passes down. Remove the `eyebrow` block; unwrap `<Link>` → `<div>` (§1.3) |
| `src/lib/data/promos.ts`  | **delete** (§1.3)                                                                                                                                                                                                                                                                                                                             |

Render only banners whose `image.status === "uploaded"` — a `pending` banner has an empty `url` and would render a broken image. If no banner qualifies, render nothing rather than an empty carousel shell.

---

## 9. Open questions

1. **Empty state.** If zero active banners exist, the homepage hero row collapses. Should the carousel hide entirely, or fall back to a static placeholder? Spec assumes hide.
2. **Image dimensions.** Cards are `4/3` and `object-cover`, so tall or very wide uploads crop hard. Should the backend reject images outside a ratio range, or is a dashboard hint ("recommended 1200×900") enough? Spec assumes the hint.
3. **Auth.** Every mutating banner endpoint is public, like every other endpoint in this backend. This remains the unresolved question flagged in the navigation spec §12.4 — not introduced here, but banner adds four more unprotected write routes.
4. **`alt` text.** The `Image` table has an `alt` column that nothing currently sets. Banners are decorative-with-adjacent-text so `alt=""` is defensible, but if these should be accessible on their own, `alt` needs a dashboard field.
