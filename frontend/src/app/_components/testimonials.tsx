import { Star } from "lucide-react"
import { testimonials } from "@/lib/data/testimonials"
import type { Testimonial } from "@/lib/data/testimonials"

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex w-[360px] shrink-0 flex-col gap-4 rounded-md bg-surface p-6 shadow-e1">
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
        <span className="text-caption text-text-secondary">{testimonial.role}</span>
      </figcaption>
    </figure>
  )
}

export function Testimonials() {
  return (
    <section aria-labelledby="testimonials-heading" className="bg-bg-section py-16 lg:py-20">
      <div className="mb-10 flex flex-col items-center gap-2 px-4 text-center sm:px-6">
        <h2 id="testimonials-heading" className="text-h2 text-text-primary">
          Loved by customers
        </h2>
        <p className="text-body text-text-secondary">
          Real feedback from people who shop with ElectroGadget.
        </p>
      </div>

      {/* Marquee — pauses on hover or keyboard focus */}
      <div className="marquee group relative overflow-hidden">
        {/* Two identical halves; -50% lands on the start of the second. */}
        <div className="marquee-track flex">
          <ul className="flex shrink-0 gap-6 pr-6">
            {testimonials.map((testimonial) => (
              <li key={testimonial.name} className="flex">
                <TestimonialCard testimonial={testimonial} />
              </li>
            ))}
          </ul>
          <ul className="flex shrink-0 gap-6 pr-6" aria-hidden>
            {testimonials.map((testimonial) => (
              <li key={`dup-${testimonial.name}`} className="flex">
                <TestimonialCard testimonial={testimonial} />
              </li>
            ))}
          </ul>
        </div>

        {/* Soft edges so cards fade in/out rather than clipping */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bg-section to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bg-section to-transparent" />
      </div>
    </section>
  )
}
