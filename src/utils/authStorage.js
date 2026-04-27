import { getApiBase } from './apiConfig.js'

export const AUTH_STORAGE_KEY = 'municipalidad_trancas_auth'

/**
 * @returns {{ token: string | null, user: object } | null}
 */
export function readSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    const api = getApiBase()

    if (api) {
      if (data?.token && data?.user) {
        return { token: data.token, user: data.user }
      }
      return null
    }

    if (data?.user) {
      return { user: data.user, token: data.token ?? null }
    }
    return null
  } catch {
    return null
  }
}

export function writeSession({ token, user }) {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ token: token ?? null, user }),
  )
}

export function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

/** Cabeceras Authorization para fetch autenticados (solo si hay token). */
export function getAuthHeaders() {
  const session = readSession()
  if (!session?.token) return {}
  return { Authorization: `Bearer ${session.token}` }
}

export function jsonAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  }
}

/**
 * Si la API responde 401 y había sesión, limpia y redirige al login del admin.
 */
export function notifyUnauthorizedIfNeeded(res) {
  if (res.status !== 401) return
  const session = readSession()
  if (!session?.token || !getApiBase()) return
  clearSession()
  if (typeof window === 'undefined') return
  const path = window.location.pathname
  if (path.startsWith('/admin') && path !== '/admin/login') {
    window.location.assign('/admin/login')
  }
}
