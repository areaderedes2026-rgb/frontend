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

export const DEFAULT_FDC_CONTENT = {
  heroEyebrow: 'Nuestra ciudad',
  heroTitle: 'Fiesta Nacional e Internacional del Caballo 2026',
  heroSubtitle:
    'Preinscribí tu puesto comercial para la Fiesta Nacional e Internacional del Caballo 2026.',
  heroImageUrl: FDC_DEFAULT_HERO_IMAGE,
  overlayOpacity: 65,
  heroSearchPlaceholder: '',
  showHeroBadge: true,
  showHeroTitle: true,
  showHeroSubtitle: true,
  showSearch: false,
  showPrimaryButton: true,
  heroPrimaryLabel: 'Solicitar puesto comercial',
  heroPrimaryHref: '#solicitud-puestos',
  showSecondaryButton: true,
  heroSecondaryLabel: 'Ver agenda de eventos',
  heroSecondaryHref: '/eventos',
  introTitle: 'Una fiesta que marca a Trancas',
  introParagraphs: [
    'La Fiesta Nacional e Internacional del Caballo reúne tradición, turismo, deportes equinos y una fuerte propuesta comercial para vecinos y visitantes.',
    'Desde este espacio podés preinscribirte para un puesto comercial. La organización evaluará cada solicitud según disponibilidad y requisitos.',
  ],
  highlights: [
    { label: 'Preinscripción', value: '20/08 al 10/09' },
    { label: 'Puestos', value: 'Solicitud comercial' },
    { label: 'Organiza', value: 'Municipalidad de Trancas' },
  ],
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

export function mergeFdcContent(base, remote) {
  const defaults = base || DEFAULT_FDC_CONTENT
  if (!remote || typeof remote !== 'object') {
    return { ...defaults }
  }
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
