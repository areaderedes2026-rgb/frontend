import { DEFAULT_OFERTA_ACADEMICA_CONTENT } from '../data/ofertaAcademicaContent.js'
import { normalizeHeroToggle } from '../data/servicesPageContent.js'
import { getApiBase } from '../utils/apiConfig.js'
import { jsonAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/authStorage.js'
import { errorFromApiResponse } from '../utils/concurrencyConflict.js'

function base() {
  return getApiBase().trim()
}

function normalizeOverlay(value, fallback = 65) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(90, Math.max(0, Math.round(n))) : fallback
}

/** Normaliza la respuesta de la API (mismo patrón que Servicios). */
export function mapOfertaAcademicaContent(value) {
  if (!value || typeof value !== 'object') return null
  return {
    heroEyebrow: String(value.heroEyebrow || ''),
    heroTitle: String(value.heroTitle || ''),
    heroSubtitle: String(value.heroSubtitle || ''),
    heroImageUrl: String(value.heroImageUrl || ''),
    overlayOpacity: normalizeOverlay(value.overlayOpacity, 65),
    heroSearchPlaceholder: String(value.heroSearchPlaceholder || ''),
    heroPrimaryLabel: String(value.heroPrimaryLabel || ''),
    heroPrimaryHref: String(value.heroPrimaryHref || ''),
    heroSecondaryLabel: String(value.heroSecondaryLabel || ''),
    heroSecondaryHref: String(value.heroSecondaryHref || ''),
    showHeroBadge: normalizeHeroToggle(value.showHeroBadge, true),
    showHeroTitle: normalizeHeroToggle(value.showHeroTitle, true),
    showHeroSubtitle: normalizeHeroToggle(value.showHeroSubtitle, true),
    showSearch: normalizeHeroToggle(value.showSearch, false),
    showPrimaryButton: normalizeHeroToggle(value.showPrimaryButton, true),
    showSecondaryButton: normalizeHeroToggle(value.showSecondaryButton, true),
    introTitle: String(value.introTitle || ''),
    introParagraphs: Array.isArray(value.introParagraphs)
      ? value.introParagraphs.map((p) => String(p || ''))
      : [],
    highlights: Array.isArray(value.highlights) ? value.highlights : [],
    categories: Array.isArray(value.categories) ? value.categories : [],
    offers: Array.isArray(value.offers) ? value.offers : [],
    ctaTitle: String(value.ctaTitle || ''),
    ctaBody: String(value.ctaBody || ''),
    updatedAt: value.updatedAt ?? null,
  }
}

async function apiErrorMessage(res) {
  const data = await res.json().catch(() => ({}))
  return typeof data.error === 'string' ? data.error : null
}

export async function fetchOfertaAcademicaContent() {
  const b = base()
  if (!b) return mapOfertaAcademicaContent(DEFAULT_OFERTA_ACADEMICA_CONTENT)
  const res = await fetch(`${b}/api/oferta-academica`)
  if (!res.ok) {
    throw new Error((await apiErrorMessage(res)) || 'No se pudo cargar Oferta académica.')
  }
  const data = await res.json().catch(() => ({}))
  return mapOfertaAcademicaContent(data.content ?? null)
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
    throw await errorFromApiResponse(res, 'No se pudo guardar Oferta académica.')
  }
  const data = await res.json().catch(() => ({}))
  return mapOfertaAcademicaContent(data.content ?? null)
}
