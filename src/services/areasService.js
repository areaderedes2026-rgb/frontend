import { MUNICIPAL_AREAS } from '../data/areas.js'
import { getApiBase, isApiConfigured } from '../utils/apiConfig.js'
import { getAuthHeaders, jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'

function mapArea(area) {
  if (!area) return null
  return {
    id: area.id != null ? Number(area.id) : null,
    slug: String(area.slug || ''),
    title: String(area.title || ''),
    description: String(area.description || ''),
    coverImage: String(area.coverImage || ''),
    sortOrder: Number(area.sortOrder) || 0,
    isActive: area.isActive !== false,
    updatedAt: area.updatedAt || area.updated_at || null,
  }
}

function fallbackAreas() {
  return MUNICIPAL_AREAS.map((x, i) => ({
    id: i + 1,
    slug: x.slug,
    title: x.title,
    description: x.description,
    coverImage: x.coverImage || '',
    sortOrder: (i + 1) * 10,
    isActive: true,
  }))
}

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

export async function fetchPublicAreas() {
  if (!isApiConfigured()) return fallbackAreas()
  const base = getApiBase()
  const res = await fetch(`${base}/api/areas`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudieron cargar las áreas.')
  }
  const data = await res.json().catch(() => ({}))
  const items = Array.isArray(data.items) ? data.items : []
  return items.map(mapArea).filter(Boolean)
}

export async function fetchAreaPublicBySlug(slug) {
  if (!isApiConfigured()) {
    const local = fallbackAreas().find((a) => a.slug === slug)
    return local || null
  }
  const base = getApiBase()
  const res = await fetch(`${base}/api/areas/${slug}`)
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar el área.')
  }
  const data = await res.json().catch(() => ({}))
  return mapArea(data.area)
}

export async function fetchAreasAdmin() {
  if (!isApiConfigured()) return fallbackAreas()
  const base = getApiBase()
  const res = await fetch(`${base}/api/areas/admin/list`, {
    headers: { ...getAuthHeaders() },
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar el catálogo de áreas.')
  }
  const data = await res.json().catch(() => ({}))
  const items = Array.isArray(data.items) ? data.items : []
  return items.map(mapArea).filter(Boolean)
}

export async function createArea(payload) {
  if (!isApiConfigured()) throw new Error('Configurá VITE_API_URL para crear áreas.')
  const base = getApiBase()
  const res = await fetch(`${base}/api/areas`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo crear el área.')
  const data = await res.json().catch(() => ({}))
  return mapArea(data.area)
}

export async function updateArea(id, payload) {
  if (!isApiConfigured()) throw new Error('Configurá VITE_API_URL para editar áreas.')
  const base = getApiBase()
  const res = await fetch(`${base}/api/areas/id/${id}`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo actualizar el área.')
  const data = await res.json().catch(() => ({}))
  return mapArea(data.area)
}

export async function deleteArea(id) {
  if (!isApiConfigured()) throw new Error('Configurá VITE_API_URL para eliminar áreas.')
  const base = getApiBase()
  const res = await fetch(`${base}/api/areas/id/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo eliminar el área.')
  return res.json()
}
