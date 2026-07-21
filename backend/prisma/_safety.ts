import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client.js"
import seedData from "./seed-data.json" with { type: "json" }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

const brandSlugs = seedData.map((b) => b.slug)
const productSlugs = seedData.flatMap((b) => b.categories.flatMap((c) => c.products.map((p) => p.slug)))
const brands = await prisma.brand.findMany({ where: { slug: { in: brandSlugs } }, select: { id: true } })
const cats = await prisma.category.findMany({ where: { brandId: { in: brands.map((b) => b.id) } }, select: { id: true } })
const prods = await prisma.product.findMany({ where: { slug: { in: productSlugs } }, select: { id: true } })

const ownerIds = [...brands.map(b=>b.id), ...cats.map(c=>c.id), ...prods.map(p=>p.id)]
// Any Cloudinary-backed image owned by something we're about to delete?
const risky = await prisma.image.findMany({
  where: { ownerId: { in: ownerIds }, publicId: { not: "" } },
  select: { ownerType: true, publicId: true },
})
console.log("Cloudinary assets owned by seed rows (MUST BE 0):", risky.length)
if (risky.length) console.log(JSON.stringify(risky, null, 2))
const total = await prisma.image.count({ where: { ownerId: { in: ownerIds } } })
console.log("Total image rows owned by seed rows:", total)
await prisma.$disconnect()
