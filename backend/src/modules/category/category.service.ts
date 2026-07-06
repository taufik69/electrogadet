import fs from "node:fs"
import path from "node:path"
import { ApiError } from "../../shared/helpers/ApiError.js"
import { toCursorResult } from "../../shared/utils/pagination.js"
import { cached, bumpCacheVersion } from "../../shared/utils/cache.js"
import { CACHE_TTL } from "../../shared/constant/cache.js"
import { PUBLIC_DIR } from "../../shared/middlewares/upload.js"
import { categoryRepository } from "./category.repository.js"
import { CATEGORY_CACHE_NAMESPACE } from "./category.constant.js"
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.types.js"

function deleteImageFile(imageUrl: string | null) {
  if (!imageUrl || !imageUrl.startsWith("/public/")) return
  const filePath = path.join(PUBLIC_DIR, imageUrl.replace(/^\/public\//, ""))
  fs.unlink(filePath, () => {})
}

async function assertParentIsTopLevel(parentId: string) {
  const parent = await categoryRepository.findById(parentId)
  if (!parent) {
    throw ApiError.badRequest(`Parent category "${parentId}" does not exist`)
  }
  if (parent.parentId !== null) {
    throw ApiError.badRequest("Categories can only be nested two levels deep")
  }
}

export const categoryService = {
  async listCategories(cursor: string | undefined, limit: number) {
    return cached(
      {
        namespace: CATEGORY_CACHE_NAMESPACE,
        key: `list:cursor=${cursor ?? "start"}:limit=${limit}`,
        ttlSeconds: CACHE_TTL.DEFAULT,
      },
      async () => {
        const rows = await categoryRepository.findManyByCursor(cursor, limit)
        return toCursorResult(rows, limit)
      },
    )
  },

  async getNavTree() {
    return cached(
      { namespace: CATEGORY_CACHE_NAMESPACE, key: "tree", ttlSeconds: CACHE_TTL.LONG },
      () => categoryRepository.findTree(),
    )
  },

  async getCategoryById(id: string) {
    const category = await categoryRepository.findById(id)
    if (!category) {
      throw ApiError.notFound(`Category "${id}" not found`)
    }
    return category
  },

  async createCategory(input: CreateCategoryInput) {
    const existing = await categoryRepository.findBySlug(input.slug)
    if (existing) {
      throw ApiError.conflict(`Category with slug "${input.slug}" already exists`)
    }
    if (input.parentId) {
      await assertParentIsTopLevel(input.parentId)
    }
    const category = await categoryRepository.create(input)
    await bumpCacheVersion(CATEGORY_CACHE_NAMESPACE)
    return category
  },

  async updateCategory(id: string, input: UpdateCategoryInput) {
    const existing = await categoryRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Category "${id}" not found`)
    }
    if (input.slug && input.slug !== existing.slug) {
      const bySlug = await categoryRepository.findBySlug(input.slug)
      if (bySlug) {
        throw ApiError.conflict(`Category with slug "${input.slug}" already exists`)
      }
    }
    if (input.parentId) {
      await assertParentIsTopLevel(input.parentId)
    }
    const category = await categoryRepository.update(id, input)
    if (input.imageUrl && existing.imageUrl && existing.imageUrl !== input.imageUrl) {
      deleteImageFile(existing.imageUrl)
    }
    await bumpCacheVersion(CATEGORY_CACHE_NAMESPACE)
    return category
  },

  async deleteCategory(id: string) {
    const existing = await categoryRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Category "${id}" not found`)
    }
    await categoryRepository.delete(id)
    deleteImageFile(existing.imageUrl)
    await bumpCacheVersion(CATEGORY_CACHE_NAMESPACE)
  },
}
