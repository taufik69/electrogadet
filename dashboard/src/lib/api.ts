const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000"

interface ApiSuccess<T> {
  success: true
  message: string
  data: T
  meta?: Record<string, unknown>
}

export interface CursorMeta {
  nextCursor: string | null
  hasMore: boolean
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiSuccess<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed with status ${res.status}`)
  }

  return (await res.json()) as ApiSuccess<T>
}

/**
 * For multipart/form-data uploads (image files) — no Content-Type header set
 * here, so the browser generates the correct `multipart/form-data; boundary=…`
 * itself. Setting it manually (as `request()` does for JSON) would omit the
 * boundary and the server couldn't parse the body.
 */
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { method: "POST", body: formData })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed with status ${res.status}`)
  }

  const body = (await res.json()) as ApiSuccess<T>
  return body.data
}

/** For single-resource reads/writes — unwraps `data`, drops `meta` (there isn't one). */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const body = await request<T>(path, init)
  return body.data
}

/**
 * For cursor-paginated list endpoints — keeps `meta.nextCursor`/`hasMore`
 * instead of discarding them. `apiFetch` alone can't page past the first
 * batch, which silently truncated the old hardcoded-limit announcement list;
 * don't repeat that for brand/category lists.
 */
export async function apiFetchPaged<T>(path: string, init?: RequestInit): Promise<{ data: T; meta: CursorMeta }> {
  const body = await request<T>(path, init)
  return { data: body.data, meta: (body.meta as unknown as CursorMeta) ?? { nextCursor: null, hasMore: false } }
}
