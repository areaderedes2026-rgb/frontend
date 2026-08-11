/**
 * Contenido público del Catálogo gastronómico (vista ciudadana + valores por defecto del panel).
 */

import { mergePageHeroCover, pageHeroToHeaderProps } from './pageHeroCoverContent.js'
import { normalizeHeroToggle } from './servicesPageContent.js'

export const GASTRONOMIC_CATALOG_CATEGORIES = [
  'Todos',
  'Bares',
  'Cafeterías',
  'Restaurantes',
  'Rotiserías',
  'Heladerías',
  'Panaderías',
  'Otros',
]

export const GASTRONOMIC_VENUE_DESCRIPTION_MAX = 2500

function normalizeVenue(remote) {
  if (!remote || typeof remote !== 'object') return null
  const name = String(remote.name || '').trim()
  const description = String(remote.description || '').trim().slice(0, GASTRONOMIC_VENUE_DESCRIPTION_MAX)
  if (!name && !description) return null
  return {
    id: String(remote.id || '').trim() || `local-${Math.random().toString(36).slice(2, 10)}`,
    category: String(remote.category || '').trim() || 'Otros',
    name,
    location: String(remote.location || '').trim(),
    phone: String(remote.phone || '').trim(),
    description,
    imageUrl: String(remote.imageUrl || '').trim(),
    hours: String(remote.hours || '').trim(),
    mapsUrl: String(remote.mapsUrl || '').trim(),
    instagram: String(remote.instagram || '').trim(),
    whatsapp: String(remote.whatsapp || '').trim(),
    isActive: remote.isActive !== false,
    sortOrder: Number.isFinite(Number(remote.sortOrder)) ? Number(remote.sortOrder) : 0,
  }
}

export const DEFAULT_GASTRONOMIC_CATALOG_CONTENT = {
  heroEyebrow: 'Nuestra ciudad',
  heroTitle: 'Catálogo gastronómico de Trancas',
  heroSubtitle:
    'Bares, cafeterías, restaurantes y otros espacios locales para comer, tomar algo y encontrarte con la comunidad.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80',
  overlayOpacity: 65,
  heroSearchPlaceholder: 'Buscar por nombre, barrio o tipo…',
  showHeroBadge: true,
  showHeroTitle: true,
  showHeroSubtitle: true,
  showSearch: true,
  showPrimaryButton: true,
  heroPrimaryLabel: 'Ver locales',
  heroPrimaryHref: '#catalogo-locales',
  showSecondaryButton: true,
  heroSecondaryLabel: 'Turismo',
  heroSecondaryHref: '/turismo',
  introTitle: 'Sabores de Trancas',
  introParagraphs: [
    'Este catálogo reúne propuestas gastronómicas del departamento: bares, cafeterías, restaurantes y otros espacios que recibieron a vecinos y visitantes.',
    'La información (nombre, ubicación, teléfono y descripción) la aportan los propios locales. Confirmá horarios y disponibilidad antes de ir.',
  ],
  highlights: [
    { label: 'Propuestas', value: 'Locales de Trancas' },
    { label: 'Tipos', value: 'Bares, cafeterías y más' },
    { label: 'Actualización', value: 'Directorio municipal' },
  ],
  categories: [...GASTRONOMIC_CATALOG_CATEGORIES],
  venues: [],
  ctaTitle: '¿Querés sumar tu local?',
  ctaBody:
    'Si tenés un bar, cafetería u otro espacio gastronómico en Trancas, acercate a la Municipalidad o escribinos por Atención al ciudadano para incorporarte al catálogo.',
}

export function mergeGastronomicCatalogContent(base, remote) {
  const defaults = base || DEFAULT_GASTRONOMIC_CATALOG_CONTENT
  if (!remote || typeof remote !== 'object') {
    return { ...defaults, venues: [...(defaults.venues || [])] }
  }

  const venuesOut = Array.isArray(remote.venues)
    ? remote.venues.map(normalizeVenue).filter(Boolean)
    : [...(defaults.venues || [])]

  return {
    ...defaults,
    heroEyebrow: String(remote.heroEyebrow ?? defaults.heroEyebrow ?? ''),
    heroTitle: String(remote.heroTitle ?? defaults.heroTitle ?? ''),
    heroSubtitle: String(remote.heroSubtitle ?? defaults.heroSubtitle ?? ''),
    heroImageUrl: String(remote.heroImageUrl ?? defaults.heroImageUrl ?? ''),
    overlayOpacity: Number.isFinite(Number(remote.overlayOpacity))
      ? Math.min(90, Math.max(0, Math.round(Number(remote.overlayOpacity))))
      : defaults.overlayOpacity ?? 65,
    heroSearchPlaceholder: String(
      remote.heroSearchPlaceholder ?? defaults.heroSearchPlaceholder ?? '',
    ),
    showHeroBadge: normalizeHeroToggle(remote.showHeroBadge, defaults.showHeroBadge !== false),
    showHeroTitle: normalizeHeroToggle(remote.showHeroTitle, defaults.showHeroTitle !== false),
    showHeroSubtitle: normalizeHeroToggle(
      remote.showHeroSubtitle,
      defaults.showHeroSubtitle !== false,
    ),
    showSearch: normalizeHeroToggle(remote.showSearch, defaults.showSearch !== false),
    showPrimaryButton: normalizeHeroToggle(
      remote.showPrimaryButton,
      defaults.showPrimaryButton === true,
    ),
    heroPrimaryLabel: String(remote.heroPrimaryLabel ?? defaults.heroPrimaryLabel ?? ''),
    heroPrimaryHref: String(remote.heroPrimaryHref ?? defaults.heroPrimaryHref ?? ''),
    showSecondaryButton: normalizeHeroToggle(
      remote.showSecondaryButton,
      defaults.showSecondaryButton === true,
    ),
    heroSecondaryLabel: String(remote.heroSecondaryLabel ?? defaults.heroSecondaryLabel ?? ''),
    heroSecondaryHref: String(remote.heroSecondaryHref ?? defaults.heroSecondaryHref ?? ''),
    introTitle: String(remote.introTitle ?? defaults.introTitle ?? ''),
    introParagraphs: Array.isArray(remote.introParagraphs)
      ? remote.introParagraphs.map((p) => String(p || '').trim()).filter(Boolean)
      : [...(defaults.introParagraphs || [])],
    highlights: Array.isArray(remote.highlights)
      ? remote.highlights
          .map((h) => ({
            label: String(h?.label || '').trim(),
            value: String(h?.value || '').trim(),
          }))
          .filter((h) => h.label || h.value)
      : [...(defaults.highlights || [])],
    categories:
      Array.isArray(remote.categories) && remote.categories.length > 0
        ? remote.categories.map((c) => String(c || '').trim()).filter(Boolean)
        : [...(defaults.categories?.length ? defaults.categories : GASTRONOMIC_CATALOG_CATEGORIES)],
    venues: venuesOut,
    ctaTitle: String(remote.ctaTitle ?? defaults.ctaTitle ?? ''),
    ctaBody: String(remote.ctaBody ?? defaults.ctaBody ?? ''),
    updatedAt: remote.updatedAt ?? null,
  }
}

