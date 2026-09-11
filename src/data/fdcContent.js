/**
 * Contenido público de Fiesta Nacional e Internacional del Caballo (FDC).
 */

import { mergePageHeroCover, pageHeroToHeaderProps } from './pageHeroCoverContent.js'
import { normalizeHeroToggle } from './servicesPageContent.js'
import {
  normalizeFdcSectionBackgroundStyle,
  normalizeFdcSectionOverlay,
  withFdcSectionBackground,
} from '../utils/fdcSectionBackground.js'

export const FDC_RUBROS = [
  'Kiosco',
  'Fonda',
  'Artesanías',
  'Drugstore',
  'Food Truck',
  'Stand Comercial',
  'Instituciones',
  'Vivero / Plantas',
  'Otro',
]

/** La opción «Otro» abre el campo libre de especificación. */
export function isFdcOtherRubro(label) {
  return String(label || '').trim().toLowerCase() === 'otro'
}

/** Normaliza lista de rubros y garantiza «Otro» al final (no se puede quitar). */
export function ensureFdcFormRubros(list, fallback = FDC_RUBROS) {
  const source = Array.isArray(list) && list.length ? list : fallback
  const seen = new Set()
  const out = []
  for (const raw of source) {
    const label = String(raw || '').trim()
    if (!label || isFdcOtherRubro(label)) continue
    const key = label.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(label)
  }
  out.push('Otro')
  return out
}

export const FDC_DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1800&q=80'

export const FDC_SCHEDULE_MAX_IMAGES = 10

export const DEFAULT_FDC_SCHEDULE = {
  title: 'Cronograma de actividades',
  backgroundStyle: 'dark',
  backgroundImageUrl: '',
  overlayOpacity: 55,
  featuredImageUrl: '',
  images: [
    {
      id: 'sch-img-1',
      imageUrl:
        'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80',
      caption: '',
    },
  ],
  ctaLabel: 'Ver cronograma completo',
  ctaHref: '',
  days: [
    {
      id: 'day-1',
      label: 'Jueves 9 Jul',
      items: [
        { id: 'd1-1', time: '08:00', text: 'Acreditaciones y apertura del predio' },
        { id: 'd1-2', time: '09:00', text: 'Concurso de Riendas' },
        { id: 'd1-3', time: '11:00', text: 'Desfile de Agrupaciones Gauchas' },
        { id: 'd1-4', time: '16:00', text: 'Pruebas de Campo' },
        { id: 'd1-5', time: '22:00', text: 'Peña de Apertura — Artistas invitados' },
      ],
    },
    {
      id: 'day-2',
      label: 'Viernes 10 Jul',
      items: [
        { id: 'd2-1', time: '10:00', text: 'Competencias ecuestres' },
        { id: 'd2-2', time: '17:00', text: 'Desfile tradicional' },
        { id: 'd2-3', time: '22:30', text: 'Shows en el escenario principal' },
      ],
    },
    {
      id: 'day-3',
      label: 'Sábado 11 Jul',
      items: [
        { id: 'd3-1', time: '10:00', text: 'Jornadas equinas' },
        { id: 'd3-2', time: '18:00', text: 'Espectáculo folklórico' },
        { id: 'd3-3', time: '22:00', text: 'Cartelera artística' },
      ],
    },
  ],
}

/** Normaliza imágenes del cronograma (máx. 10). Migra `featuredImageUrl` legacy. */
export function normalizeFdcScheduleImages(schedule) {
  const src = schedule && typeof schedule === 'object' ? schedule : {}
  const raw = Array.isArray(src.images) ? src.images : []
  const images = []
  for (const item of raw) {
    if (images.length >= FDC_SCHEDULE_MAX_IMAGES) break
    const imageUrl = String(item?.imageUrl || '').trim()
    if (!imageUrl) continue
    images.push({
      id: String(item?.id || '').trim() || `sch-img-${images.length + 1}`,
      imageUrl,
      caption: String(item?.caption || '').trim(),
    })
  }
  if (images.length === 0) {
    const legacy = String(src.featuredImageUrl || '').trim()
    if (legacy) {
      images.push({ id: 'sch-img-legacy', imageUrl: legacy, caption: '' })
    }
  }
  return images
}

export const FDC_ARTISTS_MAX_DAY_POSTERS = 4

export function normalizeFdcArtistDayPosters(artists) {
  const src = artists && typeof artists === 'object' ? artists : {}
  const list = Array.isArray(src.dayPosters) ? src.dayPosters : []
  const out = []
  for (const item of list.slice(0, FDC_ARTISTS_MAX_DAY_POSTERS)) {
    const imageUrl = String(item?.imageUrl || '').trim()
    if (!imageUrl) continue
    out.push({
      id: String(item?.id || '').trim() || `dp-${out.length + 1}`,
      label: String(item?.label || '').trim(),
      imageUrl,
      sortOrder: Number.isFinite(Number(item?.sortOrder))
        ? Number(item.sortOrder)
        : out.length,
    })
  }
  out.sort((a, b) => a.sortOrder - b.sortOrder)
  return out
}

