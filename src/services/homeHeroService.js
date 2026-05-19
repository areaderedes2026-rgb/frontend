import { DEFAULT_HOME_HERO_CONTENT } from '../data/homeHeroContent.js'
import { getApiBase } from '../utils/apiConfig.js'
import { jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'

function base() {
  return getApiBase().trim()
}

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

export async function fetchHomeHeroContent() {
  const b = base()
  if (!b) return DEFAULT_HOME_HERO_CONTENT
  const res = await fetch(`${b}/api/home-hero`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudieron cargar los banners de Inicio.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}

export async function updateHomeHeroContent(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar los banners de Inicio.')
  const res = await fetch(`${b}/api/home-hero`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudieron guardar los banners de Inicio.')
  }
  const data = await res.json().catch(() => ({}))
  return data.content || null
}
