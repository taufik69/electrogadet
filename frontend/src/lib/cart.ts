export interface CartItem {
  slug: string
  name: string
  imageUrl: string
  priceCents: number
  compareAtCents: number | null
  sellerName: string | null
  stockCount: number | null
  quantity: number
}

export const CART_STORAGE_KEY = "electrogadget-cart"
export const CART_UPDATED_EVENT = "electrogadget-cart-updated"

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CartItem[]) : []
  } catch {
    return []
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(CART_UPDATED_EVENT))
}

export function getCartItems(): CartItem[] {
  return readCart()
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  const items = readCart()
  const existing = items.find((i) => i.slug === item.slug)

  if (existing) {
    const maxQty = item.stockCount ?? Infinity
    existing.quantity = Math.min(existing.quantity + quantity, maxQty)
  } else {
    items.push({ ...item, quantity })
  }

  writeCart(items)
}

export function updateCartItemQuantity(slug: string, quantity: number) {
  const items = readCart()
  const item = items.find((i) => i.slug === slug)
  if (!item) return

  const maxQty = item.stockCount ?? Infinity
  item.quantity = Math.max(1, Math.min(quantity, maxQty))
  writeCart(items)
}

export function removeFromCart(slug: string) {
  const items = readCart().filter((i) => i.slug !== slug)
  writeCart(items)
}

export function clearCart() {
  writeCart([])
}
