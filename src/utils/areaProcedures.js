export const EMPTY_AREA_PROCEDURE = {
  id: '',
  name: '',
  description: '',
  steps: [],
  linkUrl: '',
  linkLabel: '',
  contactPhone: '',
  contactEmail: '',
  contactNote: '',
}

export const EMPTY_PROCEDURES_SECTION = {
  enabled: false,
  navLabel: 'Trámites',
  eyebrow: '',
  title: '',
  intro: '',
  items: [],
}

function newProcedureId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `tram-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function parseProcedureStepsText(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\d+[\).\]]\s*/, '').trim())
    .filter(Boolean)
}

export function formatProcedureStepsText(steps) {
  if (!Array.isArray(steps)) return ''
  return steps.map((s) => String(s || '').trim()).filter(Boolean).join('\n')
}

export function normalizeProcedureItem(item) {
  if (!item || typeof item !== 'object') return null
  const name = String(item.name || '').trim()
  const description = String(item.description || '').trim()
  const steps = Array.isArray(item.steps)
    ? item.steps.map((s) => String(s || '').trim()).filter(Boolean)
    : parseProcedureStepsText(item.stepsText)
  const linkUrl = String(item.linkUrl || '').trim()
  const linkLabel = String(item.linkLabel || '').trim() || 'Ver trámite en línea'
  const contactPhone = String(item.contactPhone || '').trim()
  const contactEmail = String(item.contactEmail || '').trim()
  const contactNote = String(item.contactNote || '').trim()
  if (!name && !description && !steps.length && !linkUrl && !contactPhone && !contactEmail) {
    return null
  }
  return {
    id: String(item.id || '').trim() || newProcedureId(),
    name,
    description,
    steps,
    linkUrl,
    linkLabel,
    contactPhone,
    contactEmail,
    contactNote,
  }
}

export function normalizeProceduresSection(section) {
  if (!section || typeof section !== 'object') {
    return { ...EMPTY_PROCEDURES_SECTION, items: [] }
  }
  const items = (Array.isArray(section.items) ? section.items : [])
    .map(normalizeProcedureItem)
    .filter(Boolean)
  return {
    enabled: Boolean(section.enabled),
    navLabel: String(section.navLabel || '').trim() || 'Trámites',
    eyebrow: String(section.eyebrow || '').trim(),
    title: String(section.title || '').trim(),
    intro: String(section.intro || '').trim(),
    items,
  }
}

export function isProceduresSectionVisible(section) {
  const normalized = normalizeProceduresSection(section)
  return normalized.enabled && normalized.items.some((item) => item.name)
}
