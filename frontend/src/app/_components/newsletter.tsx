import { NewsletterForm } from "@/app/_components/newsletter-form"

export function Newsletter() {
  return (
    <section
      aria-labelledby="newsletter-heading"
      className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-20 lg:py-20"
    >
      <div className="flex flex-col items-center gap-6 rounded-lg bg-bg-section px-8 py-16 text-center sm:px-16">
        <h2 id="newsletter-heading" className="text-h2 text-text-primary">
          Stay in the loop
        </h2>
        <p className="max-w-md text-body text-text-secondary">
          New arrivals, restocks, and members-only offers — straight to your
          inbox, once in a while.
        </p>
        <NewsletterForm />
      </div>
    </section>
  )
}
