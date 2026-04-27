export const HOME_MAP_POINT_TYPES = [
  { value: 'servicios', label: 'Servicios' },
  { value: 'salud', label: 'Salud' },
  { value: 'turismo', label: 'Turismo' },
  { value: 'educacion', label: 'Educación' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'institucional', label: 'Institucional' },
  { value: 'otro', label: 'Otro' },
]

export const DEFAULT_HOME_MAP_CONTENT = {
  center: {
    lat: -26.2312,
    lng: -65.2818,
  },
  zoom: 14,
  points: [
    {
      id: 'municipalidad',
      title: 'Municipalidad de Trancas',
      subtitle: 'Atención central',
      description: 'Sede principal para consultas generales, trámites y atención al vecino.',
      address: 'Trancas, Tucumán',
      pointType: 'institucional',
      lat: -26.2312,
      lng: -65.2818,
      isActive: true,
      sortOrder: 10,
    },
    {
      id: 'hospital',
      title: 'Hospital de Trancas',
      subtitle: 'Salud',
      description: 'Atención médica y guardia para la comunidad.',
      address: 'Zona centro, Trancas',
      pointType: 'salud',
      lat: -26.2334,
      lng: -65.2861,
      isActive: true,
      sortOrder: 20,
    },
    {
      id: 'terminal',
      title: 'Terminal de ómnibus',
      subtitle: 'Transporte',
      description: 'Conectividad interurbana y servicios de transporte de pasajeros.',
      address: 'Acceso principal, Trancas',
      pointType: 'transporte',
      lat: -26.2279,
      lng: -65.2794,
      isActive: true,
      sortOrder: 30,
    },
  ],
}

function cleanText(value, maxLen = 0) {
  const out = String(value || '').trim()
  if (!maxLen) return out
  return out.slice(0, maxLen)
}

function cleanNumber(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function mapPoint(raw, fallback, index) {
  const base = fallback || {}
  const allowedTypes = HOME_MAP_POINT_TYPES.map((type) => type.value)
  const pointTypeRaw = cleanText(raw?.pointType || base.pointType || 'otro', 32).toLowerCase()
  const pointType = allowedTypes.includes(pointTypeRaw) ? pointTypeRaw : 'otro'
  return {
    id: cleanText(raw?.id || base.id || `punto-${index + 1}`, 60),
    title: cleanText(raw?.title || base.title, 140),
    subtitle: cleanText(raw?.subtitle || base.subtitle, 120),
    description: cleanText(raw?.description || base.description, 1200),
    address: cleanText(raw?.address || base.address, 220),
    pointType,
    lat: cleanNumber(raw?.lat, cleanNumber(base.lat, 0)),
    lng: cleanNumber(raw?.lng, cleanNumber(base.lng, 0)),
    isActive: typeof raw?.isActive === 'boolean' ? raw.isActive : base.isActive !== false,
    sortOrder: Math.max(0, Math.round(cleanNumber(raw?.sortOrder, cleanNumber(base.sortOrder, index * 10)))),
  }
}

export function mergeHomeMapContent(base, incoming) {
  if (!incoming || typeof incoming !== 'object') return base
  const centerBase = base?.center || {}
  const centerIncoming = incoming?.center || {}
  const pointsIncoming = Array.isArray(incoming.points) ? incoming.points : []

  return {
    center: {
      lat: cleanNumber(centerIncoming.lat, cleanNumber(centerBase.lat, -26.2312)),
      lng: cleanNumber(centerIncoming.lng, cleanNumber(centerBase.lng, -65.2818)),
    },
    zoom: Math.min(18, Math.max(10, Math.round(cleanNumber(incoming.zoom, base?.zoom || 14)))),
    points:
      pointsIncoming.length > 0
        ? pointsIncoming.map((point, idx) => mapPoint(point, base?.points?.[idx], idx))
        : base.points.map((point, idx) => mapPoint(point, point, idx)),
  }
}
