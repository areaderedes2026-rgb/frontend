import { getApiBase } from '../utils/apiConfig.js'
import { jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'
import { errorFromApiResponse } from '../utils/concurrencyConflict.js'

function base() {
  return getApiBase().trim()
}

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

export async function fetchSitePageBanner(pageKey) {
  const b = base()
  if (!b) return null
  const res = await fetch(`${b}/api/site-page-banners/${pageKey}`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar la portada.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}

export async function updateSitePageBanner(pageKey, payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar la portada.')
  const res = await fetch(`${b}/api/site-page-banners/${pageKey}`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw await errorFromApiResponse(res, 'No se pudo guardar la portada.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}
