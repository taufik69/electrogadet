import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client.js"
import seedData from "./seed-data.json" with { type: "json" }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

const brandSlugs = seedData.map((b) => b.slug)
const productSlugs = seedData.flatMap((b) => b.categories.flatMap((c) => c.products.map((p) => p.slug)))

const seedBrands = await prisma.brand.findMany({ where: { slug: { in: brandSlugs } }, select: { id: true, name: true } })
const seedProducts = await prisma.product.findMany({ where: { slug: { in: productSlugs } }, select: { id: true } })
const seedCats = await prisma.category.findMany({ where: { brandId: { in: seedBrands.map((b) => b.id) } }, select: { id: true } })

const otherBrands = await prisma.brand.findMany({ where: { slug: { notIn: brandSlugs } }, select: { name: true, slug: true } })
const otherProducts = await prisma.product.findMany({ where: { slug: { notIn: productSlugs } }, select: { name: true, slug: true } })
const otherCats = await prisma.category.findMany({ where: { brandId: { notIn: seedBrands.map((b) => b.id) } }, select: { name: true } })

// Cloudinary-backed images anywhere (must never be deleted blindly)
const cloudinary = await prisma.image.count({ where: { publicId: { not: "" } } })

console.log("TO DELETE (seed):", JSON.stringify({ brands: seedBrands.length, categories: seedCats.length, products: seedProducts.length }))
console.log("TO KEEP (yours):", JSON.stringify({
  brands: otherBrands.map((b) => b.slug),
  categories: otherCats.map((c) => c.name),
  products: otherProducts.map((p) => p.slug),
}))
console.log("Cloudinary-backed image rows in DB (all owners):", cloudinary)
await prisma.$disconnect()