export const DEFAULT_FDC_ARTISTS = {
  title: 'Cartelera artística',
  ctaLabel: 'Ver cartelera completa',
  ctaHref: '',
  /** Vacío = fondo claro. Con URL se muestra imagen + overlay configurable. */
  backgroundStyle: 'light',
  backgroundImageUrl: '',
  overlayOpacity: 55,
  /** Afiches generales por día (hasta 4). Si hay al menos uno, el CTA alterna la vista. */
  dayPosters: [],
  items: [
    {
      id: 'art-1',
      name: 'Chaqueño Palavecino',
      dateTag: 'JUE 9',
      photoUrl:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      sortOrder: 0,
    },
    {
      id: 'art-2',
      name: 'Soledad Pastorutti',
      dateTag: 'VIE 10',
      photoUrl:
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80',
      sortOrder: 1,
    },
    {
      id: 'art-3',
      name: 'Los Manseros Santiagueños',
      dateTag: 'SÁB 11',
      photoUrl:
        'https://images.unsplash.com/photo-1501386761570-0cd26b3f3200?auto=format&fit=crop&w=800&q=80',
      sortOrder: 2,
    },
  ],
}

export const DEFAULT_FDC_TICKETS = {
  title: 'Entradas online',
  body: 'Comprá tus entradas de forma segura y accedé al predio sin filas innecesarias.',
  bullets: ['Acceso al predio', 'Promociones y beneficios', 'Compra 100% online'],
  ctaLabel: 'Comprar entradas',
  ctaUrl: '',
  backgroundStyle: 'image',
  imageUrl:
    'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1600&q=80',
  overlayOpacity: 55,
}

export const DEFAULT_FDC_NEWS = {
  title: 'Noticias del festival',
  backgroundStyle: 'light',
  backgroundImageUrl: '',
  overlayOpacity: 55,
  ctaLabel: 'Ver todas las noticias',
  ctaHref: '/noticias',
  items: [],
}

export const DEFAULT_FDC_GALLERY = {
  title: 'Viví la fiesta',
  backgroundStyle: 'dark',
  backgroundImageUrl: '',
  overlayOpacity: 55,
  items: [],
}

export const DEFAULT_FDC_SPONSORS = {
  title: 'Auspician y acompañan',
  backgroundStyle: 'light',
  backgroundImageUrl: '',
  overlayOpacity: 55,
  items: [],
}

export const DEFAULT_FDC_FORM_SECTION = {
  /** Si es false, la sección no se muestra en la web pública (se puede reactivar desde admin). */
  visible: false,
  backgroundStyle: 'dark',
  backgroundImageUrl: '',
  overlayOpacity: 55,
}

export const FDC_STAT_ICON_OPTIONS = [
  { value: 'horse', label: 'Caballo' },
  { value: 'people', label: 'Personas / visitantes' },
  { value: 'music', label: 'Micrófono / artistas' },
  { value: 'jineteada', label: 'Gaucho / jineteada' },
  { value: 'peruvianHorse', label: 'Caballo (perfil)' },
  { value: 'food', label: 'Gastronomía' },
  { value: 'market', label: 'Feria / puestos' },
  { value: 'calendar', label: 'Calendario / días' },
  { value: 'ticket', label: 'Entradas' },
]

const FDC_STAT_ICONS = new Set(FDC_STAT_ICON_OPTIONS.map((o) => o.value))

/** Íconos elegibles para ubicaciones del mapa FDC. */
export const FDC_MAP_LOCATION_ICON_OPTIONS = [
  { value: 'pin', label: 'Pin / ubicación' },
  { value: 'horse', label: 'Caballo / predio' },
  { value: 'stage', label: 'Escenario / música' },
  { value: 'food', label: 'Gastronomía' },
  { value: 'market', label: 'Feria / puestos' },
  { value: 'ticket', label: 'Boletería / entradas' },
  { value: 'parking', label: 'Estacionamiento' },
  { value: 'info', label: 'Información' },
  { value: 'restroom', label: 'Baños' },
  { value: 'camping', label: 'Camping' },
  { value: 'medical', label: 'Salud / primeros auxilios' },
  { value: 'hotel', label: 'Alojamiento' },
  { value: 'water', label: 'Agua / bebedero' },
  { value: 'park', label: 'Plaza / parque' },
  { value: 'bus', label: 'Transporte / colectivo' },
  { value: 'car', label: 'Acceso / auto' },
  { value: 'landmark', label: 'Punto de interés' },
]

const FDC_MAP_LOCATION_ICONS = new Set(FDC_MAP_LOCATION_ICON_OPTIONS.map((o) => o.value))

export function normalizeFdcMapLocationIcon(value, fallback = 'pin') {
  const key = String(value || '').trim()
  if (FDC_MAP_LOCATION_ICONS.has(key)) return key
  const fb = String(fallback || '').trim()
  return FDC_MAP_LOCATION_ICONS.has(fb) ? fb : 'pin'
}

