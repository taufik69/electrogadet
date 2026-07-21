import { z } from "zod"
import { cursorPaginationSchema } from "../../shared/types/pagination.js"
import type { Prisma } from "../../generated/prisma/client.js"

const articleStatusSchema = z.enum(["draft", "published", "archived"])
const twitterCardSchema = z.enum(["summary", "summary_large_image", "app", "player"])

// JSON-LD is genuinely schemaless — this only constrains the value to "valid
// JSON", matching Prisma's InputJsonValue, without opinion on shape.
const jsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.array(jsonValueSchema), z.record(z.string(), jsonValueSchema)]),
)

/**
 * No `slug` field: it is generated server-side from `title` (spec §2.10), the
 * same rule as product/brand/category. A client that sends one has it silently
 * stripped by zod rather than 400'd — the slug simply isn't part of the write
 * contract.
 *
 * No `excerpt` field either (spec §2.11) — the card design shows no summary
 * line, and the SEO description falls back to a truncation of `content`.
 *
 * max(160) on title is card-driven: the article card clamps to 2 lines.
 */
export const createArticleSchema = z.object({
  title: z.string().min(1).max(160),
  content: z.string().min(1),
  authorName: z.string().min(1).max(80).optional(),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(40)).max(10).optional().default([]),
  status: articleStatusSchema.optional().default("draft"),
  publishedAt: z.coerce.date().optional(),
})

export const updateArticleSchema = createArticleSchema.partial()

export const listArticlesQuerySchema = cursorPaginationSchema.extend({
  status: articleStatusSchema.optional(),
  tag: z.string().trim().toLowerCase().min(1).optional(),
})

/**
 * metaTitle/metaDescription are optional here, unlike product's (which requires
 * both). An article can be saved as a draft before its SEO is written — the
 * dashboard is what should press for a description before publish (spec §2.11).
 */
export const upsertArticleSeoSchema = z.object({
  metaTitle: z.string().min(1).max(70).optional(),
  metaDescription: z.string().min(1).max(200).optional(),
  metaKeywords: z.array(z.string().trim().toLowerCase()).optional(),
  canonicalUrl: z.string().url().optional(),
  focusKeyword: z.string().trim().toLowerCase().optional(),
  ogTitle: z.string().max(70).optional(),
  ogDescription: z.string().max(200).optional(),
  twitterCard: twitterCardSchema.optional(),
  structuredData: jsonValueSchema.optional(),
  noIndex: z.boolean().optional(),
  noFollow: z.boolean().optional(),
})
