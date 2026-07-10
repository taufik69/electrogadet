export interface PromoSlide {
  eyebrow?: string
  title: string
  subtitle: string
  imageUrl: string
  href: string
}

export const promoSlides: PromoSlide[] = [
  {
    eyebrow: "New season",
    title: "Premium sound,\nengineered for calm.",
    subtitle: "Precision audio built to last.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80",
    href: "/products",
  },
  {
    eyebrow: "New",
    title: "Effortless everyday carry.",
    subtitle: "Accessories for wherever you're headed.",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80",
    href: "/products",
  },
  {
    eyebrow: "Just landed",
    title: "Explore new soundscapes.",
    subtitle: "The latest additions to the catalog.",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&q=80",
    href: "/products",
  },
  {
    eyebrow: "Featured",
    title: "Your next daily driver.",
    subtitle: "For work, play, and everything between.",
    imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=900&q=80",
    href: "/products",
  },
]
