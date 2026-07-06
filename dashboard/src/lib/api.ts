export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000"

interface ApiSuccess<T> {
  success: true
  message: string
  data: T
  meta?: Record<string, unknown>
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed with status ${res.status}`)
  }

  const body = (await res.json()) as ApiSuccess<T>
  return body.data
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })
  return handleResponse<T>(res)
}

/** For multipart/form-data requests — never set Content-Type manually, the browser sets the multipart boundary. */
export async function apiFetchFormData<T>(
  path: string,
  formData: FormData,
  method: "POST" | "PATCH" = "POST",
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { method, body: formData })
  return handleResponse<T>(res)
}
