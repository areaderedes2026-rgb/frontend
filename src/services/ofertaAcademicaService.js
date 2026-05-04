import { DEFAULT_OFERTA_ACADEMICA_CONTENT } from '../data/ofertaAcademicaContent.js'
import { getApiBase } from '../utils/apiConfig.js'
import { jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'

function base() {
  return getApiBase().trim()
}

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

export async function fetchOfertaAcademicaContent() {
  const b = base()
  if (!b) return DEFAULT_OFERTA_ACADEMICA_CONTENT
  const res = await fetch(`${b}/api/oferta-academica`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar Oferta académica.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content ?? null
}

export async function updateOfertaAcademicaContent(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar Oferta académica.')
  const res = await fetch(`${b}/api/oferta-academica`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo guardar Oferta académica.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content ?? null
}
