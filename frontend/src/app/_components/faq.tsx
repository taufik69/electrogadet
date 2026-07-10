import { Plus } from "lucide-react"
import { faqs } from "@/lib/data/faqs"

export function Faq() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="w-full px-4 py-16 sm:px-6 lg:py-20"
    >
      <div className="mb-10 flex flex-col gap-2">
        <h2 id="faq-heading" className="text-h2 text-text-primary">
          Frequently asked questions
        </h2>
        <p className="text-body text-text-secondary">
          Everything you need to know about ordering, delivery, and returns.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-md border border-border bg-surface open:shadow-e1"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-small-semibold text-text-primary [&::-webkit-details-marker]:hidden">
              {faq.question}
              <Plus
                aria-hidden
                className="size-4 shrink-0 text-text-secondary transition-transform duration-200 group-open:rotate-45"
              />
            </summary>
            <p className="px-5 pb-5 text-small text-text-secondary">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
