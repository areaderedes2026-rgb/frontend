/**
 * Contenido público del Catálogo de hospedajes (vista ciudadana + valores por defecto del panel).
 */

import { mergePageHeroCover, pageHeroToHeaderProps } from './pageHeroCoverContent.js'
import { normalizeHeroToggle } from './servicesPageContent.js'
import {
  gastronomyVenueHasMapPoint,
  gastronomyVenuesToMapPoints,
  getActiveGastronomyVenues,
  parseOptionalGeoCoord,
} from './gastronomicCatalogContent.js'

export const LODGING_CATALOG_CATEGORIES = [
  'Todos',
  'Hoteles',
  'Hosterías',
  'Cabañas',
  'Hostels',
  'Departamentos',
  'Campings',
  'Estancias',
  'Otros',
]

export const LODGING_VENUE_DESCRIPTION_MAX = 2500

export const lodgingVenueHasMapPoint = gastronomyVenueHasMapPoint

export function lodgingVenuesToMapPoints(venues, options = {}) {
  return gastronomyVenuesToMapPoints(venues, { ...options, icon: options.icon || 'hotel' })
}

export function getActiveLodgingVenues(content) {
  return getActiveGastronomyVenues(content)
}

export const LODGING_DIRECTORY_COPY = {
  sectionId: 'catalogo-hospedajes',
  eyebrow: 'Directorio',
  title: 'Hospedajes',
  lead: 'Filtrá por tipo o buscá por nombre. Tocá la tarjeta para ver la ficha, o usá «Ver en el mapa» para volar hasta el alojamiento.',
  itemSingular: 'propuesta',
  itemPlural: 'propuestas',
  searchAria: 'Buscar hospedajes',
  emptyTitle: 'No hay hospedajes para mostrar',
  emptyBody:
    'Probá otra categoría o buscá con otra palabra. El directorio se actualiza desde el panel municipal.',
  emptyReset: 'Ver todos los hospedajes',
}

export const LODGING_MAP_COPY = {
  listTitle: 'Hospedajes en el mapa',
  listAria: 'Hospedajes en el mapa',
  searchId: 'lodging-map-search',
  searchAria: 'Buscar hospedaje en el mapa',
  searchPlaceholder: 'Buscar hospedaje...',
  emptySearch: 'No hay hospedajes que coincidan.',
  emptyHint: 'Probá con otro nombre o barrio.',
  emptyNone: 'Todavía no hay hospedajes con ubicación en el mapa.',
  countLabel: (n) => `${n} hospedaje${n === 1 ? '' : 's'} con ubicación`,
  eyebrow: 'Cómo llegar',
  title: 'Mapa de hospedajes',
  lead: 'Elegí un hospedaje en la lista o tocá «Ver en el mapa» en una tarjeta. El mapa vuela hasta el punto y se puede abrir en grande para trazar la ruta.',
}

export const LODGING_EDITOR_LABELS = {
  idPrefix: 'hospedaje',
  venueEditorTitle: 'Editar hospedaje',
  categoriesDescription: 'La primera («Todos») es fija. El resto se usa para filtrar hospedajes.',
  categoryRemoveBody: 'Los hospedajes se reasignarán a la primera categoría disponible.',
  venuesSectionId: 'hospedajes',
  venuesTitle: 'Hospedajes',
  venuesDescription:
    'Nombre, ubicación, coordenadas para el mapa, teléfono, descripción, foto y datos de contacto de cada alojamiento.',
  addVenue: 'Nuevo hospedaje',
  emptyVenues: 'Todavía no hay hospedajes. Sumá el primero con nombre, ubicación, teléfono y descripción.',
  removeVenueTitle: '¿Quitar este hospedaje?',
  unnamedVenue: 'este hospedaje',
  nameLabel: 'Nombre del hospedaje',
  photoLabel: 'Foto del hospedaje',
  visibleLabel: 'Visible en el catálogo público',
  onMap: 'Este hospedaje va a aparecer en el mapa público.',
  offMap:
    'Opcional. Si el enlace de Maps trae coordenadas, se completan al aplicar. También podés cargarlas a mano.',
  mapDescription:
    'Vista previa del mapa público. Cada hospedaje necesita latitud y longitud, o un enlace de Google Maps que las incluya.',
  mapEmpty:
    'Todavía no hay hospedajes con coordenadas. Completá latitud y longitud, o pegá un enlace de Maps con @lat,lng y aplicá el hospedaje.',
  ctaDescription:
    'Mensaje final para invitar a sumar un hospedaje o consultar. En la vista pública queda al final de la página.',
}

