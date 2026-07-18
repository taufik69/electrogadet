import type { IconType } from "react-icons"
import {
  SiApple,
  SiSamsung,
  SiSony,
  SiXiaomi,
  SiBose,
  SiJbl,
  SiAsus,
  SiLenovo,
  SiGoogle,
  SiLg,
  SiOneplus,
  SiHuawei,
  SiRazer,
  SiSonos,
} from "react-icons/si"
import { BRAND_ICON_KEYS, type BrandIconKey } from "../types/brand.types"

/** Mirrors frontend/src/lib/brand-icons.ts — same keys, same source components, kept in sync manually. */
const BRAND_ICON_COMPONENTS: Record<BrandIconKey, IconType> = {
  SiApple,
  SiSamsung,
  SiSony,
  SiXiaomi,
  SiBose,
  SiJbl,
  SiAsus,
  SiLenovo,
  SiGoogle,
  SiLg,
  SiOneplus,
  SiHuawei,
  SiRazer,
  SiSonos,
}

export function resolveBrandIcon(iconKey: string | null | undefined): IconType | null {
  if (!iconKey) return null
  return BRAND_ICON_COMPONENTS[iconKey as BrandIconKey] ?? null
}

export { BRAND_ICON_KEYS }
