import { getApiBase } from '../utils/apiConfig.js'
import { jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

function base() {
  return getApiBase().trim()
}

export async function fetchHistoryContent() {
  const b = base()
  if (!b) return null
  const res = await fetch(`${b}/api/history`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar la historia.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}

export async function updateHistoryContent(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar cambios.')
  const res = await fetch(`${b}/api/history`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo guardar la historia.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}
