import {
  DEFAULT_LODGING_CATALOG_CONTENT,
  mergeLodgingCatalogContent,
} from '../data/lodgingCatalogContent.js'
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

export async function fetchLodgingCatalogContent() {
  const b = base()
  if (!b) return mergeLodgingCatalogContent(DEFAULT_LODGING_CATALOG_CONTENT, {})
  const res = await fetch(`${b}/api/catalogo-hospedajes`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar el catálogo de hospedajes.')
  }
  const data = await res.json().catch(() => ({}))
  return mergeLodgingCatalogContent(DEFAULT_LODGING_CATALOG_CONTENT, data.content ?? {})
}

export async function updateLodgingCatalogContent(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar el catálogo de hospedajes.')
  const res = await fetch(`${b}/api/catalogo-hospedajes`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw await errorFromApiResponse(res, 'No se pudo guardar el catálogo de hospedajes.')
  }
  const data = await res.json().catch(() => ({}))
  return mergeLodgingCatalogContent(DEFAULT_LODGING_CATALOG_CONTENT, data.content ?? {})
}
