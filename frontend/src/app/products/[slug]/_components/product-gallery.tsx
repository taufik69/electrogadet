"use client"

import { useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageZoomModal } from "./image-zoom-modal"

interface ProductGalleryProps {
  images: string[]
  name: string
  discountPercent: number | null
}

export function ProductGallery({ images, name, discountPercent }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        aria-label={`Zoom into ${name}`}
        className="group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-3xl border border-border bg-[radial-gradient(circle_at_30%_20%,_theme(colors.brand-subtle),_theme(colors.bg-section)_70%)] shadow-e2"
      >
        {discountPercent !== null && (
          <span className="text-small-semibold absolute left-4 top-4 z-10 rounded-full bg-danger px-3 py-1.5 text-white shadow-e2">
            -{discountPercent}% OFF
          </span>
        )}

        <div className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-text-primary opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <ZoomIn size={16} aria-hidden="true" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex]}
              alt={name}
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 45vw"
              className="object-contain p-10 transition-transform duration-300 group-hover:scale-105"
            />
          </motion.div>
        </AnimatePresence>
      </button>

      <ImageZoomModal
        images={images}
        name={name}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        open={zoomOpen}
        onOpenChange={setZoomOpen}
      />

      {images.length > 1 && (
        <div className="flex items-center gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1} of ${name}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-bg-section transition-all",
                index === activeIndex
                  ? "border-brand-primary shadow-e1 scale-[1.03]"
                  : "border-border opacity-70 hover:border-brand-primary/50 hover:opacity-100",
              )}
            >
              <Image src={image} alt="" fill sizes="80px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
