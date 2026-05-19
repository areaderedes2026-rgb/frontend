import { getApiBase } from '../utils/apiConfig.js'
import {
  getAuthHeaders,
  jsonAuthHeaders,
  notifyUnauthorizedIfNeeded,
} from '../utils/authStorage.js'

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

function base() {
  return getApiBase().trim()
}

export async function fetchAreaProfile(slug) {
  const b = base()
  if (!b) return null
  const res = await fetch(`${b}/api/areas/${slug}/profile`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar el perfil del área.')
  }
  const data = await res.json().catch(() => ({}))
  return data.profile || null
}

export async function updateAreaProfile(slug, payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar cambios.')
  const res = await fetch(`${b}/api/areas/${slug}/profile`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo guardar el perfil del área.')
  }
  const data = await res.json().catch(() => ({}))
  return data.profile || null
}

export async function fetchMyAreaServicePermissions() {
  const b = base()
  if (!b) return []
  const res = await fetch(`${b}/api/areas/profile-services/mine`, {
    headers: getAuthHeaders(),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudieron cargar tus servicios.')
  }
  const data = await res.json().catch(() => ({}))
  return Array.isArray(data.items) ? data.items : []
}

export async function fetchAreaProfileService(slug, serviceId) {
  const b = base()
  if (!b) return null
  const res = await fetch(`${b}/api/areas/${slug}/profile/services/${serviceId}`, {
    headers: getAuthHeaders(),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar el servicio.')
  }
  return res.json()
}

export async function updateAreaProfileService(slug, serviceId, payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar cambios.')
  const res = await fetch(`${b}/api/areas/${slug}/profile/services/${serviceId}`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo guardar el servicio.')
  }
  return res.json()
}
