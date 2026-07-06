"use client"

import { useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from "lucide-react"

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.5

interface ImageZoomModalProps {
  images: string[]
  name: string
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageZoomModal({
  images,
  name,
  activeIndex,
  onActiveIndexChange,
  open,
  onOpenChange,
}: ImageZoomModalProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragState = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null)
  const pinchState = useRef<{ startDistance: number; startZoom: number } | null>(null)

  function resetView() {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  function clampZoom(value: number) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
  }

  function zoomIn() {
    setZoom((z) => clampZoom(z + ZOOM_STEP))
  }

  function zoomOut() {
    setZoom((z) => {
      const next = clampZoom(z - ZOOM_STEP)
      if (next === MIN_ZOOM) setPan({ x: 0, y: 0 })
      return next
    })
  }

  function handleWheel(event: React.WheelEvent) {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.25 : 0.25
    setZoom((z) => {
      const next = clampZoom(z + delta)
      if (next === MIN_ZOOM) setPan({ x: 0, y: 0 })
      return next
    })
  }

  function handlePointerDown(event: React.PointerEvent) {
    if (zoom <= MIN_ZOOM) return
    dragState.current = { startX: event.clientX, startY: event.clientY, panX: pan.x, panY: pan.y }
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!dragState.current) return
    const dx = event.clientX - dragState.current.startX
    const dy = event.clientY - dragState.current.startY
    setPan({ x: dragState.current.panX + dx, y: dragState.current.panY + dy })
  }

  function handlePointerUp() {
    dragState.current = null
  }

  function touchDistance(touches: React.TouchList) {
    const [a, b] = [touches[0], touches[1]]
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
  }

  function handleTouchStart(event: React.TouchEvent) {
    if (event.touches.length === 2) {
      pinchState.current = { startDistance: touchDistance(event.touches), startZoom: zoom }
    }
  }

  function handleTouchMove(event: React.TouchEvent) {
    if (event.touches.length === 2 && pinchState.current) {
      event.preventDefault()
      const distance = touchDistance(event.touches)
      const scale = distance / pinchState.current.startDistance
      setZoom(clampZoom(pinchState.current.startZoom * scale))
    }
  }

  function handleTouchEnd() {
    pinchState.current = null
  }

  function goTo(index: number) {
    resetView()
    onActiveIndexChange(index)
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) resetView()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex flex-col outline-none"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Dialog.Title className="sr-only">{name}</Dialog.Title>

          <div className="flex items-center justify-between gap-3 p-4">
            <span className="text-small text-white/70">
              {activeIndex + 1} / {images.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoom <= MIN_ZOOM}
                aria-label="Zoom out"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <span className="text-caption w-12 text-center text-white/70">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoom >= MAX_ZOOM}
                aria-label="Zoom in"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={resetView}
                disabled={zoom === MIN_ZOOM && pan.x === 0 && pan.y === 0}
                aria-label="Reset zoom"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={15} aria-hidden="true" />
              </button>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div
            className="relative flex-1 touch-none select-none overflow-hidden"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: zoom > MIN_ZOOM ? "grab" : "zoom-in" }}
            onDoubleClick={() => (zoom > MIN_ZOOM ? resetView() : setZoom(2))}
          >
            <div
              className="absolute inset-0 transition-transform duration-100 ease-out"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            >
              <Image
                src={images[activeIndex]}
                alt={name}
                fill
                sizes="100vw"
                className="object-contain p-6 sm:p-16"
                draggable={false}
                priority
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo((activeIndex - 1 + images.length) % images.length)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo((activeIndex + 1) % images.length)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
