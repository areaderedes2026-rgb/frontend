import { useEffect, useRef, useState } from 'react'
import { getHistoryScrollOffset } from '../utils/historyPageNav.js'

/**
 * Resalta en el índice la sección visible según el scroll.
 */
export function useHistoryScrollSpy(sectionIds, { enabled = true } = {}) {
  const idsKey = (sectionIds || []).join('|')
  const [activeId, setActiveId] = useState(sectionIds?.[0] || '')
  const programmaticTargetRef = useRef(null)
  const programmaticTimerRef = useRef(null)

  useEffect(() => {
    setActiveId(sectionIds?.[0] || '')
  }, [idsKey])

  useEffect(() => {
    if (!enabled || !sectionIds?.length) return undefined

    function resolveActiveId() {
      if (programmaticTargetRef.current) {
        return programmaticTargetRef.current
      }

      const offset = getHistoryScrollOffset(20)
      let current = sectionIds[0]

      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top <= offset) current = id
      }

      return current
    }

    function onScroll() {
      const next = resolveActiveId()
      setActiveId((prev) => (prev === next ? prev : next))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [enabled, idsKey, sectionIds])

  function setProgrammaticTarget(id, durationMs = 900) {
    programmaticTargetRef.current = id
    setActiveId(id)
    if (programmaticTimerRef.current) {
      window.clearTimeout(programmaticTimerRef.current)
    }
    programmaticTimerRef.current = window.setTimeout(() => {
      programmaticTargetRef.current = null
      programmaticTimerRef.current = null
    }, durationMs)
  }

  useEffect(
    () => () => {
      if (programmaticTimerRef.current) window.clearTimeout(programmaticTimerRef.current)
    },
    [],
  )

  return { activeId, setProgrammaticTarget }
}
