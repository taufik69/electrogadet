"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"

const SALE_DURATION_MS = (654 * 60 * 60 + 50 * 60 + 39) * 1000

function getRemaining(deadline: number) {
  const totalSeconds = Math.max(0, Math.floor((deadline - Date.now()) / 1000))
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

function pad(value: number): string {
  return value.toString().padStart(2, "0")
}

export function FlashSaleBanner() {
  const [deadline] = useState(() => Date.now() + SALE_DURATION_MS)
  const [remaining, setRemaining] = useState(() => getRemaining(deadline))

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemaining(deadline)), 1000)
    return () => clearInterval(interval)
  }, [deadline])

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-[#3a0d14] via-[#2a0a10] to-[#1a0509] p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger text-white">
          <Zap size={20} fill="currentColor" aria-hidden="true" />
        </span>
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-white/50">
            Limited time · Up to 70% off
          </p>
          <p className="text-h4 text-white">Flash Sale</p>
        </div>
        <p className="text-small hidden max-w-sm text-white/60 md:block">
          Premium picks at all-time-low prices. New items added every hour — once
          they&rsquo;re gone, they&rsquo;re gone.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2" aria-label="Time remaining">
          <TimeUnit value={pad(remaining.hours)} label="Hrs" />
          <span className="text-h4 text-white/30">:</span>
          <TimeUnit value={pad(remaining.minutes)} label="Min" />
          <span className="text-h4 text-white/30">:</span>
          <TimeUnit value={pad(remaining.seconds)} label="Sec" />
        </div>

        <Link
          href="/products?sale=flash"
          className="text-small-semibold flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-text-primary transition-colors hover:bg-white/90"
        >
          View all
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

function TimeUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-14 flex-col items-center gap-0.5 rounded-lg bg-white/10 px-3 py-2">
      <span className="text-h4 tabular-nums text-white">{value}</span>
      <span className="text-caption uppercase tracking-wide text-white/50">{label}</span>
    </div>
  )
}
