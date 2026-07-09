import fs from "node:fs"
import path from "node:path"
import { ApiError } from "../../shared/helpers/ApiError.js"
import { toCursorResult } from "../../shared/utils/pagination.js"
import { cached, bumpCacheVersion } from "../../shared/utils/cache.js"
import { CACHE_TTL } from "../../shared/constant/cache.js"
import { PUBLIC_DIR } from "../../shared/middlewares/upload.js"
import { brandRepository } from "./brand.repository.js"
import { BRAND_CACHE_NAMESPACE } from "./brand.constant.js"
import type { CreateBrandInput, UpdateBrandInput } from "./brand.types.js"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name)
  let slug = base
  let suffix = 2
  while (true) {
    const existing = await brandRepository.findBySlug(slug)
    if (!existing || existing.id === excludeId) {
      return slug
    }
    slug = `${base}-${suffix}`
    suffix += 1
  }
}

function deleteImageFile(image: string | null) {
  if (!image || !image.startsWith("/public/")) return
  const filePath = path.join(PUBLIC_DIR, image.replace(/^\/public\//, ""))
  fs.unlink(filePath, () => {})
}

export const brandService = {
  async listBrands(cursor: string | undefined, limit: number) {
    return cached(
      {
        namespace: BRAND_CACHE_NAMESPACE,
        key: `list:cursor=${cursor ?? "start"}:limit=${limit}`,
        ttlSeconds: CACHE_TTL.DEFAULT,
      },
      async () => {
        const rows = await brandRepository.findManyByCursor(cursor, limit)
        return toCursorResult(rows, limit)
      },
    )
  },

  async getBrandById(id: string) {
    const brand = await brandRepository.findById(id)
    if (!brand) {
      throw ApiError.notFound(`Brand with id "${id}" not found`)
    }
    return brand
  },

  async getBrandBySlug(slug: string) {
    const brand = await brandRepository.findBySlug(slug)
    if (!brand) {
      throw ApiError.notFound(`Brand with slug "${slug}" not found`)
    }
    return brand
  },

  async createBrand(input: CreateBrandInput) {
    const slug = await generateUniqueSlug(input.name)
    const brand = await brandRepository.create({ ...input, slug })
    await bumpCacheVersion(BRAND_CACHE_NAMESPACE)
    return brand
  },

  async updateBrand(id: string, input: UpdateBrandInput) {
    const existing = await brandRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Brand with id "${id}" not found`)
    }

    const slug = input.name && input.name !== existing.name
      ? await generateUniqueSlug(input.name, id)
      : undefined

    const brand = await brandRepository.update(id, { ...input, slug })
    if (input.image && existing.image && existing.image !== input.image) {
      deleteImageFile(existing.image)
    }
    await bumpCacheVersion(BRAND_CACHE_NAMESPACE)
    return brand
  },

  async deleteBrand(id: string) {
    const existing = await brandRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Brand with id "${id}" not found`)
    }
    await brandRepository.delete(id)
    deleteImageFile(existing.image)
    await bumpCacheVersion(BRAND_CACHE_NAMESPACE)
  },
}
