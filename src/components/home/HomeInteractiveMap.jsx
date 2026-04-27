import { useMemo, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { HOME_MAP_POINT_TYPES } from '../../data/homeMapContent.js'

const ICON_BY_TYPE = {
  servicios: '🛠️',
  salud: '🏥',
  turismo: '📍',
  educacion: '🎓',
  transporte: '🚌',
  institucional: '🏛️',
  otro: '📌',
}

const MARKER_COLOR_BY_TYPE = {
  servicios: '#0ea5e9',
  salud: '#ef4444',
  turismo: '#f59e0b',
  educacion: '#8b5cf6',
  transporte: '#14b8a6',
  institucional: '#1f2937',
  otro: '#6b7280',
}

function pointTypeLabel(typeValue) {
  return HOME_MAP_POINT_TYPES.find((type) => type.value === typeValue)?.label || 'Otro'
}

function buildMarkerIcon(pointType) {
  const color = MARKER_COLOR_BY_TYPE[pointType] || MARKER_COLOR_BY_TYPE.otro
  const emoji = ICON_BY_TYPE[pointType] || ICON_BY_TYPE.otro
  return L.divIcon({
    className: 'home-map-marker',
    html: `<div style="width:34px;height:34px;border-radius:9999px;background:${color};color:#ffffff;border:2px solid #ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px -8px rgba(0,0,0,0.55);font-size:16px;line-height:1;">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
  })
}

export function HomeInteractiveMap({ content }) {
  const [activeType, setActiveType] = useState('all')

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
  const availableTypes = useMemo(() => {
    const set = new Set(allPoints.map((point) => String(point.pointType || 'otro')))
    return HOME_MAP_POINT_TYPES.filter((type) => set.has(type.value))
  }, [allPoints])
  const points = useMemo(() => {
    if (activeType === 'all') return allPoints
    return allPoints.filter((point) => String(point.pointType || 'otro') === activeType)
  }, [activeType, allPoints])
  const markerIconsByType = useMemo(() => {
    const map = new Map()
    for (const type of HOME_MAP_POINT_TYPES) {
      map.set(type.value, buildMarkerIcon(type.value))
    }
    map.set('otro', buildMarkerIcon('otro'))
    return map
  }, [])

  return (
    <article className="overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm ring-1 ring-[#1a1d24]/5">
      <div className="flex flex-wrap gap-2 border-b border-[#ddd7ca] bg-[#f8f7f3] px-3 py-3 sm:px-5">
        <button
          type="button"
          onClick={() => setActiveType('all')}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            activeType === 'all'
              ? 'border-[#2a313b] bg-[#171b22] text-white'
              : 'border-[#d6d0c3] bg-white text-[#3e434d] hover:border-sky-200'
          }`}
        >
          Todos
        </button>
        {availableTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setActiveType(type.value)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              activeType === type.value
                ? 'border-[#2a313b] bg-[#171b22] text-white'
                : 'border-[#d6d0c3] bg-white text-[#3e434d] hover:border-sky-200'
            }`}
          >
            <span aria-hidden>{ICON_BY_TYPE[type.value] || ICON_BY_TYPE.otro}</span>
            {type.label}
          </button>
        ))}
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
              icon={markerIconsByType.get(point.pointType) || markerIconsByType.get('otro')}
            >
              <Popup>
                <div className="space-y-1 pr-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                    {(ICON_BY_TYPE[point.pointType] || ICON_BY_TYPE.otro) + ' '}
                    {pointTypeLabel(point.pointType || 'otro')}
                  </p>
                  <h3 className="text-sm font-bold text-[#171b22]">{point.title}</h3>
                  {point.subtitle ? <p className="text-xs font-medium text-[#3e434d]">{point.subtitle}</p> : null}
                  {point.address ? <p className="text-xs text-[#4b505a]">{point.address}</p> : null}
                  {point.description ? <p className="text-xs leading-relaxed text-[#4b505a]">{point.description}</p> : null}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="pointer-events-none absolute right-2 bottom-2 z-450 rounded-xl border border-[#ddd7ca] bg-[#fcfcfa]/95 p-2 shadow-sm backdrop-blur-sm sm:right-3 sm:bottom-3 sm:p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4b505a] sm:text-[11px]">
            Referencias
          </p>
          <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1 sm:gap-x-3">
            {HOME_MAP_POINT_TYPES.filter((type) =>
              availableTypes.some((item) => item.value === type.value),
            ).map((type) => (
              <div
                key={`legend-${type.value}`}
                className="flex items-center gap-1.5 text-[10px] text-[#3e434d] sm:text-[11px]"
              >
                <span
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px]"
                  style={{
                    backgroundColor: MARKER_COLOR_BY_TYPE[type.value] || MARKER_COLOR_BY_TYPE.otro,
                    color: '#fff',
                  }}
                  aria-hidden
                >
                  {ICON_BY_TYPE[type.value] || ICON_BY_TYPE.otro}
                </span>
                <span>{type.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
