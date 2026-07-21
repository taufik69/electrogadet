# Article — Implementation Plan

Backend-driven editorial articles (blog/buying-guide posts) for the storefront's "Articles" homepage row and a dedicated article listing + detail page, with dashboard authoring and worker-based cover image upload.

**Status:** spec — not yet implemented.

---

## 1. Current frontend analysis

### 1.1 What the design shows

The homepage "Articles" section (screenshot) is a three-up row:

- Section header `Articles` with an `All articles` link on the right — implies a **listing page** at `/articles` exists, not just the homepage row.
- Each card: cover image (`~16/9`, rounded, `object-cover`), then a **2-line-clamped title**, then a meta line: **published date** (`June 14, 2026`) and a **view count** with an eye icon (`15,300`).
- Cards are clickable — an article is an addressable page, unlike `Banner` (which is display-only). That means a **`slug` is required**, generated server-side from the title (§2.10).

### 1.2 Fields the design demands

| Rendered              | Model field                | Notes                                                |
| --------------------- | -------------------------- | ---------------------------------------------------- |
| cover image           | `Image` row, `ownerType: article_cover` | §2.3 — joined, not denormalized         |
| title                 | `title`                    | clamped to 2 lines in the card; max 160 (§4.1)       |
| `June 14, 2026`       | `publishedAt`              | **not** `createdAt` — see §2.4                       |
| `15,300` + eye icon   | `viewCount`                | denormalized counter, §2.5                           |
| card link target      | `slug`                     | `/articles/<slug>`                                   |

Not visible on the card but required by the detail page: `content` (the body) and SEO fields (§2.6). There is deliberately **no `excerpt`** — the design shows no summary line, and the SEO consequence of dropping it is handled in §2.11.

### 1.3 Scope decisions

| Decision | Rationale |
| -------- | --------- |
| **No author model.** A `String?` `authorName` column only. | There is no `User` model in this backend yet. Introducing one for a byline would pull in auth, which is explicitly unresolved repo-wide (banner spec §9.3). A nullable string is an additive migration away from a real FK later. |
| **No categories/tags relation.** `tags String[]` only. | Mirrors `Product.tags`. An `ArticleCategory` join table is speculative until the design shows filtering. |
| **No comments.** | Out of scope; would need auth and moderation. |
| **Content is Markdown in a `String` column**, not a rich-text JSON blob. | §2.7. |

---

## 2. Database schema

### 2.1 Placement

New `// ─── Editorial ───` section in `prisma/schema.prisma`, after `// ─── Marketing ───` (Banner).

### 2.2 Schema

```prisma
/// Editorial article (blog post / buying guide). Unlike Banner, articles are
/// addressable by URL, so `slug` is required and unique the way Product's is.
model Article {
  id    String @id @default(cuid())
  title String
  /// Derived server-side from `title` (slugify + -2/-3 collision suffix), never
  /// client-supplied — see spec §2.10.
  slug  String @unique
  /// Markdown body — see spec §2.7 for why not Json.
  content String

  /// Nullable: there is no User model yet (spec §1.3). Additive path to a real
  /// FK later.
  authorName String?
  tags       String[]

  status      ArticleStatus @default(draft)
  /// Set when status first flips to published; the date rendered on every card.
  /// Nullable because a draft has no publish date. See spec §2.4.
  publishedAt DateTime?

  /// Denormalized counter, incremented fire-and-forget on detail reads.
  /// Not derived from an event table — see spec §2.5.
  viewCount Int @default(0)

  seo ArticleSeo?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Serves the storefront's exact query:
  // WHERE status = 'published' ORDER BY publishedAt DESC.
  @@index([status, publishedAt(sort: Desc)])
  @@index([createdAt(sort: Desc)])
}
```

### 2.3 Cover image

Follows **`Banner`/`Product`**, not `Brand`/`Category`: join `Image` by `ownerId`, no denormalized `imageUrl` column. Articles are never part of the sidebar tree, so the two-level-include constraint that forced denormalization there (navigation spec §2.3c) does not apply.

Add one enum value:

```prisma
enum ImageOwnerType {
  product_gallery
  product_thumbnail
  seo_og
  brand
  category
  banner
  article_cover   // ← new
}
```

Named `article_cover` rather than `article` to leave room for inline body images (`article_body`) without a rename.

An article has **exactly one** cover. Enforced in `image.service.ts:createImage` (§4.4), the same service-level check banner uses — the `Image` table has no per-owner uniqueness constraint.

`Image.ownerId` has no FK, so article deletion must clean up its own images (§4.5).

#### 2.3a No schema change to `Image` — the worker columns are internal

**`localPath`, `status`, `tries`, and `lastError` stay on the `Image` table exactly as they are.** They are not decoration — they *are* the deferred-upload mechanism, and removing any of them removes the queue:

