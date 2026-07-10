import Link from "next/link"
import { Headphones, Smartphone, Watch, Laptop, Speaker } from "lucide-react"

/** Decorative gadgets drifting behind the wordmark. */
const GLYPHS = [
  { Icon: Headphones, className: "left-5 top-4", tilt: "-12deg", delay: "0ms" },
  { Icon: Smartphone, className: "left-16 bottom-4", tilt: "8deg", delay: "700ms" },
  { Icon: Watch, className: "right-20 top-3", tilt: "14deg", delay: "1400ms" },
  { Icon: Laptop, className: "right-6 bottom-5", tilt: "-8deg", delay: "2100ms" },
  { Icon: Speaker, className: "right-10 top-9", tilt: "6deg", delay: "2800ms" },
]

/** Equalizer bars — each animates on its own delay and height. */
const BARS = [
  { height: "h-3", delay: "0ms" },
  { height: "h-5", delay: "150ms" },
  { height: "h-2.5", delay: "300ms" },
  { height: "h-4", delay: "450ms" },
]

export function BrandMark() {
  return (
    <Link
      href="/"
      aria-label="ElectroGadget — home"
      className="group relative flex h-25.5 shrink-0 items-center justify-center gap-3 overflow-hidden border-b border-sidebar-border px-5"
    >
      {/* Drifting gadgets */}
      <span aria-hidden className="pointer-events-none absolute inset-0">
        {GLYPHS.map(({ Icon, className, tilt, delay }, index) => (
          <span
            key={index}
            className={`glyph-drift absolute text-white ${className}`}
            style={
              {
                animationDelay: delay,
                "--glyph-tilt": tilt,
              } as React.CSSProperties
            }
          >
            <Icon className="size-4" />
          </span>
        ))}
      </span>

      {/* Soft brand glow, brightens on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 h-16 w-40 -translate-x-1/2 rounded-full bg-brand-primary/20 blur-2xl transition-opacity duration-300 group-hover:bg-brand-primary/30"
      />

      <span className="relative text-h4 font-semibold tracking-tight text-white">
        ElectroGadget
      </span>

      {/* Equalizer */}
      <span aria-hidden className="relative flex items-end gap-0.5">
        {BARS.map((bar, index) => (
          <span
            key={index}
            className={`eq-bar w-0.5 rounded-full bg-brand-primary ${bar.height}`}
            style={{ animationDelay: bar.delay }}
          />
        ))}
      </span>
    </Link>
  )
}
