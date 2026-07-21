import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"

interface ArticleBodyProps {
  content: string
}

/**
 * Renders an article's Markdown body.
 *
 * `rehypeSanitize` is NOT optional here. Article content is authored through
 * the dashboard, and every write endpoint on the backend is currently
 * unauthenticated (backend article spec §9.5) — so the body is effectively
 * untrusted input. react-markdown does not execute raw HTML by default, but
 * sanitizing explicitly means a future `rehypeRaw` addition (a very natural
 * "let authors embed HTML" request) can't silently open an XSS hole.
 *
 * Do not replace this with `dangerouslySetInnerHTML`.
 *
 * Styling is applied via component overrides rather than a typography plugin,
 * so every element uses the design system's own tokens.
 */
export function ArticleBody({ content }: ArticleBodyProps) {
  if (!content.trim()) return null

  return (
    <div className="text-body text-text-primary">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ children }) => <h2 className="text-h2 mt-10 mb-4 text-text-primary">{children}</h2>,
          h2: ({ children }) => <h2 className="text-h3 mt-10 mb-4 text-text-primary">{children}</h2>,
          h3: ({ children }) => <h3 className="text-body-lg mt-8 mb-3 font-semibold text-text-primary">{children}</h3>,
          p: ({ children }) => <p className="mb-5 leading-relaxed text-text-secondary">{children}</p>,
          ul: ({ children }) => <ul className="mb-5 list-disc space-y-2 pl-6 text-text-secondary">{children}</ul>,
          ol: ({ children }) => <ol className="mb-5 list-decimal space-y-2 pl-6 text-text-secondary">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
          a: ({ href, children }) => (
            <a
              href={href}
              // Authored links can point anywhere, so treat them as untrusted:
              // noopener/noreferrer prevents tabnabbing via window.opener.
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-brand-primary underline underline-offset-2 transition-colors duration-200 hover:text-brand-hover"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-5 border-l-2 border-brand-primary pl-4 text-text-secondary italic">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded bg-bg-section px-1.5 py-0.5 font-mono text-[0.9em] text-text-primary">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="mb-5 overflow-x-auto rounded-lg bg-bg-section p-4 font-mono text-sm">{children}</pre>
          ),
          hr: () => <hr className="my-8 border-border" />,
          table: ({ children }) => (
            <div className="mb-5 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border px-3 py-2 font-semibold text-text-primary">{children}</th>
          ),
          td: ({ children }) => <td className="border-b border-border px-3 py-2 text-text-secondary">{children}</td>,
        }}
      >
        {content}
      </Markdown>
    </div>
  )
}