| Column      | Who writes it            | What breaks without it                                                        |
| ----------- | ------------------------ | ------------------------------------------------------------------------------ |
| `localPath` | multer (via `image.middleware.ts`), cleared by the worker | The worker is a **separate process** (`src/worker.ts`, run via `npm run worker`). It receives only a job payload and finds the staged file by path. No path, nothing to upload. Persisting it on the row is also what makes retry-after-crash possible. |
| `status`    | worker                   | `pending → processing → uploaded \| failed` is how the dashboard knows when to stop polling and swap the placeholder for the real image (§7.4). |
| `tries`     | worker                   | BullMQ retries 3× with backoff; `tries` is what makes an attempt count visible rather than silent. |
| `lastError` | worker                   | A failed Cloudinary upload would vanish entirely — the dashboard could not explain why an image never appeared. |

What *should* be hidden is these columns leaking into the article API response. The consumer of `GET /api/articles` has no use for `localPath` or `tries`. So the service projects a **slim cover shape** before responding (§4.3), rather than spreading the raw `ImageModel` the way `banner.service.ts` currently does.

#### 2.3b Upload lifecycle (already implemented — reuse, don't rebuild)

`src/worker.ts:handleUploadJob` already performs every step requested, generically for any `ownerType`:

1. `POST /api/images` — multer stages the file to `tmp/uploads`, `image.service.ts:createImage` inserts the row as `status: pending` with `localPath`, then calls `enqueueImageUpload(...)`.
2. The worker picks the job up, sets `status: processing`.
3. `cloudinaryFileUpload(localPath, { folder: "nordvolt/article_cover" })`.
4. On success it writes `url`, `publicId`, `status: "uploaded"`, **`localPath: ""`**, and clears `lastError`.
5. **`await fs.unlink(localPath)`** — the staged local file is deleted once Cloudinary has it. This is the "remove the image from local file" step, and it already exists (`worker.ts`, after the denormalization call).
6. Cache namespaces for the owner are bumped (§5).

On failure it records `status: "failed"` + `lastError`, and only unlinks the local file once `job.attemptsMade + 1 >= MAX_LOCAL_FILE_RETENTION_ATTEMPTS` — the file is deliberately *retained* between retries so a transient Cloudinary outage doesn't lose the upload.

**Article needs no new worker code for the happy path.** The only required worker change is the `cacheNamespacesForOwner` case (§5).

#### 2.3c Replace-on-edit

`ImageJobData` already carries an optional **`oldPublicId`**, and the worker already honours it — after a successful upload it fires `deleteCloudinaryFile(oldPublicId)`, detached and `.catch()`-logged.

That ordering is the important part and must be preserved: the old asset is destroyed **only after the new one is confirmed uploaded**. Deleting first would leave the article with no image at all if the new upload then failed.

Cover replacement therefore is:

```
PATCH cover → create new Image row (pending, localPath)
            → enqueue upload with oldPublicId = <existing cover's publicId>
            → delete the OLD Image row from Postgres
            → worker uploads new, then deletes old Cloudinary asset
```

The old **row** is deleted synchronously (so the single-cover invariant in §4.4 holds and the article never briefly shows two covers), while the old **Cloudinary asset** is deleted asynchronously by the worker. Do not route the old asset through `enqueueImageDelete` here — that would race the upload job and could delete the old image before the replacement lands.

### 2.10 Slug is generated server-side

**The client never sends a slug.** `article.service.ts` derives it from `title` using the existing `generateSlug()` in `shared/utils/slug.ts` (which wraps `slugify` with `{ lower: true, strict: true }` — already a dependency), then resolves collisions with a `-2`, `-3`, … suffix.

This reuses `product.service.ts:generateUniqueSlug` verbatim in shape:

```ts
async function generateUniqueSlug(title: string): Promise<string> {
  const base = generateSlug(title)
  let slug = base
  let suffix = 2
  while (await articleRepository.findBySlug(slug)) {
    slug = `${base}-${suffix}`
    suffix += 1
  }
  return slug
}
```

Article slugs are globally unique, like product's, so a same-titled article appends rather than rejecting the create.

**On update, the slug is deliberately *not* regenerated when the title changes.** Once an article is published, its URL is in search indexes and inbound links; silently changing it on a typo fix would 404 every existing link. `slug` is therefore write-once at create time.

> If renaming a published article's URL is ever needed, it requires a redirect table (`old slug → new slug`) rather than a bare column update. Out of scope — flagged as open question 9.

Two consequences worth stating:

