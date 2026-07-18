import "dotenv/config"
import fs from "node:fs/promises"
import { Worker, type Job } from "bullmq"
import { redisConnection } from "./shared/lib/redis.js"
import { prisma } from "./shared/lib/prisma.js"
import { bumpCacheVersion } from "./shared/utils/cache.js"
import { NAVIGATION_CACHE_NAMESPACE } from "./shared/constant/namespaces.js"
import { cloudinaryFileUpload, deleteCloudinaryFile } from "./shared/lib/cloudinary.js"
import { IMAGE_QUEUE_NAME, type ImageJobData } from "./shared/queues/image.queue.js"
import { IMAGE_CACHE_NAMESPACE } from "./modules/image/image.constant.js"
import { BRAND_CACHE_NAMESPACE } from "./modules/brand/brand.constant.js"
import { CATEGORY_CACHE_NAMESPACE } from "./modules/category/category.constant.js"

/**
 * Standalone process — run via `npm run worker`, never imported by the API
 * process. Picks up image jobs enqueued by image.service.ts and:
 *   pending -> processing -> uploaded | failed
 * tries/lastError on the Image row let failures surface in the dashboard
 * instead of vanishing (spec §4.2b) — this is the only place that writes them.
 */

const MAX_LOCAL_FILE_RETENTION_ATTEMPTS = 3

/** Namespaces whose cached reads embed an owner's image — bumped after a successful upload so stale urls aren't served. */
function cacheNamespacesForOwner(ownerType: string): string[] {
  switch (ownerType) {
    case "brand":
      return [BRAND_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE]
    case "category":
      return [CATEGORY_CACHE_NAMESPACE, NAVIGATION_CACHE_NAMESPACE]
    default:
      return [IMAGE_CACHE_NAMESPACE]
  }
}

/**
 * Brand/Category keep a denormalized `imageUrl` column so the sidebar query
 * never has to join Image (spec §2.3c). This is the one place that column is
 * written — it must happen in the same job as the upload, or the sidebar shows
 * a stale/missing logo while the Image row looks healthy.
 */
async function writeDenormalizedImageUrl(ownerType: string, ownerId: string, url: string) {
  if (ownerType === "brand") {
    await prisma.brand.update({ where: { id: ownerId }, data: { imageUrl: url } })
  } else if (ownerType === "category") {
    await prisma.category.update({ where: { id: ownerId }, data: { imageUrl: url } })
  }
}

async function handleUploadJob(job: Job<ImageJobData>) {
  const { imageId, ownerType, ownerId, localPath, oldPublicId } = job.data as {
    imageId: string
    ownerType: string
    ownerId: string
    localPath: string
    oldPublicId?: string
  }

  console.log(`[Worker] Processing image upload ${imageId} (${ownerType}/${ownerId})`)

  await prisma.image.update({
    where: { id: imageId },
    data: { status: "processing", tries: job.attemptsMade },
  })

  try {
    const uploaded = await cloudinaryFileUpload(localPath, { folder: `nordvolt/${ownerType}` })

    await prisma.image.update({
      where: { id: imageId },
      data: {
        url: uploaded.optimizeUrl,
        publicId: uploaded.result.public_id,
        status: "uploaded",
        localPath: "",
        tries: job.attemptsMade + 1,
        lastError: "",
      },
    })

    await writeDenormalizedImageUrl(ownerType, ownerId, uploaded.optimizeUrl)

    if (oldPublicId) {
      deleteCloudinaryFile(oldPublicId).catch((e: Error) =>
        console.error("[Worker] Old image delete failed:", e.message),
      )
    }

    await fs.unlink(localPath).catch(() => {})
    await Promise.all(cacheNamespacesForOwner(ownerType).map((ns) => bumpCacheVersion(ns)))

    return { imageId, url: uploaded.optimizeUrl }
  } catch (err) {
    // Cloudinary's SDK rejects with a plain { message, http_code } object, not
    // a real Error instance — `instanceof Error` alone would always miss it
    // and store the generic fallback instead of the actual reason.
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Upload failed"

    await prisma.image.update({
      where: { id: imageId },
      data: { status: "failed", tries: job.attemptsMade + 1, lastError: message },
    })

    // job.attemptsMade is 0-indexed *before* this attempt (0, 1, 2 for a
    // 3-attempt job) — the +1 matches what's persisted as `tries` above, and
    // is what must be compared against the retention cap.
    if (job.attemptsMade + 1 >= MAX_LOCAL_FILE_RETENTION_ATTEMPTS) {
      await fs.unlink(localPath).catch(() => {})
    }

    // Re-throw so BullMQ retries per the queue's defaultJobOptions.
    throw err
  }
}

async function handleDeleteJob(job: Job<ImageJobData>) {
  const { publicId } = job.data as { publicId: string }
  console.log(`[Worker] Deleting Cloudinary asset: ${publicId}`)
  await deleteCloudinaryFile(publicId)
  return { publicId, deleted: true }
}

function startImageWorker() {
  const worker = new Worker<ImageJobData>(
    IMAGE_QUEUE_NAME,
    async (job) => {
      if (job.name === "delete-cloudinary-image") {
        return handleDeleteJob(job)
      }
      return handleUploadJob(job)
    },
    { connection: redisConnection, concurrency: 3 },
  )

  worker.on("ready", () => console.log("[Worker] Image worker ready"))
  worker.on("active", (job) => console.log(`[Worker] Job active [${job.id}] ${job.name}`))
  worker.on("completed", (job) => console.log(`[Worker] Job completed [${job.id}]`))
  worker.on("failed", (job, err) => console.error(`[Worker] Job failed [${job?.id}]:`, err.message))
  worker.on("error", (err) => console.error("[Worker] error:", err))

  return worker
}

startImageWorker()
