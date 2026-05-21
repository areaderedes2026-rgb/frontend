import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function pointSearchText(point) {
  return normalizeSearchText(
    [point?.title, point?.subtitle, point?.address, point?.id].filter(Boolean).join(' '),
  )
}

function buildMarkerIcon(active = false) {
  const color = active ? '#0369a1' : '#1f2937'
  return L.divIcon({
    className: 'home-map-marker',
    html: `<div style="width:${active ? 38 : 34}px;height:${active ? 38 : 34}px;border-radius:9999px;background:${color};color:#ffffff;border:2px solid #ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px -8px rgba(0,0,0,0.55);font-size:16px;line-height:1;">📍</div>`,
    iconSize: [active ? 38 : 34, active ? 38 : 34],
    iconAnchor: [active ? 19 : 17, active ? 19 : 17],
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
      map.flyTo(defaultCenter, defaultZoom, {
        animate: true,
        duration: 0.75,
      })
      return
    }
    const lat = Number(point.lat)
    const lng = Number(point.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    const focusZoom = Math.min(18, Math.max(defaultZoom + 2, 16))
    map.flyTo([lat, lng], focusZoom, {
      animate: true,
      duration: 0.85,
    })
  }, [defaultCenter, defaultZoom, fitBounds, map, point])
  return null
}

function SearchIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3-3" />
    </svg>
  )
}

