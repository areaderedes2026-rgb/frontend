function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function cleanSortOrder(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function normalizeLegislatorCommission(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const name = String(raw.name || '').trim()
  if (!name) return null
  return {
    id: String(raw.id || '').trim() || makeId('leg-com'),
    sortOrder: cleanSortOrder(raw.sortOrder, (index + 1) * 10),
    number: String(raw.number || '').trim() || String(index + 1),
    name,
    roleLabel: String(raw.roleLabel || '').trim() || 'Miembro',
    roleHolder: String(raw.roleHolder || '').trim(),
    competencies: String(raw.competencies || '').trim(),
  }
}

export function normalizeLegislatorCommissions(raw) {
  if (!raw || typeof raw !== 'object') {
    return { enabled: true, title: '', subtitle: '', items: [] }
  }
  const items = Array.isArray(raw.items)
    ? raw.items.map((item, i) => normalizeLegislatorCommission(item, i)).filter(Boolean)
    : []
  items.sort((a, b) => a.sortOrder - b.sortOrder)
  return {
    enabled: raw.enabled !== false,
    title:
      String(raw.title || '').trim() || 'Comisiones que integra el legislador',
    subtitle: String(raw.subtitle || '').trim(),
    items,
  }
}

export const DEFAULT_LEGISLATOR_COMMISSIONS = {
  enabled: true,
  title: 'Comisiones que integra el legislador',
  subtitle:
    'Integración en comisiones de trabajo de la Legislatura y competencias según reglamento.',
  items: [
    {
      id: 'leg-com-cultura',
      sortOrder: 10,
      number: '1',
      name: 'COMISIÓN DE CULTURA',
      roleLabel: 'PRESIDENTE',
      roleHolder: 'D. Raúl Roberto Moreno.',
      competencies:
        'Todo lo concerniente a la actividad cultural, el folklore y expresiones artísticas en sus diferentes manifestaciones, construcciones, reparaciones y obras complementarias de edificios destinados al funcionamiento de estas actividades. Res. 86/2019 incorpora Comisión.',
    },
    {
      id: 'leg-com-comunales',
      sortOrder: 20,
      number: '2',
      name: 'COMISIÓN DE ASUNTOS COMUNALES Y MUNICIPALES',
      roleLabel: 'PRESIDENTE',
      roleHolder: 'D. Raúl Roberto Moreno',
      competencies:
        'Tendrá a su cargo todo asunto relacionado con la situación institucional de dichos organismos y en su relación con los diferentes poderes del Estado Provincial, incluyendo la normativa sobre el funcionamiento y financiamiento de municipios y comunas rurales.',
    },
    {
      id: 'leg-com-economia',
      sortOrder: 30,
      number: '3',
      name: 'COMISIÓN DE ECONOMÍA Y PRODUCCIÓN',
      roleLabel: 'SECRETARIO',
      roleHolder: 'D. Raúl Roberto Moreno.',
      competencies:
        'Promoción, orientación y realización de la política industrial; planes de desarrollo; fomento y radicación de industrias, agricultura, ganadería, comercio, minas; marcas y señales. Colonización. Policía sanitaria animal y vegetal, bosques, caza, pesca, régimen de los ríos y riego.',
    },
    {
      id: 'leg-com-juicio',
      sortOrder: 40,
      number: '4',
      name: 'COMISIÓN DE JUICIO POLÍTICO',
      roleLabel: 'MIEMBRO',
      roleHolder: '',
      competencies:
        'La materia reglada por el artículo 47 y concordantes de la Constitución.',
    },
  ],
}

export function sortLegislatorCommissions(items) {
  return [...(items || [])].sort((a, b) => a.sortOrder - b.sortOrder)
}
