/**
 * Contenido público del Concejo Deliberante (vista ciudadana + valores por defecto del panel).
 */

import {
  DEFAULT_CONCEJO_COMMISSIONS,
  normalizeCommissions,
} from './concejoCommissionsContent.js'
import {
  DEFAULT_CONCEJO_MAIN_FUNCTIONS,
  normalizeMainFunctions,
} from './concejoMainFunctionsContent.js'

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function cleanMemberSortOrder(value, fallback = 0) {
  const n = Number(value)
  if (!Number.isFinite(n)) return Math.max(0, Math.round(fallback))
  return Math.max(0, Math.round(n))
}

/** Orden público y admin: número más bajo = aparece primero. */
export function sortConcejoMembers(members) {
  return [...(Array.isArray(members) ? members : [])].sort((a, b) => {
    const oa = cleanMemberSortOrder(a?.sortOrder, 0)
    const ob = cleanMemberSortOrder(b?.sortOrder, 0)
    if (oa !== ob) return oa - ob
    return String(a?.name || '').localeCompare(String(b?.name || ''), 'es', {
      sensitivity: 'base',
    })
  })
}

export function nextConcejoMemberPriority(members) {
  const max = (Array.isArray(members) ? members : []).reduce(
    (acc, item) => Math.max(acc, cleanMemberSortOrder(item?.sortOrder, 0)),
    0,
  )
  return max + 10
}

function normalizeMember(remote, index = 0) {
  if (!remote || typeof remote !== 'object') return null
  const name = String(remote.name || '').trim()
  if (!name) return null
  const photoRaw = String(remote.photoUrl || '').trim()
  const photoUrl =
    photoRaw.startsWith('http://') ||
    photoRaw.startsWith('https://') ||
    photoRaw.startsWith('/')
      ? photoRaw
      : ''
  return {
    id: String(remote.id || '').trim() || makeId('concejal'),
    name,
    role: String(remote.role || '').trim(),
    photoUrl,
    bio: String(remote.bio || '').trim(),
    email: String(remote.email || '').trim().toLowerCase(),
    phone: String(remote.phone || '').trim(),
    period: String(remote.period || '').trim(),
    sortOrder:
      remote?.sortOrder == null || remote?.sortOrder === ''
        ? (index + 1) * 10
        : cleanMemberSortOrder(remote.sortOrder, (index + 1) * 10),
  }
}

export const DEFAULT_CONCEJO_DELIBERANTE_CONTENT = {
  heroEyebrow: 'Gobierno municipal',
  heroTitle: 'Concejo Deliberante',
  heroSubtitle:
    'Cuerpo legislativo de la ciudad. Conocé a las concejalas y concejales que representan a la comunidad de Trancas.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',
  introTitle: 'Órgano Legislativo y de Control Municipal',
  introParagraphs: [
    'El Honorable Concejo Deliberante es el órgano representativo de la voluntad popular en el ámbito municipal. Integra el Poder Legislativo local junto con la función de control de la gestión del Ejecutivo.',
    'Su misión es legislar para el bien común, fiscalizar el uso de los recursos públicos y canalizar las demandas de la ciudadanía con transparencia y cercanía institucional.',
  ],
  mainFunctions: DEFAULT_CONCEJO_MAIN_FUNCTIONS,
  commissions: DEFAULT_CONCEJO_COMMISSIONS,
  presidentName: 'Nombre del Presidente',
  presidentRole: 'Presidente del Concejo Deliberante',
  presidentBio:
    'Conduce las sesiones del cuerpo, representa institucionalmente al Concejo y articula con la intendencia y las áreas municipales.',
  presidentPhotoUrl: '',
  sessionsTitle: 'Sesiones del Concejo',
  sessionsSchedule: 'Martes a las 19:00 hs',
  sessionsLocation: 'Salón de Sesiones — Casa Municipal',
  sessionsNote:
    'Las sesiones son públicas. Consultá la agenda semanal en los canales oficiales antes de asistir.',
  contactEmail: 'concejo@trancas.gob.ar',
  contactPhone: '+54 381 4XX-XXXX',
  contactAddress: 'San Martín 100 — Trancas, Tucumán',
  contactHours: 'Lunes a viernes, 08:00 a 13:00',
  members: [
    {
      id: 'concejal-1',
      name: 'María González',
      role: 'Vicepresidente 1°',
      photoUrl: '',
      bio: 'Concejala con experiencia en políticas sociales y participación ciudadana.',
      email: 'mgonzalez@trancas.gob.ar',
      phone: '+54 381 4XX-XXXX',
      period: '2024 — 2028',
      sortOrder: 10,
    },
    {
      id: 'concejal-2',
      name: 'Juan Pérez',
      role: 'Concejal',
      photoUrl: '',
      bio: 'Trabaja en proyectos vinculados a obras públicas y servicios.',
      email: 'jperez@trancas.gob.ar',
      phone: '+54 381 4XX-XXXX',
      period: '2024 — 2028',
      sortOrder: 20,
    },
    {
      id: 'concejal-3',
      name: 'Carla Rivero',
      role: 'Vicepresidente 2°',
      photoUrl: '',
      bio: 'Profesional en gestión pública, impulsa controles y rendición de cuentas.',
      email: 'crivero@trancas.gob.ar',
      phone: '+54 381 4XX-XXXX',
      period: '2024 — 2028',
      sortOrder: 30,
    },
    {
      id: 'concejal-4',
      name: 'Pedro Sánchez',
      role: 'Concejal',
      photoUrl: '',
      bio: 'Especialista en presupuesto y temas vinculados a la producción local.',
      email: 'psanchez@trancas.gob.ar',
      phone: '+54 381 4XX-XXXX',
      period: '2024 — 2028',
      sortOrder: 40,
    },
    {
      id: 'concejal-5',
      name: 'Lucía Romero',
      role: 'Concejal',
      photoUrl: '',
      bio: 'Referente comunitaria de barrios del este, impulsa proyectos sociales.',
      email: 'lromero@trancas.gob.ar',
      phone: '+54 381 4XX-XXXX',
      period: '2024 — 2028',
      sortOrder: 50,
    },
    {
      id: 'concejal-6',
      name: 'Diego Funes',
      role: 'Concejal',
      photoUrl: '',
      bio: 'Trabaja temáticas de juventud, deportes y participación ciudadana.',
      email: 'dfunes@trancas.gob.ar',
      phone: '+54 381 4XX-XXXX',
      period: '2024 — 2028',
      sortOrder: 60,
    },
  ],
}

