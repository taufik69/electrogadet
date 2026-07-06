"use client"

import { useCallback, useSyncExternalStore } from "react"
import {
  WISHLIST_STORAGE_KEY,
  WISHLIST_UPDATED_EVENT,
  getWishlistItems,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  type WishlistItem,
} from "@/lib/wishlist"

const EMPTY_WISHLIST: WishlistItem[] = []

let cachedSnapshot: WishlistItem[] = EMPTY_WISHLIST
let cachedRaw: string | null = null

function getSnapshot(): WishlistItem[] {
  const raw = localStorage.getItem(WISHLIST_STORAGE_KEY)
  if (raw === cachedRaw) return cachedSnapshot
  cachedRaw = raw
  cachedSnapshot = getWishlistItems()
  return cachedSnapshot
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(WISHLIST_UPDATED_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(WISHLIST_UPDATED_EVENT, onStoreChange)
  }
}

function getServerSnapshot(): WishlistItem[] {
  return EMPTY_WISHLIST
}

export function useWishlist() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = useCallback((item: WishlistItem) => {
    return toggleWishlist(item)
  }, [])

  const remove = useCallback((slug: string) => {
    removeFromWishlist(slug)
  }, [])

  const clear = useCallback(() => {
    clearWishlist()
  }, [])

  const isWishlisted = useCallback(
    (slug: string) => items.some((i) => i.slug === slug),
    [items],
  )

  return {
    items,
    itemCount: items.length,
    toggle,
    remove,
    clear,
    isWishlisted,
  }
}
