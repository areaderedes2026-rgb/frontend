import { DEFAULT_INTENDENCIA_CONTENT } from '../data/intendenciaContent.js'
import { getApiBase } from '../utils/apiConfig.js'
import { jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'

function base() {
  return getApiBase().trim()
}

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

export async function fetchIntendenciaContent() {
  const b = base()
  if (!b) return DEFAULT_INTENDENCIA_CONTENT
  const res = await fetch(`${b}/api/intendencia`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar la sección de Intendencia.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}

export async function updateIntendenciaContent(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar Intendencia.')
  const res = await fetch(`${b}/api/intendencia`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo guardar Intendencia.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}