- A title of only non-latin characters or punctuation slugifies to `""`. `generateSlug` with `strict: true` strips them, so `"???"` yields an empty slug and then an empty-but-unique `-2`. The service must guard: if the base slug is empty, fall back to `article-<short id fragment>`.
- `title` max is 160 (§4.1), so the slug can be long. Postgres handles it; it's only ugly. No truncation, to keep it a pure function of the title.

### 2.11 No `excerpt` — what replaces it

`excerpt` is dropped per requirements. It had two jobs; each needs a different answer, and neither is free:

**1. Card summary.** Nothing lost — the design (§1.1) renders only cover, title, date, and view count. No card shows a summary. This is why dropping it is safe for the listing.

**2. SEO `metaDescription` fallback.** This one has a real cost. The chain was `seo.metaDescription → excerpt`. Without `excerpt`, the fallback becomes a **truncation of `content`**:

```ts
/** First ~155 chars of the body, Markdown syntax stripped — the <meta name="description">
 *  fallback now that excerpt is gone (spec §2.11). */
function deriveMetaDescription(content: string): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")      // fenced code blocks
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links/images → their text
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return plain.length <= 155 ? plain : `${plain.slice(0, 152).trimEnd()}…`
}
```

That is strictly worse than an authored summary — a body opening with "In this article we'll look at…" produces a useless search snippet. **Mitigation: `ArticleSeo.metaDescription` should be treated as effectively required in the dashboard** (§7.3) for any article being published, with the truncation as a last-resort default rather than the expected path.

Derived at read time, not stored — a stored copy would silently drift from `content` on every edit.

> If article cards later need a summary line, `excerpt` comes back as a nullable column. Additive, no backfill needed.

### 2.4 `publishedAt` vs `createdAt`

The card renders `June 14, 2026`. That must be `publishedAt`, not `createdAt`: an article drafted in March and published in June should display June. Ordering is `publishedAt DESC`, so back-dating an import is possible without touching row-creation order.

Rules, enforced in the service (§4.6):

- `publishedAt` is set to `now()` the first time `status` transitions `draft → published`, unless the caller passes an explicit value (allows back-dating).
- It is **not** cleared when unpublishing — re-publishing preserves the original date. Clearing would make "unpublish to fix a typo" silently reorder the listing.
- `publishedAt` is never non-null while `status = draft` at creation; a draft created with an explicit `publishedAt` is a 400.

### 2.5 `viewCount` as a denormalized counter

A column incremented via `prisma.article.update({ data: { viewCount: { increment: 1 } } })` on each detail read, rather than an `ArticleView` event table aggregated at read time.

Trade-off, stated plainly: **this loses all analytics** — no unique visitors, no time series, no referrer. It buys an O(1) read for a number that appears on every card. The design shows only a total, so the event table would be built and never queried.

Three consequences to design around:

1. **The increment must not block the response.** Fire-and-forget after the response is sent; a counter write failure must never 500 a page view.
2. **It is trivially inflatable** (refresh loop, bot traffic). Accepted — this is a vanity metric, not billing. No dedupe.
3. **Cache interaction.** The detail read is cached (§6). If every increment bumped the article cache namespace, the cache would be useless — every read would invalidate itself. **Increments deliberately do not bump the cache**, so the displayed count is stale by up to one TTL. That is correct behavior for this field and must be commented at the call site, or someone will "fix" it later.

### 2.6 SEO

Articles are the most SEO-sensitive content in the storefront, so they get a dedicated table mirroring `ProductSeo` exactly — same columns, same `@db.VarChar` limits, same `onDelete: Cascade`:

