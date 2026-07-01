export const EMPTY_HISTORY_STORY_IMAGE = {
  id: '',
  imageUrl: '',
  caption: '',
}

export const EMPTY_HISTORY_STORY_SECTION = {
  id: '',
  title: '',
  subtitle: '',
  paragraphs: [''],
  images: [],
  sortOrder: 0,
}

function newStoryImageId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `hist-img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeImage(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const imageUrl = String(raw.imageUrl || raw.url || '').trim()
  const caption = String(raw.caption || '').trim()
  if (!imageUrl && !caption) return null
  return {
    id: String(raw.id || '').trim() || newStoryImageId(),
    imageUrl,
    caption,
    sortOrder: Number.isFinite(Number(raw.sortOrder))
      ? Math.max(Number(raw.sortOrder), 0)
      : (index + 1) * 10,
  }
}

function normalizeParagraphs(raw) {
  if (!Array.isArray(raw)) {
    const single = String(raw || '').trim()
    return single ? [single] : []
  }
  return raw.map((p) => String(p || '').trim()).filter(Boolean)
}

export function normalizeHistoryStorySection(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const title = String(raw.title || '').trim()
  if (!title) return null
  const id = String(raw.id || '').trim() || `story-${index + 1}`
  const paragraphs = normalizeParagraphs(raw.paragraphs)
  const images = Array.isArray(raw.images)
    ? raw.images.map((img, i) => normalizeImage(img, i)).filter(Boolean)
    : []
  images.sort((a, b) => a.sortOrder - b.sortOrder)
  return {
    id,
    title,
    subtitle: String(raw.subtitle || '').trim(),
    paragraphs,
    images,
    sortOrder: Number.isFinite(Number(raw.sortOrder))
      ? Math.max(Number(raw.sortOrder), 0)
      : (index + 1) * 10,
  }
}

export function normalizeHistoryStorySections(raw, fallbackIntroStory = '') {
  if (Array.isArray(raw) && raw.length > 0) {
    const sections = raw
      .map((item, index) => normalizeHistoryStorySection(item, index))
      .filter(Boolean)
    sections.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, 'es'))
    return sections
  }

  const intro = String(fallbackIntroStory || '').trim()
  if (!intro) return []

  return [
    normalizeHistoryStorySection(
      {
        id: 'story-origenes',
        title: 'Orígenes de Trancas',
        subtitle: 'Memoria fundacional del territorio',
        paragraphs: [intro],
        images: [],
        sortOrder: 10,
      },
      0,
    ),
  ].filter(Boolean)
}

export function storySectionAnchorId(section) {
  const id = String(section?.id || '').trim()
  return id ? `historia-seccion-${id}` : 'historia-secciones'
}

export function storySectionsMatchQuery(sections, query) {
  const q = String(query || '')
    .trim()
    .toLowerCase()
  if (!q) return sections
  return (sections || []).filter((section) => {
    const hay = [
      section.title,
      section.subtitle,
      ...(section.paragraphs || []),
      ...(section.images || []).map((img) => img.caption),
    ]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}
