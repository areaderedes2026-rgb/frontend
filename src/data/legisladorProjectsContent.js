function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function cleanSortOrder(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function normalizeProjectStat(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const year = Math.round(Number(raw.year))
  const count = Math.max(0, Math.min(99999, Math.round(Number(raw.count) || 0)))
  if (!Number.isFinite(year) || year < 1900 || year > 2100) return null
  return {
    id: String(raw.id || '').trim() || makeId('proj'),
    sortOrder: cleanSortOrder(raw.sortOrder, (index + 1) * 10),
    year,
    count,
  }
}

export function normalizePresentedProjects(raw) {
  if (!raw || typeof raw !== 'object') {
    return { enabled: true, title: '', subtitle: '', items: [] }
  }
  const items = Array.isArray(raw.items)
    ? raw.items.map((item, i) => normalizeProjectStat(item, i)).filter(Boolean)
    : []
  items.sort((a, b) => a.sortOrder - b.sortOrder || a.year - b.year)
  return {
    enabled: raw.enabled !== false,
    title: String(raw.title || '').trim() || 'Proyectos presentados',
    subtitle: String(raw.subtitle || '').trim(),
    items,
  }
}

export const DEFAULT_PRESENTED_PROJECTS = {
  enabled: true,
  title: 'Proyectos presentados',
  subtitle: 'Iniciativas ingresadas en la Legislatura por período.',
  items: [
    { id: 'leg-proj-2024', sortOrder: 10, year: 2024, count: 45 },
    { id: 'leg-proj-2025', sortOrder: 20, year: 2025, count: 115 },
    { id: 'leg-proj-2026', sortOrder: 30, year: 2026, count: 61 },
  ],
}

export function sortProjectStats(items) {
  return [...(items || [])].sort((a, b) => a.sortOrder - b.sortOrder || a.year - b.year)
}