export const DEFAULT_FDC_FESTIVAL_STATS = {
  title: 'La fiesta en números',
  subtitle: '',
  showTitle: false,
  backgroundStyle: 'light',
  backgroundImageUrl: '',
  overlayOpacity: 55,
  items: [
    {
      id: 'stat-ed',
      icon: 'horse',
      prefix: '',
      value: 27,
      label: 'Ediciones',
      sortOrder: 0,
    },
    {
      id: 'stat-vis',
      icon: 'people',
      prefix: '+',
      value: 40000,
      label: 'Visitantes',
      sortOrder: 1,
    },
    {
      id: 'stat-art',
      icon: 'music',
      prefix: '+',
      value: 50,
      label: 'Artistas',
      sortOrder: 2,
    },
    {
      id: 'stat-jin',
      icon: 'jineteada',
      prefix: '+',
      value: 50,
      label: 'Jinetes',
      sortOrder: 3,
    },
    {
      id: 'stat-cab',
      icon: 'peruvianHorse',
      prefix: '+',
      value: 100,
      label: 'Caballos',
      sortOrder: 4,
    },
    {
      id: 'stat-puestos',
      icon: 'market',
      prefix: '+',
      value: 30,
      label: 'Puestos',
      sortOrder: 5,
    },
  ],
}

function normalizeFdcStatShowTitle(value, fallback = false) {
  if (value === true || value === 1 || value === '1' || value === 'true') return true
  if (value === false || value === 0 || value === '0' || value === 'false') return false
  return fallback === true
}

export function normalizeFdcFestivalStatsItem(item, index = 0) {
  const src = item && typeof item === 'object' ? item : {}
  const valueText = String(src.valueText ?? '').trim()
  let label = String(src.label ?? '').trim()
  const sublabel = String(src.sublabel ?? '').trim()
  if (!label && valueText) label = valueText
  if (!label && sublabel) label = sublabel
  const value = Math.max(0, Math.min(999999, Math.round(Number(src.value) || 0)))
  if (!label || value <= 0) return null
  return {
    id: String(src.id || '').trim() || makeFdcItemId('stat'),
    icon: FDC_STAT_ICONS.has(String(src.icon || '').trim())
      ? String(src.icon).trim()
      : 'horse',
    prefix: String(src.prefix ?? '').trim().slice(0, 8),
    value,
    label,
    sortOrder: Number.isFinite(Number(src.sortOrder)) ? Number(src.sortOrder) : index,
  }
}

export function normalizeFdcFestivalStats(input, defaults = DEFAULT_FDC_FESTIVAL_STATS) {
  const hasInput = input && typeof input === 'object'
  const src = hasInput ? input : {}
  const base = defaults && typeof defaults === 'object' ? defaults : DEFAULT_FDC_FESTIVAL_STATS
  const rawItems = hasInput && Array.isArray(src.items) ? src.items : base.items || []
  const items = rawItems
    .map((it, idx) => normalizeFdcFestivalStatsItem(it, idx))
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 8)
  return {
    title: String(src.title ?? base.title ?? '').trim(),
    subtitle: String(src.subtitle ?? base.subtitle ?? '').trim(),
    showTitle: normalizeFdcStatShowTitle(
      Object.prototype.hasOwnProperty.call(src, 'showTitle') ? src.showTitle : undefined,
      base.showTitle === true,
    ),
    backgroundStyle: normalizeFdcSectionBackgroundStyle(
      hasInput ? src.backgroundStyle : base.backgroundStyle,
      String(hasInput ? src.backgroundImageUrl : base.backgroundImageUrl || '').trim(),
    ),
    backgroundImageUrl: String(
      hasInput && src.backgroundImageUrl != null
        ? src.backgroundImageUrl
        : base.backgroundImageUrl || '',
    ).trim(),
    overlayOpacity: normalizeFdcSectionOverlay(
      hasInput ? src.overlayOpacity : base.overlayOpacity,
      base.overlayOpacity ?? 55,
    ),
    items,
  }
}

export function formatFdcStatNumber(value, prefix = '') {
  const n = Math.max(0, Math.round(Number(value) || 0))
  return `${prefix}${n.toLocaleString('es-AR')}`
}

export const DEFAULT_FDC_USEFUL_INFO = {
  title: '',
  items: [],
}

export const DEFAULT_FDC_VISIT_INFO = {
  backgroundStyle: 'light',
  backgroundImageUrl: '',
  overlayOpacity: 55,
  directions: {
    showTitle: true,
    title: 'Mapa interactivo',
    description:
      'Elegí una ubicación de la lista para verla en el mapa. Tocá el mapa para abrirlo en grande, usar tu ubicación y ver la ruta hasta el lugar que elijas.',
    center: { lat: -26.2312, lng: -65.2818 },
    zoom: 14,
    points: [
      {
        id: 'fdc-predio',
        title: 'Hipódromo Municipal de Trancas',
        subtitle: 'Predio principal',
        address: 'Ruta 9 Km 1308, Trancas, Tucumán',
        lat: -26.2312,
        lng: -65.2818,
        icon: 'horse',
        isActive: true,
        sortOrder: 10,
      },
    ],
  },
  faq: {
    showTitle: true,
    title: 'Preguntas frecuentes',
    backgroundStyle: 'light',
    backgroundImageUrl: '',
    overlayOpacity: 55,
    ctaLabel: 'Ver todas las preguntas',
    ctaHref: '',
    items: [
      {
        id: 'faq-1',
        question: '¿Los menores pagan entrada?',
        answer: 'Consultá la boletería oficial para conocer edades, costos y promociones vigentes.',
        sortOrder: 0,
      },
      {
        id: 'faq-2',
        question: '¿Se puede ingresar con conservadora?',
        answer: 'Sí, podés ingresar con conservadora según las normas de seguridad del predio.',
        sortOrder: 1,
      },
      {
        id: 'faq-3',
        question: '¿Qué pasa si llueve?',
        answer:
          'La mayoría de las actividades se realiza bajo techo o con infraestructura preparada. Ante cambios, se informará por redes oficiales.',
        sortOrder: 2,
      },
      {
        id: 'faq-4',
        question: '¿Hay estacionamiento?',
        answer: 'Sí, hay sectores de estacionamiento señalizados cerca del predio.',
        sortOrder: 3,
      },
    ],
  },
}

