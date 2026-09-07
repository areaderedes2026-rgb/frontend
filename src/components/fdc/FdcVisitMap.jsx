import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

function buildMarkerIcon(active = false, dark = false) {
  const color = active ? '#c4a574' : dark ? '#0c1017' : '#171b22'
  const border = active ? '#ffffff' : '#d4b483'
  const size = active ? 40 : 34
  return L.divIcon({
    className: 'fdc-visit-map-marker',
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};color:#ffffff;border:2px solid ${border};display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px -10px rgba(0,0,0,0.65);font-size:15px;line-height:1;">📍</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -16],
  })
}

const TOGGLEABLE_HANDLERS = [
  'dragging',
  'scrollWheelZoom',
  'doubleClickZoom',
  'touchZoom',
  'boxZoom',
  'keyboard',
]

function MapResizeController({ revision = 0 }) {
  const map = useMap()
  useEffect(() => {
    if (!map) return
    const container = map.getContainer()
    const run = () => map.invalidateSize({ animate: false })
    run()
    const t1 = window.setTimeout(run, 120)
    const t2 = window.setTimeout(run, 480)
    const t3 = window.setTimeout(run, 700)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => run()) : null
    if (ro && container?.parentElement) ro.observe(container.parentElement)
    window.addEventListener('resize', run)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      ro?.disconnect()
      window.removeEventListener('resize', run)
    }
  }, [map, revision])
  return null
}

function MapInteractivityController({ interactive }) {
  const map = useMap()
  useEffect(() => {
    if (!map) return
    TOGGLEABLE_HANDLERS.forEach((name) => {
      const handler = map[name]
      if (!handler) return
      if (interactive) handler.enable?.()
      else handler.disable?.()
    })
    if (map.tap) {
      if (interactive) map.tap.enable?.()
      else map.tap.disable?.()
    }
  }, [map, interactive])
  return null
}

function MapFocusController({ point, defaultCenter, defaultZoom, fitBounds }) {
  const map = useMap()
  useEffect(() => {
    if (!map) return
    map.invalidateSize()

    if (fitBounds?.length >= 2) {
      const bounds = L.latLngBounds(fitBounds.map(([lat, lng]) => [lat, lng]))
      map.flyToBounds(bounds, {
        animate: true,
        duration: 0.75,
        padding: [48, 48],
        maxZoom: 16,
      })
      return
    }

    if (!point) {
      map.flyTo(defaultCenter, defaultZoom, { animate: true, duration: 0.75 })
      return
    }
    const lat = Number(point.lat)
    const lng = Number(point.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    const focusZoom = Math.min(18, Math.max(defaultZoom + 2, 16))
    map.flyTo([lat, lng], focusZoom, { animate: true, duration: 0.85 })
  }, [defaultCenter, defaultZoom, fitBounds, map, point])
  return null
}

/**
 * Mapa FDC multi-punto (Leaflet), mismo patrón que el mapa de Inicio.
 * Al activarlo se agranda y habilita interacción.
 */
export function FdcVisitMap({
  center,
  zoom = 14,
  points = [],
  activePointId = '',
  onSelectPoint,
  dark = false,
  className = '',
  fitBounds = null,
}) {
  const [interactive, setInteractive] = useState(false)
  const safeZoom = Math.min(18, Math.max(10, Number(zoom) || 14))
  const mapCenter = useMemo(
    () => [Number(center?.lat) || -26.2312, Number(center?.lng) || -65.2818],
    [center?.lat, center?.lng],
  )

  const activePoints = useMemo(
    () =>
      (Array.isArray(points) ? points : []).filter(
        (p) =>
          p?.isActive !== false &&
          Number.isFinite(Number(p?.lat)) &&
          Number.isFinite(Number(p?.lng)),
      ),
    [points],
  )

  const selectedPoint = useMemo(
    () => activePoints.find((p) => p.id === activePointId) || activePoints[0] || null,
    [activePointId, activePoints],
  )

  const markerIcons = useMemo(
    () => ({
      base: buildMarkerIcon(false, dark),
      active: buildMarkerIcon(true, dark),
    }),
    [dark],
  )

  const frameClass = dark
    ? 'border-white/15 bg-[#0c1017]/40 ring-white/10'
    : 'border-[#e8e4dc] bg-slate-100 ring-[#171b22]/5'

  function selectPoint(pointId) {
    onSelectPoint?.(pointId)
    setInteractive(true)
  }

  const sizeClass = interactive
    ? 'h-[28rem] sm:h-[34rem] lg:h-[36rem] lg:min-h-[36rem]'
    : 'h-64 sm:h-80 lg:h-full lg:min-h-[22rem]'

  return (
    <div
      className={`fdc-visit-map relative overflow-hidden rounded-2xl border shadow-[0_16px_40px_-24px_rgba(23,27,34,0.35)] ring-1 transition-[height,min-height] duration-500 ease-out ${sizeClass} ${frameClass} ${className}`.trim()}
    >
      <MapContainer
        center={mapCenter}
        zoom={safeZoom}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        tap={false}
        className="z-0 h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {activePoints.map((point) => {
          const active = point.id === (selectedPoint?.id || '')
          return (
            <Marker
              key={point.id}
              position={[Number(point.lat), Number(point.lng)]}
              icon={active ? markerIcons.active : markerIcons.base}
              eventHandlers={{
                click: () => selectPoint(point.id),
              }}
            >
              <Popup>
                <div className="space-y-1 pr-1">
                  <h3 className="text-sm font-bold text-[#171b22]">{point.title}</h3>
                  {point.subtitle ? (
                    <p className="text-xs font-medium text-[#3e434d]">{point.subtitle}</p>
                  ) : null}
                  {point.address ? (
                    <p className="text-xs text-[#4b505a]">{point.address}</p>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          )
        })}
        <MapResizeController revision={interactive ? 1 : 0} />
        <MapInteractivityController interactive={interactive} />
        <MapFocusController
          point={fitBounds?.length >= 2 ? null : selectedPoint}
          defaultCenter={mapCenter}
          defaultZoom={safeZoom}
          fitBounds={fitBounds}
        />
      </MapContainer>

      {!interactive ? (
        <button
          type="button"
          onClick={() => setInteractive(true)}
          className={`absolute inset-0 z-1000 flex cursor-pointer items-end justify-center p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483] ${
            dark
              ? 'bg-linear-to-t from-[#171b22]/70 via-[#171b22]/15 to-transparent hover:from-[#171b22]/8'
              : 'bg-linear-to-t from-[#171b22]/50 via-[#171b22]/10 to-transparent hover:from-[#171b22]/6'
          }`}
          aria-label="Activar mapa interactivo"
        >
          <span className="pointer-events-none inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#171b22] shadow-lg ring-1 ring-slate-900/10 sm:text-[13px]">
            <span aria-hidden>🗺️</span>
            Tocá para activar el mapa
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setInteractive(false)}
          className="absolute right-3 top-3 z-1000 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#171b22] shadow ring-1 ring-slate-900/10 transition hover:text-sky-800"
          aria-label="Bloquear mapa"
        >
          <span aria-hidden>🔒</span> Bloquear mapa
        </button>
      )}
    </div>
  )
}
