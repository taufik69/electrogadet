import type { Metadata } from "next"
import { ArticleCard } from "@/app/_components/article-card"
import { fetchPublishedArticles } from "@/lib/articles"

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Buying guides, comparisons and setup walkthroughs from the ElectroGadget team.",
  openGraph: {
    title: "Articles | ElectroGadget",
    description:
      "Buying guides, comparisons and setup walkthroughs from the ElectroGadget team.",
    type: "website",
  },
}

export default async function BlogPage() {
  // 50 rather than the homepage's 3 — this is the full listing. The backend
  // caps limit at 50 on this endpoint, so asking for more would 400.
  const articles = await fetchPublishedArticles(50)

  return (
    <div className="w-full px-4 py-16 sm:px-6 lg:px-6">
      <header className="mb-10">
        <h1 className="text-h2 text-text-primary">Articles</h1>
        <p className="text-body mt-2 max-w-2xl text-text-secondary">
          Buying guides, comparisons and setup walkthroughs from the ElectroGadget team.
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-body text-text-secondary">No articles published yet — check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              // Only the first row is above the fold; priority on everything
              // would defeat lazy-loading entirely.
              priority={index < 3}
            />
          ))}
        </div>
      )}
    </div>
  )
}
