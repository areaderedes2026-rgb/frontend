/**
 * Comisiones de trabajo del Concejo Deliberante.
 * Persistido en commissions_json.
 */

import { cleanConcejoSortOrder } from './concejoMainFunctionsContent.js'

export { cleanConcejoSortOrder }

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeRoleHolder(raw) {
  if (!raw || typeof raw !== 'object') return { name: '', role: '' }
  return {
    name: String(raw.name || '').trim(),
    role: String(raw.role || '').trim(),
  }
}

/** Compatibilidad con vocal1/vocal2 y campos planos heredados del borrador. */
function normalizeVicepresidenteHolder(raw, slot) {
  if (!raw || typeof raw !== 'object') return { name: '', role: '' }
  const nestedModern = slot === 1 ? raw.vicepresidente1 : raw.vicepresidente2
  const nestedLegacy = slot === 1 ? raw.vocal1 : raw.vocal2
  const fromNested = normalizeRoleHolder(nestedModern ?? nestedLegacy)
  if (fromNested.name || fromNested.role) return fromNested

  const flatName =
    slot === 1
      ? raw.vicepresidente1Name ?? raw.vocal1Name
      : raw.vicepresidente2Name ?? raw.vocal2Name
  const flatRole =
    slot === 1
      ? raw.vicepresidente1Role ?? raw.vocal1Role
      : raw.vicepresidente2Role ?? raw.vocal2Role
  return normalizeRoleHolder({ name: flatName, role: flatRole })
}

/** Objeto listo para persistir (sin claves legacy ni campos planos del modal). */
export function serializeCommissionForSave(commission) {
  const normalized = normalizeCommission(commission)
  if (!normalized) return null
  const { vocal1: _v1, vocal2: _v2, ...rest } = normalized
  return rest
}

export function serializeCommissionsForSave(raw) {
  const normalized = normalizeCommissions(raw)
  return {
    ...normalized,
    items: (normalized.items || [])
      .map((item) => serializeCommissionForSave(item))
      .filter(Boolean),
  }
}

function normalizeCommission(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const name = String(raw.name || '').trim()
  if (!name) return null
  const kind = raw.kind === 'coordinating' ? 'coordinating' : 'standard'
  return {
    id: String(raw.id || '').trim() || makeId('com'),
    sortOrder:
      raw?.sortOrder == null || raw?.sortOrder === ''
        ? (index + 1) * 10
        : cleanConcejoSortOrder(raw.sortOrder, (index + 1) * 10),
    number: String(raw.number || '').trim() || String(index + 1),
    name,
    kind,
    presidente: normalizeRoleHolder(raw.presidente),
    vicepresidente1:
      kind === 'standard' ? normalizeVicepresidenteHolder(raw, 1) : { name: '', role: '' },
    vicepresidente2:
      kind === 'standard' ? normalizeVicepresidenteHolder(raw, 2) : { name: '', role: '' },
  }
}

export function sortCommissions(items) {
  return [...(Array.isArray(items) ? items : [])].sort((a, b) => {
    const oa = cleanConcejoSortOrder(a?.sortOrder, 0)
    const ob = cleanConcejoSortOrder(b?.sortOrder, 0)
    if (oa !== ob) return oa - ob
    const na = Number(a?.number)
    const nb = Number(b?.number)
    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb
    return String(a?.name || '').localeCompare(String(b?.name || ''), 'es', {
      sensitivity: 'base',
    })
  })
}

export function nextCommissionPriority(items) {
  const max = (Array.isArray(items) ? items : []).reduce(
    (acc, item) => Math.max(acc, cleanConcejoSortOrder(item?.sortOrder, 0)),
    0,
  )
  return max + 10
}

/** Presidentes de comisiones estándar (1–7) para la comisión coordinadora. */
export function buildCoordinatingPresidentsList(commissions) {
  return sortCommissions(commissions)
    .filter((c) => c.kind !== 'coordinating')
    .map((c) => ({
      commissionId: c.id,
      number: c.number,
      commissionName: c.name,
      presidentName: c.presidente?.name || '',
      presidentRole: c.presidente?.role || '',
    }))
}

function emptyHolder() {
  return { name: '', role: '' }
}

function standardCommission(id, number, sortOrder, name) {
  return {
    id,
    sortOrder,
    number: String(number),
    name,
    kind: 'standard',
    presidente: emptyHolder(),
    vicepresidente1: emptyHolder(),
    vicepresidente2: emptyHolder(),
  }
}

export const DEFAULT_CONCEJO_COMMISSIONS = {
  enabled: true,
  title: 'Comisiones de Trabajo',
  subtitle:
    'Órganos técnicos del Concejo que estudian los proyectos por temática antes de su tratamiento en sesión.',
  items: [
    standardCommission('com-1', 1, 10, 'Comisión de Legislación y Normativa'),
    standardCommission('com-2', 2, 20, 'Comisión de Hacienda y Presupuesto'),
    standardCommission('com-3', 3, 30, 'Comisión de Obras Públicas'),
    standardCommission('com-4', 4, 40, 'Comisión de Servicios Públicos'),
    standardCommission('com-5', 5, 50, 'Comisión de Desarrollo Social y Salud'),
    standardCommission('com-6', 6, 60, 'Comisión de Educación, Cultura y Deportes'),
    standardCommission('com-7', 7, 70, 'Comisión de Producción y Medio Ambiente'),
    {
      id: 'com-8',
      sortOrder: 80,
      number: '8',
      name: 'Comisión de Coordinación de Comisiones',
      kind: 'coordinating',
      presidente: emptyHolder(),
      vicepresidente1: emptyHolder(),
      vicepresidente2: emptyHolder(),
    },
  ],
}

export function normalizeCommissions(raw, base = DEFAULT_CONCEJO_COMMISSIONS) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const b = base && typeof base === 'object' ? base : DEFAULT_CONCEJO_COMMISSIONS
  const items = sortCommissions(
    (Array.isArray(source.items) ? source.items : b.items || [])
      .map((c, idx) => normalizeCommission(c, idx))
      .filter(Boolean),
  )
  return {
    enabled: source.enabled !== false,
    title: String(source.title ?? b.title ?? '').trim() || b.title,
    subtitle: String(source.subtitle ?? b.subtitle ?? '').trim() || b.subtitle,
    items: items.length ? items : [...(b.items || [])],
  }
}