```prisma
model ArticleSeo {
  id        String  @id @default(cuid())
  articleId String  @unique
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)

  metaTitle       String?     @db.VarChar(70)
  metaDescription String?     @db.VarChar(200)
  metaKeywords    String[]
  canonicalUrl    String?
  focusKeyword    String?
  ogTitle         String?     @db.VarChar(70)
  ogDescription   String?     @db.VarChar(200)
  twitterCard     TwitterCard @default(summary_large_image)
  structuredData  Json?
  noIndex         Boolean     @default(false)
  noFollow        Boolean     @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Reusing the existing `TwitterCard` enum. Fallbacks when a field is null are the frontend's job: `metaTitle → title`, `metaDescription → deriveMetaDescription(content)` (§2.11), `ogImage → cover image url`.

### 2.7 Why `content` is Markdown text, not `Json`

`ProductSeo.structuredData` is `Json` because it is "genuinely schemaless and never queried by shape". Article content is different: it's a single authored document rendered as-is.

Markdown in a `String`:
- diffs readably in the DB and in any future export
- needs no editor-specific schema (a Tiptap/Lexical JSON blob locks the content to that editor version forever)
- is trivially convertible later; the reverse is not

Cost: rendering requires a Markdown parser + **sanitization** on the frontend. Flagging that explicitly — rendering unsanitized authored HTML/Markdown is an XSS vector, and since these endpoints are unauthenticated (§9.3), it is a real one. Use `rehype-sanitize` or equivalent; do not `dangerouslySetInnerHTML` raw output.

### 2.8 New enum

```prisma
enum ArticleStatus {
  draft
  published
  archived
}
```

`archived` rather than deletion for retired content: an article that ranked in search should keep its URL resolvable and out of the listing simultaneously. `archived` articles are excluded from listings but **still resolve by slug** (§4.2) so existing inbound links don't 404.

### 2.9 Migration

One migration:

```sql
ALTER TYPE "ImageOwnerType" ADD VALUE 'article_cover';
CREATE TYPE "ArticleStatus" AS ENUM ('draft', 'published', 'archived');
CREATE TABLE "Article" ( ... );
CREATE TABLE "ArticleSeo" ( ... );
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt" DESC);
CREATE INDEX "Article_createdAt_idx" ON "Article"("createdAt" DESC);
CREATE UNIQUE INDEX "ArticleSeo_articleId_key" ON "ArticleSeo"("articleId");
```

Non-destructive. **Same Postgres hazard the banner spec hit:** `ALTER TYPE ... ADD VALUE` cannot run inside a transaction block on older Postgres, and Prisma wraps migrations in one. If `prisma migrate dev` fails, split the enum change into its own migration file ahead of the tables. Verify against the actual instance.

---

## 3. Module layout

Mirrors every other module (`ARCHITECTURE.md` §5 — no cross-module imports):

```
src/modules/article/
  article.routes.ts       thin wiring
  article.controller.ts   zod-validate → service → ApiResponse
  article.service.ts      business rules, cache-through, ApiError
  article.repository.ts   the only place calling prisma.*
  article.validation.ts   zod schemas
  article.types.ts        Create/Update input types
  article.constant.ts     ARTICLE_CACHE_NAMESPACE
```

Mounted at `/api/articles` in `app.ts`.

**Image reads stay inside the module** — `article.repository.ts` queries `prisma.image` directly, like `product.repository.ts:findImagesByOwners` and `banner.repository.ts`. Cross-module imports are forbidden.

---

## 4. API surface

Standard envelope (`ApiResponse.success` → `{ success, message, data, meta? }`).

| Method   | Path                          | Purpose                                                        |
| -------- | ----------------------------- | -------------------------------------------------------------- |
| `GET`    | `/api/articles`               | cursor-paginated list; `?status=` for the dashboard            |
| `GET`    | `/api/articles/published`     | **storefront row** — published only, `publishedAt DESC`, `?limit=3` |
| `GET`    | `/api/articles/slug/:slug`    | **storefront detail** — by slug, increments `viewCount`        |
| `GET`    | `/api/articles/:id`           | single article by id (dashboard)                               |
| `POST`   | `/api/articles`               | create                                                          |
| `PATCH`  | `/api/articles/:id`           | update                                                          |
| `PUT`    | `/api/articles/:id/seo`       | upsert SEO (mirrors `upsertProductSeo`)                        |
| `PUT`    | `/api/articles/:id/cover`     | replace cover image — old Cloudinary asset cleaned up (§4.4a)  |
| `DELETE` | `/api/articles/:id`           | delete (+ image + Cloudinary cleanup, §4.5)                    |

**Route order matters.** `/published` and `/slug/:slug` **must** be registered before `/:id`, or Express 5 matches `"published"` as an id — the hazard already commented in `category.routes.ts` for `/reorder` and `banner.routes.ts` for `/active`.

`/slug/:slug` is a nested path rather than making `/:id` polymorphic (try id, fall back to slug). Polymorphic lookup means two queries on every miss and an ambiguous 404.

### 4.1 Validation (`article.validation.ts`)

```ts
export const createArticleSchema = z.object({
  title: z.string().min(1).max(160),
  content: z.string().min(1),
  authorName: z.string().max(80).optional(),
  tags: z.array(z.string().min(1).max(40)).max(10).optional().default([]),
  status: z.enum(["draft", "published", "archived"]).optional().default("draft"),
  publishedAt: z.coerce.date().optional(),
})

export const updateArticleSchema = createArticleSchema.partial()

