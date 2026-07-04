---
name: add-dashboard-view
description: Add a new admin view/page to the Nordvolt dashboard (Vite + React + shadcn/ui + TanStack Query)
---

# Add a dashboard view

Use this when asked to add a new admin screen (e.g. "add a products list view", "add an order detail page").

## Steps

1. If no router is installed yet, add one (`react-router` is the default choice) before adding a second view — check `src/main.tsx`/`src/App.tsx` first to see if routing already exists.
2. Create the view as a component, e.g. `src/pages/Products.tsx` (create `src/pages/` if it doesn't exist).
3. For any data from the backend API, use TanStack Query:
   ```tsx
   const { data, isLoading } = useQuery({
     queryKey: ["products"],
     queryFn: () => fetch("/api/products").then((r) => r.json()),
   })
   ```
   Put the actual fetch/base-URL logic in `src/lib/api.ts` (create it if missing) rather than inlining fetch calls in components.
4. Build the UI from shadcn/ui primitives in `src/components/ui/`. If a needed primitive isn't there yet, add it with `npx shadcn@latest add <component>` rather than hand-rolling one — check available components first if unsure of the exact name.
5. Use Tailwind utility classes with the existing design tokens (`bg-card`, `text-muted-foreground`, etc.) defined in `src/index.css` — don't hardcode colors.
6. Run `npm run build` to confirm it typechecks and bundles, and `npm run lint` (oxlint, not eslint).

## Notes

- This dashboard has no direct database access — everything goes through the `backend` Express API.
- Mutations (create/update/delete) should use `useMutation` and invalidate the relevant `queryKey` on success so lists refresh automatically.
