import { getApiBase } from '../utils/apiConfig.js'
import { filterStaticSiteSearch } from '../data/siteSearchStatic.js'

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null
  const path = String(raw.path || '').trim()
  if (!path.startsWith('/')) return null
  return {
    kind: String(raw.kind || 'page'),
    id: String(raw.id ?? path),
    title: String(raw.title || '').trim() || path,
    subtitle: String(raw.subtitle || '').trim(),
    path,
  }
}

/**
 * @param {string} query
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ items: Array<{ kind: string, id: string, title: string, subtitle: string, path: string }> }>}
 */
export async function fetchGlobalSearch(query, signal) {
  const trimmed = String(query || '').trim()
  if (trimmed.length < 2) {
    return { items: [] }
  }

  const staticItems = filterStaticSiteSearch(trimmed)
  const base = getApiBase()

  if (!base) {
    return { items: staticItems.slice(0, 24) }
  }

  try {
    const url = `${base}/api/search?q=${encodeURIComponent(trimmed)}`
    const res = await fetch(url, { signal, credentials: 'omit' })
    const data = await res.json().catch(() => ({}))
    const apiRaw = Array.isArray(data.items) ? data.items : []
    const apiItems = apiRaw.map(normalizeItem).filter(Boolean)
    const seen = new Set(apiItems.map((i) => i.path))
    const merged = [...staticItems.filter((i) => !seen.has(i.path)), ...apiItems]
    return { items: merged.slice(0, 28) }
  } catch {
    if (signal?.aborted) return { items: [] }
    return { items: staticItems.slice(0, 24) }
  }
}
