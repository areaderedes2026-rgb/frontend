import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext.js'
import { getApiBase } from '../utils/apiConfig.js'
import {
  readSession,
  writeSession,
  clearSession,
} from '../utils/authStorage.js'

function sessionIsAuthenticated(session) {
  if (!session?.user) return false
  const api = getApiBase()
  if (!api) return true
  return Boolean(session.token)
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession())

  const user = session?.user ?? null
  const isAuthenticated = sessionIsAuthenticated(session)

  /** Valida el JWT con el backend al cargar (solo si hay API + token). */
  useEffect(() => {
    const apiBase = getApiBase()
    if (!apiBase) return

    const s = readSession()
    if (!s?.token) return

    let cancelled = false

    fetch(`${apiBase}/api/auth/me`, {
      headers: { Authorization: `Bearer ${s.token}` },
    })
      .then(async (res) => {
        if (cancelled) return
        if (!res.ok) {
          clearSession()
          setSession(null)
          return
        }
        const data = await res.json().catch(() => null)
        if (data?.user) {
          writeSession({ token: s.token, user: data.user })
          setSession(readSession())
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearSession()
          setSession(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (username, password) => {
    if (!username?.trim() || !password) {
      return { ok: false, error: 'Ingresá usuario y contraseña.' }
    }

    const apiBase = getApiBase()

    if (!apiBase) {
      const u = username.trim().toLowerCase()
      const next = {
        id: '1',
        username: u,
        name: 'Administrador',
        role: 'admin',
      }
      writeSession({ token: null, user: next })
      setSession(readSession())
      return { ok: true }
    }

    try {
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        return {
          ok: false,
          error:
            typeof data.error === 'string'
              ? data.error
              : 'Credenciales inválidas.',
        }
      }

      if (!data.token || !data.user) {
        return { ok: false, error: 'Respuesta inválida del servidor.' }
      }

      writeSession({ token: data.token, user: data.user })
      setSession(readSession())
      return { ok: true }
    } catch {
      const base = getApiBase()
      return {
        ok: false,
        error: `No se pudo conectar con el servidor (${base || 'API sin configurar'}). Revisa la API o la red.`,
      }
    }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login,
      logout,
    }),
    [user, isAuthenticated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
