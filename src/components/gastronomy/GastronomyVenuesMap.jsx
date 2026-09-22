import { useEffect, useMemo, useRef, useState } from 'react'
import { FdcVisitMap } from '../fdc/FdcVisitMap.jsx'
import { FdcMapLocationIcon } from '../fdc/FdcMapLocationIcon.jsx'
import { gastronomyVenuesToMapPoints } from '../../data/gastronomicCatalogContent.js'
import { FDC_DEFAULT_VISIT_MAP } from '../../utils/fdcVisitMap.js'

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function SearchIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3-3" />
    </svg>
  )
}

function LocationsPanel({
  points,
  filteredPoints,
  searchQuery,
  onSearchChange,
  onClearSearch,
  activePointId,
  onSelect,
}) {
  const searchRef = useRef(null)
  const isSearching = Boolean(normalizeSearchText(searchQuery.trim()))

  return (
    <aside className="flex min-w-0 flex-col">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-800 sm:text-[11px]">
        Locales en el mapa
      </p>
      <div className="relative mb-3">
        <label htmlFor="gastronomy-map-search" className="sr-only">
          Buscar local en el mapa
        </label>
        <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400">
          <SearchIcon />
        </span>
        <input
          ref={searchRef}
          id="gastronomy-map-search"
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar local..."
          autoComplete="off"
          className="w-full rounded-full border border-[#d6d0c3] bg-white py-2.5 pr-10 pl-10 text-sm text-[#171b22] shadow-sm transition placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200/80"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => {
              onClearSearch()
              searchRef.current?.focus()
            }}
            className="absolute top-1/2 right-2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Limpiar búsqueda"
          >
            <span className="text-lg leading-none" aria-hidden>
              ×
            </span>
          </button>
        ) : null}
      </div>

      {isSearching ? (
        <p className="mb-2 text-xs font-medium text-slate-500">
          {filteredPoints.length === 0 ? (
            'No hay locales que coincidan.'
          ) : (
            <>
              <span className="font-semibold text-sky-800">{filteredPoints.length}</span>
              {filteredPoints.length === 1 ? ' resultado' : ' resultados'}
            </>
          )}
        </p>
      ) : null}

      <ul
        className="flex max-h-[18rem] flex-col gap-2 overflow-y-auto pr-1 sm:max-h-[22rem] lg:max-h-[26rem]"
        role="listbox"
        aria-label="Locales gastronómicos en el mapa"
      >
        {filteredPoints.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-[#d8d5cd] bg-[#f8f7f3] px-4 py-6 text-center text-sm text-slate-500">
            {isSearching ? 'Probá con otro nombre o barrio.' : 'Todavía no hay locales con ubicación en el mapa.'}
          </li>
        ) : (
          filteredPoints.map((point) => {
            const active = point.id === activePointId
            return (
              <li key={point.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onSelect(point.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition sm:px-4 sm:py-3.5 ${
                    active
                      ? 'border-[#171b22] bg-[#171b22] text-white shadow-[0_14px_32px_-20px_rgba(23,27,34,0.55)]'
                      : 'border-[#e8e4dc] bg-white text-[#171b22] hover:border-sky-200 hover:bg-sky-50/70'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      active ? 'bg-white/15 text-white' : 'bg-sky-50 text-sky-800'
                    }`}
                    aria-hidden
                  >
                    <FdcMapLocationIcon name="food" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-[15px] font-bold leading-snug sm:text-base">
                      {point.title}
                    </span>
                    {point.subtitle ? (
                      <span className={`mt-0.5 block text-xs font-medium ${active ? 'text-white/75' : 'text-sky-800'}`}>
                        {point.subtitle}
                      </span>
                    ) : null}
                    {point.address ? (
                      <span className={`mt-1 block text-xs leading-relaxed ${active ? 'text-white/70' : 'text-[#4b505a]'}`}>
                        {point.address}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            )
          })
        )}
      </ul>
      {!isSearching && points.length > 0 ? (
        <p className="mt-2 text-[11px] text-slate-400">
          {points.length} local{points.length === 1 ? '' : 'es'} con ubicación
        </p>
      ) : null}
    </aside>
  )
}

export function GastronomyVenuesMap({
  venues = [],
  focusVenueId = '',
  focusToken = '',
  className = '',
  sectionId = 'catalogo-mapa',
  compact = false,
  includeInactive = false,
}) {
  const points = useMemo(
    () => gastronomyVenuesToMapPoints(venues, { includeInactive }),
    [includeInactive, venues],
  )
  const [activePointId, setActivePointId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const normalizedQuery = useMemo(() => normalizeSearchText(searchQuery.trim()), [searchQuery])
  const filteredPoints = useMemo(() => {
    if (!normalizedQuery) return points
    return points.filter((point) =>
      normalizeSearchText([point.title, point.subtitle, point.address, point.id].join(' ')).includes(
        normalizedQuery,
      ),
    )
  }, [normalizedQuery, points])

  const isSearching = normalizedQuery.length > 0
  const mapPoints = isSearching ? filteredPoints : points
  const mapFitBounds = useMemo(() => {
    if (!isSearching || filteredPoints.length < 2) return null
    return filteredPoints.map((point) => [Number(point.lat), Number(point.lng)])
  }, [filteredPoints, isSearching])

  useEffect(() => {
    if (!filteredPoints.length) {
      setActivePointId('')
      return
    }
    setActivePointId((prev) =>
      filteredPoints.some((p) => p.id === prev) ? prev : filteredPoints[0].id,
    )
  }, [filteredPoints])

  useEffect(() => {
    if (!focusVenueId) return
    if (points.some((p) => p.id === focusVenueId)) {
      setSearchQuery('')
      setActivePointId(focusVenueId)
    }
  }, [focusToken, focusVenueId, points])

  if (points.length === 0) return null

  const center = {
    lat: Number(points[0]?.lat) || FDC_DEFAULT_VISIT_MAP.lat,
    lng: Number(points[0]?.lng) || FDC_DEFAULT_VISIT_MAP.lng,
  }

  return (
    <section
      id={sectionId || undefined}
      className={`scroll-mt-[calc(var(--navbar-h,5rem)+1rem)] ${className}`.trim()}
    >
      {compact ? null : (
        <div className="border-b border-[#ddd7ca] pb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">Cómo llegar</p>
          <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
            Mapa de locales
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#4b505a]">
            Elegí un local en la lista o tocá «Ver en el mapa» en una tarjeta. El mapa vuela hasta el punto y
            se puede abrir en grande para trazar la ruta.
          </p>
        </div>
      )}

      <div
        className={`grid gap-6 lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.4fr)] lg:items-start xl:gap-8 ${
          compact ? 'mt-0' : 'mt-6'
        }`}
      >
        <LocationsPanel
          points={points}
          filteredPoints={filteredPoints}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery('')}
          activePointId={activePointId}
          onSelect={setActivePointId}
        />
        <FdcVisitMap
          center={center}
          zoom={FDC_DEFAULT_VISIT_MAP.zoom}
          points={mapPoints}
          allPoints={points}
          activePointId={activePointId}
          onSelectPoint={setActivePointId}
          fitBounds={mapFitBounds}
          focusToken={String(focusToken || '')}
          accent="sky"
        />
      </div>
    </section>
  )
}
