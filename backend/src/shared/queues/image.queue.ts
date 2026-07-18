import { Queue } from "bullmq"
import { redisConnection } from "../lib/redis.js"
import type { ImageOwnerType } from "../../generated/prisma/enums.js"

export const IMAGE_QUEUE_NAME = "image-processing"

export interface UploadImageJobData {
  imageId: string
  ownerType: ImageOwnerType
  ownerId: string
  localPath: string
  /** Present on a re-upload (e.g. replacing a brand logo) so the worker can delete the old asset after the new one succeeds. */
  oldPublicId?: string
}

export interface DeleteImageJobData {
  publicId: string
}

export type ImageJobData = UploadImageJobData | DeleteImageJobData

export const imageQueue = new Queue<ImageJobData>(IMAGE_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 500 },
  },
})

export async function enqueueImageUpload(data: UploadImageJobData) {
  await imageQueue.add("upload-image", data)
}

export async function enqueueImageDelete(data: DeleteImageJobData) {
  await imageQueue.add("delete-cloudinary-image", data)
}
