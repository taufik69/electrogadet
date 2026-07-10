import Image from "next/image"
import Link from "next/link"
import { Eye } from "lucide-react"
import { articles } from "@/lib/data/homepage"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

export function Articles() {
  return (
    <section
      aria-labelledby="articles-heading"
      className="w-full px-4 py-16 sm:px-6 lg:px-6"
    >
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
          <article key={article.slug}>
            <Link href={`/blog/${article.slug}`} className="group flex flex-col gap-4">
              <span className="relative block aspect-16/9 overflow-hidden rounded-md bg-bg-section">
                <Image
                  src={article.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                />
              </span>

              <h3 className="text-body-lg text-text-primary transition-colors duration-200 group-hover:text-brand-primary">
                {article.title}
              </h3>
            </Link>

            <div className="mt-3 flex items-center gap-4 text-caption text-text-secondary">
              <time dateTime={article.publishedAt}>
                {dateFormatter.format(new Date(article.publishedAt))}
              </time>
              <span className="flex items-center gap-1.5">
                <Eye className="size-3.5" />
                {article.views.toLocaleString("en-US")}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
