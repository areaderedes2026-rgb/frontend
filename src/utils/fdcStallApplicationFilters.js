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

function stripAccents(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/** Clave estable para agrupar variantes (Trancas, TRANCAS, Ciudad de Trancas…). */
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

/**
 * Opciones del select de localidad: una entrada por grupo normalizado.
 * @param {Array<{ locality?: string }>} items
 */
export function buildLocalityFilterOptions(items) {
  const groups = new Map()

  for (const app of items || []) {
    const raw = String(app?.locality || '').trim()
    if (!raw) continue
    const key = localityFilterKey(raw)
    if (!key) continue

    let group = groups.get(key)
    if (!group) {
      group = { variants: new Map(), total: 0 }
      groups.set(key, group)
    }
    group.total += 1
    group.variants.set(raw, (group.variants.get(raw) || 0) + 1)
  }

  return [...groups.entries()]
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

      return { value, label, count: group.total, variantCount }
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'es'))
}

/** Etiqueta legible para resúmenes (PDF, texto de filtros activos). */
export function localityFilterLabel(filterValue, options) {
  if (!filterValue || filterValue === 'all') return ''
  const opt = (options || []).find((o) => o.value === filterValue)
  return opt?.label || filterValue
}
