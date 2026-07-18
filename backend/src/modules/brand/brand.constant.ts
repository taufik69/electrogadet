export const BRAND_CACHE_NAMESPACE = "brand"

/**
 * Allowlist of icon keys the frontend can actually render (react-icons/si
 * component names — see frontend/src/lib/data/brands.ts and spec §5.2/§9.3).
 * Kept here, not just in a zod `.regex()`, so an unrenderable key can never be
 * persisted — the dashboard's icon picker should also source from this list.
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
