import { getApiBase, isApiConfigured } from '../utils/apiConfig.js'
import { getAuthHeaders, jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

function base() {
  return getApiBase().trim()
}

function mapSummary(o) {
  if (!o) return null
  return {
    id: Number(o.id),
    slug: String(o.slug || ''),
    name: String(o.name || ''),
    iconKey: String(o.iconKey || 'building'),
    sortOrder: Number(o.sortOrder) || 0,
  }
}

function mapDetail(o) {
  if (!o) return null
  const s = mapSummary(o)
  if (!s) return null
  return {
    ...s,
    description: String(o.description || ''),
    activities: Array.isArray(o.activities) ? o.activities.map((x) => String(x || '')) : [],
    updatedAt: o.updatedAt || o.updated_at || null,
  }
}

function mapAdmin(o) {
  if (!o) return null
  return {
    id: Number(o.id),
    areaSlug: String(o.areaSlug || ''),
    slug: String(o.slug || ''),
    name: String(o.name || ''),
    iconKey: String(o.iconKey || 'building'),
    description: String(o.description || ''),
    activities: Array.isArray(o.activities) ? o.activities.map((x) => String(x || '')) : [],
    sortOrder: Number(o.sortOrder) || 0,
    createdAt: o.createdAt || o.created_at || null,
    updatedAt: o.updatedAt || o.updated_at || null,
  }
}

export async function fetchAreaOfficesPublic(areaSlug) {
  const b = base()
  if (!b || !isApiConfigured()) return []
  const res = await fetch(`${b}/api/areas/${encodeURIComponent(areaSlug)}/offices`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudieron cargar las oficinas.')
  }
  const data = await res.json().catch(() => ({}))
  const items = Array.isArray(data.items) ? data.items : []
  return items.map(mapSummary).filter(Boolean)
}

export async function fetchAreaOfficePublic(areaSlug, officeSlug) {
  const b = base()
  if (!b || !isApiConfigured()) return null
  const res = await fetch(
    `${b}/api/areas/${encodeURIComponent(areaSlug)}/offices/${encodeURIComponent(officeSlug)}`,
  )
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar la oficina.')
  }
  const data = await res.json().catch(() => ({}))
  return mapDetail(data.office)
}

export async function fetchAreaOfficesAdmin(areaSlug) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL.')
  const res = await fetch(
    `${b}/api/areas/${encodeURIComponent(areaSlug)}/offices/admin/list`,
    { headers: { ...getAuthHeaders() } },
  )
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudieron cargar las oficinas.')
  }
  const data = await res.json().catch(() => ({}))
  const items = Array.isArray(data.items) ? data.items : []
  return items.map(mapAdmin).filter(Boolean)
}

export async function createAreaOfficeAdmin(areaSlug, payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL.')
  const res = await fetch(`${b}/api/areas/${encodeURIComponent(areaSlug)}/offices`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo crear la oficina.')
  const data = await res.json().catch(() => ({}))
  return mapAdmin(data.office)
}

export async function updateAreaOfficeAdmin(areaSlug, id, payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL.')
  const res = await fetch(
    `${b}/api/areas/${encodeURIComponent(areaSlug)}/offices/id/${encodeURIComponent(String(id))}`,
    {
      method: 'PUT',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(payload),
    },
  )
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo actualizar la oficina.')
  const data = await res.json().catch(() => ({}))
  return mapAdmin(data.office)
}

export async function deleteAreaOfficeAdmin(areaSlug, id) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL.')
  const res = await fetch(
    `${b}/api/areas/${encodeURIComponent(areaSlug)}/offices/id/${encodeURIComponent(String(id))}`,
    { method: 'DELETE', headers: { ...getAuthHeaders() } },
  )
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo eliminar la oficina.')
}