export const listArticlesQuerySchema = cursorPaginationSchema.extend({
  status: z.enum(["draft", "published", "archived"]).optional(),
  tag: z.string().optional(),
})
```

**No `slug` field.** It is generated server-side from `title` (§2.10) and rejected if sent — an unknown key in a zod object is stripped by default, so a client passing one is silently ignored rather than 400'd. That's the desired behavior: the slug is not part of the write contract.

**No `excerpt` field.** Dropped per requirements — see §2.11 for what fills its two former roles.

`max(160)` on title is card-driven (the card clamps to 2 lines).

### 4.2 Visibility rules

| Endpoint            | `draft` | `published` | `archived` |
| ------------------- | ------- | ----------- | ---------- |
| `/published`        | ✗       | ✓           | ✗          |
| `/articles` (no `?status`) | ✓ | ✓          | ✓          |
| `/slug/:slug`       | ✗ (404) | ✓           | ✓ (§2.8)   |

`/articles` returning everything by default is intentional — it is the dashboard's list. This is only safe because there is no auth boundary anyway (§9.3); if auth lands, the default must flip to published-only and drafts gated.

### 4.3 Response shape

`article.service.ts` merges the cover image in, mirroring `product.service.ts:attachImages` / `banner.service.ts`:

```jsonc
{
  "id": "clx...",
  "title": "iPhone 17 Pro vs iPhone 16 Pro: is the upgrade worth it in 2026?",
  "slug": "iphone-17-pro-vs-iphone-16-pro",   // server-generated (§2.10)
  "content": "## The short answer\n\n...",   // omitted from list responses, §4.3a
  "authorName": null,
  "tags": ["iphone", "comparison"],
  "status": "published",
  "publishedAt": "2026-06-14T00:00:00.000Z",
  "viewCount": 15300,
  "createdAt": "2026-06-10T...",
  "updatedAt": "2026-06-14T...",
  "coverImage": {          // null until an Image row exists — never omitted
    "id": "clx...",
    "url": "https://res.cloudinary.com/...",
    "status": "uploaded",  // pending | processing | uploaded | failed
    "alt": null
  },
  "seo": null              // null when no ArticleSeo row exists
}
```

**`coverImage` is a projection, not the raw `Image` row (§2.3a).** `article.service.ts:attachCoverImages` selects exactly four fields and drops the worker's bookkeeping:

```ts
type CoverImage = Pick<ImageModel, "id" | "url" | "status" | "alt">

// localPath / publicId / tries / lastError are worker internals (spec §2.3a).
// They stay on the table but must not reach the storefront: publicId is an
// infrastructure identifier, and localPath leaks a server filesystem path.
function toCoverImage(img: ImageModel): CoverImage {
  return { id: img.id, url: img.url, status: img.status, alt: img.alt }
}
```

`status` is the one internal field that **is** exposed, deliberately — the dashboard polls on it (§7.4) and the storefront filters on it (§8). The other three have no consumer outside the worker.

> Note: this diverges from `banner.service.ts`, which spreads the whole `ImageModel` into its response. Article is the more correct pattern; banner is worth aligning in a follow-up, but that's out of scope here.

**§4.3a — `content` is excluded from every list response.** A listing of 20 articles would otherwise ship 20 full article bodies to render three lines of card text. The repository uses an explicit `select` for list queries omitting `content`; only the two single-article reads include it. This is the single biggest payload decision in the module — do not "simplify" it by reusing one shape for both.

`coverImage` is `null`, never omitted, so `article.coverImage?.status` is a stable check.

### 4.4 Image upload flow

**No new endpoint for the initial upload.** Reuse `POST /api/images` (multipart, field `file`) with `ownerType: "article_cover"`, `ownerId: <articleId>` — exactly how brand, category, product, and banner already work. multer stages to `tmp/uploads`, the row is created `pending`, the job is enqueued, and the worker takes it from there (§2.3b).

Same ordering constraint as banner: **the article must exist before its cover can be uploaded**, since `ownerId` is required. The dashboard does create → then upload (§7.2).

Single-cover enforcement extends the existing check in `image.service.ts:createImage`, alongside the `product_gallery` and `banner` branches already there:

```ts
// image.constant.ts
export const MAX_ARTICLE_COVER_IMAGES = 1

