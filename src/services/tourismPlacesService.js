import { DEFAULT_TOURISM_PLACES } from '../data/tourismPlaces.js'
import { getApiBase } from '../utils/apiConfig.js'
import { jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

function base() {
  return getApiBase().trim()
}

function mapPlace(value, fallbackId = 0) {
  return {
    id: Number(value?.id) || fallbackId,
    slug: String(value?.slug || ''),
    name: String(value?.name || ''),
    category: String(value?.category || ''),
    shortDescription: String(value?.shortDescription || ''),
    fullDescription: String(value?.fullDescription || ''),
    imageUrl: String(value?.imageUrl || ''),
    gallery: Array.isArray(value?.gallery) ? value.gallery.map((x) => String(x || '')) : [],
    address: String(value?.address || ''),
    howToGet: String(value?.howToGet || ''),
    mapEmbedUrl: String(value?.mapEmbedUrl || ''),
    mapExternalUrl: String(value?.mapExternalUrl || ''),
    contactPhone: String(value?.contactPhone || ''),
    contactEmail: String(value?.contactEmail || ''),
    contactWhatsapp: String(value?.contactWhatsapp || ''),
    visitingHours: String(value?.visitingHours || ''),
    sortOrder: Number(value?.sortOrder) || 0,
    isActive: value?.isActive !== false,
    updatedAt: value?.updatedAt || value?.updated_at || null,
  }
}

export async function fetchTourismPlacesPublic() {
  const b = base()
  if (!b) return DEFAULT_TOURISM_PLACES
  const res = await fetch(`${b}/api/tourism-places`)
  if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudieron cargar los lugares turísticos.')
  const data = await res.json().catch(() => ({}))
  const places = Array.isArray(data.places) ? data.places : []
  return places.map((place, index) => mapPlace(place, index + 1))
}

export async function fetchTourismPlacePublicBySlug(slug) {
  const b = base()
  if (!b) {
    return DEFAULT_TOURISM_PLACES.find((place) => place.slug === slug) || null
  }
  const res = await fetch(`${b}/api/tourism-places/${slug}`)
  if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar el lugar turístico.')
  const data = await res.json().catch(() => ({}))
  return data.place ? mapPlace(data.place) : null
}

export async function fetchTourismPlacesAdmin() {
  const b = base()
  if (!b) return DEFAULT_TOURISM_PLACES
  const res = await fetch(`${b}/api/tourism-places/admin/list`, {
    headers: jsonAuthHeaders(),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudieron cargar los lugares turísticos.')
  const data = await res.json().catch(() => ({}))
  const places = Array.isArray(data.places) ? data.places : []
  return places.map((place, index) => mapPlace(place, index + 1))
}

export async function createTourismPlace(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para crear lugares turísticos.')
  const res = await fetch(`${b}/api/tourism-places`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo crear el lugar turístico.')
  const data = await res.json().catch(() => ({}))
  return data.place ? mapPlace(data.place) : null
}

export async function updateTourismPlace(id, payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para editar lugares turísticos.')
  const res = await fetch(`${b}/api/tourism-places/id/${id}`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo editar el lugar turístico.')
  const data = await res.json().catch(() => ({}))
  return data.place ? mapPlace(data.place) : null
}

export async function deleteTourismPlace(id) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para eliminar lugares turísticos.')
  const res = await fetch(`${b}/api/tourism-places/id/${id}`, {
    method: 'DELETE',
    headers: jsonAuthHeaders(),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo eliminar el lugar turístico.')
}
