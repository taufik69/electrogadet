# Announcement Bar — Dashboard Spec

Status: **DRAFT — pending review**
Figma: https://www.figma.com/design/gEkUH2nWXoepam205EWQ2S/Nordvolt-%E2%80%94-Premium-Electronics-E-commerce--Copy-?node-id=6-7 (node `6:7`)
App: `dashboard/` (Vite + React 19 + TypeScript + shadcn/ui + TanStack Query)

Related specs: `backend/.claude/spec/announcement/announcement.spec.md` (this screen depends on that API being implemented first), `frontend/.claude/spec/announcement/announcement.spec.md`.

## Shared data shape (consumed from backend)

```ts
interface AnnouncementBar {
  id: string
  message: string
  linkUrl: string | null
  linkText: string | null
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
  backgroundColor: string | null
  createdAt: string
  updatedAt: string
}
```

## 0. Prerequisite: shadcn `sidebar-07` block + routing

The dashboard currently has **no router installed** and only `button` + `card` from shadcn/ui (`src/components/ui/`). Per user instruction, bring in the `sidebar-07` shadcn block as the dashboard's navigation shell before building the announcement screen.

Steps:
1. `npx shadcn@latest add sidebar-07` (run from `dashboard/`). This block pulls in its own dependencies (`sidebar`, `separator`, `sheet`, `breadcrumb`, `tooltip`, `avatar`, `dropdown-menu`, etc.) — let the CLI add whatever it needs under `src/components/ui/`.
2. `sidebar-07` is normally scaffolded as a full example page (its own `app-sidebar.tsx`, `page.tsx` demo). Adapt it into the app shell:
   - Move/rename its generated sidebar component to `src/components/layout/app-sidebar.tsx` (or keep at the CLI's default path if that's already consistent with project conventions — confirm during review).
   - Replace its placeholder nav items (teams/projects/etc.) with Nordvolt's real admin sections: **Products**, **Announcement Bar** (this feature), and a placeholder for **Orders** (future).
3. Install `react-router` (per `add-dashboard-view` skill's default) since this is the first second-view addition. Wrap `<App />`'s content area in a router; `sidebar-07`'s layout becomes the persistent shell, with routed pages rendered in its `<SidebarInset>`/content slot.
4. Routes:
   - `/` or `/products` — existing/future product list (out of scope here, just needs a placeholder route so the sidebar link resolves)
   - `/announcements` — the announcement bar screen (this spec)

This is infrastructure shared by all future dashboard screens, not announcement-specific, but it's a blocking prerequisite since there's currently no sidebar/nav shell at all.

## 1. Data & API layer

- `src/lib/api.ts` (create if missing): base URL + fetch helper reading from an env var (e.g. `VITE_API_URL`, defaulting to `http://localhost:<backend-port>`), matching the `add-dashboard-view` skill's "keep fetch/base-URL logic in a dedicated `src/lib/api.ts`" rule.
- `src/features/announcements/api.ts` (feature-based, per `dashboard-architecture`):
  - `fetchAnnouncements(cursor?, limit?)` → `GET /api/announcements`
  - `fetchActiveAnnouncement()` → `GET /api/announcements/active` (useful for a live "preview" panel showing what's currently on the storefront)
  - `createAnnouncement(input)` → `POST /api/announcements`
  - `updateAnnouncement(id, input)` → `PATCH /api/announcements/:id`
  - `deleteAnnouncement(id)` → `DELETE /api/announcements/:id`
- `src/features/announcements/hooks.ts`:
  - `useAnnouncements()` — `useQuery({ queryKey: ["announcements"], ... })`
  - `useCreateAnnouncement()`, `useUpdateAnnouncement()`, `useDeleteAnnouncement()` — `useMutation`, each invalidating `["announcements"]` (and `["announcements", "active"]` if the active-preview query is added) `onSuccess`.

## 2. UI: `/announcements` screen

`src/pages/Announcements.tsx` (or `src/features/announcements/AnnouncementsPage.tsx` — confirm folder convention during review; `dashboard-architecture` skill favors feature-based, so leaning toward the latter).

Layout, built from shadcn primitives (add any missing ones via `npx shadcn@latest add <name>` — anticipate needing `table`, `dialog` or `sheet`, `form`, `input`, `textarea`, `switch`, `label`, on top of what `sidebar-07` already brought in):

- **List view**: a `Table` of existing announcement bars — columns: message (truncated), active (badge/switch), schedule window (or "always on" if null), updated date, row actions (edit/delete).
- **Create/Edit**: a `Dialog` (or `Sheet`, matching whatever feels more consistent with `sidebar-07`'s aesthetic) with a `react-hook-form` + zod form — *note: zod is not yet a dashboard dependency; add it (`npm install zod`) since the `add-dashboard-view` skill doesn't currently mandate a form library, but matching frontend's RHF+Zod pattern is preferable to hand-rolled form state.* Fields: message (textarea), link URL + link text (optional, paired), active (switch — toggling on should surface a hint like "this will deactivate the currently active bar"), starts/ends at (date pickers, optional), background color (optional text/color input).
- **Delete**: confirm via `AlertDialog` before calling the delete mutation.
- **Live preview** (nice-to-have, confirm scope during review): render a small non-interactive preview of the bar using the same visual treatment as the storefront component, so admins see what they're publishing.

## 3. States

- Loading: `Skeleton` rows in the table.
- Empty: empty-state message ("No announcement bars yet") + a "Create" CTA.
- Error: inline error message with retry (TanStack Query's `refetch`).
- Mutation pending: disable form submit button, show spinner (shadcn `Button` with `disabled` + loading icon).

## 4. Verification

- `npm run build` (typecheck + bundle), `npm run lint` (oxlint)
- Manual: `npm run dev`, exercise create/edit/delete/activate-toggle against a running `backend`, confirm the sidebar nav and routing work end-to-end.

## Open questions (resolve during review)

1. Confirm exact folder placement: `src/pages/` (per the generic `add-dashboard-view` skill) vs. `src/features/announcements/` (per the more specific `dashboard-architecture` skill). These two skills give slightly different guidance — should pick one convention now since `sidebar-07` + router is also being introduced fresh.
2. Should the "live preview" panel be in scope for v1, or deferred?
3. Confirm whether `sidebar-07`'s generated demo content (team switcher, user nav footer, etc.) should be kept as placeholder chrome or stripped down for now — affects how much of the block's boilerplate stays.
4. Any auth/login screen expected before the sidebar shell, or is the dashboard unauthenticated for now (matches backend's "no auth middleware yet" note)?

## Review gate

Per user instruction: **do not implement anything until all three per-app spec files (backend/dashboard/frontend) are reviewed and explicitly approved.** Next command after approval triggers implementation.
