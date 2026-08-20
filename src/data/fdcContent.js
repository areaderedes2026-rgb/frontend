/**
 * Contenido público de Fiesta Nacional e Internacional del Caballo (FDC).
 */

import { mergePageHeroCover, pageHeroToHeaderProps } from './pageHeroCoverContent.js'
import { normalizeHeroToggle } from './servicesPageContent.js'

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

export const FDC_DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1800&q=80'

export const FDC_SCHEDULE_MAX_IMAGES = 10

export const DEFAULT_FDC_SCHEDULE = {
  title: 'Cronograma de actividades',
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

export const DEFAULT_FDC_ARTISTS = {
  title: 'Cartelera artística',
  ctaLabel: '',
  ctaHref: '#cartelera',
  items: [],
}

export const DEFAULT_FDC_TICKETS = {
  title: 'Entradas online',
  body: 'Comprá tus entradas de forma segura y accedé al predio sin filas innecesarias.',
  bullets: ['Acceso al predio', 'Promociones y beneficios', 'Compra 100% online'],
  ctaLabel: 'Comprar entradas',
  ctaUrl: '',
  imageUrl:
    'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80',
}

export const DEFAULT_FDC_NEWS = {
  title: 'Noticias del festival',
  ctaLabel: 'Ver noticias municipales',
  ctaHref: '/noticias',
  items: [],
}

export const DEFAULT_FDC_GALLERY = {
  title: 'Viví la fiesta',
  items: [],
}

export const DEFAULT_FDC_SPONSORS = {
  title: 'Auspician y acompañan',
  items: [],
}

export const DEFAULT_FDC_USEFUL_INFO = {
  title: 'Información útil',
  items: [
    {
      id: 'info-1',
      title: 'Ubicación',
      body: 'Predio ferial · Trancas, Tucumán',
    },
    {
      id: 'info-2',
      title: 'Horarios',
      body: 'Consultá el cronograma día por día',
    },
    {
      id: 'info-3',
      title: 'Puestos comerciales',
      body: 'Preinscribite online desde esta página',
    },
  ],
}

export const DEFAULT_FDC_SECTION_NAV = [
  { id: 'nav-cronograma', label: 'Cronograma', href: '#cronograma', icon: 'calendar' },
  { id: 'nav-cartelera', label: 'Cartelera', href: '#cartelera', icon: 'music' },
  { id: 'nav-entradas', label: 'Entradas', href: '#entradas', icon: 'ticket' },
  { id: 'nav-noticias', label: 'Noticias', href: '#noticias', icon: 'news' },
  { id: 'nav-info', label: 'Info útil', href: '#info-util', icon: 'info' },
  { id: 'nav-puestos', label: 'Puestos', href: '#solicitud-puestos', icon: 'store' },
]

export const DEFAULT_FDC_CONTENT = {
  heroEyebrow: 'Trancas · Tucumán · Argentina',
  heroTitle: 'Fiesta Nacional e Internacional del Caballo 2026',
  heroSubtitle:
    'Una celebración de tradición, cultura y encuentro para toda la familia.',
  heroSlogan: '',
  heroDateBadge: '',
  heroImageUrl: FDC_DEFAULT_HERO_IMAGE,
  overlayOpacity: 58,
  heroSearchPlaceholder: '',
  showHeroBadge: true,
  showHeroTitle: true,
  showHeroSubtitle: true,
  showSearch: false,
  showPrimaryButton: true,
  heroPrimaryLabel: 'Conocer más',
  heroPrimaryHref: '#sobre-la-fiesta',
  showSecondaryButton: true,
  heroSecondaryLabel: 'Ver cronograma',
  heroSecondaryHref: '#cronograma',
  introTitle: 'Una fiesta que marca a Trancas',
  introParagraphs: [
    'La Fiesta Nacional e Internacional del Caballo reúne tradición, turismo, deportes equinos y una fuerte propuesta comercial para vecinos y visitantes.',
  ],
  highlights: [
    { label: 'Preinscripción', value: '20/08 al 10/09' },
    { label: 'Puestos', value: 'Solicitud comercial' },
    { label: 'Organiza', value: 'Municipalidad de Trancas' },
  ],
  sectionNav: DEFAULT_FDC_SECTION_NAV,
  schedule: DEFAULT_FDC_SCHEDULE,
  artists: DEFAULT_FDC_ARTISTS,
  tickets: DEFAULT_FDC_TICKETS,
  news: DEFAULT_FDC_NEWS,
  gallery: DEFAULT_FDC_GALLERY,
  sponsors: DEFAULT_FDC_SPONSORS,
  usefulInfo: DEFAULT_FDC_USEFUL_INFO,
  formNotice:
    'IMPORTANTE: La presente preinscripción no implica la adjudicación del espacio. La organización evaluará cada solicitud de acuerdo con la disponibilidad de lugares y el cumplimiento de los requisitos establecidos.',
  formOpenFrom: '2026-08-20',
  formOpenUntil: '2026-09-10',
  ctaTitle: '¿Querés sumar tu puesto?',
  ctaBody:
    'Completá el formulario de preinscripción. Vas a recibir una constancia automática en tu correo electrónico con el número de solicitud.',
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
    sectionNav: Array.isArray(remote.sectionNav)
      ? remote.sectionNav.map((n) => ({ ...n }))
      : [...(defaults.sectionNav || [])],
    schedule: (() => {
      const merged = mergeNamedSection(defaults.schedule, remote.schedule, [
        'title',
        'featuredImageUrl',
        'ctaLabel',
        'ctaHref',
        'days',
        'images',
      ])
      const images = normalizeFdcScheduleImages(merged)
      return {
        ...merged,
        images,
        featuredImageUrl: images[0]?.imageUrl || String(merged.featuredImageUrl || '').trim(),
      }
    })(),
    artists: mergeNamedSection(defaults.artists, remote.artists, [
      'title',
      'ctaLabel',
      'ctaHref',
      'items',
    ]),
    tickets: mergeNamedSection(defaults.tickets, remote.tickets, [
      'title',
      'body',
      'bullets',
      'ctaLabel',
      'ctaUrl',
      'imageUrl',
    ]),
    news: mergeNamedSection(defaults.news, remote.news, [
      'title',
      'ctaLabel',
      'ctaHref',
      'items',
    ]),
    gallery: mergeNamedSection(defaults.gallery, remote.gallery, ['title', 'items']),
    sponsors: mergeNamedSection(defaults.sponsors, remote.sponsors, ['title', 'items']),
    usefulInfo: mergeNamedSection(defaults.usefulInfo, remote.usefulInfo, ['title', 'items']),
    formNotice: String(remote.formNotice ?? defaults.formNotice ?? ''),
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

export function formatFdcDateLabel(ymd) {
  const raw = String(ymd || '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return ''
  const [y, m, d] = raw.split('-')
  return `${d}/${m}/${y}`
}

export function makeFdcItemId(prefix = 'item') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
