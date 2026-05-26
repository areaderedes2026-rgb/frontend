export const EMPTY_SERVICE_GALLERY_IMAGE = {
  id: '',
  imageUrl: '',
  caption: '',
}

export const EMPTY_SERVICE_GALLERY_SECTION = {
  enabled: false,
  title: 'Galería de fotos',
  images: [],
}

function newGalleryImageId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `gal-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function normalizeServiceGalleryImage(item) {
  if (!item || typeof item !== 'object') return null
  const imageUrl = String(item.imageUrl || '').trim()
  const caption = String(item.caption || '').trim()
  if (!imageUrl && !caption) return null
  return {
    id: String(item.id || '').trim() || newGalleryImageId(),
    imageUrl,
    caption,
  }
}

export function normalizeServiceGallerySection(section) {
  if (!section || typeof section !== 'object') {
    return { ...EMPTY_SERVICE_GALLERY_SECTION, images: [] }
  }
  const images = (Array.isArray(section.images) ? section.images : [])
    .map(normalizeServiceGalleryImage)
    .filter(Boolean)
  return {
    enabled: Boolean(section.enabled),
    title: String(section.title || '').trim() || 'Galería de fotos',
    images,
  }
}

export function isServiceGallerySectionVisible(section) {
  const normalized = normalizeServiceGallerySection(section)
  return normalized.enabled && normalized.images.some((img) => img.imageUrl)
}
