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

export async function fetchAreasPageContent() {
  const b = base()
  if (!b) return null
  const res = await fetch(`${b}/api/areas/page-content`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar portada global de áreas.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}

export async function updateAreasPageContent(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar portada global de áreas.')
  const res = await fetch(`${b}/api/areas/page-content`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw await errorFromApiResponse(res, 'No se pudo guardar portada global de áreas.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}
