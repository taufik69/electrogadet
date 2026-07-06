export interface WishlistItem {
  slug: string
  name: string
  imageUrl: string
  priceCents: number
  compareAtCents: number | null
  discountPercent: number | null
  sellerName: string | null
  stockCount: number | null
}

export const WISHLIST_STORAGE_KEY = "electrogadget-wishlist"
export const WISHLIST_UPDATED_EVENT = "electrogadget-wishlist-updated"

function readWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as WishlistItem[]) : []
  } catch {
    return []
  }
}

function writeWishlist(items: WishlistItem[]) {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT))
}

export function getWishlistItems(): WishlistItem[] {
  return readWishlist()
}

export function isInWishlist(slug: string): boolean {
  return readWishlist().some((i) => i.slug === slug)
}

export function addToWishlist(item: WishlistItem) {
  const items = readWishlist()
  if (items.some((i) => i.slug === item.slug)) return
  writeWishlist([...items, item])
}

export function removeFromWishlist(slug: string) {
  const items = readWishlist().filter((i) => i.slug !== slug)
  writeWishlist(items)
}

export function toggleWishlist(item: WishlistItem): boolean {
  const items = readWishlist()
  const exists = items.some((i) => i.slug === item.slug)

  if (exists) {
    writeWishlist(items.filter((i) => i.slug !== item.slug))
    return false
  }

  writeWishlist([...items, item])
  return true
}

export function clearWishlist() {
  writeWishlist([])
}
