import { resolveMediaUrl } from '../../utils/imageUrl.js'

/**
 * Capas visuales de fondo imagen + overlay (solo cuando style === image).
 */
export function FdcSectionBackgroundLayers({ style, imageUrl, overlayOpacity = 55 }) {
  if (style !== 'image') return null
  const src = resolveMediaUrl(imageUrl) || String(imageUrl || '').trim()
  if (!src) return null

  const overlay = Math.min(90, Math.max(0, Math.round(Number(overlayOpacity) || 0)))

  return (
    <>
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <div
        className="absolute inset-0 bg-[#171b22]"
        style={{ opacity: overlay / 100 }}
        aria-hidden
      />
    </>
  )
}
