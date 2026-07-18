import { prisma } from "../../shared/lib/prisma.js"
import type {
  AttachProductInput,
  CreateCategoryInput,
  ReorderCategoryItem,
  ReorderCategoryProductItem,
  UpdateCategoryInput,
} from "./category.types.js"

export const categoryRepository = {
  async findManyByCursor(
    cursor: string | undefined,
    limit: number,
    filters: { brandId?: string; parentId?: string; includeInactive: boolean },
  ) {
    return prisma.category.findMany({
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: {
        ...(filters.brandId ? { brandId: filters.brandId } : {}),
        ...(filters.parentId !== undefined ? { parentId: filters.parentId } : {}),
        ...(filters.includeInactive ? {} : { isActive: true }),
      },
      take: limit + 1,
      orderBy: { id: "asc" },
    })
  },

  async findById(id: string) {
    return prisma.category.findUnique({ where: { id } })
  },

  async findByBrandAndSlug(brandId: string, slug: string) {
    return prisma.category.findUnique({ where: { brandId_slug: { brandId, slug } } })
  },

  /** Walks parentId up from `startId`, returning every ancestor id. Used for both cycle and depth checks. */
  async findAncestorIds(startId: string): Promise<string[]> {
    const ancestors: string[] = []
    let currentId: string | null = startId

    while (currentId) {
      const current: { id: string; parentId: string | null } | null = await prisma.category.findUnique({
        where: { id: currentId },
        select: { id: true, parentId: true },
      })
      if (!current?.parentId) break
      ancestors.push(current.parentId)
      currentId = current.parentId
    }

    return ancestors
  },

  async create(data: CreateCategoryInput) {
    return prisma.category.create({ data })
  },

  async update(id: string, data: UpdateCategoryInput) {
    return prisma.category.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.category.delete({ where: { id } })
  },

  async reorder(items: ReorderCategoryItem[]) {
    await prisma.$transaction(
      items.map((item) =>
        prisma.category.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } }),
      ),
    )
  },

  async attachProduct(categoryId: string, input: AttachProductInput) {
    return prisma.productCategory.upsert({
      where: { productId_categoryId: { productId: input.productId, categoryId } },
      create: { categoryId, productId: input.productId, sortOrder: input.sortOrder ?? 0 },
      update: { sortOrder: input.sortOrder ?? 0 },
    })
  },

  async detachProduct(categoryId: string, productId: string) {
    return prisma.productCategory.delete({
      where: { productId_categoryId: { productId, categoryId } },
    })
  },

  async reorderProducts(categoryId: string, items: ReorderCategoryProductItem[]) {
    await prisma.$transaction(
      items.map((item) =>
        prisma.productCategory.update({
          where: { productId_categoryId: { productId: item.productId, categoryId } },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    )
  },
}
