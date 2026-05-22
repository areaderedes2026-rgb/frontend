import { DEFAULT_LEGISLADOR_ESTE_CONTENT } from '../data/legisladorEsteContent.js'
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

export async function fetchLegisladorEsteContent() {
  const b = base()
  if (!b) return DEFAULT_LEGISLADOR_ESTE_CONTENT
  const res = await fetch(`${b}/api/legislador-este`)
  if (!res.ok) {
    throw new Error(
      (await apiErrorMessage(res)) ||
        'No se pudo cargar la sección de Legislador por el Este.',
    )
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}

export async function updateLegisladorEsteContent(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar Legislador por el Este.')
  const res = await fetch(`${b}/api/legislador-este`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw await errorFromApiResponse(res, 'No se pudo guardar Legislador por el Este.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}
