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
 * priceCents has no source data (this file only ever described navigation,
 * not pricing) so every seeded product gets a placeholder; replace via the
 * product API once real catalog data exists.
 */
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client.js"
import seedData from "./seed-data.json" with { type: "json" }

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const PLACEHOLDER_PRICE_CENTS = 9999

async function main() {
  for (const brandData of seedData) {
    const brand = await prisma.brand.upsert({
      where: { slug: brandData.slug },
      create: {
        name: brandData.name,
        slug: brandData.slug,
        iconKey: brandData.iconKey,
        sortOrder: brandData.sortOrder,
      },
      update: {
        name: brandData.name,
        iconKey: brandData.iconKey,
        sortOrder: brandData.sortOrder,
      },
    })

    for (const categoryData of brandData.categories) {
      const category = await prisma.category.upsert({
        where: { brandId_slug: { brandId: brand.id, slug: categoryData.slug } },
        create: {
          name: categoryData.name,
          slug: categoryData.slug,
          sortOrder: categoryData.sortOrder,
          brandId: brand.id,
        },
        update: {
          name: categoryData.name,
          sortOrder: categoryData.sortOrder,
        },
      })

      for (const productData of categoryData.products) {
        const product = await prisma.product.upsert({
          where: { slug: productData.slug },
          create: {
            name: productData.name,
            slug: productData.slug,
            priceCents: PLACEHOLDER_PRICE_CENTS,
            brandId: brand.id,
          },
          update: {
            name: productData.name,
            brandId: brand.id,
          },
        })

        await prisma.productCategory.upsert({
          where: { productId_categoryId: { productId: product.id, categoryId: category.id } },
          create: { productId: product.id, categoryId: category.id, sortOrder: productData.sortOrder },
          update: { sortOrder: productData.sortOrder },
        })
      }
    }

    console.log(`Seeded brand: ${brand.name} (${brandData.categories.length} categories)`)
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
