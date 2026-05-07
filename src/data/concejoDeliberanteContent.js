/**
 * Contenido público del Concejo Deliberante (vista ciudadana + valores por defecto del panel).
 */

const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

function normalizeColor(value) {
  const s = String(value || '').trim().toLowerCase()
  if (!s) return ''
  return HEX_COLOR_RE.test(s) ? s : ''
}

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeBlock(remote) {
  if (!remote || typeof remote !== 'object') return null
  const name = String(remote.name || '').trim()
  if (!name) return null
  return {
    id: String(remote.id || '').trim() || makeId('bloque'),
    name,
    color: normalizeColor(remote.color),
    description: String(remote.description || '').trim(),
  }
}

function normalizeMember(remote) {
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
    block: String(remote.block || '').trim(),
    photoUrl,
    bio: String(remote.bio || '').trim(),
    email: String(remote.email || '').trim().toLowerCase(),
    phone: String(remote.phone || '').trim(),
    period: String(remote.period || '').trim(),
  }
}

function normalizeCommission(remote) {
  if (!remote || typeof remote !== 'object') return null
  const name = String(remote.name || '').trim()
  if (!name) return null
  return {
    id: String(remote.id || '').trim() || makeId('comision'),
    name,
    description: String(remote.description || '').trim(),
  }
}

export const DEFAULT_CONCEJO_DELIBERANTE_CONTENT = {
  heroEyebrow: 'Gobierno municipal',
  heroTitle: 'Concejo Deliberante',
  heroSubtitle:
    'Cuerpo legislativo de la ciudad. Conocé a las concejalas y concejales que representan a la comunidad de Trancas, sus bloques políticos y las comisiones de trabajo.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',
  introTitle: 'Una representación plural y cercana',
  introParagraphs: [
    'El Concejo Deliberante sanciona ordenanzas, controla la gestión municipal y canaliza las inquietudes de los vecinos a través de proyectos y comisiones de trabajo.',
    'Las sesiones son públicas: cualquier vecino o vecina puede asistir y conocer la agenda de los temas que se debaten cada semana.',
  ],
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
  blocks: [
    {
      id: 'bloque-oficialismo',
      name: 'Bloque Oficialismo',
      color: '#0369a1',
      description: 'Bloque que acompaña la gestión del Departamento Ejecutivo Municipal.',
    },
    {
      id: 'bloque-oposicion',
      name: 'Bloque Oposición',
      color: '#b45309',
      description:
        'Bloque que ejerce el control político y propone iniciativas alternativas.',
    },
    {
      id: 'bloque-vecinal',
      name: 'Bloque Vecinal',
      color: '#15803d',
      description:
        'Concejales que representan demandas barriales y proyectos comunitarios.',
    },
  ],
  members: [
    {
      id: 'concejal-1',
      name: 'María González',
      role: 'Vicepresidente 1°',
      block: 'Bloque Oficialismo',
      photoUrl: '',
      bio: 'Concejala con experiencia en políticas sociales y comisiones de género.',
      email: 'mgonzalez@trancas.gob.ar',
      phone: '+54 381 4XX-XXXX',
      period: '2024 — 2028',
    },
    {
      id: 'concejal-2',
      name: 'Juan Pérez',
      role: 'Concejal',
      block: 'Bloque Oficialismo',
      photoUrl: '',
      bio: 'Trabaja en proyectos vinculados a obras públicas y servicios.',
      email: 'jperez@trancas.gob.ar',
      phone: '+54 381 4XX-XXXX',
      period: '2024 — 2028',
    },
    {
      id: 'concejal-3',
      name: 'Carla Rivero',
      role: 'Vicepresidente 2°',
      block: 'Bloque Oposición',
      photoUrl: '',
      bio: 'Profesional en gestión pública, impulsa controles y rendición de cuentas.',
      email: 'crivero@trancas.gob.ar',
      phone: '+54 381 4XX-XXXX',
      period: '2024 — 2028',
    },
    {
      id: 'concejal-4',
      name: 'Pedro Sánchez',
      role: 'Concejal',
      block: 'Bloque Oposición',
      photoUrl: '',
      bio: 'Especialista en presupuesto y temas vinculados a la producción local.',
      email: 'psanchez@trancas.gob.ar',
      phone: '+54 381 4XX-XXXX',
      period: '2024 — 2028',
    },
    {
      id: 'concejal-5',
      name: 'Lucía Romero',
      role: 'Concejal',
      block: 'Bloque Vecinal',
      photoUrl: '',
      bio: 'Referente comunitaria de barrios del este, impulsa proyectos sociales.',
      email: 'lromero@trancas.gob.ar',
      phone: '+54 381 4XX-XXXX',
      period: '2024 — 2028',
    },
    {
      id: 'concejal-6',
      name: 'Diego Funes',
      role: 'Concejal',
      block: 'Bloque Vecinal',
      photoUrl: '',
      bio: 'Trabaja temáticas de juventud, deportes y participación ciudadana.',
      email: 'dfunes@trancas.gob.ar',
      phone: '+54 381 4XX-XXXX',
      period: '2024 — 2028',
    },
  ],
  commissions: [
    {
      id: 'com-legislacion',
      name: 'Legislación general y asuntos institucionales',
      description:
        'Analiza y dictamina sobre proyectos de ordenanza, resoluciones y reformas reglamentarias.',
    },
    {
      id: 'com-hacienda',
      name: 'Hacienda y presupuesto',
      description:
        'Estudia el presupuesto municipal, ejecución de fondos y rendiciones de cuentas.',
    },
    {
      id: 'com-obras',
      name: 'Obras públicas y servicios',
      description:
        'Trabaja sobre infraestructura, planificación urbana y servicios esenciales.',
    },
    {
      id: 'com-social',
      name: 'Acción social, salud y educación',
      description:
        'Aborda políticas sociales, programas de salud comunitaria y articulación educativa.',
    },
  ],
}

export function mergeConcejoDeliberanteContent(base, remote) {
  if (!remote || typeof remote !== 'object') {
    return {
      ...base,
      blocks: [...(base.blocks || [])],
      members: [...(base.members || [])],
      commissions: [...(base.commissions || [])],
    }
  }

  const blocks = Array.isArray(remote.blocks)
    ? remote.blocks.map(normalizeBlock).filter(Boolean)
    : (base.blocks || []).map(normalizeBlock).filter(Boolean)

  const members = Array.isArray(remote.members)
    ? remote.members.map(normalizeMember).filter(Boolean)
    : (base.members || []).map(normalizeMember).filter(Boolean)

  const commissions = Array.isArray(remote.commissions)
    ? remote.commissions.map(normalizeCommission).filter(Boolean)
    : (base.commissions || []).map(normalizeCommission).filter(Boolean)

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
    blocks,
    members,
    commissions,
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
