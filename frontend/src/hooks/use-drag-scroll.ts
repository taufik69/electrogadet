"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/** Pointer travel, in px, past which a drag suppresses the click on release. */
const DRAG_THRESHOLD = 4

/** Slack, in px, absorbing sub-pixel scroll rounding at the track's ends. */
const EDGE_EPSILON = 1

/**
 * Keeps a scroll offset inside [0, half) so a looping track scrolls in both
 * directions — auto-scroll only ever runs forward, but a drag can push the
 * offset below zero.
 */
function wrap(value: number, half: number) {
  return ((value % half) + half) % half
}

interface UseDragScrollOptions {
  /**
   * Render the item list twice and wrap at the midpoint for a seamless loop.
   * Off by default: a finite track reports honest `canScrollBefore/After`, which
   * is what arrow enable/disable needs.
   */
  loop?: boolean
  /** Continuous drift in px/sec. 0 disables it. Ignored unless `loop`. */
  autoScrollSpeed?: number
  /** Selector for one item, used to size an arrow step. */
  itemSelector: string
  /** Gap between items in px, added to the measured item width. */
  gap: number
}

/**
 * Horizontal drag-to-scroll for a native `overflow-x-auto` track, plus optional
 * looping auto-scroll.
 *
 * Touch and trackpad panning are deliberately left to the browser — taking them
 * over costs momentum scrolling and, on touch, fights vertical page scroll. Only
 * mouse drag is synthesised.
 */
export function useDragScroll({
  loop = false,
  autoScrollSpeed = 0,
  itemSelector,
  gap,
}: UseDragScrollOptions) {
  const trackRef = useRef<HTMLDivElement>(null)
  // Hover/focus and dragging pause independently — a drag can end while the
  // cursor is still inside, and that must stay paused.
  const hoverPausedRef = useRef(false)
  const dragPausedRef = useRef(false)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startScrollLeft: number
    moved: boolean
  } | null>(null)

  // Drives arrow disabled state, so it has to be render state, not a ref.
  const [canScrollBefore, setCanScrollBefore] = useState(false)
  const [canScrollAfter, setCanScrollAfter] = useState(false)

  const syncEdges = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    // A looping track can always scroll either way.
    if (loop) {
      setCanScrollBefore(true)
      setCanScrollAfter(true)
      return
    }
    const maxScroll = track.scrollWidth - track.clientWidth
    setCanScrollBefore(track.scrollLeft > EDGE_EPSILON)
    setCanScrollAfter(track.scrollLeft < maxScroll - EDGE_EPSILON)
  }, [loop])

  // Re-measure when the element resizes or its children change — the tile count
  // and viewport width both decide whether the arrows are live.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    syncEdges()
    const observer = new ResizeObserver(syncEdges)
    observer.observe(track)
    for (const child of track.children) observer.observe(child)
    return () => observer.disconnect()
  }, [syncEdges])

  useEffect(() => {
    const track = trackRef.current
    if (!track || !loop || autoScrollSpeed <= 0) return

    // Respect users who asked for reduced motion — no ambient animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0
    let previous = performance.now()

    function step(now: number) {
      const elapsed = now - previous
      previous = now
      frame = requestAnimationFrame(step)

      if (!track || hoverPausedRef.current || dragPausedRef.current) return

      // One full copy of the item list; wrapping there looks continuous
      // because the second copy is identical to the first.
      const half = track.scrollWidth / 2
      if (half <= 0) return

      track.scrollLeft = wrap(track.scrollLeft + (autoScrollSpeed * elapsed) / 1000, half)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [loop, autoScrollSpeed])

  /** Scrolls by one item, or by a full visible page when `page` is set. */
  const scrollByItem = useCallback(
    (direction: 1 | -1, page = false) => {
      const track = trackRef.current
      if (!track) return
      const item = track.querySelector<HTMLElement>(itemSelector)
      const step = (item?.offsetWidth ?? 320) + gap
      const distance = page
        ? // Whole visible pages, snapped down to a item boundary so tiles never
          // land half-cut against the edge.
          Math.max(1, Math.floor(track.clientWidth / step)) * step
        : step
      track.scrollBy({ left: distance * direction, behavior: "smooth" })
    },
    [itemSelector, gap],
  )

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return
    const track = trackRef.current
    if (!track) return

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      moved: false,
    }
    dragPausedRef.current = true
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    const track = trackRef.current
    if (!drag || !track || event.pointerId !== drag.pointerId) return

    const distance = event.clientX - drag.startX

    if (!drag.moved) {
      if (Math.abs(distance) < DRAG_THRESHOLD) return
      drag.moved = true
      // Captured only once the gesture is definitely a drag, so a plain click
      // still behaves normally.
      track.setPointerCapture(drag.pointerId)
    }

    const next = drag.startScrollLeft - distance
    const half = track.scrollWidth / 2
    track.scrollLeft = loop && half > 0 ? wrap(next, half) : next
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    const track = trackRef.current
    if (!drag || event.pointerId !== drag.pointerId) return

    if (drag.moved && track?.hasPointerCapture(drag.pointerId)) {
      track.releasePointerCapture(drag.pointerId)
    }
    dragPausedRef.current = false
    // Cleared on a later tick so the click that follows this release can still
    // see `moved` and cancel itself.
    const finished = drag
    setTimeout(() => {
      if (dragRef.current === finished) dragRef.current = null
    }, 0)
  }

  return {
    trackRef,
    canScrollBefore,
    canScrollAfter,
    scrollByItem,
    /** Spread onto the scrolling track element. */
    trackProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onScroll: syncEdges,
      // A drag that travelled far enough must not also activate whatever it
      // ended on top of.
      onClickCapture: (event: React.MouseEvent) => {
        if (dragRef.current?.moved) {
          event.preventDefault()
          event.stopPropagation()
        }
      },
      // Without these the browser's native text selection and image-drag ghost
      // hijack the gesture.
      draggable: false,
      onDragStart: (event: React.DragEvent) => event.preventDefault(),
    },
    /** Spread onto the wrapper that should pause auto-scroll on hover/focus. */
    hoverProps: {
      onMouseEnter: () => {
        hoverPausedRef.current = true
      },
      onMouseLeave: () => {
        hoverPausedRef.current = false
      },
      onFocusCapture: () => {
        hoverPausedRef.current = true
      },
      onBlurCapture: () => {
        hoverPausedRef.current = false
      },
    },
  }
}
