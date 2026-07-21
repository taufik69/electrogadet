/**
 * Seeds Brand -> Category -> Product from seed-data.json, which was extracted
 * from frontend/src/lib/data/brands.ts (the hardcoded array the sidebar used
 * before this backend existed) with array order preserved as sortOrder.
 *
 * This doubles as the migration's acceptance test (spec §9.5): seed, hit
 * GET /api/navigation/sidebar, and the response should be structurally
 * identical to the old hardcoded array.
 *
 * Product.slug is globally unique — verified at extraction time that all 83
 * source product slugs are already distinct, so no rewriting was needed.
 *
 * Demo imagery comes from Unsplash (seed-images.json keyed by category slug,
 * seed-brand-images.json by brand slug); every URL was checked to return 200 at
 * authoring time. Images are written with status "uploaded" so they render —
 * the frontend filters on that, and nothing here goes through the upload
 * worker. Unsplash is already an allowed host in frontend/next.config.ts.
 *
 * Prices are demo values derived deterministically from the slug, so a given
 * product gets the same price on every reseed rather than a placeholder.
 */
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client.js"
import type { ImageOwnerType } from "../src/generated/prisma/enums.js"
import seedData from "./seed-data.json" with { type: "json" }
import categoryImages from "./seed-images.json" with { type: "json" }
import brandImages from "./seed-brand-images.json" with { type: "json" }

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const categoryImageBySlug: Record<string, string> = categoryImages
const brandImageBySlug: Record<string, string> = brandImages

/** Price band per category slug, in whole currency units, as [min, max]. */
const PRICE_BANDS: Record<string, [number, number]> = {
  macbook: [1299, 3499],
  laptops: [699, 2499],
  ipad: [399, 1299],
  tablets: [199, 999],
  iphone: [699, 1599],
  phones: [299, 1299],
  watch: [249, 799],
  watches: [199, 599],
  wearables: [79, 399],
  headphones: [99, 549],
  headsets: [79, 299],
  audio: [59, 349],
  speakers: [99, 899],
  soundbars: [199, 1299],
  monitors: [179, 1499],
  televisions: [449, 2999],
  cameras: [549, 3299],
  vacuums: [199, 899],
  keyboards: [59, 249],
  mice: [39, 169],
  accessories: [19, 199],
  "smart-home": [49, 329],
}

const DEFAULT_BAND: [number, number] = [49, 499]

/** Stable hash so reseeding never shuffles prices. */
function hashSlug(slug: string): number {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0
  }
  return hash
}

/** Deterministic in-band price, rounded to a .99 retail ending. */
function priceCentsFor(productSlug: string, categorySlug: string): number {
  const [min, max] = PRICE_BANDS[categorySlug] ?? DEFAULT_BAND
  const whole = min + (hashSlug(productSlug) % (max - min + 1))
  return whole * 100 - 1
}

const CATEGORY_SLUGS = Object.keys(categoryImageBySlug).sort()

/** A different category's image, so galleries aren't the same photo twice. */
function galleryPartnerFor(categorySlug: string, productSlug: string): string {
  const others = CATEGORY_SLUGS.filter((slug) => slug !== categorySlug)
  return categoryImageBySlug[others[hashSlug(productSlug) % others.length]]
}

/**
 * Image has no unique index covering (ownerType, ownerId, sortOrder), so
 * prisma.upsert can't be used — reseeding would stack duplicate rows. Match
 * on that triple manually and update in place.
 *
 * Written as "uploaded" with an empty publicId/localPath: these URLs are
 * already public, so they bypass the upload worker entirely.
 */
async function upsertOwnerImage(
  ownerType: ImageOwnerType,
  ownerId: string,
  url: string | undefined,
  alt: string,
  sortOrder = 0,
) {
  if (!url) return

  const existing = await prisma.image.findFirst({
    where: { ownerType, ownerId, sortOrder },
    select: { id: true },
  })

  if (existing) {
    await prisma.image.update({
      where: { id: existing.id },
      data: { url, alt, status: "uploaded" },
    })
    return
  }

  await prisma.image.create({
    data: { ownerType, ownerId, sortOrder, url, alt, status: "uploaded" },
  })
}

async function main() {
  for (const brandData of seedData) {
    const brand = await prisma.brand.upsert({
      where: { slug: brandData.slug },
      create: {
        name: brandData.name,
        slug: brandData.slug,
        iconKey: brandData.iconKey,
        sortOrder: brandData.sortOrder,
        imageUrl: brandImageBySlug[brandData.slug] ?? null,
      },
      update: {
        name: brandData.name,
        iconKey: brandData.iconKey,
        sortOrder: brandData.sortOrder,
        imageUrl: brandImageBySlug[brandData.slug] ?? null,
      },
    })

    await upsertOwnerImage("brand", brand.id, brandImageBySlug[brandData.slug], brandData.name)

    for (const categoryData of brandData.categories) {
      const category = await prisma.category.upsert({
        where: { brandId_slug: { brandId: brand.id, slug: categoryData.slug } },
        create: {
          name: categoryData.name,
          slug: categoryData.slug,
          sortOrder: categoryData.sortOrder,
          brandId: brand.id,
          imageUrl: categoryImageBySlug[categoryData.slug] ?? null,
        },
        update: {
          name: categoryData.name,
          sortOrder: categoryData.sortOrder,
          imageUrl: categoryImageBySlug[categoryData.slug] ?? null,
        },
      })

      await upsertOwnerImage(
        "category",
        category.id,
        categoryImageBySlug[categoryData.slug],
        categoryData.name,
      )

      for (const productData of categoryData.products) {
        const product = await prisma.product.upsert({
          where: { slug: productData.slug },
          create: {
            name: productData.name,
            slug: productData.slug,
            priceCents: priceCentsFor(productData.slug, categoryData.slug),
            brandId: brand.id,
          },
          update: {
            name: productData.name,
            priceCents: priceCentsFor(productData.slug, categoryData.slug),
            brandId: brand.id,
          },
        })

        // A product's own photo isn't in the source data, so it borrows its
        // category's image — good enough for demo browsing. The gallery adds a
        // sibling category's image so multi-image UI (dot indicators) has
        // something to show.
        const primary = categoryImageBySlug[categoryData.slug]
        await upsertOwnerImage("product_thumbnail", product.id, primary, productData.name)
        await upsertOwnerImage("product_gallery", product.id, primary, productData.name, 0)
        await upsertOwnerImage(
          "product_gallery",
          product.id,
          galleryPartnerFor(categoryData.slug, productData.slug),
          productData.name,
          1,
        )

        await prisma.productCategory.upsert({
          where: { productId_categoryId: { productId: product.id, categoryId: category.id } },
          create: { productId: product.id, categoryId: category.id, sortOrder: productData.sortOrder },
          update: { sortOrder: productData.sortOrder },
        })
      }
    }

    const productCount = brandData.categories.reduce((sum, c) => sum + c.products.length, 0)
    console.log(
      `Seeded ${brand.name}: ${brandData.categories.length} categories, ${productCount} products`,
    )
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (err) => {
    console.error(err)
    await prisma.$disconnect()
    process.exit(1)
  })
