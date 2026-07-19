import { PromoCarousel } from "@/app/_components/promo-carousel"
import { fetchActiveBanners } from "@/lib/banners"

/**
 * Server component: fetches the banners and hands them to the client-side
 * carousel, which owns only the scroll/arrow interaction (spec §8).
 */
export async function HeroRow() {
  const banners = await fetchActiveBanners()

  return (
    <section className="w-full pt-4">
      <h1 className="sr-only">ElectroGadget — Premium Electronics</h1>
      <PromoCarousel banners={banners} />
    </section>
  )
}
