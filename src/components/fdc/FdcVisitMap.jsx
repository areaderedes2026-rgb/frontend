import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { getFdcMapLocationEmoji, FdcMapLocationIcon } from './FdcMapLocationIcon.jsx'

function buildMarkerIcon(active = false, dark = false, iconName = 'pin') {
  const color = active ? '#c4a574' : dark ? '#0c1017' : '#171b22'
  const border = active ? '#ffffff' : '#d4b483'
  const size = active ? 40 : 34
  const emoji = getFdcMapLocationEmoji(iconName)
  return L.divIcon({
    className: 'fdc-visit-map-marker',
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};color:#ffffff;border:2px solid ${border};display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px -10px rgba(0,0,0,0.65);font-size:${active ? 16 : 14}px;line-height:1;">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -16],
  })
}

function buildUserIcon() {
  return L.divIcon({
    className: 'fdc-user-map-marker',
    html: `<div style="width:18px;height:18px;border-radius:9999px;background:#2563eb;border:3px solid #ffffff;box-shadow:0 0 0 6px rgba(37,99,235,0.28),0 8px 18px -8px rgba(0,0,0,0.55);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  })
}

const ROUTE_ENDPOINTS = {
  driving: [
    'https://router.project-osrm.org/route/v1/driving',
    'https://routing.openstreetmap.de/routed-car/route/v1/driving',
  ],
  foot: ['https://routing.openstreetmap.de/routed-foot/route/v1/driving'],
}

function formatRouteDistance(meters) {
  const m = Number(meters) || 0
  if (m < 1000) return `${Math.round(m)} m`
  return `${(m / 1000).toFixed(m >= 10000 ? 0 : 1).replace('.', ',')} km`
}

function formatRouteDuration(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0))
  if (s < 60) return `${s} seg`
  const mins = Math.round(s / 60)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const rem = mins % 60
  return rem ? `${h} h ${rem} min` : `${h} h`
}

async function fetchOsrmRoute(from, to, profile = 'driving') {
  const fromLng = Number(from.lng)
  const fromLat = Number(from.lat)
  const toLng = Number(to.lng)
  const toLat = Number(to.lat)
  if (
    !Number.isFinite(fromLng) ||
    !Number.isFinite(fromLat) ||
    !Number.isFinite(toLng) ||
    !Number.isFinite(toLat)
  ) {
    throw new Error('Coordenadas inválidas para calcular la ruta.')
  }

  const endpoints = ROUTE_ENDPOINTS[profile] || ROUTE_ENDPOINTS.driving
  const coords = `${fromLng},${fromLat};${toLng},${toLat}`
  const query = 'overview=full&geometries=geojson&steps=false'

  let lastError = null
  for (const base of endpoints) {
    try {
      const res = await fetch(`${base}/${coords}?${query}`)
      if (!res.ok) {
        lastError = new Error(`No se pudo calcular la ruta (${res.status}).`)
        continue
      }
      const data = await res.json()
      if (data?.code && data.code !== 'Ok') {
        lastError = new Error('No hay una ruta disponible entre esos puntos.')
        continue
      }
      const route = data?.routes?.[0]
      const geometry = route?.geometry?.coordinates
      if (!Array.isArray(geometry) || geometry.length < 2) {
        lastError = new Error('La ruta recibida no es válida.')
        continue
      }
      return {
        coordinates: geometry.map(([lng, lat]) => [lat, lng]),
        distance: Number(route.distance) || 0,
        duration: Number(route.duration) || 0,
        profile,
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Error de red al calcular la ruta.')
    }
  }
  throw lastError || new Error('No se pudo calcular la ruta.')
}

function geolocationErrorMessage(error) {
  if (!error) return 'No se pudo obtener tu ubicación.'
  if (error.code === 1) {
    return 'Permiso denegado. Activá la ubicación en el navegador para ver la ruta.'
  }
  if (error.code === 2) return 'No se pudo determinar tu ubicación. Probá de nuevo al aire libre.'
  if (error.code === 3) return 'Se agotó el tiempo al buscar tu ubicación. Probá de nuevo.'
  return error.message || 'No se pudo obtener tu ubicación.'
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
        padding: [56, 72],
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
  userLocation = null,
  routeCoordinates = null,
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

  const markerIcons = useMemo(() => {
    const cache = new Map()
    function iconFor(point, active) {
      const iconName = point?.icon || 'pin'
      const key = `${iconName}:${active ? '1' : '0'}`
      if (!cache.has(key)) {
        cache.set(key, buildMarkerIcon(Boolean(active), dark, iconName))
      }
      return cache.get(key)
    }
    return {
      iconFor,
      user: buildUserIcon(),
    }
  }, [dark])

  const focusKey =
    fitBounds?.length >= 2
      ? `bounds:${fitBounds.length}:${fitBounds[0]?.join(',')}:${fitBounds[fitBounds.length - 1]?.join(',')}:${focusToken}`
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
      {Array.isArray(routeCoordinates) && routeCoordinates.length >= 2 ? (
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: '#2563eb',
            weight: 5,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      ) : null}
      {userLocation &&
      Number.isFinite(Number(userLocation.lat)) &&
      Number.isFinite(Number(userLocation.lng)) ? (
        <>
          <CircleMarker
            center={[Number(userLocation.lat), Number(userLocation.lng)]}
            radius={18}
            pathOptions={{
              color: '#2563eb',
              fillColor: '#2563eb',
              fillOpacity: 0.12,
              weight: 0,
            }}
          />
          <Marker
            position={[Number(userLocation.lat), Number(userLocation.lng)]}
            icon={markerIcons.user}
            zIndexOffset={1000}
          >
            <Popup>
              <p className="text-sm font-bold text-[#171b22]">Tu ubicación</p>
            </Popup>
          </Marker>
        </>
      ) : null}
      {activePoints.map((point) => {
        const active = point.id === (selectedPoint?.id || '')
        return (
          <Marker
            key={point.id}
            position={[Number(point.lat), Number(point.lng)]}
            icon={markerIcons.iconFor(point, active)}
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
  const routeRequestId = useRef(0)
  const [mounted, setMounted] = useState(false)
  const [modalActiveId, setModalActiveId] = useState(activePointId || '')
  const [focusMode, setFocusMode] = useState('all') // 'all' | 'point' | 'route'
  const [focusToken, setFocusToken] = useState(0)

  const [userLocation, setUserLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [routeProfile, setRouteProfile] = useState('driving')
  const [routeEnabled, setRouteEnabled] = useState(true)
  const [route, setRoute] = useState(null)
  const [routing, setRouting] = useState(false)
  const [routeError, setRouteError] = useState('')

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) {
      setMounted(false)
      setUserLocation(null)
      setLocating(false)
      setLocationError('')
      setRoute(null)
      setRouting(false)
      setRouteError('')
      setRouteProfile('driving')
      setRouteEnabled(true)
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

  const selectedDestination = useMemo(
    () => allPoints.find((p) => p.id === modalActiveId) || null,
    [allPoints, modalActiveId],
  )

  const initialFitBounds = useMemo(() => {
    if (allPoints.length < 2) return null
    return allPoints.map((p) => [Number(p.lat), Number(p.lng)])
  }, [allPoints])

  const clearRoute = useCallback(() => {
    routeRequestId.current += 1
    setRoute(null)
    setRouteError('')
    setRouting(false)
  }, [])

  const requestUserLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Tu navegador no admite geolocalización.')
      return
    }
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setLocationError('La ubicación solo funciona en HTTPS o en localhost.')
      return
    }

    setLocating(true)
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
        setUserLocation(next)
        setLocating(false)
        setLocationError('')
        setRouteEnabled(true)
        setFocusMode('route')
        setFocusToken((n) => n + 1)
      },
      (err) => {
        setLocating(false)
        setLocationError(geolocationErrorMessage(err))
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      },
    )
  }, [])

  const computeRoute = useCallback(async (destination, fromLocation, profile) => {
    if (!fromLocation || !destination) return
    const reqId = ++routeRequestId.current
    setRouting(true)
    setRouteError('')
    try {
      const nextRoute = await fetchOsrmRoute(fromLocation, destination, profile)
      if (reqId !== routeRequestId.current) return
      setRoute(nextRoute)
      setFocusMode('route')
      setFocusToken((n) => n + 1)
    } catch (err) {
      if (reqId !== routeRequestId.current) return
      setRoute(null)
      setRouteError(err?.message || 'No se pudo calcular la ruta.')
    } finally {
      if (reqId === routeRequestId.current) setRouting(false)
    }
  }, [])

  useEffect(() => {
    if (!open || !routeEnabled || !userLocation || !selectedDestination) {
      if (!routeEnabled) return
      if (!userLocation || !selectedDestination) clearRoute()
      return
    }
    void computeRoute(selectedDestination, userLocation, routeProfile)
  }, [
    clearRoute,
    computeRoute,
    open,
    routeEnabled,
    routeProfile,
    selectedDestination,
    userLocation,
  ])

  function handleSelect(pointId) {
    setModalActiveId(pointId)
    setRouteEnabled(true)
    setFocusMode(userLocation ? 'route' : 'point')
    setFocusToken((n) => n + 1)
    onSelectPoint?.(pointId)
  }

  if (!open || typeof document === 'undefined') return null

  const routeFitBounds =
    focusMode === 'route' && Array.isArray(route?.coordinates) && route.coordinates.length >= 2
      ? route.coordinates
      : focusMode === 'route' && userLocation && selectedDestination
        ? [
            [Number(userLocation.lat), Number(userLocation.lng)],
            [Number(selectedDestination.lat), Number(selectedDestination.lng)],
          ]
        : null

  const effectiveFitBounds =
    routeFitBounds || (focusMode === 'all' ? initialFitBounds : null)

  const mapActiveId =
    focusMode === 'point' || focusMode === 'route'
      ? modalActiveId
      : allPoints.length < 2
        ? modalActiveId || allPoints[0]?.id || ''
        : modalActiveId

  const geoSupported =
    typeof navigator !== 'undefined' && Boolean(navigator.geolocation)

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex flex-col bg-[#0c1017]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="relative z-20 flex shrink-0 flex-col gap-3 border-b border-white/10 bg-[#0c1017]/95 px-3 py-3 backdrop-blur sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate font-serif text-base font-bold text-white sm:text-lg">
              Mapa interactivo
            </h2>
            <p className="mt-0.5 text-xs text-white/55 sm:text-sm">
              {userLocation
                ? 'Elegí un destino para ver la ruta desde tu ubicación'
                : `${allPoints.length} ubicación${allPoints.length === 1 ? '' : 'es'} · Activá tu ubicación para ver cómo llegar`}
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={requestUserLocation}
            disabled={!geoSupported || locating}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#2563eb] px-3.5 text-xs font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
          >
            <span aria-hidden>📍</span>
            {locating ? 'Obteniendo ubicación…' : userLocation ? 'Actualizar mi ubicación' : 'Usar mi ubicación'}
          </button>

          <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-0.5">
            <button
              type="button"
              onClick={() => {
                setRouteProfile('driving')
                setRouteEnabled(true)
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                routeProfile === 'driving'
                  ? 'bg-white text-[#171b22]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              En auto
            </button>
            <button
              type="button"
              onClick={() => {
                setRouteProfile('foot')
                setRouteEnabled(true)
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                routeProfile === 'foot'
                  ? 'bg-white text-[#171b22]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              A pie
            </button>
          </div>

          {route || routeEnabled === false ? (
            <button
              type="button"
              onClick={() => {
                setRouteEnabled(false)
                clearRoute()
                setFocusMode(selectedDestination ? 'point' : 'all')
                setFocusToken((n) => n + 1)
              }}
              className="inline-flex min-h-10 items-center rounded-full border border-white/20 px-3 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white sm:text-sm"
            >
              Quitar ruta
            </button>
          ) : null}
        </div>

        {locationError ? (
          <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100 sm:text-sm">
            {locationError}
          </p>
        ) : null}
        {routeError ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-100 sm:text-sm">
            {routeError}
          </p>
        ) : null}
        {routing ? (
          <p className="text-xs text-sky-200/90 sm:text-sm">Calculando la mejor ruta…</p>
        ) : null}
        {route && selectedDestination ? (
          <p className="text-xs text-white/80 sm:text-sm">
            Hasta <span className="font-semibold text-[#d4b483]">{selectedDestination.title}</span>
            {' · '}
            {formatRouteDistance(route.distance)}
            {' · '}
            aprox. {formatRouteDuration(route.duration)}
            {routeProfile === 'foot' ? ' caminando' : ' en auto'}
          </p>
        ) : userLocation && !selectedDestination ? (
          <p className="text-xs text-white/60 sm:text-sm">
            Tocá una ubicación abajo o un marcador para trazar la ruta.
          </p>
        ) : null}
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
            animateFocus={focusMode !== 'all'}
            focusToken={String(focusToken)}
            userLocation={userLocation}
            routeCoordinates={route?.coordinates || null}
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
                    className={`inline-flex max-w-[16rem] shrink-0 items-start gap-2 rounded-2xl border px-3 py-2 text-left transition ${
                      active
                        ? 'border-[#d4b483] bg-[#d4b483] text-[#171b22] shadow-lg'
                        : 'border-white/20 bg-[#171b22]/85 text-white backdrop-blur hover:border-white/40'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        active ? 'bg-[#171b22]/10' : 'bg-white/10'
                      }`}
                      aria-hidden
                    >
                      <FdcMapLocationIcon
                        name={point.icon}
                        className="h-3.5 w-3.5"
                        tone={active ? 'dark' : 'light'}
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-bold sm:text-sm">{point.title}</span>
                      {point.address ? (
                        <span
                          className={`mt-0.5 block truncate text-[10px] sm:text-[11px] ${
                            active ? 'text-[#171b22]/75' : 'text-white/55'
                          }`}
                        >
                          {point.address}
                        </span>
                      ) : null}
                    </span>
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
 * Geolocalización y rutas solo en el mapa en grande (no altera la vista embebida).
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
