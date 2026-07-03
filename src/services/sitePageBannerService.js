import {
  DEFAULT_EVENTS_PAGE_HERO,
  DEFAULT_NEWS_PAGE_HERO,
  DEFAULT_TOURISM_PAGE_HERO,
  mergePageHeroCover,
} from '../data/pageHeroCoverContent.js'
import { getApiBase } from '../utils/apiConfig.js'
import { jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'
import { errorFromApiResponse } from '../utils/concurrencyConflict.js'

function base() {
  return getApiBase().trim()
}

const DEFAULTS_BY_PAGE_KEY = {
  news: DEFAULT_NEWS_PAGE_HERO,
  events: DEFAULT_EVENTS_PAGE_HERO,
  tourism: DEFAULT_TOURISM_PAGE_HERO,
}

function mapPageBannerContent(pageKey, content) {
  const defaults = DEFAULTS_BY_PAGE_KEY[pageKey] || DEFAULT_NEWS_PAGE_HERO
  if (!content || typeof content !== 'object') {
    return mergePageHeroCover(defaults, null)
  }
  return mergePageHeroCover(defaults, content)
}

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

export async function fetchSitePageBanner(pageKey) {
  const b = base()
  if (!b) return null
  const key = String(pageKey || '').trim().toLowerCase()
  const res = await fetch(`${b}/api/site-page-banners/${key}`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar la portada.')
  }
  const data = await res.json().catch(() => ({}))
  return mapPageBannerContent(key, data.content || null)
}

export async function updateSitePageBanner(pageKey, payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar la portada.')
  const key = String(pageKey || '').trim().toLowerCase()
  const res = await fetch(`${b}/api/site-page-banners/${key}`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw await errorFromApiResponse(res, 'No se pudo guardar la portada.')
  }
  const data = await res.json().catch(() => ({}))
  return mapPageBannerContent(key, data.content || null)
}
