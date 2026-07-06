# Mega Navigation — Dashboard Spec

Status: **DRAFT — pending review**
Design source: user-provided screenshot (mega nav demo mockup), no Figma node available this session.
App: `dashboard/` (Vite + React 19 + TypeScript + shadcn/ui + TanStack Query)

Related specs: `backend/.claude/spec/mega-nav/mega-nav.spec.md` (this screen depends on that API being implemented first), `frontend/.claude/spec/mega-nav/mega-nav.spec.md`.

## Shared data shape (consumed from backend)

```ts
interface NavCategory {
  id: string
  name: string
  slug: string
  parentId: string | null
  sortOrder: number
  isClearance: boolean
  showInMegaMenu: boolean
  createdAt: string
  updatedAt: string
}
```

`GET /api/categories/tree` — top-level `NavCategory[]` with nested `children`. `GET /api/categories` — flat, paginated, for the admin list view.

## 0. Prerequisite check: infra already exists

Unlike the announcement feature (which had to introduce the sidebar shell + router + zod from scratch), all of that infra is now in place: `src/components/layout/app-sidebar.tsx`, `react-router` wired in `App.tsx`/`main.tsx`, `zod` installed. This spec only needs to **add a new sidebar entry + routes + feature module** — no new infra prerequisite.

## 1. Sidebar

Add a **"Categories"** nav item to `src/components/layout/app-sidebar.tsx` (alongside existing `Products`/`Announcement Bar` entries), linking to `/categories`.

## 2. Data & API layer

`src/features/categories/api.ts` (feature-based, per `dashboard-architecture`, mirrors `src/features/announcements/api.ts`):
- `fetchCategories(cursor?, limit?)` → `GET /api/categories`
- `fetchCategoryTree()` → `GET /api/categories/tree` (used for both the admin's own tree-view UI and any parent-picker dropdown in the create/edit form)
- `createCategory(input)` → `POST /api/categories`
- `updateCategory(id, input)` → `PATCH /api/categories/:id`
- `deleteCategory(id)` → `DELETE /api/categories/:id`

`src/features/categories/hooks.ts`:
- `useCategories()` — `useQuery({ queryKey: ["categories"], ... })`
- `useCategoryTree()` — `useQuery({ queryKey: ["categories", "tree"], ... })`
- `useCreateCategory()`, `useUpdateCategory()`, `useDeleteCategory()` — `useMutation`, each invalidating both `["categories"]` and `["categories", "tree"]` `onSuccess` (both views must stay in sync since they read the same underlying table).

## 3. UI: `/categories` screen

`src/features/categories/CategoriesPage.tsx`, routed at `/categories` in `App.tsx` alongside the existing routes.

Because this is a 2-level tree (unlike announcements' flat list), the natural admin UI is a **tree/grouped view** rather than a flat table:

- **List view**: grouped by top-level category — each top-level row expandable (shadcn `Collapsible` or a simple disclosure) showing its children indented underneath, with drag-handle-free `sortOrder` shown as a number input or up/down arrows (drag-and-drop reordering is a nice-to-have, not required for v1 — flag below). Columns/fields per row: name, slug, `showInMegaMenu` (badge/switch), `isClearance` (badge, top-level only), updated date, row actions (edit/delete/add-child).
- **Add top-level category**: a top-level "New category" button opens a `Dialog`/`Sheet` form (react-hook-form + zod, matching the frontend's form convention and the announcement feature's dashboard form pattern) — fields: name, slug (auto-slugify from name with an editable override, matching typical admin UX), `sortOrder`, `showInMegaMenu` (switch), `isClearance` (switch, only meaningful with no parent).
- **Add child category**: an "Add subcategory" action on each top-level row, opening the same form pre-filled with `parentId` set and `isClearance`/`showInMegaMenu` hidden (only relevant to top-level rows, per the two-level-depth business rule in the backend spec).
- **Edit**: same form, pre-filled, `parentId` field locked/read-only (moving a category between parents isn't in scope for v1 — flag below).
- **Delete**: `AlertDialog` confirm before calling the delete mutation; if deleting a top-level category with children, the confirm copy should warn "this will also delete N subcategories" (matches backend's cascade-delete rule) — needs the children count, available from the tree query.
- **Live preview** (optional, matches the announcement feature's "nice-to-have" precedent): a small non-interactive render of the mega-menu panel using the same column layout as the storefront, so admins can see what they're publishing without switching to the frontend.

## 4. States

- Loading: `Skeleton` rows/tree, matching the announcement feature's pattern.
- Empty: empty-state message ("No categories yet") + "New category" CTA.
- Error: inline error message with retry (`refetch`).
- Mutation pending: disable form submit, show spinner (shadcn `Button` + `disabled` + loading icon), same as announcements.

## 5. Verification

- `npm run build` (typecheck + bundle), `npm run lint` (oxlint)
- Manual: `npm run dev`, exercise create-top-level/create-child/edit/delete against a running `backend`, confirm sidebar link + routing work, confirm the cascade-delete warning shows the right child count, confirm both `categories` and `categories/tree` queries stay in sync after any mutation.

## Open questions (resolve during review)

1. Is **drag-and-drop reordering** (for `sortOrder`) needed in v1, or is a plain number input / up-down arrows acceptable? Screenshot shows edit-mode Figma chrome, not an admin UI, so no direct signal either way — leaning toward number input for v1 (simpler, no new drag library dependency) unless review wants full drag-and-drop.
2. Is **re-parenting** (moving a child to a different top-level category, or promoting a child to top-level) needed in v1? Current spec locks `parentId` on edit to keep the form simple — flag if this is actually a common admin task.
3. Confirm scope of the "live preview" panel (mirrors the same open question in the announcement dashboard spec) — in v1 or deferred?
4. Any auth/login gate expected before this screen, or does it inherit the same "no auth yet" status as the rest of the dashboard?

## Review gate

Per user instruction: **do not implement anything until all three per-app spec files (backend/dashboard/frontend) are reviewed and explicitly approved.** Next command after approval triggers implementation.
