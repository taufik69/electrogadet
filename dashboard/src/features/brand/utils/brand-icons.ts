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
 * The dashboard's create/edit form no longer sets iconKey (brand imagery is
 * the uploaded photo instead — see brand-form.tsx), but existing/seeded
 * brands still carry one, so the list view still resolves it for display.
 * Mirrors frontend/src/lib/brand-icons.ts — same keys, kept in sync manually.
 */
const BRAND_ICON_COMPONENTS: Record<string, IconType> = {
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
  return BRAND_ICON_COMPONENTS[iconKey] ?? null
}
