import type { ArticleModel, ImageModel } from "../../generated/prisma/models.js"
import type { ArticleStatus, TwitterCard } from "../../generated/prisma/enums.js"

export type Article = ArticleModel

/**
 * The cover image as the API exposes it — a projection, not the raw Image row.
 * localPath/publicId/tries/lastError are worker bookkeeping (spec §2.3a):
 * publicId is an infrastructure identifier and localPath leaks a server
 * filesystem path, so neither belongs in a storefront response. `status` is the
 * one internal field deliberately kept — the dashboard polls on it and the
 * storefront filters on it.
 */
export type CoverImage = Pick<ImageModel, "id" | "url" | "status" | "alt">

export interface CreateArticleInput {
  title: string
  content: string
  authorName?: string
  tags?: string[]
  status?: ArticleStatus
  publishedAt?: Date
}

export type UpdateArticleInput = Partial<CreateArticleInput>

export interface ArticleSeoInput {
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string[]
  canonicalUrl?: string | null
  focusKeyword?: string | null
  ogTitle?: string | null
  ogDescription?: string | null
  twitterCard?: TwitterCard
  structuredData?: unknown
  noIndex?: boolean
  noFollow?: boolean
}

export interface ListArticleFilters {
  status?: ArticleStatus
  tag?: string
}
