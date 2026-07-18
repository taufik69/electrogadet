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

/**
 * Brand icons are React components, which can't be serialized over the API —
 * the backend sends an `iconKey` string (e.g. "SiApple") and this map resolves
 * it back to the actual component. Mirrors backend's BRAND_ICON_KEYS allowlist
 * (backend/src/modules/brand/brand.constant.ts) — keep both in sync.
 */
const BRAND_ICONS: Record<string, IconType> = {
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

/** Returns null for an unrecognized/missing key so callers can render a placeholder instead of crashing. */
export function resolveBrandIcon(iconKey: string | null): IconType | null {
  return iconKey ? (BRAND_ICONS[iconKey] ?? null) : null
}
