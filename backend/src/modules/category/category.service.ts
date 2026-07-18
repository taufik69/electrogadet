import { ApiError } from "../../shared/helpers/ApiError.js"
import { toCursorResult } from "../../shared/utils/pagination.js"
import { cached, bumpCacheVersions } from "../../shared/utils/cache.js"
import { CACHE_TTL } from "../../shared/constant/cache.js"
import { NAVIGATION_CACHE_NAMESPACE } from "../../shared/constant/namespaces.js"
import { categoryRepository } from "./category.repository.js"
import { CATEGORY_CACHE_NAMESPACE, MAX_CATEGORY_DEPTH } from "./category.constant.js"
import type {
  AttachProductInput,
  CreateCategoryInput,
  ReorderCategoryItem,
  ReorderCategoryProductItem,
  UpdateCategoryInput,
} from "./category.types.js"

/** Rejects a parentId that would create a cycle or exceed MAX_CATEGORY_DEPTH (spec §9.4). */
async function assertValidParent(categoryId: string | null, parentId: string) {
  if (parentId === categoryId) {
    throw ApiError.badRequest("A category cannot be its own parent")
  }

  const ancestors = await categoryRepository.findAncestorIds(parentId)

  if (categoryId && ancestors.includes(categoryId)) {
    throw ApiError.badRequest("This would create a cycle in the category tree")
  }

  if (ancestors.length + 1 >= MAX_CATEGORY_DEPTH) {
    throw ApiError.badRequest(`Category depth cannot exceed ${MAX_CATEGORY_DEPTH} levels`)
  }
}

export const categoryService = {
  async listCategories(
    cursor: string | undefined,
    limit: number,
    filters: { brandId?: string; parentId?: string; includeInactive: boolean },
  ) {
    return cached(
      {
        namespace: CATEGORY_CACHE_NAMESPACE,
        key: `list:cursor=${cursor ?? "start"}:limit=${limit}:brand=${filters.brandId ?? "any"}:parent=${filters.parentId ?? "any"}:inactive=${filters.includeInactive}`,
        ttlSeconds: CACHE_TTL.DEFAULT,
      },
      async () => {
        const rows = await categoryRepository.findManyByCursor(cursor, limit, filters)
        return toCursorResult(rows, limit)
      },
    )
  },

  async getCategoryById(id: string) {
    const category = await categoryRepository.findById(id)
    if (!category) {
      throw ApiError.notFound(`Category with id "${id}" not found`)
    }
    return category
  },

  async createCategory(input: CreateCategoryInput) {
    const existing = await categoryRepository.findByBrandAndSlug(input.brandId, input.slug)
    if (existing) {
      throw ApiError.conflict(`Category with slug "${input.slug}" already exists for this brand`)
    }

    if (input.parentId) {
      await assertValidParent(null, input.parentId)
    }

    const category = await categoryRepository.create(input)
    await bumpCacheVersions(CATEGORY_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE)
    return category
  },

  async updateCategory(id: string, input: UpdateCategoryInput) {
    const existing = await categoryRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Category with id "${id}" not found`)
    }

    if (input.parentId) {
      await assertValidParent(id, input.parentId)
    }

    const category = await categoryRepository.update(id, input)
    await bumpCacheVersions(CATEGORY_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE)
    return category
  },

  async deleteCategory(id: string) {
    const existing = await categoryRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Category with id "${id}" not found`)
    }

    await categoryRepository.delete(id)
    await bumpCacheVersions(CATEGORY_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE)
  },

  async reorderCategories(items: ReorderCategoryItem[]) {
    await categoryRepository.reorder(items)
    await bumpCacheVersions(CATEGORY_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE)
  },

  async attachProduct(categoryId: string, input: AttachProductInput) {
    const category = await categoryRepository.findById(categoryId)
    if (!category) {
      throw ApiError.notFound(`Category with id "${categoryId}" not found`)
    }

    const link = await categoryRepository.attachProduct(categoryId, input)
    await bumpCacheVersions(CATEGORY_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE)
    return link
  },

  async detachProduct(categoryId: string, productId: string) {
    await categoryRepository.detachProduct(categoryId, productId)
    await bumpCacheVersions(CATEGORY_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE)
  },

  async reorderCategoryProducts(categoryId: string, items: ReorderCategoryProductItem[]) {
    await categoryRepository.reorderProducts(categoryId, items)
    await bumpCacheVersions(CATEGORY_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE)
  },
}
