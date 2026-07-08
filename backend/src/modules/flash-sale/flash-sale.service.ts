import { Prisma } from "../../generated/prisma/client.js"
import { ApiError } from "../../shared/helpers/ApiError.js"
import { toCursorResult } from "../../shared/utils/pagination.js"
import { cached, bumpCacheVersion } from "../../shared/utils/cache.js"
import { CACHE_TTL } from "../../shared/constant/cache.js"
import { flashSaleRepository } from "./flash-sale.repository.js"
import { FLASH_SALE_CACHE_NAMESPACE } from "./flash-sale.constant.js"
import type {
  CreateFlashSaleInput,
  UpdateFlashSaleInput,
  AddFlashSaleProductInput,
  UpdateFlashSaleProductInput,
} from "./flash-sale.types.js"

async function withProductExistsCheck<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw ApiError.badRequest("The referenced product does not exist")
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw ApiError.conflict("This product is already part of the flash sale")
    }
    throw error
  }
}

export const flashSaleService = {
  async listFlashSales(cursor: string | undefined, limit: number) {
    return cached(
      {
        namespace: FLASH_SALE_CACHE_NAMESPACE,
        key: `list:cursor=${cursor ?? "start"}:limit=${limit}`,
        ttlSeconds: CACHE_TTL.DEFAULT,
      },
      async () => {
        const rows = await flashSaleRepository.findManyByCursor(cursor, limit)
        return toCursorResult(rows, limit)
      },
    )
  },

  async getActiveFlashSale() {
    return cached(
      { namespace: FLASH_SALE_CACHE_NAMESPACE, key: "active", ttlSeconds: CACHE_TTL.SHORT },
      () => flashSaleRepository.findCurrentlyActive(new Date()),
    )
  },

  async getFlashSaleById(id: string) {
    const flashSale = await flashSaleRepository.findById(id)
    if (!flashSale) {
      throw ApiError.notFound(`Flash sale with id "${id}" not found`)
    }
    return flashSale
  },

  async createFlashSale(input: CreateFlashSaleInput) {
    if (new Date(input.endsAt) <= new Date(input.startsAt)) {
      throw ApiError.badRequest("endsAt must be after startsAt")
    }
    const flashSale = await flashSaleRepository.create(input)
    await bumpCacheVersion(FLASH_SALE_CACHE_NAMESPACE)
    return flashSale
  },

  async updateFlashSale(id: string, input: UpdateFlashSaleInput) {
    const existing = await flashSaleRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Flash sale with id "${id}" not found`)
    }
    const startsAt = input.startsAt ? new Date(input.startsAt) : existing.startsAt
    const endsAt = input.endsAt ? new Date(input.endsAt) : existing.endsAt
    if (endsAt <= startsAt) {
      throw ApiError.badRequest("endsAt must be after startsAt")
    }

    const flashSale = await flashSaleRepository.update(id, input)
    await bumpCacheVersion(FLASH_SALE_CACHE_NAMESPACE)
    return flashSale
  },

  async deleteFlashSale(id: string) {
    const existing = await flashSaleRepository.findById(id)
    if (!existing) {
      throw ApiError.notFound(`Flash sale with id "${id}" not found`)
    }
    await flashSaleRepository.delete(id)
    await bumpCacheVersion(FLASH_SALE_CACHE_NAMESPACE)
  },

  async addProduct(flashSaleId: string, input: AddFlashSaleProductInput) {
    const flashSale = await flashSaleRepository.findById(flashSaleId)
    if (!flashSale) {
      throw ApiError.notFound(`Flash sale with id "${flashSaleId}" not found`)
    }

    const entry = await withProductExistsCheck(() => flashSaleRepository.addProduct(flashSaleId, input))
    await bumpCacheVersion(FLASH_SALE_CACHE_NAMESPACE)
    return entry
  },

  async updateProduct(flashSaleId: string, entryId: string, input: UpdateFlashSaleProductInput) {
    const entry = await flashSaleRepository.findProductEntryById(entryId)
    if (!entry || entry.flashSaleId !== flashSaleId) {
      throw ApiError.notFound(`Flash sale product entry "${entryId}" not found`)
    }

    const updated = await flashSaleRepository.updateProduct(entryId, input)
    await bumpCacheVersion(FLASH_SALE_CACHE_NAMESPACE)
    return updated
  },

  async removeProduct(flashSaleId: string, entryId: string) {
    const entry = await flashSaleRepository.findProductEntryById(entryId)
    if (!entry || entry.flashSaleId !== flashSaleId) {
      throw ApiError.notFound(`Flash sale product entry "${entryId}" not found`)
    }

    await flashSaleRepository.removeProduct(entryId)
    await bumpCacheVersion(FLASH_SALE_CACHE_NAMESPACE)
  },
}
