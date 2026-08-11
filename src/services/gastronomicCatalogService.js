import {
  DEFAULT_GASTRONOMIC_CATALOG_CONTENT,
  mergeGastronomicCatalogContent,
} from '../data/gastronomicCatalogContent.js'
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

export async function fetchGastronomicCatalogContent() {
  const b = base()
  if (!b) return mergeGastronomicCatalogContent(DEFAULT_GASTRONOMIC_CATALOG_CONTENT, {})
  const res = await fetch(`${b}/api/catalogo-gastronomico`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar el catálogo gastronómico.')
  }
  const data = await res.json().catch(() => ({}))
  return mergeGastronomicCatalogContent(DEFAULT_GASTRONOMIC_CATALOG_CONTENT, data.content ?? {})
}

export async function updateGastronomicCatalogContent(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar el catálogo gastronómico.')
  const res = await fetch(`${b}/api/catalogo-gastronomico`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw await errorFromApiResponse(res, 'No se pudo guardar el catálogo gastronómico.')
  }
  const data = await res.json().catch(() => ({}))
  return mergeGastronomicCatalogContent(DEFAULT_GASTRONOMIC_CATALOG_CONTENT, data.content ?? {})
}
