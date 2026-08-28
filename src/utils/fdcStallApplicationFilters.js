/**
 * Agrupación de localidades para filtros del admin (solicitudes FDC).
 * No modifica lo guardado ni la vista pública: solo normaliza al filtrar.
 */

const LOCALITY_PREFIXES = [
  'ciudad de ',
  'villa ',
  'pueblo de ',
  'localidad de ',
  'departamento de ',
  'partido de ',
]

const MANUAL_PREFIX = 'g:'
const AUTO_PREFIX = 'a:'

function stripAccents(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/** Clave comparable exacta (para variantes manuales). */
export function localityVariantKey(raw) {
  return String(raw || '').trim().toLowerCase()
}

/** Clave estable para agrupar variantes automáticas (Trancas, TRANCAS, Ciudad de Trancas…). */
export function localityFilterKey(raw) {
  let s = stripAccents(String(raw || '').trim().toLowerCase())
  if (!s) return ''
  s = s.replace(/[.,;]+/g, ' ').replace(/\s+/g, ' ').trim()
  for (const prefix of LOCALITY_PREFIXES) {
    if (s.startsWith(prefix)) {
      s = s.slice(prefix.length).trim()
      break
    }
  }
  s = s.replace(/,\s*tucuman.*$/i, '').trim()
  s = s.replace(/\s+tucuman\s*$/i, '').trim()
  return s
}

function titleCaseLocality(str) {
  return String(str || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/** @typedef {{ id: string, label: string, variants: string[] }} LocalityFilterGroup */

export function buildManualVariantMap(manualGroups = []) {
  const map = new Map()
  for (const group of manualGroups || []) {
    if (!group?.id) continue
    for (const variant of group.variants || []) {
      const key = localityVariantKey(variant)
      if (key) map.set(key, group.id)
    }
  }
  return map
}

/** Clave de filtro para una solicitud: manual (`g:id`) o automática (`a:key`). */
export function applicationLocalityFilterKey(app, manualGroups = []) {
  const raw = String(app?.locality || '').trim()
  if (!raw) return ''
  const manualId = buildManualVariantMap(manualGroups).get(localityVariantKey(raw))
  if (manualId) return `${MANUAL_PREFIX}${manualId}`
  const autoKey = localityFilterKey(raw)
  return autoKey ? `${AUTO_PREFIX}${autoKey}` : ''
}

/**
 * Opciones del select de localidad.
 * Las agrupaciones manuales tienen prioridad; el resto se agrupa automáticamente.
 * @param {Array<{ locality?: string }>} items
 * @param {LocalityFilterGroup[]} manualGroups
 */
export function buildLocalityFilterOptions(items, manualGroups = []) {
  const manualMap = buildManualVariantMap(manualGroups)
  const manualStats = new Map()

  for (const group of manualGroups || []) {
    if (!group?.id) continue
    manualStats.set(group.id, {
      label: group.label || 'Sin nombre',
      variants: new Map(),
      total: 0,
    })
  }

  const autoGroups = new Map()

  for (const app of items || []) {
    const raw = String(app?.locality || '').trim()
    if (!raw) continue

    const manualId = manualMap.get(localityVariantKey(raw))
    if (manualId) {
      const stat = manualStats.get(manualId)
      if (stat) {
        stat.total += 1
        stat.variants.set(raw, (stat.variants.get(raw) || 0) + 1)
      }
      continue
    }

    const key = localityFilterKey(raw)
    if (!key) continue

    let group = autoGroups.get(key)
    if (!group) {
      group = { variants: new Map(), total: 0 }
      autoGroups.set(key, group)
    }
    group.total += 1
    group.variants.set(raw, (group.variants.get(raw) || 0) + 1)
  }

  const manualOptions = [...manualStats.entries()].map(([id, stat]) => {
    const variantCount = stat.variants.size
    const label =
      variantCount > 1 ? `${stat.label} (${variantCount} formas)` : stat.label
    return {
      value: `${MANUAL_PREFIX}${id}`,
      label,
      count: stat.total,
      variantCount,
      isManual: true,
    }
  })

  const autoOptions = [...autoGroups.entries()]
    .map(([value, group]) => {
      let bestRaw = ''
      let bestCount = -1
      for (const [raw, count] of group.variants) {
        if (
          count > bestCount ||
          (count === bestCount && raw.length < bestRaw.length)
        ) {
          bestRaw = raw
          bestCount = count
        }
      }

      const canonical = titleCaseLocality(bestRaw) || titleCaseLocality(value)
      const variantCount = group.variants.size
      const label =
        variantCount > 1
          ? `${canonical} (${variantCount} formas)`
          : canonical

      return {
        value: `${AUTO_PREFIX}${value}`,
        label,
        count: group.total,
        variantCount,
        isManual: false,
      }
    })

  return [...manualOptions, ...autoOptions].sort((a, b) =>
    a.label.localeCompare(b.label, 'es'),
  )
}

/** Etiqueta legible para resúmenes (PDF, texto de filtros activos). */
export function localityFilterLabel(filterValue, options) {
  if (!filterValue || filterValue === 'all') return ''
  const opt = (options || []).find((o) => o.value === filterValue)
  return opt?.label || filterValue
}

/** Localidades distintas en solicitudes (texto original tal como lo escribió el vecino). */
export function collectDistinctLocalities(items) {
  const map = new Map()
  for (const app of items || []) {
    const raw = String(app?.locality || '').trim()
    if (!raw) continue
    const key = localityVariantKey(raw)
    const prev = map.get(key)
    if (!prev || prev.count < 1) {
      map.set(key, { raw, count: 1 })
    } else {
      map.set(key, { raw: prev.raw, count: prev.count + 1 })
    }
  }
  return [...map.values()].sort((a, b) => a.raw.localeCompare(b.raw, 'es'))
}

/** Variantes ya asignadas a algún grupo (opcionalmente excluyendo uno al editar). */
export function getAssignedLocalityVariants(manualGroups = [], excludeGroupId = null) {
  const assigned = new Set()
  for (const group of manualGroups || []) {
    if (!group?.id || group.id === excludeGroupId) continue
    for (const variant of group.variants || []) {
      const key = localityVariantKey(variant)
      if (key) assigned.add(key)
    }
  }
  return assigned
}

export function normalizeLocalityFilterGroups(input) {
  if (!Array.isArray(input)) return []
  const out = []
  const seenVariants = new Set()
  for (const group of input.slice(0, 40)) {
    const label = String(group?.label || '').trim().slice(0, 120)
    if (!label) continue
    const id = String(group?.id || '').trim().slice(0, 64)
    const variants = []
    for (const variant of (Array.isArray(group?.variants) ? group.variants : []).slice(0, 50)) {
      const s = String(variant || '').trim().slice(0, 160)
      if (!s) continue
      const key = localityVariantKey(s)
      if (seenVariants.has(key)) continue
      seenVariants.add(key)
      variants.push(s)
    }
    if (variants.length === 0) continue
    out.push({ id: id || `loc-${out.length + 1}`, label, variants })
  }
  return out
}
