import { DEFAULT_HOME_EMERGENCY_CONTENT, mergeHomeEmergencyContent } from '../data/homeEmergencyContent.js'
import { getApiBase } from '../utils/apiConfig.js'
import { jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'
import { errorFromApiResponse } from '../utils/concurrencyConflict.js'
import { normalizeHeroOverlayOpacity } from '../utils/heroOverlay.js'
import { normalizeHeroToggle } from '../data/servicesPageContent.js'

function base() {
  return getApiBase().trim()
}

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

export function mapHomeEmergencyContent(value) {
  if (!value || typeof value !== 'object') return null
  return {
    eyebrow: String(value.eyebrow || ''),
    title: String(value.title || ''),
    subtitle: String(value.subtitle || ''),
    imageUrl: String(value.imageUrl || ''),
    overlayOpacity: normalizeHeroOverlayOpacity(value.overlayOpacity, 65),
    showEyebrow: normalizeHeroToggle(value.showEyebrow, true),
    showTitle: normalizeHeroToggle(value.showTitle, true),
    showSubtitle: normalizeHeroToggle(value.showSubtitle, true),
    numbers: Array.isArray(value.numbers) ? value.numbers : [],
    updatedAt: value.updatedAt || null,
  }
}

export async function fetchHomeEmergencyContent() {
  const b = base()
  if (!b) return mergeHomeEmergencyContent(DEFAULT_HOME_EMERGENCY_CONTENT, {})
  const res = await fetch(`${b}/api/home-emergency`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar los números de emergencia.')
  }
  const data = await res.json().catch(() => ({}))
  return mapHomeEmergencyContent(data.content ?? null)
}

export async function updateHomeEmergencyContent(payload) {
  const b = base()
  if (!b) throw new Error('Configurá VITE_API_URL para guardar los números de emergencia.')
  const res = await fetch(`${b}/api/home-emergency`, {
    method: 'PUT',
    headers: jsonAuthHeaders(),
    body: JSON.stringify(payload),
  })
  notifyUnauthorizedIfNeeded(res)
  if (!res.ok) {
    throw await errorFromApiResponse(res, 'No se pudo guardar los números de emergencia.')
  }
  const data = await res.json().catch(() => ({}))
  return mapHomeEmergencyContent(data.content ?? null)
}
