import { getApiBase } from '../utils/apiConfig.js'
import {
  getAuthHeaders,
  jsonAuthHeaders,
  notifyUnauthorizedIfNeeded,
} from '../utils/authStorage.js'

const API_BASE = getApiBase()

const MOCK_EVENTS = [
  {
    id: '1',
    slug: 'feria-gastronomica-local',
    title: 'Feria gastronómica local',
    eventDate: '2026-07-04T18:30:00-03:00',
    place: 'Plaza principal',
    summary: 'Food trucks, cocina regional y espectáculos para toda la familia.',
    flyerUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
    isActive: true,
    sortOrder: 10,
  },
  {
    id: '2',
    slug: 'carrera-trancas-10k',
    title: 'Carrera ciudad de Trancas 10K',
    eventDate: '2026-07-13T08:00:00-03:00',
    place: 'Circuito urbano',
    summary: 'Competencia y circuito recreativo de 3K con inscripción gratuita.',
    flyerUrl:
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80',
    isActive: true,
    sortOrder: 20,
  },
]

let mockStore = [...MOCK_EVENTS]

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

function normalize(item) {
  if (!item) return null
  return {
    id: String(item.id),
    slug: String(item.slug || ''),
    title: String(item.title || ''),
    eventDate: item.eventDate || item.event_date || null,
    place: String(item.place || ''),
    summary: String(item.summary || ''),
    flyerUrl: String(item.flyerUrl || item.flyer_url || ''),
    isActive: item.isActive !== false && item.is_active !== 0,
    sortOrder: Number(item.sortOrder ?? item.sort_order ?? 0),
    updatedAt: item.updatedAt || item.updated_at || null,
  }
}

export async function fetchPublicEvents() {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/events`)
    if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudieron cargar los eventos.')
    const data = await res.json().catch(() => ({}))
    const list = Array.isArray(data.items) ? data.items : []
    return list.map(normalize).filter(Boolean)
  }
  return [...mockStore].filter((event) => event.isActive)
}

export async function fetchAdminEvents() {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/events/admin`, {
      headers: { ...getAuthHeaders() },
    })
    notifyUnauthorizedIfNeeded(res)
    if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudieron cargar los eventos.')
    const data = await res.json().catch(() => ({}))
    const list = Array.isArray(data.items) ? data.items : []
    return list.map(normalize).filter(Boolean)
  }
  return [...mockStore]
}

export async function createEvent(payload) {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(payload),
    })
    notifyUnauthorizedIfNeeded(res)
    if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo crear el evento.')
    const data = await res.json().catch(() => ({}))
    return normalize(data.item)
  }
  const created = {
    id: String(Date.now()),
    ...payload,
  }
  mockStore = [...mockStore, created]
  return normalize(created)
}

export async function updateEvent(id, payload) {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/events/${id}`, {
      method: 'PUT',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(payload),
    })
    notifyUnauthorizedIfNeeded(res)
    if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo editar el evento.')
    const data = await res.json().catch(() => ({}))
    return normalize(data.item)
  }
  mockStore = mockStore.map((event) =>
    String(event.id) === String(id) ? { ...event, ...payload } : event,
  )
  return normalize(mockStore.find((event) => String(event.id) === String(id)))
}

export async function deleteEvent(id) {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/events/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    })
    notifyUnauthorizedIfNeeded(res)
    if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo eliminar el evento.')
    return true
  }
  mockStore = mockStore.filter((event) => String(event.id) !== String(id))
  return true
}
