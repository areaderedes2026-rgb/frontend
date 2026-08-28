/** Estilos de fondo para secciones FDC (mutuamente excluyentes). */
export const FDC_SECTION_BG_STYLES = ['light', 'dark', 'image']

const STYLE_ALIASES = {
  light: 'light',
  white: 'light',
  blanco: 'light',
  dark: 'dark',
  blue: 'dark',
  azul: 'dark',
  image: 'image',
  imagen: 'image',
  photo: 'image',
}

/**
 * Normaliza el estilo de fondo. Si hay imagen legacy sin estilo explícito → image.
 */
export function normalizeFdcSectionBackgroundStyle(rawStyle, imageUrl = '') {
  const img = String(imageUrl || '').trim()
  const key = String(rawStyle || '').trim().toLowerCase()
  if (STYLE_ALIASES[key]) {
    const resolved = STYLE_ALIASES[key]
    if (resolved === 'image' && !img) return 'light'
    return resolved
  }
  if (img) return 'image'
  return 'light'
}

export function normalizeFdcSectionOverlay(raw, fallback = 55) {
  const n = Number(raw)
  return Number.isFinite(n) ? Math.min(90, Math.max(0, Math.round(n))) : fallback
}

/**
 * Resuelve clases y tono según estilo + imagen opcional.
 * Acepta backgroundImageUrl (cartelera) o imageUrl (entradas).
 */
export function resolveFdcSectionBackground(config, { defaultOverlay = 55 } = {}) {
  const imageUrl = String(config?.backgroundImageUrl || config?.imageUrl || '').trim()
  const style = normalizeFdcSectionBackgroundStyle(config?.backgroundStyle, imageUrl)
  const overlayOpacity = normalizeFdcSectionOverlay(config?.overlayOpacity, defaultOverlay)
  const usesDarkTone = style === 'dark' || style === 'image'

  const sectionClassByStyle = {
    light: 'border-[#e8e5dd] bg-[#f7f7f5]',
    dark: 'border-white/10 bg-[#171b22] text-white',
    image: 'border-white/10 text-white',
  }

  return {
    style,
    imageUrl: style === 'image' ? imageUrl : '',
    overlayOpacity,
    titleTone: usesDarkTone ? 'dark' : 'light',
    sectionClassName: sectionClassByStyle[style] || sectionClassByStyle.light,
    usesDarkTone,
  }
}

export const FDC_SECTION_CTA_OUTLINE_LIGHT =
  'inline-flex min-h-11 items-center justify-center rounded-md border border-[#171b22]/80 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#171b22] transition hover:bg-[#171b22] hover:text-white sm:text-xs'

export const FDC_SECTION_CTA_OUTLINE_DARK =
  'inline-flex min-h-11 items-center justify-center rounded-md border border-white/75 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-[#171b22] sm:text-xs'

export function getFdcSectionOutlineCtaClass(usesDarkTone) {
  return usesDarkTone ? FDC_SECTION_CTA_OUTLINE_DARK : FDC_SECTION_CTA_OUTLINE_LIGHT
}

/** Normaliza campos de fondo al mergear contenido FDC. */
export function withFdcSectionBackground(merged, defaults = {}) {
  const bgImage = String(merged?.backgroundImageUrl || merged?.imageUrl || '').trim()
  const styleSource = merged?.backgroundStyle ?? defaults?.backgroundStyle
  return {
    ...merged,
    backgroundStyle: normalizeFdcSectionBackgroundStyle(styleSource, bgImage),
    backgroundImageUrl: String(merged?.backgroundImageUrl || '').trim(),
    overlayOpacity: normalizeFdcSectionOverlay(merged?.overlayOpacity, defaults?.overlayOpacity ?? 55),
  }
}
