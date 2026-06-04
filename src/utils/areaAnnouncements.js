export const ANNOUNCEMENT_VARIANTS = ['info', 'warning', 'success', 'urgent']
export const ANNOUNCEMENT_DISPLAY_MODES = ['inline', 'floating']

export const EMPTY_AREA_ANNOUNCEMENT = {
  id: '',
  title: '',
  message: '',
  linkUrl: '',
  linkLabel: '',
  variant: 'info',
  dismissible: true,
}

export const EMPTY_ANNOUNCEMENTS_SECTION = {
  enabled: false,
  displayMode: 'inline',
  items: [],
}

function newAnnouncementId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `an-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function normalizeAnnouncementVariant(value) {
  const v = String(value || '').trim().toLowerCase()
  return ANNOUNCEMENT_VARIANTS.includes(v) ? v : 'info'
}

export function normalizeAnnouncementDisplayMode(value) {
  const m = String(value || '').trim().toLowerCase()
  return ANNOUNCEMENT_DISPLAY_MODES.includes(m) ? m : 'inline'
}

export function normalizeAnnouncementItem(item) {
  if (!item || typeof item !== 'object') return null
  const title = String(item.title || '').trim()
  const message = String(item.message || '').trim()
  const linkUrl = String(item.linkUrl || '').trim()
  const linkLabel = String(item.linkLabel || '').trim() || 'Más información'
  const variant = normalizeAnnouncementVariant(item.variant)
  const dismissible = item.dismissible !== false
  if (!title && !message) return null
  return {
    id: String(item.id || '').trim() || newAnnouncementId(),
    title,
    message,
    linkUrl,
    linkLabel,
    variant,
    dismissible,
  }
}

export function normalizeAnnouncementsSection(section) {
  if (!section || typeof section !== 'object') {
    return { ...EMPTY_ANNOUNCEMENTS_SECTION, items: [] }
  }
  const items = (Array.isArray(section.items) ? section.items : [])
    .map(normalizeAnnouncementItem)
    .filter(Boolean)
  return {
    enabled: Boolean(section.enabled),
    displayMode: normalizeAnnouncementDisplayMode(section.displayMode),
    items,
  }
}

export function isAnnouncementsSectionVisible(section) {
  const normalized = normalizeAnnouncementsSection(section)
  return normalized.enabled && normalized.items.some((item) => item.title || item.message)
}

export function announcementDismissStorageKey(areaSlug, announcementId) {
  return `mt-area-announce-dismiss:${String(areaSlug || '').trim()}:${String(announcementId || '').trim()}`
}
