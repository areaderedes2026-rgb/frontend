import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

function resetHorizontalScroll() {
  if (typeof window === 'undefined') return
  if (window.scrollX !== 0) {
    window.scrollTo({ top: window.scrollY, left: 0, behavior: 'auto' })
  }
  const scrollingEl = document.scrollingElement
  if (scrollingEl && scrollingEl.scrollLeft !== 0) {
    scrollingEl.scrollLeft = 0
  }
  if (document.documentElement.scrollLeft !== 0) {
    document.documentElement.scrollLeft = 0
  }
  if (document.body.scrollLeft !== 0) {
    document.body.scrollLeft = 0
  }
}

/**
 * Lleva el scroll al inicio cada vez que cambia la ruta (PUSH/REPLACE).
 * - Respeta anclas (#hash) para no romper navegación interna a secciones.
 * - En navegaciones POP (botón atrás/adelante del navegador) no fuerza scroll
 *   para permitir la restauración nativa de posición previa.
 * - Usa `useLayoutEffect` + `behavior: 'auto'` para mover el scroll antes del
 *   primer paint de la nueva página (evita flicker y que IntersectionObserver
 *   se inicialice con la posición vieja en mobile).
 * - En móvil, también corrige scroll horizontal residual tras refresh/bfcache.
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

    if (navigationType === 'POP') {
      resetHorizontalScroll()
      return
    }
    if (hash) {
      resetHorizontalScroll()
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash, navigationType])

  useEffect(() => {
    resetHorizontalScroll()

    const onPageShow = () => {
      // bfcache / refresh en iOS a veces restaura scrollX > 0.
      resetHorizontalScroll()
    }
    const onOrientation = () => {
      window.requestAnimationFrame(resetHorizontalScroll)
    }

    window.addEventListener('pageshow', onPageShow)
    window.addEventListener('orientationchange', onOrientation)
    return () => {
      window.removeEventListener('pageshow', onPageShow)
      window.removeEventListener('orientationchange', onOrientation)
    }
  }, [])

  return null
}
