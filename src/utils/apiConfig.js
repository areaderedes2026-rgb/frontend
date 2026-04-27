function normalize(raw) {
  return String(raw || '').replace(/\/$/, '').trim()
}

function isLoopbackUrl(url) {
  try {
    const u = new URL(url)
    return u.hostname === '127.0.0.1' || u.hostname === 'localhost'
  } catch {
    return false
  }
}

function deriveProductionApiFromBrowser() {
  if (typeof window === 'undefined') return ''
  const { protocol, hostname } = window.location
  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') return ''
  const cleanHost = hostname.replace(/^www\./, '')
  return `${protocol}//api.${cleanHost}`
}

/** URL base del backend, sin barra final. */
export function getApiBase() {
  const configured = normalize(import.meta.env.VITE_API_URL)
  const derived = deriveProductionApiFromBrowser()

  // Si por error quedó localhost en un deploy real, usar API del dominio público.
  if (configured && isLoopbackUrl(configured) && derived) return derived
  return configured || derived
}

export function isApiConfigured() {
  return Boolean(getApiBase())
}
