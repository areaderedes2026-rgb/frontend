/** Centro aproximado del predio / Trancas (fallback). */
export const FDC_DEFAULT_VISIT_MAP = {
  lat: -26.2312,
  lng: -65.2818,
  zoom: 14,
}

function coordsIfValid(latRaw, lngRaw) {
  const lat = Number(latRaw)
  const lng = Number(lngRaw)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 }
}

export function parseMapUrlCoordinates(url) {
  const raw = String(url || '').trim()
  if (!raw) return null

  const atMatch = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (atMatch) {
    const coords = coordsIfValid(atMatch[1], atMatch[2])
    if (coords) return coords
  }

  const bangMatch = raw.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
  if (bangMatch) {
    const coords = coordsIfValid(bangMatch[1], bangMatch[2])
    if (coords) return coords
  }

  const qMatch = raw.match(/[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i)
  if (qMatch) {
    const coords = coordsIfValid(qMatch[1], qMatch[2])
    if (coords) return coords
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