function normalizeFdcVisitShowTitle(value, fallback = true) {
  if (value === true || value === 1 || value === '1' || value === 'true') return true
  if (value === false || value === 0 || value === '0' || value === 'false') return false
  return fallback === true
}

/** Migra el título legacy «¿Cómo llegar?» → «Mapa interactivo». */
function normalizeFdcMapSectionTitle(raw, fallback = 'Mapa interactivo') {
  const title = String(raw ?? '').trim()
  if (!title || /^¿?c[oó]mo llegar\??$/i.test(title)) {
    return String(fallback || 'Mapa interactivo').trim() || 'Mapa interactivo'
  }
  return title
}

export function normalizeFdcVisitMapPoint(item, index = 0) {
  const src = item && typeof item === 'object' ? item : {}
  const lat = Number(src.lat)
  const lng = Number(src.lng)
  const title = String(src.title ?? '').trim()
  const subtitle = String(src.subtitle ?? '').trim()
  const address = String(src.address ?? '').trim()
  if (!title && !subtitle && !address) return null
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return {
    id: String(src.id || '').trim() || makeFdcItemId('loc'),
    title: title || subtitle || address,
    subtitle,
    address,
    lat: Math.min(90, Math.max(-90, lat)),
    lng: Math.min(180, Math.max(-180, lng)),
    icon: normalizeFdcMapLocationIcon(src.icon, 'pin'),
    isActive: src.isActive !== false && src.isActive !== 0 && src.isActive !== '0',
    sortOrder: Number.isFinite(Number(src.sortOrder)) ? Math.max(0, Math.round(Number(src.sortOrder))) : index * 10,
  }
}

function migrateLegacyFdcDirectionsPoints(directionsSrc, baseDirections = {}) {
  // Si ya viene `points` (aunque esté vacío), no reinyectar legacy ni defaults.
  if (Array.isArray(directionsSrc?.points)) {
    return directionsSrc.points
      .map((it, idx) => normalizeFdcVisitMapPoint(it, idx))
      .filter(Boolean)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, 40)
  }

  const legacyLat = Number(directionsSrc?.mapLat ?? directionsSrc?.center?.lat)
  const legacyLng = Number(directionsSrc?.mapLng ?? directionsSrc?.center?.lng)
  const legacyAddress = String(directionsSrc?.address || '').trim()
  if (Number.isFinite(legacyLat) && Number.isFinite(legacyLng)) {
    const venue = legacyAddress.split(',')[0]?.trim() || legacyAddress || 'Ubicación del festival'
    return [
      normalizeFdcVisitMapPoint(
        {
          id: 'fdc-legacy',
          title: venue,
          subtitle: '',
          address: legacyAddress,
          lat: legacyLat,
          lng: legacyLng,
          isActive: true,
          sortOrder: 10,
        },
        0,
      ),
    ].filter(Boolean)
  }

  return (baseDirections?.points || [])
    .map((it, idx) => normalizeFdcVisitMapPoint(it, idx))
    .filter(Boolean)
}

export function normalizeFdcVisitFaqItem(item, index = 0) {
  const src = item && typeof item === 'object' ? item : {}
  const question = String(src.question ?? '').trim()
  if (!question) return null
  return {
    id: String(src.id || '').trim() || makeFdcItemId('faq'),
    question,
    answer: String(src.answer ?? '').trim(),
    sortOrder: Number.isFinite(Number(src.sortOrder)) ? Number(src.sortOrder) : index,
  }
}

