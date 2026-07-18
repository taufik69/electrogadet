export interface Brand {
  id: string
  name: string
  slug: string
  iconKey: string | null
  imageUrl: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateBrandInput {
  name: string
  slug: string
  iconKey?: string
  isActive?: boolean
  sortOrder?: number
}

export type UpdateBrandInput = Partial<Omit<CreateBrandInput, "slug">>

/**
 * Allowlist of icon keys the backend will actually accept and the storefront
 * can render (react-icons/si component names) — mirrors
 * backend/src/modules/brand/brand.constant.ts BRAND_ICON_KEYS. Sourcing the
 * dashboard's icon picker from this list, not free text, is what the backend
 * comment there asks for — an unrenderable key should never be enterable.
 */
export const BRAND_ICON_KEYS = [
  "SiApple",
  "SiSamsung",
  "SiSony",
  "SiXiaomi",
  "SiBose",
  "SiJbl",
  "SiAsus",
  "SiLenovo",
  "SiGoogle",
  "SiLg",
  "SiOneplus",
  "SiHuawei",
  "SiRazer",
  "SiSonos",
] as const

export type BrandIconKey = (typeof BRAND_ICON_KEYS)[number]
