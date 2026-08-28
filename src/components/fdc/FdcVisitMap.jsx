import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Modal } from '../ui/Modal.jsx'

function buildFdcMarkerIcon() {
  return L.divIcon({
    className: 'fdc-visit-map-marker',
    html: `<div style="width:36px;height:36px;border-radius:9999px;background:#171b22;color:#ffffff;border:2px solid #d4b483;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px -10px rgba(0,0,0,0.65);font-size:15px;line-height:1;">📍</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -16],
  })
}

function MapResizeController({ active }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !active) return
    const run = () => map.invalidateSize({ animate: false })
    run()
    const t1 = window.setTimeout(run, 80)
    const t2 = window.setTimeout(run, 320)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [map, active])
  return null
}

function MapInteractivityController({ enabled }) {
  const map = useMap()
  useEffect(() => {
    if (!map) return
    ;['dragging', 'scrollWheelZoom', 'doubleClickZoom', 'touchZoom', 'boxZoom', 'keyboard'].forEach(
      (name) => {
        const handler = map[name]
        if (!handler) return
        if (enabled) handler.enable?.()
        else handler.disable?.()
      },
    )
    if (map.tap) {
      if (enabled) map.tap.enable?.()
      else map.tap.disable?.()
    }
  }, [map, enabled])
  return null
}

function VisitMapCanvas({ center, zoom, label, address, interactive, active }) {
  const markerIcon = useMemo(() => buildFdcMarkerIcon(), [])
  const position = useMemo(() => [center.lat, center.lng], [center.lat, center.lng])

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      dragging={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      boxZoom={interactive}
      keyboard={interactive}
      tap={interactive}
      className="z-0 h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <Marker position={position} icon={markerIcon}>
        {label || address ? (
          <Popup>
            <div className="space-y-1 pr-1">
              {label ? <p className="text-sm font-bold text-[#171b22]">{label}</p> : null}
              {address ? <p className="text-xs text-[#4b505a]">{address}</p> : null}
            </div>
          </Popup>
        ) : null}
      </Marker>
      <MapResizeController active={active} />
      <MapInteractivityController enabled={interactive} />
    </MapContainer>
  )
}

/**
 * Mapa compacto con marcador; al tocar se abre en modal para navegar.
 */
export function FdcVisitMap({ center, zoom = 14, label = '', address = '', dark = false }) {
  const [expanded, setExpanded] = useState(false)
  const safeZoom = Math.min(18, Math.max(10, Number(zoom) || 14))

  if (!Number.isFinite(center?.lat) || !Number.isFinite(center?.lng)) return null

  const frameClass = dark
    ? 'border-white/15 bg-[#0c1017]/40 ring-white/10'
    : 'border-[#e8e4dc] bg-slate-100 ring-[#171b22]/5'

  return (
    <>
      <div
        className={`fdc-visit-map relative h-52 overflow-hidden rounded-2xl border shadow-[0_16px_40px_-24px_rgba(23,27,34,0.35)] ring-1 sm:h-60 lg:h-full lg:min-h-[17.5rem] ${frameClass}`}
      >
        <VisitMapCanvas
          center={center}
          zoom={safeZoom}
          label={label}
          address={address}
          interactive={false}
          active
        />
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={`absolute inset-0 z-1000 flex cursor-pointer items-end justify-center p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483] ${
            dark
              ? 'bg-linear-to-t from-[#171b22]/75 via-[#171b22]/20 to-transparent hover:from-[#171b22]/85'
              : 'bg-linear-to-t from-[#171b22]/55 via-[#171b22]/10 to-transparent hover:from-[#171b22]/65'
          }`}
          aria-label="Ampliar mapa interactivo"
        >
          <span className="pointer-events-none inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#171b22] shadow-lg ring-1 ring-slate-900/10 sm:text-[13px]">
            <span aria-hidden>🗺️</span>
            Tocá para ampliar el mapa
          </span>
        </button>
      </div>

      <Modal
        open={expanded}
        onClose={() => setExpanded(false)}
        title={label || 'Ubicación'}
        description={address || undefined}
        size="xlarge"
        bodyClassName="overflow-hidden p-0!"
      >
        <div className="fdc-visit-map h-[min(72dvh,34rem)] w-full bg-slate-200">
          <VisitMapCanvas
            center={center}
            zoom={Math.min(18, safeZoom + 1)}
            label={label}
            address={address}
            interactive
            active={expanded}
          />
        </div>
      </Modal>
    </>
  )
}
