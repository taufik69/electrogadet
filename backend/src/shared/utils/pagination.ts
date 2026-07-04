export interface OffsetPaginationParams {
  page: number
  limit: number
}

export function toSkipTake({ page, limit }: OffsetPaginationParams) {
  return { skip: (page - 1) * limit, take: limit }
}

export interface CursorPaginationParams {
  cursor?: string
  limit: number
}

export interface CursorResult<T> {
  data: T[]
  nextCursor: string | null
  hasMore: boolean
}

/**
 * Fetches limit + 1 rows to detect if there's a next page without a separate count query.
 */
export function toCursorResult<T extends { id: string }>(rows: T[], limit: number): CursorResult<T> {
  const hasMore = rows.length > limit
  const data = hasMore ? rows.slice(0, limit) : rows
  const nextCursor = hasMore ? data[data.length - 1].id : null
  return { data, nextCursor, hasMore }
}
