/**
 * Prices are stored in minor units (kopeks) on the backend's priceCents column
 * — same convention the dashboard formats against, so both surfaces agree.
 */
export function formatPriceCents(kopeks: number, currency = "RUB"): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
  }).format(kopeks / 100)
}
