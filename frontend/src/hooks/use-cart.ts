"use client"

import { useCallback, useSyncExternalStore } from "react"
import {
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
  addToCart,
  clearCart,
  getCartItems,
  removeFromCart,
  updateCartItemQuantity,
  type CartItem,
} from "@/lib/cart"

const EMPTY_CART: CartItem[] = []

let cachedSnapshot: CartItem[] = EMPTY_CART
let cachedRaw: string | null = null

function getSnapshot(): CartItem[] {
  const raw = localStorage.getItem(CART_STORAGE_KEY)
  if (raw === cachedRaw) return cachedSnapshot
  cachedRaw = raw
  cachedSnapshot = getCartItems()
  return cachedSnapshot
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(CART_UPDATED_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(CART_UPDATED_EVENT, onStoreChange)
  }
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const add = useCallback((item: Parameters<typeof addToCart>[0], quantity?: number) => {
    addToCart(item, quantity)
  }, [])

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    updateCartItemQuantity(slug, quantity)
  }, [])

  const remove = useCallback((slug: string) => {
    removeFromCart(slug)
  }, [])

  const clear = useCallback(() => {
    clearCart()
  }, [])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotalCents = items.reduce((total, item) => total + item.priceCents * item.quantity, 0)
  const compareSubtotalCents = items.reduce(
    (total, item) => total + (item.compareAtCents ?? item.priceCents) * item.quantity,
    0,
  )

  return {
    items,
    itemCount,
    subtotalCents,
    savingsCents: Math.max(0, compareSubtotalCents - subtotalCents),
    add,
    updateQuantity,
    remove,
    clear,
  }
}

export { CART_STORAGE_KEY }
