import { useCallback, useEffect, useRef, useState } from 'react'
import { getHistoryScrollOffset } from '../utils/historyPageNav.js'

/**
 * Scroll spy por posición de scroll (mismo criterio que Bootstrap / docs).
 * No bloquea el scroll manual tras un clic en el índice.
 */
export function useSectionScrollSpy(sectionIds) {
  const idsKey = (sectionIds || []).join('|')
  const [activeId, setActiveId] = useState(sectionIds?.[0] || '')
  const isClickScrollingRef = useRef(false)
  const clickScrollTimerRef = useRef(null)

  useEffect(() => {
    setActiveId(sectionIds?.[0] || '')
  }, [idsKey])

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id)
    if (!el) return

    const prefersReduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const top = el.getBoundingClientRect().top + window.scrollY - getHistoryScrollOffset()
    setActiveId(id)

    isClickScrollingRef.current = true
    if (clickScrollTimerRef.current) window.clearTimeout(clickScrollTimerRef.current)
    clickScrollTimerRef.current = window.setTimeout(() => {
      isClickScrollingRef.current = false
      clickScrollTimerRef.current = null
    }, prefersReduce ? 80 : 700)

    window.scrollTo({
      top: Math.max(0, top),
      behavior: prefersReduce ? 'auto' : 'smooth',
    })
  }, [])

  useEffect(() => {
    const ids = (sectionIds || []).filter(Boolean)
    if (!ids.length) return undefined

    let ticking = false

    const resolveActiveId = () => {
      if (isClickScrollingRef.current) return

      const offset = getHistoryScrollOffset() + 20
      let current = ids[0]

      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= offset) {
          current = id
        }
      }

      setActiveId(current)
      ticking = false
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(resolveActiveId)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    resolveActiveId()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (clickScrollTimerRef.current) window.clearTimeout(clickScrollTimerRef.current)
    }
  }, [idsKey])

  return { activeId, scrollToSection }
}