export function mergeConcejoDeliberanteContent(base, remote) {
  if (!remote || typeof remote !== 'object') {
    return {
      ...base,
      members: [...(base.members || [])],
      mainFunctions: normalizeMainFunctions(base.mainFunctions, DEFAULT_CONCEJO_MAIN_FUNCTIONS),
      commissions: normalizeCommissions(base.commissions, DEFAULT_CONCEJO_COMMISSIONS),
    }
  }

  const members = sortConcejoMembers(
    Array.isArray(remote.members)
      ? remote.members.map((m, idx) => normalizeMember(m, idx)).filter(Boolean)
      : (base.members || []).map((m, idx) => normalizeMember(m, idx)).filter(Boolean),
  )

  return {
    ...base,
    heroEyebrow: String(remote.heroEyebrow ?? base.heroEyebrow ?? ''),
    heroTitle: String(remote.heroTitle ?? base.heroTitle ?? ''),
    heroSubtitle: String(remote.heroSubtitle ?? base.heroSubtitle ?? ''),
    heroImageUrl: String(remote.heroImageUrl ?? base.heroImageUrl ?? ''),
    introTitle: String(remote.introTitle ?? base.introTitle ?? ''),
    introParagraphs: Array.isArray(remote.introParagraphs)
      ? remote.introParagraphs.map((p) => String(p || '').trim()).filter(Boolean)
      : [...(base.introParagraphs || [])],
    presidentName: String(remote.presidentName ?? base.presidentName ?? ''),
    presidentRole: String(remote.presidentRole ?? base.presidentRole ?? ''),
    presidentBio: String(remote.presidentBio ?? base.presidentBio ?? ''),
    presidentPhotoUrl: String(remote.presidentPhotoUrl ?? base.presidentPhotoUrl ?? ''),
    sessionsTitle: String(remote.sessionsTitle ?? base.sessionsTitle ?? ''),
    sessionsSchedule: String(remote.sessionsSchedule ?? base.sessionsSchedule ?? ''),
    sessionsLocation: String(remote.sessionsLocation ?? base.sessionsLocation ?? ''),
    sessionsNote: String(remote.sessionsNote ?? base.sessionsNote ?? ''),
    contactEmail: String(remote.contactEmail ?? base.contactEmail ?? ''),
    contactPhone: String(remote.contactPhone ?? base.contactPhone ?? ''),
    contactAddress: String(remote.contactAddress ?? base.contactAddress ?? ''),
    contactHours: String(remote.contactHours ?? base.contactHours ?? ''),
    members,
    mainFunctions: normalizeMainFunctions(
      remote.mainFunctions ?? remote.blocks,
      base.mainFunctions || DEFAULT_CONCEJO_MAIN_FUNCTIONS,
    ),
    commissions: normalizeCommissions(
      remote.commissions,
      base.commissions || DEFAULT_CONCEJO_COMMISSIONS,
    ),
  }
}

export function getInitialsFromName(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return 'CD'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