export function HomeInteractiveMap({ content }) {
  const [activePointId, setActivePointId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [interactive, setInteractive] = useState(false)
  const tabsRef = useRef(null)
  const searchRef = useRef(null)

  const center = useMemo(
    () => [Number(content?.center?.lat) || -26.2312, Number(content?.center?.lng) || -65.2818],
    [content],
  )
  const zoom = Math.min(18, Math.max(10, Number(content?.zoom) || 14))
  const allPoints = useMemo(
    () =>
      (Array.isArray(content?.points) ? content.points : [])
        .filter(
          (point) =>
            point?.isActive !== false &&
            Number.isFinite(Number(point?.lat)) &&
            Number.isFinite(Number(point?.lng)),
        )
        .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)),
    [content],
  )

  const normalizedQuery = useMemo(() => normalizeSearchText(searchQuery.trim()), [searchQuery])

  const filteredPoints = useMemo(() => {
    if (!normalizedQuery) return allPoints
    return allPoints.filter((point) => pointSearchText(point).includes(normalizedQuery))
  }, [allPoints, normalizedQuery])

  const isSearching = normalizedQuery.length > 0

  const effectiveActivePointId = useMemo(() => {
    if (!filteredPoints.length) return ''
    if (filteredPoints.some((p) => p.id === activePointId)) return activePointId
    return filteredPoints[0].id
  }, [activePointId, filteredPoints])

  const selectedPoint = useMemo(
    () => filteredPoints.find((point) => point.id === effectiveActivePointId) || null,
    [effectiveActivePointId, filteredPoints],
  )

  const visiblePoints = useMemo(() => {
    if (isSearching) return filteredPoints
    return selectedPoint ? [selectedPoint] : filteredPoints
  }, [filteredPoints, isSearching, selectedPoint])

  const mapFitBounds = useMemo(() => {
    if (!isSearching || visiblePoints.length < 2) return null
    return visiblePoints.map((point) => [Number(point.lat), Number(point.lng)])
  }, [isSearching, visiblePoints])

  const markerIcons = useMemo(
    () => ({
      base: buildMarkerIcon(false),
      active: buildMarkerIcon(true),
    }),
    [],
  )

  useEffect(() => {
    if (!filteredPoints.length) {
      if (activePointId) setActivePointId('')
      return
    }
    if (!filteredPoints.some((p) => p.id === activePointId)) {
      setActivePointId(filteredPoints[0].id)
    }
  }, [activePointId, filteredPoints])

  function scrollTabs(direction = 1) {
    if (!tabsRef.current) return
    tabsRef.current.scrollBy({
      left: direction * 220,
      behavior: 'smooth',
    })
  }

  function selectPoint(pointId) {
    setActivePointId(pointId)
    setInteractive(true)
  }

  function clearSearch() {
    setSearchQuery('')
    searchRef.current?.focus()
  }

  return (
    <article className="overflow-hidden rounded-4xl border border-white/70 bg-white/72 shadow-[0_24px_80px_-46px_rgba(23,27,34,0.55)] ring-1 ring-[#171b22]/5 backdrop-blur">
      <div className="border-b border-[#ddd7ca]/80 bg-white/58 px-3 py-3 backdrop-blur sm:px-5">
        <div className="relative">
          <label htmlFor="home-map-search" className="sr-only">
            Buscar ubicación en el mapa
          </label>
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </span>
          <input
            ref={searchRef}
            id="home-map-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ubicación..."
            autoComplete="off"
            className="w-full rounded-full border border-[#d6d0c3] bg-white/95 py-2.5 pr-10 pl-10 text-sm text-[#171b22] shadow-sm transition placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200/80"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Limpiar búsqueda"
            >
              <span className="text-lg leading-none" aria-hidden>
                ×
              </span>
            </button>
          ) : null}
        </div>

        {isSearching ? (
          <p className="mt-2 text-xs font-medium text-slate-500">
            {filteredPoints.length === 0 ? (
              'No hay ubicaciones que coincidan con tu búsqueda.'
            ) : (
              <>
                <span className="font-semibold text-sky-800">{filteredPoints.length}</span>
                {filteredPoints.length === 1 ? ' resultado' : ' resultados'}
              </>
            )}
          </p>
        ) : null}

        <div className={`flex items-center gap-2 ${isSearching ? 'mt-2' : 'mt-3'}`}>
          <button
            type="button"
            onClick={() => scrollTabs(-1)}
            disabled={filteredPoints.length === 0}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d6d0c3] bg-white/90 text-sm font-bold text-[#3e434d] shadow-sm transition hover:border-sky-200 hover:text-sky-800 disabled:pointer-events-none disabled:opacity-40"
            aria-label="Ver puntos anteriores"
          >
            ←
          </button>
          <div
            ref={tabsRef}
            className="flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Ubicaciones del mapa"
          >
            {filteredPoints.length === 0 ? (
              <span className="inline-flex shrink-0 items-center rounded-full border border-dashed border-[#d6d0c3] bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-500">
                Sin coincidencias
              </span>
            ) : (
              filteredPoints.map((point) => {
                const active = point.id === effectiveActivePointId
                return (
                  <button
                    key={point.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => selectPoint(point.id)}
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'border-[#2a313b] bg-[#171b22] text-white shadow-sm'
                        : 'border-[#d6d0c3] bg-white/90 text-[#3e434d] hover:border-sky-200 hover:bg-white'
                    }`}
                  >
                    {point.title || point.id}
                  </button>
                )
              })
            )}
          </div>
          <button
            type="button"
            onClick={() => scrollTabs(1)}
            disabled={filteredPoints.length === 0}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d6d0c3] bg-white/90 text-sm font-bold text-[#3e434d] shadow-sm transition hover:border-sky-200 hover:text-sky-800 disabled:pointer-events-none disabled:opacity-40"
            aria-label="Ver siguientes puntos"
          >
            →
          </button>
        </div>
      </div>

      <div className="relative h-88 w-full bg-[#171b22] sm:h-104 lg:h-120">
        <MapContainer
          center={center}
          zoom={zoom}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          tap={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}/tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {visiblePoints.map((point) => (
            <Marker
              key={point.id}
              position={[Number(point.lat), Number(point.lng)]}
              icon={point.id === effectiveActivePointId ? markerIcons.active : markerIcons.base}
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
          ))}
          <MapInteractivityController interactive={interactive} />
          <MapFocusController
            point={isSearching && visiblePoints.length > 1 ? null : selectedPoint}
            defaultCenter={center}
            defaultZoom={zoom}
            fitBounds={mapFitBounds}
          />
        </MapContainer>

        {!interactive ? (
          <button
            type="button"
            onClick={() => setInteractive(true)}
            className="absolute inset-0 z-1000 flex cursor-pointer items-center justify-center bg-[#171b22]/28 backdrop-blur-[1px] transition hover:bg-[#171b22]/38 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            aria-label="Activar mapa interactivo"
          >
            <span className="pointer-events-none inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-[#171b22] shadow-lg ring-1 ring-slate-900/10 sm:px-5 sm:text-base">
              <span aria-hidden>🗺️</span> Tocá para activar el mapa
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
    </article>
  )
}
