import { storySectionAnchorId } from '../data/historyStorySections.js'

export function getHistoryScrollOffset(extraPx = 16) {
  if (typeof window === 'undefined') return 96
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--navbar-h').trim()
  const navbar = Number.parseFloat(raw) || 80
  return navbar + extraPx
}

export function scrollToHistorySection(sectionId, { updateHash = true } = {}) {
  if (!sectionId || typeof window === 'undefined') return false
  const el = document.getElementById(sectionId)
  if (!el) return false

  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const offset = getHistoryScrollOffset()
  const top = el.getBoundingClientRect().top + window.scrollY - offset

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: prefersReduce ? 'auto' : 'smooth',
  })

  if (updateHash) {
    const nextHash = `#${sectionId}`
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash)
    }
  }

  return true
}

/**
 * Ítems del índice lateral según bloques visibles en la página de Historia.
 */
export function getHistoryPageNavItems({
  storySections = [],
  showLegacy = false,
  showDocumentary = false,
  documentaryTitle = '',
  showClosing = false,
  closingTitle = '',
}) {
  const items = (storySections || []).map((section) => ({
    id: storySectionAnchorId(section),
    label: section.title || 'Sección',
    kind: 'story',
  }))

  if (showLegacy) {
    items.push({
      id: 'tarjetas-historia',
      label: 'Destacados',
      kind: 'legacy',
    })
  }

  if (showDocumentary) {
    items.push({
      id: 'documental-historia',
      label: documentaryTitle || 'Documental',
      kind: 'documentary',
    })
  }

  if (showClosing) {
    items.push({
      id: 'cierre-historia',
      label: closingTitle || 'Cierre',
      kind: 'closing',
    })
  }

  return items
}
