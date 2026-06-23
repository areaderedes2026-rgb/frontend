function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function cleanSortOrder(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function normalizeLegislatorLaw(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const number = String(raw.number || '').trim()
  const body = String(raw.body || raw.description || '').trim()
  if (!number && !body) return null
  const lawNumber = number || String(index + 1)
  return {
    id: String(raw.id || '').trim() || makeId('leg-law'),
    sortOrder: cleanSortOrder(raw.sortOrder, (index + 1) * 10),
    number: lawNumber,
    label: String(raw.label || '').trim() || `LEY ${lawNumber}`,
    body,
  }
}

export function normalizeLegislatorLaws(raw) {
  if (!raw || typeof raw !== 'object') {
    return { enabled: true, title: '', subtitle: '', items: [] }
  }
  const items = Array.isArray(raw.items)
    ? raw.items.map((item, i) => normalizeLegislatorLaw(item, i)).filter(Boolean)
    : []
  items.sort((a, b) => a.sortOrder - b.sortOrder)
  return {
    enabled: raw.enabled !== false,
    title: String(raw.title || '').trim() || 'Leyes',
    subtitle: String(raw.subtitle || '').trim(),
    items,
  }
}

export const DEFAULT_LEGISLATOR_LAWS = {
  enabled: true,
  title: 'Leyes',
  subtitle: 'Normas impulsadas o acompañadas en la Legislatura provincial.',
  items: [
    {
      id: 'leg-law-9840',
      sortOrder: 10,
      number: '9840',
      label: 'LEY 9840',
      body: 'Incorpora al Calendario Escolar de la Provincia el 22 de Agosto de cada año, como "Día Nacional de Desagravio al Pueblo Tucumano por el cierre masivo de Ingenios Azucareros pergeñado por la dictadura militar de 1966", instituido por Ley N° 27.620.',
    },
  ],
}

export function sortLegislatorLaws(items) {
  return [...(items || [])].sort((a, b) => a.sortOrder - b.sortOrder)
}
