import { buildWhatsAppUrl } from './whatsapp.js'

export const SERVICE_CONTACT_TYPES = [
  { value: 'phone', label: 'Teléfono' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'link', label: 'Enlace web' },
  { value: 'text', label: 'Solo texto' },
]

export const EMPTY_SERVICE_CONTACT_ITEM = {
  id: '',
  type: 'phone',
  label: '',
  value: '',
  note: '',
  url: '',
}

export const EMPTY_SERVICE_CONTACT_SECTION = {
  enabled: false,
  title: 'Contacto',
  items: [],
}

function newContactItemId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `contact-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function cleanContactType(value) {
  const type = String(value || '').trim().toLowerCase()
  return SERVICE_CONTACT_TYPES.some((item) => item.value === type) ? type : 'text'
}

export function normalizeServiceContactItem(item) {
  const type = cleanContactType(item?.type)
  const label = String(item?.label || '').trim()
  const value = String(item?.value || '').trim()
  const note = String(item?.note || '').trim()
  const url = String(item?.url || '').trim()
  if (!label && !value && !note && !url) return null
  return {
    id: String(item?.id || '').trim() || newContactItemId(),
    type,
    label,
    value,
    note,
    url,
  }
}

export function normalizeServiceContactSection(section) {
  if (!section || typeof section !== 'object') {
    return { ...EMPTY_SERVICE_CONTACT_SECTION, items: [] }
  }
  const items = (Array.isArray(section.items) ? section.items : [])
    .map(normalizeServiceContactItem)
    .filter(Boolean)
  return {
    enabled: Boolean(section.enabled),
    title: String(section.title || '').trim() || 'Contacto',
    items,
  }
}

export function isServiceContactSectionVisible(section) {
  const normalized = normalizeServiceContactSection(section)
  return normalized.enabled && normalized.items.length > 0
}

export function getServiceContactItemHref(item) {
  const type = cleanContactType(item?.type)
  const value = String(item?.value || '').trim()
  const url = String(item?.url || '').trim()

  if (type === 'text') return ''
  if (type === 'link') {
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (value.startsWith('http://') || value.startsWith('https://')) return value
    return ''
  }
  if (type === 'email') {
    const email = value.replace(/^mailto:/i, '')
    return email ? `mailto:${email}` : ''
  }
  if (type === 'phone') {
    const digits = value.replace(/[^\d+]/g, '')
    return digits ? `tel:${digits}` : ''
  }
  if (type === 'whatsapp') {
    return buildWhatsAppUrl(value)
  }
  return ''
}

export function getServiceContactTypeLabel(type) {
  return SERVICE_CONTACT_TYPES.find((item) => item.value === type)?.label || 'Contacto'
}
