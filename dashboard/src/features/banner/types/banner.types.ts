export interface BannerImage {
  id: string
  url: string
  status: "pending" | "processing" | "uploaded" | "failed"
  alt: string | null
}

export interface Banner {
  id: string
  title: string
  description: string
  isActive: boolean
  /**
   * Populated server-side (backend banner.service.ts attachImages) on every
   * read — always present as a key, null until an image is uploaded, so
   * `banner.image?.status` is a stable check.
   */
  image: BannerImage | null
  createdAt: string
  updatedAt: string
}

export interface CreateBannerInput {
  title: string
  description: string
  isActive?: boolean
}

export type UpdateBannerInput = Partial<CreateBannerInput>
