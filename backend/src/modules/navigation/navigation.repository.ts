import { prisma } from "../../shared/lib/prisma.js"
import { SIDEBAR_PRODUCTS_PER_CATEGORY } from "./navigation.constant.js"

/**
 * One findMany with a nested select, not N+1. Selects only the fields the
 * sidebar renders (spec §9.1) — no Image join, no price/timestamp/SEO columns.
 * A brand with zero active top-level categories is excluded entirely (spec §8);
 * a category with zero active products is still returned (its `products`
 * array is simply empty — the frontend's chevron check relies on that).
 */
export const navigationRepository = {
  async findSidebarTree() {
    return prisma.brand.findMany({
      where: {
        isActive: true,
        categories: {
          some: { isActive: true, parentId: null },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        iconKey: true,
        imageUrl: true,
        categories: {
          where: { isActive: true, parentId: null },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            slug: true,
            products: {
              where: { product: { isActive: true } },
              orderBy: [{ sortOrder: "asc" }],
              take: SIDEBAR_PRODUCTS_PER_CATEGORY,
              select: {
                product: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
    })
  },
}