export function normalizeFdcVisitInfo(input, defaults = DEFAULT_FDC_VISIT_INFO) {
  const hasInput = input && typeof input === 'object'
  const src = hasInput ? input : {}
  const base = defaults && typeof defaults === 'object' ? defaults : DEFAULT_FDC_VISIT_INFO
  const directionsSrc =
    src.directions && typeof src.directions === 'object' ? src.directions : base.directions || {}
  const faqSrc = src.faq && typeof src.faq === 'object' ? src.faq : base.faq || {}
  const bgImage = String(
    hasInput && src.backgroundImageUrl != null
      ? src.backgroundImageUrl
      : base.backgroundImageUrl || '',
  ).trim()
  const rawItems = hasInput && Array.isArray(faqSrc.items) ? faqSrc.items : base.faq?.items || []
  const items = rawItems
    .map((it, idx) => normalizeFdcVisitFaqItem(it, idx))
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return {
    backgroundStyle: normalizeFdcSectionBackgroundStyle(
      hasInput ? src.backgroundStyle : base.backgroundStyle,
      bgImage,
    ),
    backgroundImageUrl: bgImage,
    overlayOpacity: normalizeFdcSectionOverlay(
      hasInput ? src.overlayOpacity : base.overlayOpacity,
      base.overlayOpacity ?? 55,
    ),
    directions: (() => {
      const points = migrateLegacyFdcDirectionsPoints(directionsSrc, base.directions || {})
      const centerSrc =
        directionsSrc.center && typeof directionsSrc.center === 'object'
          ? directionsSrc.center
          : {}
      const centerLat = Number(
        centerSrc.lat ?? directionsSrc.mapLat ?? base.directions?.center?.lat ?? points[0]?.lat,
      )
      const centerLng = Number(
        centerSrc.lng ?? directionsSrc.mapLng ?? base.directions?.center?.lng ?? points[0]?.lng,
      )
      const zoomRaw = Number(
        directionsSrc.zoom ?? directionsSrc.mapZoom ?? base.directions?.zoom ?? 14,
      )
      return {
        showTitle: normalizeFdcVisitShowTitle(
          directionsSrc.showTitle,
          base.directions?.showTitle !== false,
        ),
        title: normalizeFdcMapSectionTitle(
          directionsSrc.title ?? base.directions?.title,
          base.directions?.title || 'Mapa interactivo',
        ),
        description: String(
          directionsSrc.description ?? base.directions?.description ?? '',
        ).trim(),
        center: {
          lat: Number.isFinite(centerLat) ? Math.min(90, Math.max(-90, centerLat)) : -26.2312,
          lng: Number.isFinite(centerLng) ? Math.min(180, Math.max(-180, centerLng)) : -65.2818,
        },
        zoom: Number.isFinite(zoomRaw) ? Math.min(18, Math.max(10, Math.round(zoomRaw))) : 14,
        points,
      }
    })(),
    faq: (() => {
      const faqBgImage = String(
        faqSrc.backgroundImageUrl != null
          ? faqSrc.backgroundImageUrl
          : base.faq?.backgroundImageUrl || '',
      ).trim()
      return {
        showTitle: normalizeFdcVisitShowTitle(faqSrc.showTitle, base.faq?.showTitle !== false),
        title: String(faqSrc.title ?? base.faq?.title ?? 'Preguntas frecuentes').trim(),
        backgroundStyle: normalizeFdcSectionBackgroundStyle(
          faqSrc.backgroundStyle ?? base.faq?.backgroundStyle ?? 'light',
          faqBgImage,
        ),
        backgroundImageUrl: faqBgImage,
        overlayOpacity: normalizeFdcSectionOverlay(
          faqSrc.overlayOpacity ?? base.faq?.overlayOpacity,
          base.faq?.overlayOpacity ?? 55,
        ),
        ctaLabel: String(faqSrc.ctaLabel ?? base.faq?.ctaLabel ?? '').trim(),
        ctaHref: String(faqSrc.ctaHref ?? base.faq?.ctaHref ?? '').trim(),
        items,
      }
    })(),
  }
}

export function fdcVisitDirectionsHasContent(visitInfo) {
  const normalized = normalizeFdcVisitInfo(visitInfo)
  const points = (normalized.directions?.points || []).filter(
    (p) =>
      p?.isActive !== false &&
      Number.isFinite(Number(p?.lat)) &&
      Number.isFinite(Number(p?.lng)) &&
      (String(p?.title || '').trim() || String(p?.address || '').trim()),
  )
  return points.length > 0
}

export function fdcVisitFaqHasContent(visitInfo) {
  const normalized = normalizeFdcVisitInfo(visitInfo)
  return (normalized.faq?.items || []).length > 0
}

export function fdcVisitInfoHasContent(visitInfo) {
  return fdcVisitDirectionsHasContent(visitInfo) || fdcVisitFaqHasContent(visitInfo)
}

/** Config de fondo para la sección FAQ (independiente del mapa). */
export function resolveFdcFaqSectionBackgroundConfig(visitInfo) {
  const normalized = normalizeFdcVisitInfo(visitInfo)
  const faq = normalized.faq || {}
  return {
    backgroundStyle: faq.backgroundStyle || 'light',
    backgroundImageUrl: faq.backgroundImageUrl || '',
    overlayOpacity: faq.overlayOpacity ?? 55,
  }
}

export const DEFAULT_FDC_SECTION_NAV = [
  { id: 'nav-cronograma', label: 'Cronograma', href: '#cronograma', icon: 'calendar' },
  { id: 'nav-cartelera', label: 'Cartelera', href: '#cartelera', icon: 'music' },
  { id: 'nav-entradas', label: 'Entradas', href: '#entradas', icon: 'ticket' },
  { id: 'nav-noticias', label: 'Noticias', href: '#noticias', icon: 'news' },
]

/** Contador regresivo sobre la portada (encima de la barra de navegación). */
export const DEFAULT_FDC_HERO_COUNTDOWN = {
  enabled: false,
  /** Fecha/hora local ISO parcial: 2026-07-09T18:00:00 */
  targetAt: '2026-07-09T00:00:00',
  /** Ajuste vertical en px (negativo = más arriba). Móvil. */
  offsetYMobile: 0,
  /** Ajuste vertical en px (negativo = más arriba). Escritorio. */
  offsetYDesktop: 0,
  /** Color del texto «Faltan» (hex). */
  labelColor: '#ffffff',
}

