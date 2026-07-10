"use client"

import { useState, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "success">("idle")

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("success")
  }

  if (status === "success") {
    return (
      <p className="text-body-lg text-brand-primary" role="status">
        You&apos;re on the list — thanks for subscribing.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <Input
        id="newsletter-email"
        type="email"
        required
        placeholder="you@example.com"
        className="h-11 rounded-md bg-surface"
      />
      <Button type="submit" size="lg" className="h-11 shrink-0 rounded-md">
        Subscribe
      </Button>
    </form>
  )
}
