import Image from "next/image"
import Link from "next/link"
import { Eye } from "lucide-react"
import type { Article } from "@/lib/types/article"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

interface ArticleCardProps {
  article: Article
  /**
   * Passed through to next/image. The homepage row and the listing grid have
   * different column counts, so they need different sizes hints — getting this
   * wrong makes the browser download an oversized image.
   */
  sizes?: string
  /** Set on the first card above the fold to skip lazy-loading (LCP). */
  priority?: boolean
}

/**
 * Shared by the homepage row and the /blog listing so the two can never drift.
 *
 * Assumes `coverImage` is uploaded — both callers filter on that, because
 * next/image throws on an empty src rather than degrading.
 */
export function ArticleCard({ article, sizes = "(min-width: 768px) 33vw, 100vw", priority }: ArticleCardProps) {
  return (
    <article>
      <Link href={`/blog/${article.slug}`} className="group flex flex-col gap-4">
        <span className="relative block aspect-16/9 overflow-hidden rounded-md bg-bg-section">
          <Image
            src={article.coverImage?.url ?? ""}
            alt={article.coverImage?.alt ?? ""}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        </span>

        <h3 className="text-body-lg text-text-primary transition-colors duration-200 group-hover:text-brand-primary">
          {article.title}
        </h3>
      </Link>

      <div className="mt-3 flex items-center gap-4 text-caption text-text-secondary">
        {/* publishedAt is non-null for anything /published returns, but the
            type allows null (drafts), so guard rather than assert. */}
        {article.publishedAt && (
          <time dateTime={article.publishedAt}>{dateFormatter.format(new Date(article.publishedAt))}</time>
        )}
        <span className="flex items-center gap-1.5">
          <Eye className="size-3.5" />
          {article.viewCount.toLocaleString("en-US")}
        </span>
      </div>
    </article>
  )
}
