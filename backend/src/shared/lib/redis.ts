import { Redis } from "ioredis"

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379"

/**
 * BullMQ requires `maxRetriesPerRequest: null` on the connection it's given —
 * with ioredis's default retry behavior, BullMQ's blocking commands (used to
 * wait for jobs) can throw instead of blocking indefinitely. This client is
 * for BullMQ Queue/Worker construction only, never for plain cache reads/writes.
 */
export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
})

/** General-purpose client for cache-through reads/writes — see shared/utils/cache.ts. */
export const redis = new Redis(REDIS_URL, {
  tls: REDIS_URL.startsWith("rediss://") ? {} : undefined,
})

redisConnection.on("error", (err: Error) => {
  console.error("[Redis/connection] error:", err.message)
})
redis.on("error", (err: Error) => {
  console.error("[Redis/cache] error:", err.message)
})
