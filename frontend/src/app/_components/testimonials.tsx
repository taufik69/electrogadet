import { Star } from "lucide-react"
import { testimonials } from "@/lib/data/testimonials"

export function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="bg-bg-section"
    >
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-20 lg:py-20">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <h2 id="testimonials-heading" className="text-h2 text-text-primary">
            Loved by customers
          </h2>
          <p className="text-body text-text-secondary">
            Real feedback from people who shop with Electromart.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex flex-col gap-4 rounded-md bg-surface p-6 shadow-e1"
            >
              <div className="flex gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < testimonial.rating
                        ? "size-4 fill-warning text-warning"
                        : "size-4 text-border"
                    }
                  />
                ))}
              </div>
              <blockquote className="text-body text-text-primary">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto flex flex-col">
                <span className="text-small-semibold text-text-primary">
                  {testimonial.name}
                </span>
                <span className="text-caption text-text-secondary">
                  {testimonial.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
