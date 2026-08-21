/**
 * Scroll estable a secciones de Fiesta del Caballo (navbar + barra sticky).
 */

export const FDC_FORM_SECTION_ID = 'solicitud-puestos'

export const FDC_FORM_HASH_ALIASES = new Set([
  'solicitud-puestos',
  'preinscripcion',
  'preinscripción',
  'formulario',
  'puestos',
  'postularme',
])

export function resolveFdcHashTargetId(hash) {
  const raw = String(hash || '')
    .replace(/^#/, '')
    .trim()
    .toLowerCase()
  if (!raw) return null
  if (FDC_FORM_HASH_ALIASES.has(raw)) return FDC_FORM_SECTION_ID
  return raw
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Offset: navbar + barra de secciones FDC + respiración. */
export function getFdcScrollOffset() {
  if (typeof window === 'undefined') return 120
  const root = document.documentElement
  const navbarRaw = getComputedStyle(root).getPropertyValue('--navbar-h').trim()
  const navbar = Number.parseFloat(navbarRaw) || 80
  const sticky = document.getElementById('fdc-section-nav')
  const stickyH = sticky ? sticky.getBoundingClientRect().height : 64
  return Math.round(navbar + stickyH + 12)
}

export function scrollToFdcElement(elOrId, { behavior } = {}) {
  if (typeof window === 'undefined') return false
  const el =
    typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId
  if (!el) return false

  const reduce = prefersReducedMotion()
  const top =
    el.getBoundingClientRect().top + window.scrollY - getFdcScrollOffset()

  window.scrollTo({
    top: Math.max(0, Math.round(top)),
    behavior: reduce ? 'auto' : behavior || 'smooth',
  })
  return true
}

/**
 * Scroll con reintentos: el layout puede moverse (imágenes, sticky, reveal).
 * Devuelve cleanup para cancelar timers.
 */
export function scrollToFdcElementSettled(elOrId, { behavior } = {}) {
  if (typeof window === 'undefined') return () => {}

  const delays = [0, 50, 180, 420, 800]
  const timers = []
  let cancelled = false
  let raf = 0

  const attempt = (index) => {
    if (cancelled) return
    const reduce = prefersReducedMotion()
    // Primer intento suave; correcciones en auto para no pelear con smooth.
    const mode = reduce ? 'auto' : index === 0 ? behavior || 'smooth' : 'auto'
    scrollToFdcElement(elOrId, { behavior: mode })
  }

  raf = window.requestAnimationFrame(() => attempt(0))
  delays.slice(1).forEach((ms, i) => {
    timers.push(window.setTimeout(() => attempt(i + 1), ms))
  })

  return () => {
    cancelled = true
    window.cancelAnimationFrame(raf)
    timers.forEach((t) => window.clearTimeout(t))
  }
}
