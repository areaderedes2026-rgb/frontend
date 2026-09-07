import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

function MapResizeController({ revision = 0 }) {
  const map = useMap()
  useEffect(() => {
    if (!map) return
    const container = map.getContainer()
    const run = () => map.invalidateSize({ animate: false })
    run()
    const timers = [60, 160, 360, 700].map((ms) => window.setTimeout(run, ms))
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => run()) : null
    if (ro && container?.parentElement) ro.observe(container.parentElement)
    window.addEventListener('resize', run)
    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      ro?.disconnect()
      window.removeEventListener('resize', run)
    }
  }, [map, revision])
  return null
}

function MapFocusController({
  focusKey,
  point,
  defaultCenter,
  defaultZoom,
  fitBounds,
  animate = true,
}) {
  const map = useMap()
  useEffect(() => {
    if (!map) return
    map.invalidateSize({ animate: false })

    const duration = animate ? 0.8 : 0

    if (fitBounds?.length >= 2) {
      const bounds = L.latLngBounds(fitBounds.map(([lat, lng]) => [lat, lng]))
      map.flyToBounds(bounds, {
        animate,
        duration,
        padding: [56, 56],
        maxZoom: 16,
      })
      return
    }

    if (!point) {
      map.setView(defaultCenter, defaultZoom, { animate, duration })
      return
    }
    const lat = Number(point.lat)
    const lng = Number(point.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    const focusZoom = Math.min(18, Math.max(defaultZoom + 2, 16))
    if (animate) {
      map.flyTo([lat, lng], focusZoom, { animate: true, duration: 0.85 })
    } else {
      map.setView([lat, lng], focusZoom, { animate: false })
    }
    // focusKey evita re-disparos por cambios de referencia del objeto point
  }, [animate, defaultCenter, defaultZoom, fitBounds, focusKey, map, point])
  return null
}

function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [locked])
}

function LeafletMapView({
  center,
  zoom,
  points,
  activePointId,
  onSelectPoint,
  dark = false,
  fitBounds = null,
  interactive = false,
  className = '',
  animateFocus = true,
  mapKey = 'map',
  focusToken = '',
}) {
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
    () => activePoints.find((p) => p.id === activePointId) || null,
    [activePointId, activePoints],
  )

  const markerIcons = useMemo(
    () => ({
      base: buildMarkerIcon(false, dark),
      active: buildMarkerIcon(true, dark),
    }),
    [dark],
  )

  const focusKey = fitBounds?.length >= 2
    ? `bounds:${fitBounds.map((c) => c.join(',')).join('|')}`
    : `point:${selectedPoint?.id || 'none'}:${focusToken}`

  return (
    <MapContainer
      key={mapKey}
      center={mapCenter}
      zoom={safeZoom}
      dragging={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      boxZoom={interactive}
      keyboard={interactive}
      tap={interactive}
      className={`z-0 h-full w-full ${className}`.trim()}
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
              click: () => onSelectPoint?.(point.id),
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
      <MapResizeController revision={interactive ? 2 : 1} />
      <MapFocusController
        focusKey={focusKey}
        point={fitBounds?.length >= 2 ? null : selectedPoint}
        defaultCenter={mapCenter}
        defaultZoom={safeZoom}
        fitBounds={fitBounds}
        animate={animateFocus}
      />
    </MapContainer>
  )
}

function ExpandIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
      />
    </svg>
  )
}

function CloseIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function FdcVisitMapFullscreen({
  open,
  onClose,
  center,
  zoom,
  points,
  activePointId,
  onSelectPoint,
}) {
  const titleId = useId()
  const closeRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [modalActiveId, setModalActiveId] = useState(activePointId || '')
  const [focusMode, setFocusMode] = useState('all') // 'all' | 'point'
  const [focusToken, setFocusToken] = useState(0)

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) {
      setMounted(false)
      return
    }
    setModalActiveId(activePointId || '')
    setFocusMode('all')
    setFocusToken(0)
    const id = requestAnimationFrame(() => {
      setMounted(true)
      closeRef.current?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [activePointId, open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const allPoints = useMemo(
    () =>
      (Array.isArray(points) ? points : []).filter(
        (p) =>
          p?.isActive !== false &&
          Number.isFinite(Number(p?.lat)) &&
          Number.isFinite(Number(p?.lng)),
      ),
    [points],
  )

  const initialFitBounds = useMemo(() => {
    if (allPoints.length < 2) return null
    return allPoints.map((p) => [Number(p.lat), Number(p.lng)])
  }, [allPoints])

  function handleSelect(pointId) {
    setModalActiveId(pointId)
    setFocusMode('point')
    setFocusToken((n) => n + 1)
    onSelectPoint?.(pointId)
  }

  if (!open || typeof document === 'undefined') return null

  const effectiveFitBounds = focusMode === 'all' ? initialFitBounds : null
  const mapActiveId =
    focusMode === 'point'
      ? modalActiveId
      : allPoints.length < 2
        ? modalActiveId || allPoints[0]?.id || ''
        : modalActiveId

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex flex-col bg-[#0c1017]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0c1017]/95 px-3 py-3 backdrop-blur sm:px-5">
        <div className="min-w-0">
          <h2 id={titleId} className="truncate font-serif text-base font-bold text-white sm:text-lg">
            Mapa interactivo
          </h2>
          <p className="mt-0.5 text-xs text-white/55 sm:text-sm">
            {allPoints.length} ubicación{allPoints.length === 1 ? '' : 'es'} · Arrastrá, acercá y tocá los
            marcadores
          </p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#171b22] shadow-lg transition hover:bg-[#f4f1ea] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483]"
          aria-label="Cerrar mapa a pantalla completa"
        >
          <CloseIcon />
          <span className="hidden sm:inline">Cerrar</span>
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        {mounted ? (
          <LeafletMapView
            mapKey="fdc-map-fullscreen"
            center={center}
            zoom={zoom}
            points={allPoints}
            activePointId={mapActiveId}
            onSelectPoint={handleSelect}
            dark
            interactive
            fitBounds={effectiveFitBounds}
            animateFocus={focusMode === 'point'}
            focusToken={String(focusToken)}
            className="[&_.leaflet-control-attribution]:text-[10px]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/50">
            Cargando mapa…
          </div>
        )}

        {allPoints.length > 0 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-[#0c1017]/90 via-[#0c1017]/35 to-transparent p-3 pt-16 sm:p-5 sm:pt-20">
            <div className="pointer-events-auto mx-auto flex max-w-5xl gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {allPoints.map((point) => {
                const active = point.id === modalActiveId
                return (
                  <button
                    key={point.id}
                    type="button"
                    onClick={() => handleSelect(point.id)}
                    className={`inline-flex max-w-[14rem] shrink-0 flex-col rounded-2xl border px-3 py-2 text-left transition ${
                      active
                        ? 'border-[#d4b483] bg-[#d4b483] text-[#171b22] shadow-lg'
                        : 'border-white/20 bg-[#171b22]/85 text-white backdrop-blur hover:border-white/40'
                    }`}
                  >
                    <span className="truncate text-xs font-bold sm:text-sm">{point.title}</span>
                    {point.address ? (
                      <span
                        className={`mt-0.5 truncate text-[10px] sm:text-[11px] ${
                          active ? 'text-[#171b22]/75' : 'text-white/55'
                        }`}
                      >
                        {point.address}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

/**
 * Vista previa bloqueada (solo foco desde la lista) + modal fullscreen navegable.
 */
export function FdcVisitMap({
  center,
  zoom = 14,
  points = [],
  allPoints,
  activePointId = '',
  onSelectPoint,
  dark = false,
  className = '',
  fitBounds = null,
}) {
  const [fullscreenOpen, setFullscreenOpen] = useState(false)

  const previewPoints = useMemo(
    () =>
      (Array.isArray(points) ? points : []).filter(
        (p) =>
          p?.isActive !== false &&
          Number.isFinite(Number(p?.lat)) &&
          Number.isFinite(Number(p?.lng)),
      ),
    [points],
  )

  const fullscreenPoints = useMemo(() => {
    const source = Array.isArray(allPoints) && allPoints.length > 0 ? allPoints : points
    return (source || []).filter(
      (p) =>
        p?.isActive !== false &&
        Number.isFinite(Number(p?.lat)) &&
        Number.isFinite(Number(p?.lng)),
    )
  }, [allPoints, points])

  const frameClass = dark
    ? 'border-white/15 bg-[#0c1017]/40 ring-white/10'
    : 'border-[#e8e4dc] bg-slate-100 ring-[#171b22]/5'

  return (
    <>
      <div
        className={`fdc-visit-map relative h-64 overflow-hidden rounded-2xl border shadow-[0_16px_40px_-24px_rgba(23,27,34,0.35)] ring-1 sm:h-80 lg:h-full lg:min-h-[22rem] ${frameClass} ${className}`.trim()}
      >
        <LeafletMapView
          mapKey="fdc-map-preview"
          center={center}
          zoom={zoom}
          points={previewPoints}
          activePointId={activePointId}
          onSelectPoint={onSelectPoint}
          dark={dark}
          interactive={false}
          fitBounds={fitBounds}
          animateFocus
        />

        <button
          type="button"
          onClick={() => setFullscreenOpen(true)}
          className={`absolute inset-0 z-[600] flex cursor-pointer touch-none items-end justify-center p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483] ${
            dark
              ? 'bg-linear-to-t from-[#171b22]/70 via-[#171b22]/15 to-transparent hover:from-[#171b22]/80'
              : 'bg-linear-to-t from-[#171b22]/50 via-[#171b22]/10 to-transparent hover:from-[#171b22]/60'
          }`}
          aria-label="Abrir mapa a pantalla completa"
        >
          <span className="pointer-events-none inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#171b22] shadow-lg ring-1 ring-slate-900/10 sm:text-[13px]">
            <ExpandIcon className="h-4 w-4" />
            Ver mapa en grande
          </span>
        </button>
      </div>

      <FdcVisitMapFullscreen
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        center={center}
        zoom={zoom}
        points={fullscreenPoints}
        activePointId={activePointId}
        onSelectPoint={onSelectPoint}
      />
    </>
  )
}