// image.service.ts:createImage
if (input.ownerType === "article_cover") {
  const count = await imageRepository.countByOwner(input.ownerType, input.ownerId)
  if (count >= MAX_ARTICLE_COVER_IMAGES) {
    throw ApiError.conflict("An article already has a cover image — replace it instead")
  }
}
```

#### 4.4a Cover replacement endpoint

Banner's "delete then re-upload" is two round trips and leaves the banner coverless in between. Article gets a **dedicated replace endpoint** instead, so the swap is atomic from the client's perspective and the old Cloudinary asset is cleaned up automatically (§2.3c):

```
PUT /api/articles/:id/cover     multipart, field `file`
```

`article.service.ts:replaceCover`:

1. Look up the existing cover (`ownerType: "article_cover"`, `ownerId: id`); capture its `publicId`.
2. Create the new `Image` row (`pending`, `localPath` from multer).
3. `enqueueImageUpload({ imageId, ownerType, ownerId, localPath, oldPublicId })` — passing the captured `publicId` as `oldPublicId`.
4. Delete the **old `Image` row** from Postgres (keeps the single-cover invariant true).
5. Bump `ARTICLE_CACHE_NAMESPACE`.

The old Cloudinary **asset** is destroyed by the worker only after the new upload succeeds. If the article has no existing cover, this behaves identically to a first upload (`oldPublicId` undefined).

This is why the route is `PUT`, not `POST` — it's idempotent in intent: one cover, replaced.

### 4.5 Deletion and orphan cleanup

`ArticleSeo` cascades via FK. `Image` does **not** — no FK on `ownerId`. So `article.service.ts:deleteArticle` must, mirroring `banner.service.ts:deleteBanner`:

1. find images (`ownerType: "article_cover"`, `ownerId: id`)
2. delete the `Image` rows, returning their `publicId`s (`articleRepository.deleteImagesByOwner(id)`)
3. delete the `Article` row (SEO cascades)
4. `enqueueImageDelete({ publicId })` for each **non-empty** `publicId`
5. bump `ARTICLE_CACHE_NAMESPACE`

The worker's `handleDeleteJob` calls `deleteCloudinaryFile(publicId)` — that's the "remove from Cloudinary using publicId" step, already implemented.

Two details that matter:

- **Skip empty `publicId`s.** An image still `pending` has `publicId: ""` — nothing was ever uploaded, so there is nothing to delete. Enqueueing a job for `""` would fail against the Cloudinary API on every retry.
- **Enqueue after the DB rows are gone, and never let it block.** A failed Cloudinary delete costs storage; it must not roll back or 500 the deletion the admin asked for. Banner's comment on this is worth copying verbatim.

> A `pending` cover also still has a **staged local file** in `tmp/uploads`. Deleting the article orphans it — the worker will later fail to find it, exhaust its 3 retries, and unlink. Acceptable, but it means a deleted-while-uploading article leaves a failing job in the queue briefly. Not worth special-casing; noting it so the failed-job log entry isn't mistaken for a bug. **Consider soft-delete instead**: deleting a published article breaks every inbound link. `archived` (§2.8) exists precisely so hard delete is rarely the right action — the dashboard should steer toward archiving, with delete as a deliberate destructive action behind a confirm dialog.

### 4.6 Publish transition

`article.service.ts:updateArticle` owns the §2.4 rules. Concretely:

```
if (next.status === "published" && current.status !== "published") {
  publishedAt = input.publishedAt ?? current.publishedAt ?? new Date()
}
// never clear publishedAt on unpublish
```

Creating directly with `status: "published"` sets `publishedAt` the same way.

### 4.7 View increment

`getArticleBySlug` returns the cached article, then increments **after the response**, without awaiting into the request path:

```ts
// Deliberately not awaited and deliberately NOT bumping the cache namespace:
// bumping here would invalidate the article on every read (spec §2.5).
void articleRepository.incrementViewCount(id).catch(() => {})
```

The `.catch(() => {})` is required — an unhandled rejection from a detached promise takes down the process under Node's default `unhandledRejection` behavior.

Only `/slug/:slug` increments. The dashboard's `/:id` read must not, or editors inflate their own numbers.

---

## 5. Worker changes

**Exactly one line of new logic.** `src/worker.ts` already handles any `ownerType` generically — uploads to `nordvolt/<ownerType>` (→ `nordvolt/article_cover`), writes `url`/`publicId`/`status`, unlinks the local staged file, deletes `oldPublicId` when present, and retries 3× with backoff.

| Touch point                 | Change                                                                                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `handleUploadJob`           | **none** — fully generic (§2.3b)                                                                                                                                                          |
| `handleDeleteJob`           | **none** — already takes a bare `publicId` (§4.5)                                                                                                                                         |
| `oldPublicId` handling      | **none** — already implemented; article just starts passing it (§2.3c)                                                                                                                    |
| `fs.unlink(localPath)`      | **none** — already runs after a successful upload and after the retry cap on failure                                                                                                      |
| `writeDenormalizedImageUrl` | **none** — its `if brand / else if category` chain correctly no-ops for `article_cover`, since articles join `Image` rather than denormalizing (§2.3)                                     |
| `cacheNamespacesForOwner`   | **add a case** ↓                                                                                                                                                                          |

```ts
// Article list/detail reads embed the cover (spec §2.3), so without this the
// storefront serves a stale `coverImage: null` until the TTL expires.
// Articles aren't in the sidebar tree, so "navigation" is not bumped.
case "article_cover":
  return [ARTICLE_CACHE_NAMESPACE, IMAGE_CACHE_NAMESPACE]
