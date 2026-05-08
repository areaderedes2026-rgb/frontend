import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Lleva el scroll al inicio cada vez que cambia la ruta (PUSH/REPLACE).
 * - Respeta anclas (#hash) para no romper navegación interna a secciones.
 * - En navegaciones POP (botón atrás/adelante del navegador) no fuerza scroll
 *   para permitir la restauración nativa de posición previa.
 * - Usa `instant`/`auto` para evitar parpadeos visuales.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()
  const lastPathRef = useRef(pathname)

  useEffect(() => {
    if (lastPathRef.current === pathname) {
      return
    }
    lastPathRef.current = pathname

    if (navigationType === 'POP') return
    if (hash) return

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash, navigationType])

  return null
}
