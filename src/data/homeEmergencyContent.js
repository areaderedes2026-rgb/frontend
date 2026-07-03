import { normalizeHeroOverlayOpacity } from '../utils/heroOverlay.js'
import { normalizeHeroToggle } from './servicesPageContent.js'

export const HOME_EMERGENCY_DEFAULT_IMAGE = '/images/atencion-hero-bg.jpg'

export const DEFAULT_HOME_EMERGENCY_CONTENT = {
  eyebrow: 'Emergencias',
  title: 'Números útiles de Trancas',
  subtitle:
    'Tené a mano los contactos prioritarios del municipio y los servicios de emergencia.',
  imageUrl: HOME_EMERGENCY_DEFAULT_IMAGE,
  overlayOpacity: 65,
  showEyebrow: true,
  showTitle: true,
  showSubtitle: true,
  numbers: [
    {
      id: 'policia',
      label: 'Policía',
      phone: '911',
      description: 'Emergencias policiales',
      isActive: true,
      sortOrder: 10,
    },
    {
      id: 'bomberos',
      label: 'Bomberos',
      phone: '100',
      description: 'Incendios y rescates',
      isActive: true,
      sortOrder: 20,
    },
    {
      id: 'misma',
      label: 'Emergencias médicas',
      phone: '107',
      description: 'Atención médica urgente',
      isActive: true,
      sortOrder: 30,
    },
    {
      id: 'defensa-civil',
      label: 'Defensa Civil',
      phone: '103',
      description: 'Riesgos y contingencias',
      isActive: true,
      sortOrder: 40,
    },
  ],
}

function cleanText(value, maxLen = 0) {
  const out = String(value || '').trim()
  if (!maxLen) return out
  return out.slice(0, maxLen)
}

function cleanNumber(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function mapNumberItem(raw, fallback, index) {
  const base = fallback || {}
  return {
    id: cleanText(raw?.id || base.id || `emergencia-${index + 1}`, 60),
    label: cleanText(raw?.label || base.label, 120),
    phone: cleanText(raw?.phone || base.phone, 40),
    description: cleanText(raw?.description || base.description, 180),
    isActive: normalizeHeroToggle(raw?.isActive, base.isActive !== false),
    sortOrder: Math.max(
      0,
      Math.round(cleanNumber(raw?.sortOrder, cleanNumber(base.sortOrder, index * 10))),
    ),
  }
}

export function mergeHomeEmergencyContent(base, incoming) {
  const defaults = base || DEFAULT_HOME_EMERGENCY_CONTENT
  if (!incoming || typeof incoming !== 'object') return { ...defaults }

  const numbersIncoming = Array.isArray(incoming.numbers) ? incoming.numbers : null

  return {
    eyebrow: cleanText(incoming.eyebrow ?? defaults.eyebrow, 80),
    title: cleanText(incoming.title ?? defaults.title, 160),
    subtitle: cleanText(incoming.subtitle ?? defaults.subtitle, 500),
    imageUrl: cleanText(incoming.imageUrl ?? defaults.imageUrl, 2048),
    overlayOpacity: normalizeHeroOverlayOpacity(
      incoming.overlayOpacity,
      defaults.overlayOpacity ?? 65,
    ),
    showEyebrow: normalizeHeroToggle(incoming.showEyebrow, defaults.showEyebrow !== false),
    showTitle: normalizeHeroToggle(incoming.showTitle, defaults.showTitle !== false),
    showSubtitle: normalizeHeroToggle(incoming.showSubtitle, defaults.showSubtitle !== false),
    numbers:
      numbersIncoming && numbersIncoming.length > 0
        ? numbersIncoming.map((item, idx) => mapNumberItem(item, defaults.numbers?.[idx], idx))
        : (defaults.numbers || []).map((item, idx) => mapNumberItem(item, item, idx)),
  }
}

export function getActiveEmergencyNumbers(content) {
  const merged = mergeHomeEmergencyContent(DEFAULT_HOME_EMERGENCY_CONTENT, content || {})
  return [...(merged.numbers || [])]
    .filter((item) => item && item.isActive !== false && (item.label || item.phone))
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
}