```

Omitting that case is the "uploads never appear" bug already hit once on the product side and pre-empted for banner — and it would bite harder here, since the article detail read uses `CACHE_TTL.LONG` (§6), making the stale window an hour rather than five minutes.

---

## 6. Caching

Namespace `"article"`, versioned cache-through via the existing `cached()` / `bumpCacheVersions()` helpers, called from the **service** layer only.

| Read                 | Key                                    | TTL                 |
| -------------------- | -------------------------------------- | ------------------- |
| `listArticles`       | `list:cursor=…:limit=…:status=…:tag=…` | `CACHE_TTL.DEFAULT` |
| `publishedArticles`  | `published:limit=…`                    | `CACHE_TTL.DEFAULT` |
| `getArticleBySlug`   | `slug:<slug>`                          | `CACHE_TTL.LONG`    |
| `getArticleById`     | `id:<id>`                              | `CACHE_TTL.DEFAULT` |

`CACHE_TTL.LONG` (1h) on the detail read: article bodies are near-immutable after publish, and it's the hottest single-row read. The cost is that `viewCount` (§2.5) and post-publish typo fixes are visible up to an hour late — the typo case is covered because updates bump the namespace, so only the counter lags.

Bump `ARTICLE_CACHE_NAMESPACE` on create, update, SEO upsert, delete, and image-upload completion (§5). **Not** on view increment (§2.5).

Articles are not in the sidebar tree, so `NAVIGATION_CACHE_NAMESPACE` is **not** bumped — same reasoning as `upsertProductSeo` and banner.

---

## 7. Dashboard

### 7.1 Feature layout

Mirrors `banner/` and `product/`:

```
dashboard/src/features/article/
  api/article.api.ts, api/article-image.api.ts
  hooks/useArticles.ts
  components/article-form.tsx, components/article-seo-form.tsx, components/delete-article-dialog.tsx
  pages/ArticlesPage.tsx, CreateArticlePage.tsx, EditArticlePage.tsx
  types/article.types.ts
  index.ts
```

Routes `/articles`, `/articles/new`, `/articles/:id/edit`, lazy-loaded through the barrel. Sidebar entry in `app-sidebar.tsx`.

### 7.2 Create flow

Create-then-upload, for the §4.4 ordering reason:

1. `POST /api/articles` → get `id`
2. `POST /api/images` with `ownerType: "article_cover"`, `ownerId: id` (fire-and-forget)
3. `PUT /api/articles/:id/seo` if SEO fields were filled

### 7.3 Form fields

| Field       | Required | Notes                                                                 |
| ----------- | -------- | --------------------------------------------------------------------- |
| Title       | ✅       | max 160                                                               |
| Slug        | —        | **not a field** — generated from the title by the backend (§2.10). Show it read-only on the edit page so the author knows the URL. |
| Content     | ✅       | Markdown textarea + preview pane                                      |
| Cover image | ✅       | client-side gate — not an RHF field, same manual check as banner      |
| Author      | —        | free text                                                             |
| Tags        | —        | max 10                                                                |
| Status      | —        | select, defaults `draft`                                              |
| Published at| —        | date picker, only enabled when status is `published` (§2.4)           |

Required fields get the red `*` used across the existing forms.

### 7.4 Image polling

`useArticle`/`useArticles` poll at 1.5s while `coverImage.status` is `pending` or `processing`, stopping once settled — the exact `useBanners` pattern:

```ts
refetchInterval: (query) =>
  query.state.data?.data.some((a) => isCoverPending(a.coverImage)) ? 1500 : false
```

Without it the dashboard shows a blank thumbnail until manual refresh, because the upload resolves in a **separate worker process** — nothing in the browser would otherwise know it finished.

Poll on `failed` too, in the sense that polling **stops** on `failed` and the form surfaces an error state. An article stuck at `failed` needs the cover re-uploaded; silently showing a blank image would hide that.

### 7.5 Toasts (react-toastify)

The dashboard currently has **no toast library** — `package.json` has neither `react-toastify` nor `sonner`, and nothing in `src/` imports a toast. So this is a clean addition with no conflict to resolve.

```
cd dashboard && npm i react-toastify
```

**Mount the container once, globally** — in `src/main.tsx`, inside `QueryClientProvider`, alongside the existing providers:

```tsx
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

<QueryClientProvider client={queryClient}>
  <BrowserRouter>
    <App />
  </BrowserRouter>
  <ToastContainer position="top-right" autoClose={3000} theme="colored" newestOnTop />