function gastronomyHeroDefaults() {
  const d = DEFAULT_GASTRONOMIC_CATALOG_CONTENT
  return {
    heroImageUrl: d.heroImageUrl,
    overlayOpacity: d.overlayOpacity ?? 65,
    heroBadge: d.heroEyebrow,
    heroTitle: d.heroTitle,
    heroSubtitle: d.heroSubtitle,
    heroSearchPlaceholder: d.heroSearchPlaceholder,
    showHeroBadge: d.showHeroBadge !== false,
    showHeroTitle: d.showHeroTitle !== false,
    showHeroSubtitle: d.showHeroSubtitle !== false,
    showSearch: d.showSearch === true,
    showPrimaryButton: d.showPrimaryButton !== false,
    primaryLabel: d.heroPrimaryLabel,
    primaryHref: d.heroPrimaryHref,
    showSecondaryButton: d.showSecondaryButton !== false,
    secondaryLabel: d.heroSecondaryLabel,
    secondaryHref: d.heroSecondaryHref,
  }
}

export function gastronomyContentToHeroCover(content) {
  const c = content && typeof content === 'object' ? content : {}
  return mergePageHeroCover(gastronomyHeroDefaults(), {
    heroImageUrl: c.heroImageUrl,
    overlayOpacity: c.overlayOpacity,
    heroBadge: c.heroEyebrow,
    heroTitle: c.heroTitle,
    heroSubtitle: c.heroSubtitle,
    heroSearchPlaceholder: c.heroSearchPlaceholder,
    showHeroBadge: c.showHeroBadge,
    showHeroTitle: c.showHeroTitle,
    showHeroSubtitle: c.showHeroSubtitle,
    showSearch: c.showSearch,
    showPrimaryButton: c.showPrimaryButton,
    primaryLabel: c.heroPrimaryLabel,
    primaryHref: c.heroPrimaryHref,
    showSecondaryButton: c.showSecondaryButton,
    secondaryLabel: c.heroSecondaryLabel,
    secondaryHref: c.heroSecondaryHref,
  })
}

export function applyHeroCoverToGastronomyContent(content, draft) {
  const merged = mergePageHeroCover(gastronomyHeroDefaults(), draft)
  return {
    ...(content && typeof content === 'object' ? content : {}),
    heroImageUrl: merged.heroImageUrl,
    overlayOpacity: merged.overlayOpacity,
    heroEyebrow: merged.heroBadge,
    heroTitle: merged.heroTitle,
    heroSubtitle: merged.heroSubtitle,
    heroSearchPlaceholder: merged.heroSearchPlaceholder,
    showHeroBadge: merged.showHeroBadge,
    showHeroTitle: merged.showHeroTitle,
    showHeroSubtitle: merged.showHeroSubtitle,
    showSearch: merged.showSearch,
    showPrimaryButton: merged.showPrimaryButton,
    heroPrimaryLabel: merged.primaryLabel,
    heroPrimaryHref: merged.primaryHref,
    showSecondaryButton: merged.showSecondaryButton,
    heroSecondaryLabel: merged.secondaryLabel,
    heroSecondaryHref: merged.secondaryHref,
  }
}

export function gastronomyHeroToHeaderProps(content, options) {
  return pageHeroToHeaderProps(
    gastronomyContentToHeroCover(content),
    gastronomyHeroDefaults(),
    options,
  )
}

export function getActiveGastronomyVenues(content) {
  const venues = Array.isArray(content?.venues) ? content.venues : []
  return venues
    .filter((v) => v && v.isActive !== false && String(v.name || '').trim())
    .slice()
    .sort((a, b) => {
      const orderA = Number(a.sortOrder) || 0
      const orderB = Number(b.sortOrder) || 0
      if (orderA !== orderB) return orderA - orderB
      return String(a.name).localeCompare(String(b.name), 'es')
    })
}
