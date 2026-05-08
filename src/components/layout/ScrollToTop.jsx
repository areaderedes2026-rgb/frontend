import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Lleva el scroll al inicio cada vez que cambia la ruta (PUSH/REPLACE).
 * - Respeta anclas (#hash) para no romper navegación interna a secciones.
 * - En navegaciones POP (botón atrás/adelante del navegador) no fuerza scroll
 *   para permitir la restauración nativa de posición previa.
 * - Usa `useLayoutEffect` + `behavior: 'auto'` para mover el scroll antes del
 *   primer paint de la nueva página (evita flicker y que IntersectionObserver
 *   se inicialice con la posición vieja en mobile).
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()
  const lastPathRef = useRef(pathname)

  useLayoutEffect(() => {
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
