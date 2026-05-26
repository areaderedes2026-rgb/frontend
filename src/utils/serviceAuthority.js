export const EMPTY_SERVICE_AUTHORITY_PERSON = {
  id: '',
  name: '',
  role: '',
  bio: '',
  photoUrl: '',
}

export const EMPTY_SERVICE_AUTHORITY_SECTION = {
  enabled: false,
  title: 'Autoridades a cargo',
  intro: '',
  people: [],
}

function newAuthorityPersonId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `auth-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function normalizeServiceAuthorityPerson(item) {
  if (!item || typeof item !== 'object') return null
  const name = String(item.name || '').trim()
  const role = String(item.role || '').trim()
  const bio = String(item.bio || '').trim()
  const photoUrl = String(item.photoUrl || '').trim()
  if (!name && !role && !bio && !photoUrl) return null
  return {
    id: String(item.id || '').trim() || newAuthorityPersonId(),
    name,
    role,
    bio,
    photoUrl,
  }
}

export function normalizeServiceAuthoritySection(section) {
  if (!section || typeof section !== 'object') {
    return { ...EMPTY_SERVICE_AUTHORITY_SECTION, people: [] }
  }
  const people = (Array.isArray(section.people) ? section.people : [])
    .map(normalizeServiceAuthorityPerson)
    .filter(Boolean)
  return {
    enabled: Boolean(section.enabled),
    title: String(section.title || '').trim() || 'Autoridades a cargo',
    intro: String(section.intro || '').trim(),
    people,
  }
}

export function isServiceAuthoritySectionVisible(section) {
  const normalized = normalizeServiceAuthoritySection(section)
  return normalized.enabled && normalized.people.length > 0
}