function normalizeVenue(remote) {
  if (!remote || typeof remote !== 'object') return null
  const name = String(remote.name || '').trim()
  const description = String(remote.description || '').trim().slice(0, LODGING_VENUE_DESCRIPTION_MAX)
  if (!name && !description) return null
  return {
    id: String(remote.id || '').trim() || `hospedaje-${Math.random().toString(36).slice(2, 10)}`,
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
    lat: parseOptionalGeoCoord(remote.lat, -90, 90),
    lng: parseOptionalGeoCoord(remote.lng, -180, 180),
    isActive: remote.isActive !== false,
    sortOrder: Number.isFinite(Number(remote.sortOrder)) ? Number(remote.sortOrder) : 0,
  }
}

export const DEFAULT_LODGING_CATALOG_CONTENT = {
  heroEyebrow: 'Nuestra ciudad',
  heroTitle: 'Catálogo de hospedajes de Trancas',
  heroSubtitle:
    'Hoteles, cabañas, hostels y otros alojamientos locales para quedarte y conocer el departamento.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=80',
  overlayOpacity: 65,
  heroSearchPlaceholder: 'Buscar por nombre, barrio o tipo…',
  showHeroBadge: true,
  showHeroTitle: true,
  showHeroSubtitle: true,
  showSearch: true,
  showPrimaryButton: true,
  heroPrimaryLabel: 'Ver hospedajes',
  heroPrimaryHref: '#catalogo-hospedajes',
  showSecondaryButton: true,
  heroSecondaryLabel: 'Turismo',
  heroSecondaryHref: '/turismo',
  introTitle: 'Dónde quedarte en Trancas',
  introParagraphs: [
    'Este catálogo reúne alojamientos del departamento: hoteles, cabañas, hostels y otras opciones para vecinos y visitantes.',
    'La información (nombre, ubicación, teléfono y descripción) la aportan los propios establecimientos. Confirmá disponibilidad y tarifas antes de reservar.',
  ],
  highlights: [
    { label: 'Propuestas', value: 'Alojamientos de Trancas' },
    { label: 'Tipos', value: 'Hoteles, cabañas y más' },
    { label: 'Actualización', value: 'Directorio municipal' },
  ],
  categories: [...LODGING_CATALOG_CATEGORIES],
  venues: [],
  ctaTitle: '¿Querés sumar tu hospedaje?',
  ctaBody:
    'Si tenés un hotel, cabañas u otro alojamiento en Trancas, acercate a la Municipalidad o escribinos por Atención al ciudadano para incorporarte al catálogo.',
}

export function mergeLodgingCatalogContent(base, remote) {
  const defaults = base || DEFAULT_LODGING_CATALOG_CONTENT
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
        : [...(defaults.categories?.length ? defaults.categories : LODGING_CATALOG_CATEGORIES)],
    venues: venuesOut,
    ctaTitle: String(remote.ctaTitle ?? defaults.ctaTitle ?? ''),
    ctaBody: String(remote.ctaBody ?? defaults.ctaBody ?? ''),
    updatedAt: remote.updatedAt ?? null,
  }
}

function lodgingHeroDefaults() {
  const d = DEFAULT_LODGING_CATALOG_CONTENT
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

export function lodgingContentToHeroCover(content) {
  const c = content && typeof content === 'object' ? content : {}
  return mergePageHeroCover(lodgingHeroDefaults(), {
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

export function applyHeroCoverToLodgingContent(content, draft) {
  const merged = mergePageHeroCover(lodgingHeroDefaults(), draft)
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

export function lodgingHeroToHeaderProps(content, options) {
  return pageHeroToHeaderProps(lodgingContentToHeroCover(content), lodgingHeroDefaults(), options)
}
