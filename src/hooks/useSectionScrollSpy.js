import { useCallback, useEffect, useRef, useState } from 'react'
import { getHistoryScrollOffset } from '../utils/historyPageNav.js'

/**
 * Scroll spy con IntersectionObserver (mismo enfoque que ConcejoPageNav).
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

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((node) => node instanceof HTMLElement)

    if (!elements.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrollingRef.current) return

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -58% 0px',
        threshold: [0, 0.1, 0.25, 0.5],
      },
    )

    for (const el of elements) observer.observe(el)

    return () => {
      observer.disconnect()
      if (clickScrollTimerRef.current) window.clearTimeout(clickScrollTimerRef.current)
    }
  }, [idsKey, sectionIds])

  return { activeId, scrollToSection }
}