export const FDC_HERO_COUNTDOWN_LABEL_COLORS = [
  { value: '#ffffff', label: 'Blanco' },
  { value: '#171b22', label: 'Azul oscuro' },
  { value: '#d4b483', label: 'Dorado' },
  { value: '#0369a1', label: 'Azul institucional' },
]

function normalizeCountdownLabelColor(value, fallback = '#ffffff') {
  const expand = (hex) => {
    let raw = String(hex || '').trim()
    if (/^[0-9a-fA-F]{6}$/.test(raw)) raw = `#${raw}`
    if (/^[0-9a-fA-F]{3}$/.test(raw)) raw = `#${raw}`
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase()
    if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
      const c = raw.slice(1)
      return `#${c[0]}${c[0]}${c[1]}${c[1]}${c[2]}${c[2]}`.toLowerCase()
    }
    return null
  }
  return expand(value) || expand(fallback) || '#ffffff'
}

function clampCountdownOffset(value, fallback = 0) {
  const n = Number(value)
  const fb = Number(fallback)
  const base = Number.isFinite(n) ? n : Number.isFinite(fb) ? fb : 0
  return Math.min(160, Math.max(-160, Math.round(base)))
}

export function normalizeFdcHeroCountdown(input, defaults = DEFAULT_FDC_HERO_COUNTDOWN) {
  const src = input && typeof input === 'object' ? input : {}
  const base = defaults && typeof defaults === 'object' ? defaults : DEFAULT_FDC_HERO_COUNTDOWN
  const enabled = src.enabled === true || src.enabled === 1
  const targetRaw = String(src.targetAt ?? base.targetAt ?? '').trim()
  const targetAt =
    targetRaw && /^\d{4}-\d{2}-\d{2}/.test(targetRaw) ? targetRaw.slice(0, 19) : String(base.targetAt || '')
  return {
    enabled,
    targetAt,
    offsetYMobile: clampCountdownOffset(src.offsetYMobile, base.offsetYMobile),
    offsetYDesktop: clampCountdownOffset(src.offsetYDesktop, base.offsetYDesktop),
    labelColor: normalizeCountdownLabelColor(src.labelColor, base.labelColor),
  }
}

