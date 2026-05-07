import { DEFAULT_CONCEJO_DELIBERANTE_CONTENT } from '../data/concejoDeliberanteContent.js'
import { getApiBase } from '../utils/apiConfig.js'
import { jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'

function base() {
  return getApiBase().trim()
}

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

export async function fetchConcejoDeliberanteContent() {
  const b = base()
  if (!b) return DEFAULT_CONCEJO_DELIBERANTE_CONTENT
  const res = await fetch(`${b}/api/concejo-deliberante`)
  if (!res.ok) {
    throw new Error(
      (await apiErrorMessage(res)) ||
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
    throw new Error(
      (await apiErrorMessage(res)) || 'No se pudo guardar el Concejo Deliberante.',
    )
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}
