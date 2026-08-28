/** Centro aproximado del predio / Trancas (fallback). */
export const FDC_DEFAULT_VISIT_MAP = {
  lat: -26.2312,
  lng: -65.2818,
  zoom: 14,
}

export function parseMapUrlCoordinates(url) {
  const raw = String(url || '').trim()
  if (!raw) return null

  const atMatch = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (atMatch) {
    const lat = Number(atMatch[1])
    const lng = Number(atMatch[2])
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
  }

  const qMatch = raw.match(/[?&]query=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (qMatch) {
    const lat = Number(qMatch[1])
    const lng = Number(qMatch[2])
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
  }

  return null
}

export function resolveFdcVisitMapCoords(directions) {
  const src = directions && typeof directions === 'object' ? directions : {}
  const lat = Number(src.mapLat)
  const lng = Number(src.mapLng)
  const zoomRaw = Number(src.mapZoom)

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return {
      lat,
      lng,
      zoom: Number.isFinite(zoomRaw)
        ? Math.min(18, Math.max(10, Math.round(zoomRaw)))
        : FDC_DEFAULT_VISIT_MAP.zoom,
    }
  }

  const fromUrl = parseMapUrlCoordinates(src.mapUrl)
  if (fromUrl) {
    return {
      ...fromUrl,
      zoom: Number.isFinite(zoomRaw)
        ? Math.min(18, Math.max(10, Math.round(zoomRaw)))
        : FDC_DEFAULT_VISIT_MAP.zoom,
    }
  }

  return { ...FDC_DEFAULT_VISIT_MAP }
}
