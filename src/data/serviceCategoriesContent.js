export const SERVICE_CATEGORY_ICON_OPTIONS = [
  { value: 'document', label: 'Documentación' },
  { value: 'community', label: 'Comunidad' },
  { value: 'construction', label: 'Obras' },
  { value: 'health', label: 'Salud' },
  { value: 'education', label: 'Educación' },
  { value: 'commerce', label: 'Comercio' },
  { value: 'digital', label: 'Digital' },
  { value: 'social', label: 'Asistencia social' },
  { value: 'environment', label: 'Ambiente' },
  { value: 'culture', label: 'Cultura' },
  { value: 'sports', label: 'Deportes' },
  { value: 'pets', label: 'Animales' },
  { value: 'claims', label: 'Reclamos' },
  { value: 'license', label: 'Licencias' },
  { value: 'tax', label: 'Tasas' },
  { value: 'permit', label: 'Permisos' },
  { value: 'default', label: 'General' },
]

const LEGACY_NAME_ICON = {
  documentación: 'document',
  documentacion: 'document',
  comunidad: 'community',
  obras: 'construction',
  salud: 'health',
  educación: 'education',
  educacion: 'education',
}

export const DEFAULT_SERVICE_CATEGORIES = [
  {
    id: 'svc-cat-documentacion',
    slug: 'documentacion',
    name: 'Documentación',
    icon: 'document',
    sortOrder: 10,
    enabled: true,
  },
  {
    id: 'svc-cat-comunidad',
    slug: 'comunidad',
    name: 'Comunidad',
    icon: 'community',
    sortOrder: 20,
    enabled: true,
  },
  {
    id: 'svc-cat-obras',
    slug: 'obras',
    name: 'Obras y servicios urbanos',
    icon: 'construction',
    sortOrder: 30,
    enabled: true,
  },
  {
    id: 'svc-cat-salud',
    slug: 'salud',
    name: 'Salud',
    icon: 'health',
    sortOrder: 40,
    enabled: true,
  },
]

export function slugifyServiceCategory(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

function legacyIconForName(name) {
  const key = String(name || '')
    .trim()
    .toLowerCase()
  return LEGACY_NAME_ICON[key] || 'default'
}

function normalizeOneCategory(raw, index = 0) {
  if (raw == null) return null
  if (typeof raw === 'string') {
    const name = raw.trim()
    if (!name) return null
    const slug = slugifyServiceCategory(name)
    return {
      id: `svc-cat-${slug || `item-${index + 1}`}`,
      slug: slug || `categoria-${index + 1}`,
      name,
      icon: legacyIconForName(name),
      sortOrder: (index + 1) * 10,
      enabled: true,
    }
  }
  if (typeof raw !== 'object') return null
  const name = String(raw.name || '').trim()
  if (!name) return null
  const slug = slugifyServiceCategory(raw.slug || name) || `categoria-${index + 1}`
  const id = String(raw.id || '').trim() || `svc-cat-${slug}`
  const icon = String(raw.icon || '').trim() || legacyIconForName(name)
  return {
    id,
    slug,
    name,
    icon: SERVICE_CATEGORY_ICON_OPTIONS.some((o) => o.value === icon) ? icon : 'default',
    sortOrder: Number.isFinite(Number(raw.sortOrder)) ? Math.max(Number(raw.sortOrder), 0) : (index + 1) * 10,
    enabled: raw.enabled !== false,
  }
}

export function normalizeServiceCategories(list, fallback = DEFAULT_SERVICE_CATEGORIES) {
  if (!Array.isArray(list) || list.length === 0) {
    return fallback.map((item, index) => normalizeOneCategory(item, index)).filter(Boolean)
  }
  const out = []
  const seen = new Set()
  for (let i = 0; i < list.length; i += 1) {
    const row = normalizeOneCategory(list[i], i)
    if (!row || seen.has(row.id)) continue
    seen.add(row.id)
    out.push(row)
  }
  out.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es'))
  return out.length ? out : fallback.map((item, index) => normalizeOneCategory(item, index)).filter(Boolean)
}

export function findServiceCategory(categories, { id, slug, name } = {}) {
  const list = normalizeServiceCategories(categories)
  const idVal = String(id || '').trim()
  if (idVal) {
    const hit = list.find((c) => c.id === idVal)
    if (hit) return hit
  }
  const slugVal = String(slug || '').trim().toLowerCase()
  if (slugVal) {
    const hit = list.find((c) => c.slug === slugVal)
    if (hit) return hit
  }
  const nameVal = String(name || '').trim().toLowerCase()
  if (nameVal) {
    const hit = list.find((c) => c.name.toLowerCase() === nameVal)
    if (hit) return hit
  }
  return null
}

/** Resuelve el id de categoría guardado en un trámite (soporta nombres legacy). */
export function resolveServiceCategoryId(categoryValue, categories) {
  const raw = String(categoryValue || '').trim()
  if (!raw) return ''
  const list = normalizeServiceCategories(categories)
  if (list.some((c) => c.id === raw)) return raw
  const found = findServiceCategory(list, { slug: raw, name: raw })
  return found?.id || raw
}

export function serviceBelongsToCategory(service, category, categories) {
  const categoryId = resolveServiceCategoryId(service?.category, categories)
  return Boolean(category?.id) && categoryId === category.id
}

export function countServicesInCategory(services, category, categories) {
  if (!category) return 0
  return (services || []).filter(
    (s) => s?.isActive !== false && serviceBelongsToCategory(s, category, categories),
  ).length
}

export function groupServicesByCategory(services, categories) {
  const list = normalizeServiceCategories(categories)
  const map = new Map(list.map((c) => [c.id, []]))
  for (const service of services || []) {
    if (service?.isActive === false) continue
    const id = resolveServiceCategoryId(service.category, list)
    if (!map.has(id)) map.set(id, [])
    map.get(id).push(service)
  }
  return map
}
