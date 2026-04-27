import { useEffect, useRef, useState } from 'react'

function getPrefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const VARIANTS = {
  default: {
    hidden:
      'translate-y-8 opacity-0 will-change-[transform,opacity]',
    shown: 'translate-y-0 opacity-100',
    transition:
      'duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
    /** Margen del root para el observer (porcentaje abajo = aparece un poco antes). */
    rootMargin: '0px 0px -6% 0px',
  },
  /** Tarjetas de noticias: sube desde abajo con leve escala (responsive). */
  newsCard: {
    hidden:
      'translate-y-[2rem] scale-[0.98] opacity-0 will-change-[transform,opacity] sm:translate-y-[2.75rem] sm:scale-[0.985]',
    shown: 'translate-y-0 scale-100 opacity-100',
    transition:
      'duration-[780ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
    rootMargin: '0px 0px 8% 0px',
  },
  slow: {
    hidden:
      'translate-y-10 opacity-0 will-change-[transform,opacity]',
    shown: 'translate-y-0 opacity-100',
    transition:
      'duration-[1050ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
    rootMargin: '0px 0px -8% 0px',
  },
  newsCardSlow: {
    hidden:
      'translate-y-[2.25rem] scale-[0.98] opacity-0 will-change-[transform,opacity] sm:translate-y-[3rem] sm:scale-[0.985]',
    shown: 'translate-y-0 scale-100 opacity-100',
    transition:
      'duration-[1150ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
    rootMargin: '0px 0px 6% 0px',
  },
}

/**
 * Revela el contenido al entrar en el viewport (solo efecto visual).
 * Respeta prefers-reduced-motion.
 */
export function RevealOnScroll({
  children,
  className = '',
  delayMs = 0,
  /** Desactiva la animación (p. ej. contenido crítico ya visible). */
  disabled = false,
  /** `newsCard`: entrada desde abajo más expresiva (noticias en inicio). */
  variant = 'default',
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(getPrefersReducedMotion)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const v = VARIANTS[variant] ?? VARIANTS.default

  useEffect(() => {
    if (disabled || reduceMotion) return
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: variant === 'newsCard' || variant === 'newsCardSlow' ? 0.06 : 0.08, rootMargin: v.rootMargin },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [disabled, reduceMotion, variant, v.rootMargin])

  const show = visible || reduceMotion || disabled

  return (
    <div
      ref={ref}
      className={`${className} ${
        show ? v.shown : v.hidden
      } transition-[opacity,transform] ${v.transition} motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-none`}
      style={
        reduceMotion || disabled
          ? undefined
          : { transitionDelay: show ? `${delayMs}ms` : '0ms' }
      }
    >
      {children}
    </div>
  )
}
