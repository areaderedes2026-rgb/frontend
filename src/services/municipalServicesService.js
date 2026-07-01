import {
  DEFAULT_MUNICIPAL_SERVICES,
  DEFAULT_SERVICES_PAGE_CONTENT,
  normalizeMunicipalService,
} from '../data/servicesPageContent.js'
import { getApiBase } from '../utils/apiConfig.js'
import { errorFromApiResponse } from '../utils/concurrencyConflict.js'
import { jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

function base() {
  return getApiBase().trim()
}

function mapContent(value) {
  return {
    heroEyebrow: String(value?.heroEyebrow || ''),
    heroTitle: String(value?.heroTitle || ''),
    heroSubtitle: String(value?.heroSubtitle || ''),
    heroSearchPlaceholder: String(value?.heroSearchPlaceholder || ''),
    heroImageUrl: String(value?.heroImageUrl || ''),
    heroPrimaryLabel: String(value?.heroPrimaryLabel || ''),
    heroPrimaryHref: String(value?.heroPrimaryHref || ''),
    heroSecondaryLabel: String(value?.heroSecondaryLabel || ''),
    heroSecondaryHref: String(value?.heroSecondaryHref || ''),
    steps: Array.isArray(value?.steps) ? value.steps.map((x) => String(x || '')) : [],
    scheduleLines: Array.isArray(value?.scheduleLines)
      ? value.scheduleLines.map((x) => String(x || ''))
      : [],
    categories: Array.isArray(value?.categories)
      ? value.categories.map((item, index) => {
          if (item == null) return null
          if (typeof item === 'string') {
            const name = String(item || '').trim()
            if (!name) return null
            return { name }
          }
          if (typeof item !== 'object') return null
          return {
            id: String(item?.id || '').trim(),
            slug: String(item?.slug || '').trim(),
            name: String(item?.name || '').trim(),
            icon: String(item?.icon || '').trim(),
            sortOrder: Number(item?.sortOrder) || (index + 1) * 10,
            enabled: item?.enabled !== false,
          }
        }).filter(Boolean)
      : [],
    proceduresEyebrow: String(value?.proceduresEyebrow || ''),
    proceduresTitle: String(value?.proceduresTitle || ''),
    faq: Array.isArray(value?.faq)
      ? value.faq.map((item) => ({
          id: String(item?.id || ''),
          q: String(item?.q || ''),
          a: String(item?.a || ''),
        }))
      : [],
    finalCtaTitle: String(value?.finalCtaTitle || ''),
    finalCtaText: String(value?.finalCtaText || ''),
    finalPrimaryLabel: String(value?.finalPrimaryLabel || ''),
    finalPrimaryHref: String(value?.finalPrimaryHref || ''),
    finalSecondaryLabel: String(value?.finalSecondaryLabel || ''),
    finalSecondaryHref: String(value?.finalSecondaryHref || ''),
    updatedAt: value?.updatedAt || value?.updated_at || null,
  }
}

function mapService(value, fallbackId = 0) {
  return normalizeMunicipalService(value, fallbackId)
}

export async function fetchServicesPageContent() {
  const b = base()
  if (!b) return { ...DEFAULT_SERVICES_PAGE_CONTENT, updatedAt: null }
  const res = await fetch(`${b}/api/municipal-services/content`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar la página de servicios.')
  }
  const data = await res.json().catch(() => ({}))
  return mapContent(data.content || {})
}

export async function updateServicesPageContent(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar servicios.')
  const res = await fetch(`${b}/api/municipal-services/content`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw await errorFromApiResponse(res, 'No se pudo guardar la página de servicios.')
  }
  const data = await res.json().catch(() => ({}))
  return mapContent(data.content || {})
}

export async function fetchMunicipalServicesPublic() {
  const b = base()
  if (!b) return DEFAULT_MUNICIPAL_SERVICES.filter((s) => s.isActive !== false)
  const res = await fetch(`${b}/api/municipal-services/items`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudieron cargar los trámites.')
  }
  const data = await res.json().catch(() => ({}))
  const services = Array.isArray(data.services) ? data.services : []
  return services.map((item, index) => mapService(item, index + 1))
}

export async function fetchMunicipalServicesAdmin() {
  const b = base()
  if (!b) return DEFAULT_MUNICIPAL_SERVICES
  const res = await fetch(`${b}/api/municipal-services/admin/items`, {
    headers: jsonAuthHeaders(),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudieron cargar los trámites.')
  }
  const data = await res.json().catch(() => ({}))
  const services = Array.isArray(data.services) ? data.services : []
  return services.map((item, index) => mapService(item, index + 1))
}

export async function createMunicipalService(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para crear trámites.')
  const res = await fetch(`${b}/api/municipal-services/items`, {
    method: 'POST',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo crear el trámite.')
  const data = await res.json().catch(() => ({}))
  return mapService(data.service || {})
}

export async function updateMunicipalService(id, payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para editar trámites.')
  const res = await fetch(`${b}/api/municipal-services/items/id/${id}`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo guardar el trámite.')
  const data = await res.json().catch(() => ({}))
  return mapService(data.service || {})
}

export async function deleteMunicipalService(id) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para eliminar trámites.')
  const res = await fetch(`${b}/api/municipal-services/items/id/${id}`, {
    method: 'DELETE',
    headers: jsonAuthHeaders(),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) throw new Error((await apiErrorMessage(res)) || 'No se pudo eliminar el trámite.')
}