/** Convierte targetAt a valor para input datetime-local. */
export function fdcCountdownToDatetimeLocal(targetAt) {
  const raw = String(targetAt || '').trim()
  if (!raw) return ''
  const normalized = raw.length === 10 ? `${raw}T00:00:00` : raw
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}`
}

/** Partes del contador (días, horas, minutos, segundos). */
export function computeFdcCountdownRemaining(targetAt, now = Date.now()) {
  const raw = String(targetAt || '').trim()
  if (!raw) return null
  const target = new Date(raw.length === 10 ? `${raw}T00:00:00` : raw)
  if (Number.isNaN(target.getTime())) return null
  const diff = Math.max(0, target.getTime() - now)
  const totalSec = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    expired: diff === 0,
  }
}

export const DEFAULT_FDC_CONTENT = {
  heroEyebrow: 'Trancas · Tucumán · Argentina',
  heroTitle: 'Fiesta Nacional e Internacional del Caballo 2026',
  heroSubtitle:
    'Una celebración de tradición, cultura y encuentro para toda la familia.',
  heroSlogan: '',
  heroDateBadge: '',
  heroImageUrl: FDC_DEFAULT_HERO_IMAGE,
  /** Afiche vertical/optimizado para móvil; si está vacío se usa heroImageUrl. */
  heroImageUrlMobile: '',
  overlayOpacity: 58,
  heroSearchPlaceholder: '',
  showHeroBadge: true,
  showHeroTitle: true,
  showHeroSubtitle: true,
  showSearch: false,
  showPrimaryButton: true,
  heroPrimaryLabel: 'Conocer más',
  heroPrimaryHref: '#cartelera',
  showSecondaryButton: true,
  heroSecondaryLabel: 'Ver cronograma',
  heroSecondaryHref: '#cronograma',
  heroCountdown: { ...DEFAULT_FDC_HERO_COUNTDOWN },
  introTitle: '',
  introParagraphs: [],
  highlights: [],
  sectionNav: DEFAULT_FDC_SECTION_NAV,
  schedule: DEFAULT_FDC_SCHEDULE,
  artists: DEFAULT_FDC_ARTISTS,
  tickets: DEFAULT_FDC_TICKETS,
  news: DEFAULT_FDC_NEWS,
  gallery: DEFAULT_FDC_GALLERY,
  sponsors: DEFAULT_FDC_SPONSORS,
  festivalStats: DEFAULT_FDC_FESTIVAL_STATS,
  visitInfo: DEFAULT_FDC_VISIT_INFO,
  formSection: DEFAULT_FDC_FORM_SECTION,
  usefulInfo: DEFAULT_FDC_USEFUL_INFO,
  formNotice:
    'IMPORTANTE: La presente preinscripción no implica la adjudicación del espacio. La organización evaluará cada solicitud de acuerdo con la disponibilidad de lugares y el cumplimiento de los requisitos establecidos.',
  formRubros: [...FDC_RUBROS],
  formEyebrow: 'Preinscripción 2026',
  formHeading: 'Completá tus datos',
  formOpenFrom: '2026-08-20',
  formOpenUntil: '2026-09-10',
  ctaTitle: '¿Querés sumar tu puesto?',
  ctaBody: '',
  whatsappMessage: '',
  updatedAt: null,
}

function mergeNamedSection(defaults, remote, keys) {
  const base = defaults && typeof defaults === 'object' ? defaults : {}
  const src = remote && typeof remote === 'object' ? remote : {}
  const out = { ...base }
  for (const key of keys) {
    if (src[key] !== undefined && src[key] !== null) out[key] = src[key]
  }
  return out
}

export function mergeFdcContent(base, remote) {
  const defaults = base || DEFAULT_FDC_CONTENT
  if (!remote || typeof remote !== 'object') {
    return JSON.parse(JSON.stringify(defaults))
  }
  return {
    ...defaults,
    heroEyebrow: String(remote.heroEyebrow ?? defaults.heroEyebrow ?? ''),
    heroTitle: String(remote.heroTitle ?? defaults.heroTitle ?? ''),
    heroSubtitle: String(remote.heroSubtitle ?? defaults.heroSubtitle ?? ''),
    heroSlogan: String(remote.heroSlogan ?? defaults.heroSlogan ?? ''),
    heroDateBadge: String(remote.heroDateBadge ?? defaults.heroDateBadge ?? ''),
    heroImageUrl: String(remote.heroImageUrl ?? defaults.heroImageUrl ?? ''),
    heroImageUrlMobile: String(
      remote.heroImageUrlMobile ??
        remote.usefulInfo?.heroImageUrlMobile ??
        defaults.heroImageUrlMobile ??
        '',
    ),
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
    showSearch: normalizeHeroToggle(remote.showSearch, defaults.showSearch === true),
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
    heroCountdown: normalizeFdcHeroCountdown(
      remote.heroCountdown ??
        remote.usefulInfo?.heroCountdown ??
        defaults.heroCountdown,
      defaults.heroCountdown,
    ),
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
    sectionNav: (Array.isArray(remote.sectionNav)
      ? remote.sectionNav.map((n) => ({ ...n }))
      : [...(defaults.sectionNav || [])]
    ).filter((n) => {
      const href = String(n?.href || '').trim().toLowerCase()
      return href !== '#info-util'
    }),
    schedule: (() => {
      const remoteSch =
        remote.schedule && typeof remote.schedule === 'object' ? remote.schedule : null
      const merged = mergeNamedSection(defaults.schedule, remoteSch, [
        'title',
        'featuredImageUrl',
        'ctaLabel',
        'ctaHref',
        'days',
        'images',
        'backgroundStyle',
        'backgroundImageUrl',
        'overlayOpacity',
      ])
      // Si hay schedule remoto, no mezclar fotos demo del default: usar `images` del
      // servidor o migrar desde `featuredImageUrl` legacy.
      const images = normalizeFdcScheduleImages(
        remoteSch
          ? {
              images: Array.isArray(remoteSch.images) ? remoteSch.images : [],
              featuredImageUrl:
                remoteSch.featuredImageUrl || merged.featuredImageUrl || '',
            }
          : merged,
      )
      return withFdcSectionBackground(
        {
          ...merged,
          images,
          featuredImageUrl: images[0]?.imageUrl || String(merged.featuredImageUrl || '').trim(),
        },
        defaults.schedule,
      )
    })(),
    artists: (() => {
      const merged = mergeNamedSection(defaults.artists, remote.artists, [
        'title',
        'ctaLabel',
        'ctaHref',
        'items',
        'dayPosters',
        'backgroundStyle',
        'backgroundImageUrl',
        'overlayOpacity',
      ])
      return withFdcSectionBackground(
        {
          ...merged,
          dayPosters: normalizeFdcArtistDayPosters(
            remote.artists && typeof remote.artists === 'object'
              ? {
                  dayPosters: Array.isArray(remote.artists.dayPosters)
                    ? remote.artists.dayPosters
                    : [],
                }
              : merged,
          ),
        },
        defaults.artists,
      )
    })(),
    tickets: (() => {
      const merged = mergeNamedSection(defaults.tickets, remote.tickets, [
        'title',
        'body',
        'bullets',
        'ctaLabel',
        'ctaUrl',
        'backgroundStyle',
        'imageUrl',
        'overlayOpacity',
      ])
      const ticketImage = String(merged.imageUrl || '').trim()
      return {
        ...withFdcSectionBackground(merged, defaults.tickets),
        backgroundStyle: normalizeFdcSectionBackgroundStyle(merged.backgroundStyle, ticketImage),
      }
    })(),
    news: withFdcSectionBackground(
      mergeNamedSection(defaults.news, remote.news, [
        'title',
        'ctaLabel',
        'ctaHref',
        'items',
        'backgroundStyle',
        'backgroundImageUrl',
        'overlayOpacity',
      ]),
      defaults.news,
    ),
    gallery: withFdcSectionBackground(
      mergeNamedSection(defaults.gallery, remote.gallery, [
        'title',
        'items',
        'backgroundStyle',
        'backgroundImageUrl',
        'overlayOpacity',
      ]),
      defaults.gallery,
    ),
    sponsors: withFdcSectionBackground(
      mergeNamedSection(defaults.sponsors, remote.sponsors, [
        'title',
        'items',
        'backgroundStyle',
        'backgroundImageUrl',
        'overlayOpacity',
      ]),
      defaults.sponsors,
    ),
    festivalStats: normalizeFdcFestivalStats(
      remote.festivalStats ?? defaults.festivalStats,
      defaults.festivalStats,
    ),
    visitInfo: normalizeFdcVisitInfo(remote.visitInfo ?? defaults.visitInfo, defaults.visitInfo),
    formSection: (() => {
      const raw = remote.formSection ?? remote.usefulInfo?.formSection ?? defaults.formSection
      const merged = withFdcSectionBackground(raw, defaults.formSection)
      const visibleRaw =
        raw && typeof raw === 'object' && Object.prototype.hasOwnProperty.call(raw, 'visible')
          ? raw.visible
          : defaults.formSection?.visible
      return {
        ...merged,
        visible: normalizeFdcFormSectionVisible(visibleRaw, false),
      }
    })(),
    usefulInfo: { title: '', items: [] },
    formNotice: String(remote.formNotice ?? defaults.formNotice ?? ''),
    formRubros: ensureFdcFormRubros(
      Array.isArray(remote.formRubros)
        ? remote.formRubros
        : Array.isArray(remote.usefulInfo?.formRubros)
          ? remote.usefulInfo.formRubros
          : defaults.formRubros || FDC_RUBROS,
    ),
    formEyebrow: String(
      remote.formEyebrow ||
        remote.usefulInfo?.formEyebrow ||
        defaults.formEyebrow ||
        'Preinscripción 2026',
    ),
    formHeading: String(
      remote.formHeading ||
        remote.usefulInfo?.formHeading ||
        defaults.formHeading ||
        'Completá tus datos',
    ),
    formOpenFrom: remote.formOpenFrom
      ? String(remote.formOpenFrom).slice(0, 10)
      : defaults.formOpenFrom,
    formOpenUntil: remote.formOpenUntil
      ? String(remote.formOpenUntil).slice(0, 10)
      : defaults.formOpenUntil,
    ctaTitle: String(remote.ctaTitle ?? defaults.ctaTitle ?? ''),
    ctaBody: String(remote.ctaBody ?? defaults.ctaBody ?? ''),
    whatsappMessage:
      remote.whatsappMessage != null ? String(remote.whatsappMessage) : defaults.whatsappMessage || '',
    updatedAt: remote.updatedAt ?? null,
  }
}

function fdcHeroDefaults() {
  const d = DEFAULT_FDC_CONTENT
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

export function fdcContentToHeroCover(content) {
  const c = content && typeof content === 'object' ? content : {}
  return mergePageHeroCover(fdcHeroDefaults(), {
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

export function applyHeroCoverToFdcContent(content, draft) {
  const merged = mergePageHeroCover(fdcHeroDefaults(), draft)
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

export function fdcHeroToHeaderProps(content, options) {
  return pageHeroToHeaderProps(fdcContentToHeroCover(content), fdcHeroDefaults(), options)
}

/** @returns {'open'|'before'|'after'|'unknown'} */
export function getFdcFormWindowState(content, now = new Date()) {
  const from = content?.formOpenFrom ? String(content.formOpenFrom).slice(0, 10) : ''
  const until = content?.formOpenUntil ? String(content.formOpenUntil).slice(0, 10) : ''
  if (!from && !until) return 'open'
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const today = `${y}-${m}-${d}`
  if (from && today < from) return 'before'
  if (until && today > until) return 'after'
  return 'open'
}

/** Visible en la web pública (formulario + anclas relacionadas). */
export function normalizeFdcFormSectionVisible(value, fallback = false) {
  if (value === true || value === 1 || value === '1' || value === 'true') return true
  if (value === false || value === 0 || value === '0' || value === 'false') return false
  return fallback === true
}

export function isFdcPreinscriptionVisible(content) {
  return normalizeFdcFormSectionVisible(content?.formSection?.visible, false)
}

/** Detecta enlaces/anclas a la sección de preinscripción. */
export function isFdcPreinscriptionHref(href) {
  const raw = String(href || '').trim().toLowerCase()
  if (!raw) return false
  const hash = raw.includes('#') ? raw.slice(raw.indexOf('#') + 1) : raw.replace(/^\//, '')
  const id = hash.split(/[/?]/)[0] || ''
  return (
    id === 'solicitud-puestos' ||
    id === 'preinscripcion' ||
    id === 'preinscripción' ||
    id === 'puestos'
  )
}

export function filterFdcPublicSectionNav(items, { preinscriptionVisible = false } = {}) {
  const list = Array.isArray(items) ? items : []
  if (preinscriptionVisible) return list
  return list.filter((item) => !isFdcPreinscriptionHref(item?.href))
}

export function formatFdcDateLabel(ymd) {
  const raw = String(ymd || '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return ''
  const [y, m, d] = raw.split('-')
  return `${d}/${m}/${y}`
}

export function makeFdcItemId(prefix = 'item') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
