import { redis } from "../lib/redis.js"

const VERSION_KEY_PREFIX = "cache:version:"

async function getVersion(namespace: string): Promise<number> {
  const version = await redis.get(VERSION_KEY_PREFIX + namespace)
  return version ? Number(version) : 0
}

/**
 * Bumps a namespace's version, orphaning every key built with the previous
 * version so it's never read again (TTL reaps the dead keys from Redis).
 * Call this after any mutation that affects the namespace's cached reads.
 */
export async function bumpCacheVersion(namespace: string): Promise<void> {
  await redis.incr(VERSION_KEY_PREFIX + namespace)
}

async function buildKey(namespace: string, key: string): Promise<string> {
  const version = await getVersion(namespace)
  return `cache:${namespace}:v${version}:${key}`
}

interface CacheOptions {
  namespace: string
  key: string
  ttlSeconds: number
}

/**
 * Reads through Redis: returns the cached value if present, otherwise calls
 * `fetcher`, caches the result with the namespace's current version baked
 * into the key, and returns it. `bumpCacheVersion(namespace)` invalidates
 * everything cached under that namespace without needing to enumerate keys.
 */
export async function cached<T>(options: CacheOptions, fetcher: () => Promise<T>): Promise<T> {
  const fullKey = await buildKey(options.namespace, options.key)

  const hit = await redis.get(fullKey)
  if (hit !== null) {
    return JSON.parse(hit) as T
  }

  const value = await fetcher()
  await redis.set(fullKey, JSON.stringify(value), "EX", options.ttlSeconds)
  return value
}
