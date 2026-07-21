import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Eye } from "lucide-react"
import { fetchArticleBySlug } from "@/lib/articles"
import { ArticleBody } from "@/app/blog/_components/article-body"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * Falls back down the chain the backend spec defines (§2.6/§2.11): an authored
 * seo field first, then the article's own fields, then a truncation of the body
 * — `excerpt` was dropped from the model, so there is no authored summary to
 * fall back to.
 */
function deriveDescription(content: string | undefined, limit = 155): string {
  if (!content) return ""
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return plain.length <= limit ? plain : `${plain.slice(0, limit - 3).trimEnd()}…`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await fetchArticleBySlug(slug)

  if (!article) {
    return { title: "Article not found" }
  }

  const seo = article.seo
  const title = seo?.metaTitle ?? article.title
  const description = seo?.metaDescription ?? deriveDescription(article.content)
  const ogImage = article.coverImage?.status === "uploaded" ? article.coverImage.url : undefined

  return {
    title,
    description,
    ...(seo?.metaKeywords?.length ? { keywords: seo.metaKeywords } : {}),
    ...(seo?.canonicalUrl ? { alternates: { canonical: seo.canonicalUrl } } : {}),
    robots: {
      index: !seo?.noIndex,
      follow: !seo?.noFollow,
    },
    openGraph: {
      title: seo?.ogTitle ?? title,
      description: seo?.ogDescription ?? description,
      type: "article",
      ...(article.publishedAt ? { publishedTime: article.publishedAt } : {}),
      ...(article.authorName ? { authors: [article.authorName] } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: seo?.twitterCard ?? "summary_large_image",
      title: seo?.ogTitle ?? title,
      description: seo?.ogDescription ?? description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await fetchArticleBySlug(slug)

  // The backend 404s drafts and unknown slugs alike, and fetchArticleBySlug
  // turns any non-ok response into null — both are a genuine 404 here.
  // Archived articles still resolve on purpose, so old links keep working.
  if (!article) notFound()

  const hasCover = article.coverImage?.status === "uploaded"

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-6">
      <Link
        href="/blog"
        className="text-small-semibold mb-8 inline-flex items-center gap-2 text-text-secondary transition-colors duration-200 hover:text-brand-primary"
      >
        <ArrowLeft className="size-4" />
        All articles
      </Link>

      <header className="mb-8">
        <h1 className="text-h1 text-text-primary">{article.title}</h1>

        <div className="text-caption mt-4 flex flex-wrap items-center gap-4 text-text-secondary">
          {article.publishedAt && (
            <time dateTime={article.publishedAt}>
              {dateFormatter.format(new Date(article.publishedAt))}
            </time>
          )}
          {article.authorName && <span>By {article.authorName}</span>}
          <span className="flex items-center gap-1.5">
            <Eye className="size-3.5" />
            {article.viewCount.toLocaleString("en-US")}
          </span>
        </div>
      </header>

      {hasCover && (
        <div className="relative mb-10 block aspect-16/9 overflow-hidden rounded-lg bg-bg-section">
          <Image
            src={article.coverImage!.url}
            alt={article.coverImage?.alt ?? ""}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            priority
            className="object-cover"
          />
        </div>
      )}

      <ArticleBody content={article.content ?? ""} />

      {article.tags.length > 0 && (
        <footer className="mt-12 border-t border-border pt-6">
          <ul className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <li
                key={tag}
                className="text-caption rounded-full bg-bg-section px-3 py-1 text-text-secondary"
              >
                #{tag}
              </li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  )
}
