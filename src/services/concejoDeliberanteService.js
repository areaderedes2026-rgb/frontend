import { DEFAULT_CONCEJO_DELIBERANTE_CONTENT } from '../data/concejoDeliberanteContent.js'
import { getApiBase } from '../utils/apiConfig.js'
import { jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'
import { errorFromApiResponse } from '../utils/concurrencyConflict.js'

function base() {
  return getApiBase().trim()
}

export async function fetchConcejoDeliberanteContent() {
  const b = base()
  if (!b) return DEFAULT_CONCEJO_DELIBERANTE_CONTENT
  const res = await fetch(`${b}/api/concejo-deliberante`)
  if (!res.ok) {
    throw await errorFromApiResponse(
      res,
      'No se pudo cargar la sección del Concejo Deliberante.',
    )
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}

export async function updateConcejoDeliberanteContent(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar el Concejo Deliberante.')
  const res = await fetch(`${b}/api/concejo-deliberante`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw await errorFromApiResponse(res, 'No se pudo guardar el Concejo Deliberante.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}
