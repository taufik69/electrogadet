import Link from "next/link"
import { ArticleCard } from "@/app/_components/article-card"
import type { Article } from "@/lib/types/article"

interface ArticlesProps {
  articles: Article[]
}

export function Articles({ articles }: ArticlesProps) {
  // Nothing published yet — or the API is down and fetchPublishedArticles
  // degraded to []. Render nothing rather than a bare section header over an
  // empty grid.
  if (articles.length === 0) return null

  return (
    <section aria-labelledby="articles-heading" className="w-full px-4 py-16 sm:px-6 lg:px-6">
      <div className="mb-10 flex items-end justify-between gap-4">
        <h2 id="articles-heading" className="text-h3 text-text-primary">
          Articles
        </h2>
        <Link
          href="/blog"
          className="text-small-semibold text-brand-primary transition-colors duration-200 hover:text-brand-hover"
        >
          All articles
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}
