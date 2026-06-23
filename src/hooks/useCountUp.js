import { useEffect, useRef, useState } from 'react'

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Anima un número desde 0 hasta `target` cuando el elemento entra al viewport.
 */
export function useCountUp(target, { duration = 1600, rootMargin = '0px 0px -8% 0px' } = {}) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)
  const goal = Math.max(0, Math.min(99999, Math.round(Number(target) || 0)))

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(goal)
      setStarted(true)
      return undefined
    }

    const el = ref.current
    if (!el) return undefined

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          obs.disconnect()
        }
      },
      { threshold: 0.2, rootMargin },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [goal, rootMargin])

  useEffect(() => {
    if (!started) return undefined
    if (prefersReducedMotion() || goal === 0) {
      setValue(goal)
      return undefined
    }

    let raf = 0
    const t0 = performance.now()

    const tick = (now) => {
      const progress = Math.min(1, (now - t0) / duration)
      setValue(Math.round(goal * easeOutCubic(progress)))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, goal, duration])

  return { ref, value, goal }
}
