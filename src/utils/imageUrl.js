import { getApiBase } from './apiConfig.js'

/** Convierte URL absoluta o ruta relativa del backend en URL usable para `<img src>`. */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return ''
  const t = url.trim()
  if (!t) return ''
  if (t.startsWith('http://') || t.startsWith('https://')) return t
  const base = getApiBase()
  if (!base) return t
  const path = t.startsWith('/') ? t : `/${t}`
  return `${base}${path}`
}

const CLOUDINARY_UPLOAD_RE =
  /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/i

function looksLikeCloudinaryTransform(segment) {
  const s = String(segment || '')
  if (!s) return false
  if (/^v\d+$/.test(s)) return false
  return (
    s.includes(',') ||
    /^(f_|q_|w_|h_|c_|g_|dpr_|e_|ar_|fl_|so_|t_|b_|o_|r_|x_|y_)/.test(s)
  )
}

function cloudinaryPathAfterTransforms(rest) {
  let path = String(rest || '').replace(/^s--[\w-]+--\//, '')
  const versionAt = path.search(/(?:^|\/)v\d+\//)
  if (versionAt >= 0) {
    return path.slice(versionAt).replace(/^\//, '')
  }
  const parts = path.split('/')
  while (parts.length > 1 && looksLikeCloudinaryTransform(parts[0])) {
    parts.shift()
  }
  return parts.join('/')
}

/**
 * Inserta transformaciones de Cloudinary (WebP/AVIF, calidad y tamaño).
 * Si la URL no es de Cloudinary, devuelve el original.
 */
export function withCloudinaryTransform(url, transform) {
  const src = String(url || '').trim()
  const tx = String(transform || '').trim()
  if (!src || !tx) return src
  const match = src.match(CLOUDINARY_UPLOAD_RE)
  if (!match) return src
  const rest = cloudinaryPathAfterTransforms(match[2])
  if (!rest) return src
  return `${match[1]}${tx}/${rest}`
}

/**
 * Variantes listas para `<img>`: src, srcSet, placeholder minúsculo y sizes.
 * Pensado para fotos de tarjeta en pantallas retina (móvil y desktop).
 */
export function getResponsiveMediaImage(
  url,
  { widths = [360, 480, 640, 800, 960], fallbackWidth = 640, sizes = '50vw' } = {},
) {
  const resolved = resolveMediaUrl(url)
  if (!resolved) {
    return { src: '', srcSet: '', placeholder: '', sizes }
  }

  const match = resolved.match(CLOUDINARY_UPLOAD_RE)
  if (!match) {
    return { src: resolved, srcSet: '', placeholder: '', sizes }
  }

  const uniqueWidths = [...new Set((widths || []).map((w) => Math.round(Number(w))).filter((w) => w > 0))].sort(
    (a, b) => a - b,
  )
  const fallback = uniqueWidths.includes(fallbackWidth)
    ? fallbackWidth
    : uniqueWidths[Math.min(uniqueWidths.length - 1, 2)] || fallbackWidth

  const src = withCloudinaryTransform(
    resolved,
    `f_auto,q_auto:good,c_fill,g_auto,w_${fallback}`,
  )
  const srcSet = uniqueWidths
    .map(
      (w) =>
        `${withCloudinaryTransform(resolved, `f_auto,q_auto:good,c_fill,g_auto,w_${w}`)} ${w}w`,
    )
    .join(', ')
  const placeholder = withCloudinaryTransform(
    resolved,
    'f_auto,q_auto:low,e_blur:1200,c_fill,g_auto,w_24',
  )

  return { src, srcSet, placeholder, sizes }
}
