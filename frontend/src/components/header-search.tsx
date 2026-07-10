"use client"

import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function HeaderSearch() {
  const router = useRouter()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = String(formData.get("q") ?? "").trim()
    router.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products")
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="hidden flex-1 items-center sm:flex"
    >
      <div className="relative w-full max-w-2xl">
        <Input
          name="q"
          type="search"
          placeholder="Search products…"
          aria-label="Search products"
          className="h-10 rounded-full border-border bg-bg-section pr-10 pl-4 text-body shadow-none focus-visible:bg-surface"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label="Submit search"
          className="absolute top-1/2 right-1 size-8 -translate-y-1/2 rounded-full text-text-secondary hover:bg-transparent hover:text-brand-primary"
        >
          <Search className="size-4" />
        </Button>
      </div>
    </form>
  )
}
