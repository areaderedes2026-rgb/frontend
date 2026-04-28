import { useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

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

export function HomeInteractiveMap({ content }) {
  const [activePointId, setActivePointId] = useState('')
  const tabsRef = useRef(null)

  const center = useMemo(
    () => [Number(content?.center?.lat) || -26.2312, Number(content?.center?.lng) || -65.2818],
    [content],
  )
  const zoom = Math.min(18, Math.max(10, Number(content?.zoom) || 14))
  const allPoints = useMemo(
    () =>
      (Array.isArray(content?.points) ? content.points : [])
        .filter((point) => point?.isActive !== false && Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lng)))
        .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)),
    [content],
  )
  const points = allPoints
  const effectiveActivePointId = useMemo(() => {
    if (!points.length) return ''
    if (points.some((p) => p.id === activePointId)) return activePointId
    return points[0].id
  }, [activePointId, points])
  const markerIcons = useMemo(
    () => ({
      base: buildMarkerIcon(false),
      active: buildMarkerIcon(true),
    }),
    [],
  )

  function scrollTabs(direction = 1) {
    if (!tabsRef.current) return
    tabsRef.current.scrollBy({
      left: direction * 220,
      behavior: 'smooth',
    })
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm ring-1 ring-[#1a1d24]/5">
      <div className="border-b border-[#ddd7ca] bg-[#f8f7f3] px-3 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollTabs(-1)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d6d0c3] bg-white text-sm font-bold text-[#3e434d] transition hover:border-sky-200 hover:text-sky-800"
            aria-label="Ver puntos anteriores"
          >
            ←
          </button>
          <div
            ref={tabsRef}
            className="flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {points.map((point) => {
              const active = point.id === effectiveActivePointId
              return (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => setActivePointId(point.id)}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'border-[#2a313b] bg-[#171b22] text-white'
                      : 'border-[#d6d0c3] bg-white text-[#3e434d] hover:border-sky-200'
                  }`}
                >
                  {point.title || point.id}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => scrollTabs(1)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d6d0c3] bg-white text-sm font-bold text-[#3e434d] transition hover:border-sky-200 hover:text-sky-800"
            aria-label="Ver siguientes puntos"
          >
            →
          </button>
        </div>
      </div>
      <div className="relative h-88 w-full sm:h-104 lg:h-120">
        <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((point) => (
            <Marker
              key={point.id}
              position={[Number(point.lat), Number(point.lng)]}
              icon={point.id === effectiveActivePointId ? markerIcons.active : markerIcons.base}
            >
              <Popup>
                <div className="space-y-1 pr-1">
                  <h3 className="text-sm font-bold text-[#171b22]">{point.title}</h3>
                  {point.subtitle ? <p className="text-xs font-medium text-[#3e434d]">{point.subtitle}</p> : null}
                  {point.address ? <p className="text-xs text-[#4b505a]">{point.address}</p> : null}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </article>
  )
}
