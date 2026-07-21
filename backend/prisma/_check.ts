import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client.js"
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
const imgs = await prisma.image.findMany({
  where: { ownerType: "brand" },
  select: { id: true, url: true, publicId: true, status: true, ownerId: true },
})
console.log("BRAND IMAGE ROWS:", imgs.length)
for (const i of imgs) {
  const host = i.url ? new URL(i.url).hostname : "(empty)"
  console.log(`  ${i.status.padEnd(9)} host=${host.padEnd(24)} publicId=${i.publicId || "(none)"}`)
}
const brands = await prisma.brand.findMany({ select: { name: true, imageUrl: true } })
const byHost: Record<string, number> = {}
for (const b of brands) {
  const h = b.imageUrl ? new URL(b.imageUrl).hostname : "(null)"
  byHost[h] = (byHost[h] ?? 0) + 1
}
console.log("BRAND.imageUrl by host:", JSON.stringify(byHost))
await prisma.$disconnect()
