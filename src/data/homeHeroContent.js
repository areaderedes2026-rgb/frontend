import { ROUTES } from '../utils/constants.js'

export const DEFAULT_HOME_HERO_CONTENT = {
  displayMode: 'single',
  activeSlideId: 'trancas-tierra-gaucha',
  autoplayEnabled: true,
  autoplaySeconds: 6,
  slides: [
    {
      id: 'trancas-tierra-gaucha',
      eyebrow: 'Municipalidad de Trancas',
      title: 'Trancas tierra gaucha',
      subtitle: '',
      imageUrl: '/rio.jpeg',
      mobileImageUrl: '',
      imageAlt: 'Paisaje de Trancas',
      overlayOpacity: 65,
      showEyebrow: true,
      showTitle: true,
      showSubtitle: false,
      showPrimaryButton: true,
      primaryLabel: 'Realizar consulta',
      primaryHref: ROUTES.atencionCiudadano,
      showSecondaryButton: true,
      secondaryLabel: 'Ver servicios',
      secondaryHref: ROUTES.services,
      textAlign: 'left',
      isActive: true,
      sortOrder: 10,
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

function cleanBool(value, fallback = true) {
  return typeof value === 'boolean' ? value : fallback
}

function mapSlide(raw, fallback, index) {
  const base = fallback || {}
  const id = cleanText(raw?.id || base.id || `banner-${index + 1}`, 80)
  const textAlign = ['left', 'center', 'right'].includes(raw?.textAlign)
    ? raw.textAlign
    : base.textAlign || 'left'

  return {
    id,
    eyebrow: cleanText(raw?.eyebrow ?? base.eyebrow, 120),
    title: cleanText(raw?.title ?? base.title, 180),
    subtitle: cleanText(raw?.subtitle ?? base.subtitle, 600),
    imageUrl: cleanText(raw?.imageUrl ?? base.imageUrl, 2048),
    mobileImageUrl: cleanText(raw?.mobileImageUrl ?? base.mobileImageUrl, 2048),
    imageAlt: cleanText(raw?.imageAlt ?? base.imageAlt, 180),
    overlayOpacity: Math.min(
      90,
      Math.max(0, Math.round(cleanNumber(raw?.overlayOpacity, cleanNumber(base.overlayOpacity, 65)))),
    ),
    showEyebrow: cleanBool(raw?.showEyebrow, base.showEyebrow !== false),
    showTitle: cleanBool(raw?.showTitle, base.showTitle !== false),
    showSubtitle: cleanBool(raw?.showSubtitle, base.showSubtitle !== false),
    showPrimaryButton: cleanBool(raw?.showPrimaryButton, base.showPrimaryButton !== false),
    primaryLabel: cleanText(raw?.primaryLabel ?? base.primaryLabel, 80),
    primaryHref: cleanText(raw?.primaryHref ?? base.primaryHref, 2048),
    showSecondaryButton: cleanBool(raw?.showSecondaryButton, base.showSecondaryButton !== false),
    secondaryLabel: cleanText(raw?.secondaryLabel ?? base.secondaryLabel, 80),
    secondaryHref: cleanText(raw?.secondaryHref ?? base.secondaryHref, 2048),
    textAlign,
    isActive: cleanBool(raw?.isActive, base.isActive !== false),
    sortOrder: Math.max(0, Math.round(cleanNumber(raw?.sortOrder, cleanNumber(base.sortOrder, index * 10)))),
  }
}

export function mergeHomeHeroContent(base, incoming) {
  if (!incoming || typeof incoming !== 'object') return base

  const slidesIncoming = Array.isArray(incoming.slides) ? incoming.slides : []
  const slides = slidesIncoming.length
    ? slidesIncoming.map((slide, idx) => mapSlide(slide, base?.slides?.[idx], idx))
    : base.slides.map((slide, idx) => mapSlide(slide, slide, idx))

  const activeSlideId = cleanText(incoming.activeSlideId || base.activeSlideId, 80)

  return {
    displayMode: incoming.displayMode === 'carousel' ? 'carousel' : 'single',
    activeSlideId: slides.some((slide) => slide.id === activeSlideId)
      ? activeSlideId
      : slides[0]?.id || '',
    autoplayEnabled: cleanBool(incoming.autoplayEnabled, base.autoplayEnabled !== false),
    autoplaySeconds: Math.min(
      30,
      Math.max(3, Math.round(cleanNumber(incoming.autoplaySeconds, base.autoplaySeconds || 6))),
    ),
    slides,
    updatedAt: incoming.updatedAt || null,
  }
}

export function getActiveHomeHeroSlides(content) {
  const merged = mergeHomeHeroContent(DEFAULT_HOME_HERO_CONTENT, content || {})
  const activeSlides = merged.slides
    .filter((slide) => slide.isActive !== false)
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))

  if (merged.displayMode !== 'carousel') {
    const selected = activeSlides.find((slide) => slide.id === merged.activeSlideId)
    return selected ? [selected] : activeSlides.slice(0, 1)
  }

  return activeSlides.length ? activeSlides : merged.slides.slice(0, 1)
}
