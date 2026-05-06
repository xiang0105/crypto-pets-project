const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
const AUTH_TOKEN_KEY = 'cryptopets.authToken'

export function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'API_ERROR' }))
    throw new Error(typeof body.error === 'string' ? body.error : 'API_ERROR')
  }

  return response.json() as Promise<T>
}
