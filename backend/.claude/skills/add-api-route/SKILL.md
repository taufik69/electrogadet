---
name: add-api-route
description: Add a new REST resource/endpoint to the Nordvolt backend API (Express + Prisma), following the layered module architecture
---

# Add an API route

Use this when asked to add a new backend resource or endpoint (e.g. "add an orders API", "add a DELETE endpoint for products"). For the full architectural rationale (layering, patterns, pagination, response contract), see `ARCHITECTURE.md` and `.claude/skills/backend-architecture/SKILL.md` — this skill is just the quick mechanical checklist.

## Steps

1. **Model first, if new data is involved.** Add/edit the model in `prisma/schema.prisma`. Run `npm run prisma:migrate` to create and apply a migration, then `npm run prisma:generate` to regenerate the client (migrate already triggers generate, but re-run if you only edited the schema without migrating, e.g. against an already-correct DB).
2. **Create the module.** Add `src/modules/<resource>/` following the pattern in `src/modules/product/`:
   - `<resource>.routes.ts` — `Router()` instance exported by name (e.g. `export const ordersRouter = ...`), routes call controller methods only
   - `<resource>.controller.ts` — validates via a zod schema from `<resource>.validation.ts` (`safeParse`; throw `ApiError.badRequest(message, parsed.error.flatten())` on failure), calls the service, responds via `ApiResponse.success(...)` from `shared/helpers/apiResponse.js`
   - `<resource>.service.ts` — business logic, calls the repository only, throws `ApiError.notFound/.conflict(...)` for rule violations
   - `<resource>.repository.ts` — the only file that calls `prisma.<model>.*`, using the shared client from `../../shared/lib/prisma.js`
   - `<resource>.validation.ts`, `<resource>.types.ts`, `<resource>.constant.ts` as needed
   - For list endpoints, default to cursor pagination — reuse `cursorPaginationSchema`/`toCursorResult` from `shared/types/pagination.ts` / `shared/utils/pagination.ts`
3. **Mount it** in `src/app.ts`: `app.use("/api/<resource>", <resource>Router)` — before the `errorHandler` line, which must stay last.
4. Run `npm run typecheck` and `npm run lint`.
5. Sanity-check manually: `npm run dev`, then `curl` the new endpoint.

## Notes

- Don't wrap handlers in try/catch just to forward errors — Express 5 auto-forwards rejected async handlers to error middleware, and the global `errorHandler` is the only place that writes an error response.
- If the resource needs relations to `Product` or other models, add the relation fields on both sides of the Prisma schema before migrating.
- No cross-module imports — a new `orders` module must not import from `modules/product/*` internals; compose at a higher layer or put shared logic in `shared/` instead.
- Keep authorization/authentication out of scope unless asked — there's no auth middleware in this scaffold yet.
