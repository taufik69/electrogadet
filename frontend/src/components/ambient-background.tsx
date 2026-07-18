/**
 * Decorative background for the main content column: soft grey blobs that give
 * the otherwise flat white area some depth.
 *
 * Purely visual — `aria-hidden` and `pointer-events-none`, so it never enters
 * the accessibility tree or intercepts clicks.
 *
 * Everything is `fixed` rather than `absolute`: the homepage is long, and an
 * absolutely-positioned layer would stretch across the full scroll height and
 * dilute the effect. Fixed keeps the tint steady while content scrolls over it.
 *
 * Colors come from the blob tokens in `globals.css` — greyscale only, so the
 * background reads as depth rather than as a competing brand color.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Top-right — anchors the area that reads as flat white. */}
      <div className="absolute -top-40 -right-48 size-[42rem] rounded-full bg-blob-1 blur-3xl" />

      {/* Mid-left — offsets the top-right blob so the page isn't lopsided. */}
      <div className="absolute top-[40%] -left-56 size-[38rem] rounded-full bg-blob-2 blur-3xl" />

      {/* Lower-right — carries the tint down past the fold toward the footer. */}
      <div className="absolute -right-40 bottom-[-10%] size-[34rem] rounded-full bg-blob-3 blur-3xl" />
    </div>
  )
}