</QueryClientProvider>
```

One container for the whole app. Mounting it per-page renders duplicate toasts on every route that happens to be mounted.

**Fire toasts from the mutation hooks, not the pages.** `useArticles.ts` already owns `onSuccess` for cache invalidation, and putting them there means every caller of the hook gets consistent feedback — a page that forgets to add a toast is a class of bug that can't happen:

```ts
export function useCreateArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateArticleInput) => createArticle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARTICLES_KEY })
      toast.success("Article created")
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  })
}
```

Coverage:

| Action                  | Success                                   | Error                        |
| ----------------------- | ----------------------------------------- | ---------------------------- |
| Create article          | `"Article created"`                       | server message               |
| Update article          | `"Article updated"`                       | server message               |
| Delete article          | `"Article deleted"`                       | server message               |
| Upload / replace cover  | — (none, deliberately)                    | server message               |
| SEO upsert              | `"SEO settings saved"`                    | server message               |
| Cover upload **failed** | —                                         | `"Cover image upload failed"` |

Two things worth getting right:

- **The cover upload fires no success toast.** The request returns as soon as the row is `pending` — Cloudinary hasn't been touched yet (§2.3b), so there is nothing truthful to announce, and a "uploaded" toast would be a lie. The cover thumbnail's own pending/uploaded state (§7.4 polling) is the progress indicator. Failures still toast: when `status` flips to `failed`, fire the error toast from the query's settled state.
- **`onError` must read the server's message, not print `[object Object]`.** The backend returns `{ success: false, message }` via `errorHandler`, so a small shared `getApiErrorMessage(err)` helper should unwrap that and fall back to a generic string. Worth putting in `src/lib/` since every future feature needs it.

---

## 8. Frontend (storefront) changes

| File                              | Change |
| --------------------------------- | ------ |
| `src/lib/articles.ts`             | **new** — `fetchPublishedArticles(limit)` and `fetchArticleBySlug(slug)`, degrading to `[]`/`null` on failure (the `fetchProducts`/`fetchSidebar` pattern) |
| `src/lib/types/article.ts`        | **new** — `Article` type matching §4.3 |
| `src/app/_components/article-row.tsx` | **new** — server component, 3-up grid, matches the screenshot |
| `src/app/articles/page.tsx`       | **new** — the `All articles` listing target |
| `src/app/articles/[slug]/page.tsx`| **new** — detail page; `generateMetadata` from `seo` with the §2.6 fallbacks |

Two rendering notes:

- Render only articles whose `coverImage.status === "uploaded"` in the row — a `pending` cover has an empty `url` and renders broken. If none qualify, render nothing rather than an empty section shell.
- Format `viewCount` with `Intl.NumberFormat` (`15300` → `15,300`) and `publishedAt` with `Intl.DateTimeFormat` (`June 14, 2026`) — both to match the design, and both to avoid a locale mismatch between server and client render.

---

## 9. Open questions

1. **Content format.** Spec assumes Markdown (§2.7). If the dashboard needs a WYSIWYG editor, that pushes toward storing HTML or editor JSON — decide before authoring real content, because migrating existing bodies is painful.
2. **Related articles.** The detail page will likely want "read next". Tag overlap is the cheap version; an explicit `relatedArticles` self-relation is the precise one. Not specced — needs a design.
3. **Reading time.** Common on article cards, absent from this design. Derivable from `content` at read time; no column needed unless it's shown in a list response (which excludes `content`, §4.3a — so it *would* need a column). Flagging now because adding it later means a backfill.
4. **`viewCount` inflation.** No dedupe (§2.5). If this number is ever used for anything but display, it needs rethinking.
5. **Auth.** Every mutating article endpoint is public, like every other endpoint in this backend — the unresolved question from navigation spec §12.4 and banner spec §9.3. Article adds five more unprotected write routes, and unlike banners these accept a **body rendered as Markdown**, which makes the XSS surface in §2.7 real rather than theoretical.
6. **`alt` text.** The `Image` table has an `alt` column nothing currently sets. Article covers sit next to a title so `alt=""` is defensible, but article images are more likely to be content-bearing than banner images — worth a dashboard field.
7. **Orphaned staged files.** `tmp/uploads` is only cleaned by the worker (on success, or after the retry cap). A file whose job never gets enqueued — API crash between multer writing the file and `enqueueImageUpload` resolving — is never cleaned up. Pre-existing across all owner types, not introduced by article, but article adds another write path to it. A periodic sweep of files older than ~24h would close it.
8. **`banner.service.ts` leaks worker internals.** It spreads the raw `ImageModel` into its API response, exposing `localPath`, `tries`, and `lastError` to the storefront (§4.3). Article does this correctly; banner is worth aligning in a follow-up.
9. **Slug is write-once (§2.10).** Fixing a typo in a published title leaves the old slug in the URL forever. Renaming safely needs a redirect table (`old slug → new slug` + 301), which is out of scope. Until then, titles should be proofread before first publish.
10. **`metaDescription` quality.** With `excerpt` gone (§2.11), an article published without an authored `seo.metaDescription` gets a mechanical truncation of its body as its search snippet. Consider making the field required-on-publish in the dashboard rather than merely recommended.
