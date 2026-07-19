export interface BannerImage {
  id: string
  url: string
  status: "pending" | "processing" | "uploaded" | "failed"
  alt: string | null
}

export interface Banner {
  id: string
  /** May contain a literal "\n" — rendered with `whitespace-pre-line`. */
  title: string
  description: string
  isActive: boolean
  /** Always present as a key; null until the worker finishes the upload. */
  image: BannerImage | null
  createdAt: string
  updatedAt: string
}
