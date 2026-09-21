/**
 * Copia texto al portapapeles (HTTPS + gesto del usuario, con fallback para iOS).
 */
export function buildPageSectionUrl(sectionId) {
  if (typeof window === 'undefined') return ''
  const { origin, pathname, search } = window.location
  const hash = String(sectionId || '')
    .replace(/^#/, '')
    .trim()
  return `${origin}${pathname}${search}${hash ? `#${hash}` : ''}`
}

function copyWithExecCommand(text) {
  const selection = typeof window !== 'undefined' ? window.getSelection() : null
  const previousRanges = []
  if (selection) {
    for (let i = 0; i < selection.rangeCount; i += 1) {
      previousRanges.push(selection.getRangeAt(i))
    }
  }

  const span = document.createElement('span')
  span.textContent = text
  span.setAttribute('aria-hidden', 'true')
  span.style.position = 'fixed'
  span.style.top = '0'
  span.style.left = '0'
  span.style.width = '1px'
  span.style.height = '1px'
  span.style.opacity = '0'
  span.style.pointerEvents = 'none'
  span.style.whiteSpace = 'pre'
  document.body.appendChild(span)

  const range = document.createRange()
  range.selectNodeContents(span)
  selection?.removeAllRanges()
  selection?.addRange(range)

  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }

  selection?.removeAllRanges()
  previousRanges.forEach((r) => selection?.addRange(r))
  span.remove()
  return ok
}

export async function copyTextToClipboard(text) {
  const value = String(text || '')
  if (!value || typeof document === 'undefined') return false

  if (typeof navigator !== 'undefined' && window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      /* fallback */
    }
  }

  return copyWithExecCommand(value)
}
