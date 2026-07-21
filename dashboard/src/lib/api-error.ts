/**
 * Unwraps the backend's error envelope for display in a toast.
 *
 * `request()`/`apiUpload()` in lib/api.ts already rethrow the server's
 * `{ success: false, message }` as `new Error(message)`, so in practice this is
 * `err.message` — but a network failure or a thrown non-Error would otherwise
 * render as "[object Object]" in the toast, which tells the admin nothing.
 */
export function getApiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === "string" && err) return err
  if (typeof err === "object" && err !== null && "message" in err) {
    const message = (err as { message: unknown }).message
    if (typeof message === "string" && message) return message
  }
  return fallback
}
