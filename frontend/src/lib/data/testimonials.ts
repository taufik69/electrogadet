export interface Testimonial {
  name: string
  role: string
  quote: string
  rating: number
}

export const testimonials: Testimonial[] = [
  {
    name: "Amara Chen",
    role: "Verified buyer",
    quote:
      "The unboxing alone felt premium. Everything about the sound quality and build makes this feel like a much more expensive product.",
    rating: 5,
  },
  {
    name: "Daniel Osei",
    role: "Verified buyer",
    quote:
      "Fast shipping, thoughtful packaging, and the product matched every spec listed. Exactly what I wanted from an upgrade.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Verified buyer",
    quote:
      "Customer support helped me pick the right model in minutes. No pressure, just genuinely useful advice.",
    rating: 4,
  },
  {
    name: "Mateo Rivera",
    role: "Verified buyer",
    quote:
      "Ordered on a Friday night and it arrived Saturday morning. The trade-in credit was applied without me having to chase anyone.",
    rating: 5,
  },
]
