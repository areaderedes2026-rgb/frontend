import { getApiBase } from './apiConfig.js'

/** Convierte URL absoluta o ruta relativa del backend en URL usable para `<img src>`. */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return ''
  const t = url.trim()
  if (!t) return ''
  if (t.startsWith('http://') || t.startsWith('https://')) return t
  const base = getApiBase()
  if (!base) return t
  const path = t.startsWith('/') ? t : `/${t}`
  return `${base}${path}`
}
