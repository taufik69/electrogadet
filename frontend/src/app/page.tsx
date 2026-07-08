import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { getActiveBanners } from "@/lib/banners";
import { getActiveFlashSale } from "@/lib/flash-sales";
import { HeroBanner } from "./_components/hero-banner";
import { FlashSaleBanner } from "./_components/flash-sale-banner";
import { BestSellers } from "./_components/best-sellers";
import { NewArrivals } from "./_components/new-arrivals";
import { WhyShopWithUs } from "./_components/why-shop-with-us";
import { FaqSection } from "./_components/faq-section";
import { FeaturedBrands } from "./_components/featured-brands";

const mockProducts = [
  {
    slug: "adidas-premium-stylish-comfort-running",
    name: "Adidas Premium Stylish Comfort Performance Running",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=480&q=80",
    priceCents: 158000,
    compareAtCents: 355000,
    discountPercent: 55,
    sellerName: "Export Fashion Shoes BD",
    isVerifiedSeller: true,
    badge: "new" as const,
    soldCount: 4,
    stockCount: 50,
  },
  {
    slug: "nike-zoom-sneakers-sports-shoe",
    name: "Nike Zoom Sneakers Sports Shoe For Men - Black - EFS-64",
    imageUrl:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=480&q=80",
    priceCents: 119000,
    compareAtCents: 285000,
    discountPercent: 58,
    sellerName: "Export Fashion Shoes BD",
    isVerifiedSeller: true,
    badge: "new" as const,
    soldCount: 18,
    stockCount: 50,
  },
  {
    slug: "redtape-drivex-ultra-running-shoes",
    name: "Redtape DriveX Ultra Comfort Running Shoes For Men",
    imageUrl:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=480&q=80",
    priceCents: 129900,
    compareAtCents: 870000,
    discountPercent: 85,
    sellerName: "Export Fashion Shoes BD",
    isVerifiedSeller: true,
    badge: "new" as const,
    soldCount: 2,
    stockCount: 50,
  },
  {
    slug: "asics-running-shoes-gray-ash",
    name: "Asics Running shoes For Man - Gray Ash - EFS-10",
    imageUrl:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=480&q=80",
    priceCents: 165000,
    compareAtCents: 550000,
    discountPercent: 70,
    sellerName: "Export Fashion Shoes BD",
    isVerifiedSeller: true,
    badge: "new" as const,
    soldCount: 26,
    stockCount: 50,
  },
  {
    slug: "crivit-performance-running-navy-blue",
    name: "Crivit Performance Running For Man - Navy Blue",
    imageUrl:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=480&q=80",
    priceCents: 125000,
    compareAtCents: 450000,
    discountPercent: 72,
    sellerName: "Export Fashion Shoes BD",
    isVerifiedSeller: true,
    badge: "new" as const,
    soldCount: 4,
    stockCount: 34,
  },
];

export default async function Home() {
  const [banners, flashSale] = await Promise.all([getActiveBanners(), getActiveFlashSale()]);

  return (
    <Container className="flex flex-col py-8 sm:py-10">
      <HeroBanner banners={banners} />

      {flashSale && (
        <div className="mt-10 sm:mt-14">
          <FlashSaleBanner flashSale={flashSale} />
        </div>
      )}

      <div className="mt-14 sm:mt-20">
        <FeaturedBrands />
      </div>

      <section className="mt-14 flex flex-col gap-4 sm:mt-20">
        <h2 className="text-h3 text-text-primary">Popular right now</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {mockProducts.map((product) => (
            <ProductCard key={product.slug} {...product} />
          ))}
        </div>
      </section>

      <div className="mt-14 sm:mt-20">
        <BestSellers />
      </div>

      <div className="mt-14 sm:mt-20">
        <NewArrivals />
      </div>

      <div className="mt-14 sm:mt-20">
        <WhyShopWithUs />
      </div>

      <div className="mt-14 mb-6 sm:mt-20 sm:mb-10">
        <FaqSection />
      </div>
    </Container>
  );
}
