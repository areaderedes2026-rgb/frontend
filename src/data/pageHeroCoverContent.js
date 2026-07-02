export const DEFAULT_AREAS_PAGE_HERO = {
  heroImageUrl: '',
  overlayOpacity: 65,
  heroBadge: 'Municipalidad de Trancas',
  heroTitle: 'Todas las áreas en un solo lugar',
  heroSubtitle:
    'Explorá programas, equipos y acciones de cada área municipal para encontrar más rápido la gestión que necesitás.',
  heroSearchPlaceholder: 'Buscar por nombre, slug o descripción…',
  showHeroBadge: true,
  showHeroTitle: true,
  showHeroSubtitle: true,
  showSearch: true,
  showPrimaryButton: true,
  primaryLabel: 'Empezar recorrido',
  primaryHref: '#areas-grid',
  showSecondaryButton: true,
  secondaryLabel: 'Ver directorio',
  secondaryHref: '#areas-grid',
}

export const DEFAULT_NEWS_PAGE_HERO = {
  heroImageUrl: '',
  overlayOpacity: 65,
  heroBadge: 'Municipalidad de Trancas',
  heroTitle: 'Noticias Trancas',
  heroSubtitle: 'Cobertura institucional, novedades de gestión y comunicados oficiales.',
  heroSearchPlaceholder: 'Buscar por título o contenido…',
  showHeroBadge: true,
  showHeroTitle: true,
  showHeroSubtitle: true,
  showSearch: true,
  showPrimaryButton: false,
  primaryLabel: '',
  primaryHref: '',
  showSecondaryButton: false,
  secondaryLabel: '',
  secondaryHref: '',
}

function cleanBool(value, fallback) {
  if (typeof value === 'boolean') return value
  if (value === 0 || value === '0' || value === 'false') return false
  if (value === 1 || value === '1' || value === 'true') return true
  return fallback
}

function cleanNumber(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function cleanText(raw, base) {
  const value = String(raw ?? '').trim()
  if (value) return value
  return String(base ?? '').trim()
}

export function mergePageHeroCover(defaults, remote) {
  const base = defaults || {}
  const raw = remote && typeof remote === 'object' ? remote : {}
  return {
    heroImageUrl: String(raw.heroImageUrl ?? base.heroImageUrl ?? '').trim(),
    overlayOpacity: Math.min(
      90,
      Math.max(0, Math.round(cleanNumber(raw.overlayOpacity, base.overlayOpacity ?? 65))),
    ),
    heroBadge: cleanText(raw.heroBadge, base.heroBadge),
    heroTitle: cleanText(raw.heroTitle, base.heroTitle),
    heroSubtitle: cleanText(raw.heroSubtitle, base.heroSubtitle),
    heroSearchPlaceholder: cleanText(raw.heroSearchPlaceholder, base.heroSearchPlaceholder),
    showHeroBadge: cleanBool(raw.showHeroBadge, base.showHeroBadge !== false),
    showHeroTitle: cleanBool(raw.showHeroTitle, base.showHeroTitle !== false),
    showHeroSubtitle: cleanBool(raw.showHeroSubtitle, base.showHeroSubtitle !== false),
    showSearch: cleanBool(raw.showSearch, base.showSearch !== false),
    showPrimaryButton: cleanBool(raw.showPrimaryButton, base.showPrimaryButton === true),
    primaryLabel: cleanText(raw.primaryLabel, base.primaryLabel),
    primaryHref: cleanText(raw.primaryHref, base.primaryHref),
    showSecondaryButton: cleanBool(raw.showSecondaryButton, base.showSecondaryButton === true),
    secondaryLabel: cleanText(raw.secondaryLabel, base.secondaryLabel),
    secondaryHref: cleanText(raw.secondaryHref, base.secondaryHref),
    updatedAt: raw.updatedAt ?? null,
  }
}

/** Props para AreasHeroHeader / NewsHeroHeader desde contenido guardado. */
export function pageHeroToHeaderProps(content, defaults, { primaryHrefOverride } = {}) {
  const merged = mergePageHeroCover(defaults, content)
  const primaryHref = primaryHrefOverride || merged.primaryHref || '#'
  return {
    badge: merged.showHeroBadge ? merged.heroBadge : '',
    title: merged.showHeroTitle ? merged.heroTitle : '',
    subtitle: merged.showHeroSubtitle ? merged.heroSubtitle : '',
    imageUrl: merged.heroImageUrl,
    overlayOpacity: merged.overlayOpacity,
    searchPlaceholder: merged.heroSearchPlaceholder,
    showSearch: merged.showSearch,
    primaryCta:
      merged.showPrimaryButton && merged.primaryLabel
        ? { label: merged.primaryLabel, href: primaryHref }
        : null,
    secondaryCta:
      merged.showSecondaryButton && merged.secondaryLabel
        ? { label: merged.secondaryLabel, href: merged.secondaryHref || '#' }
        : null,
  }
}
