import type { ProductModel } from "../../generated/prisma/models.js"

export type Product = ProductModel

export interface CreateProductInput {
  name: string
  slug: string
  priceCents: number
}
