import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { footPromos } from "@/lib/data/homepage"

export function FootPromos() {
  return (
    <section aria-label="Promotions" className="w-full px-4 pb-16 sm:px-6 lg:px-6">
      <div className="grid gap-6 md:grid-cols-2">
        {footPromos.map((promo) => (
          <Link
            key={promo.href}
            href={promo.href}
            className={`group relative flex aspect-2/1 items-center overflow-hidden rounded-lg ${promo.toneClassName}`}
          >
            <div className="relative z-10 flex flex-1 flex-col gap-2 p-8">
              <h3 className="text-h4 text-text-primary">{promo.title}</h3>
              {promo.subtitle && (
                <p className="text-small text-text-secondary">{promo.subtitle}</p>
              )}
              <ArrowRight className="mt-2 size-5 text-text-primary transition-transform duration-200 group-hover:translate-x-1" />
            </div>

            <Image
              src={promo.imageUrl}
              alt=""
              width={400}
              height={400}
              className="h-full w-2/5 shrink-0 object-contain p-6 transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          </Link>
        ))}
      </div>
    </section>
  )
}
