# Announcement Bar — Frontend Spec

Status: **DRAFT — pending review**
Figma: https://www.figma.com/design/gEkUH2nWXoepam205EWQ2S/Nordvolt-%E2%80%94-Premium-Electronics-E-commerce--Copy-?node-id=6-7 (node `6:7`)
App: `frontend/` (Next.js 16 App Router + Tailwind v4 + shadcn/ui)

Related specs: `backend/.claude/spec/announcement/announcement.spec.md` (this component depends on that API being implemented first), `dashboard/.claude/spec/announcement/announcement.spec.md`.

> Visual spec caveat: Figma node `6:7` couldn't be fetched this session (MCP rate limit) — layout/copy/exact colors below are placeholders pending a real look at the design. Re-pull before finalizing implementation.

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

## 1. Component

Cross-route chrome (rendered in the root layout, not a single route), so per the frontend `CLAUDE.md` structure rule it belongs in the shared location: **`src/components/announcement-bar.tsx`**.

- **Server Component** by default (per `app-architecture` rendering-preference rule: Static > ISR > SSR > client). Fetches the active announcement server-side:
  ```ts
  const res = await fetch(`${API_URL}/api/announcements/active`, { next: { revalidate: 60 } })
  ```
  60s revalidation is a starting point — admins won't see instant updates, but a full site-wide bar doesn't need to be real-time; tune during review.
- If `data` is `null` (no active bar, per backend's `getActive` contract), render nothing (return `null`) — not an empty bar / not a loading skeleton, since this is server-rendered.
- If a **dismiss button** is confirmed in the Figma design (see backend spec's open question #1), the dismiss interaction needs client state → extract a small `"use client"` wrapper (e.g. `announcement-bar-dismiss-button.tsx`) that reads/writes `localStorage` keyed by the bar's `id` (so a new announcement always reappears even if a prior one was dismissed), while the outer bar and its content stay server-rendered. This keeps the client bundle minimal per the performance standard in `app-architecture`.

## 2. Placement

Mount in `src/app/layout.tsx`, above the site header, inside `<body>`:
```tsx
<body className="min-h-full flex flex-col">
  <AnnouncementBar />
  {/* existing header/children */}
  {children}
</body>
```
Exact position relative to header/nav to be confirmed against the Figma frame once fetchable — some designs put it above a sticky header (scrolls away), others make the whole stack sticky together.

## 3. Styling

- Tailwind utility classes using existing design-system tokens from `globals.css`'s `@theme inline` block — **no hardcoded hex/px**, per `design-system-guide`. Pull the relevant background/text/spacing tokens once the Figma frame is inspected; if the design calls for a color not yet in the token set, add it as a new CSS variable in `globals.css` rather than hardcoding.
- `backgroundColor` override from the API (if present) is an inline-style escape hatch for admin-chosen colors outside the token system — used sparingly, only when the field is non-null.
- Responsive: message text should truncate/wrap sensibly on mobile; if the bar includes a link/CTA, verify tap target size on small screens.

## 4. Content

- `message` rendered as plain text (no `dangerouslySetInnerHTML`) unless the backend spec's rich-text question resolves to something requiring safe rendering — default to plain text for security (XSS) and simplicity.
- If `linkUrl`/`linkText` are present, wrap the message (or a trailing CTA fragment) in `next/link` — external URLs get `target="_blank" rel="noopener noreferrer"`, internal ones use plain `next/link` navigation.

## 5. Metadata / SEO

Not applicable — this is presentational chrome, not indexable content; no metadata API changes needed.

## 6. Verification

- `npm run build`, `npm run lint`
- Manual: run `frontend` + `backend` together, toggle the active bar via the dashboard (or a direct `curl PATCH`), confirm the storefront reflects it within the revalidate window; confirm it disappears when no bar is active; confirm dismiss (if in scope) persists across reload but resets for a new announcement id.

## Open questions (resolve during review)

1. Placement relative to header — sticky-together or scrolls-away independently? Needs the actual Figma frame.
2. Dismiss button: in scope or not (mirrors backend spec open question #1).
3. Is there a design for **multiple simultaneous bars** or **rotating messages** (mirrors backend spec open question #2)? If rotation is in scope, this becomes a small client component (interval-based carousel) instead of static server-rendered text.
4. Revalidation window (currently proposed 60s) — acceptable, or does the design imply near-instant updates (e.g. a flash-sale countdown) that would need a shorter window or client polling instead?

## Review gate

Per user instruction: **do not implement anything until all three per-app spec files (backend/dashboard/frontend) are reviewed and explicitly approved.** Next command after approval triggers implementation.
