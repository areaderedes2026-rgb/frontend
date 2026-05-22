import { DEFAULT_HOME_MAP_CONTENT } from '../data/homeMapContent.js'
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

export async function fetchHomeMapContent() {
  const b = base()
  if (!b) return DEFAULT_HOME_MAP_CONTENT
  const res = await fetch(`${b}/api/home-map`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar el mapa de Trancas.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}

export async function updateHomeMapContent(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar el mapa de Inicio.')
  const res = await fetch(`${b}/api/home-map`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw await errorFromApiResponse(res, 'No se pudo guardar el mapa de Inicio.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}
