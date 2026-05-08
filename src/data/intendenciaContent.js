function toBoolFlag(value, fallback = true) {
  if (value === undefined || value === null) return fallback
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase()
    if (v === '0' || v === 'false' || v === 'no') return false
    if (v === '1' || v === 'true' || v === 'yes') return true
  }
  return Boolean(value)
}

export const DEFAULT_INTENDENCIA_CONTENT = {
  heroEyebrow: 'Gobierno municipal',
  heroTitle: 'Intendencia',
  heroSubtitle:
    'Información institucional del despacho de intendencia y su rol en la coordinación de la gestión municipal.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80',
  mayorName: 'Roberto Moreno',
  mayorRole: 'Intendente Municipal de Trancas',
  mayorBio:
    'Conduce la gestión municipal con enfoque territorial, cercanía con los vecinos y coordinación permanente con las áreas para ejecutar políticas públicas de impacto local.',
  mayorPhotoUrl:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80',
  contactEmail: 'intendencia@trancas.gob.ar',
  contactPhone: '+54 381 4XX-XXXX',
  officeHours: 'Lunes a viernes, 08:00 a 13:00',
  showMayorPhoto: true,
  showMayorRole: true,
  showMayorBio: true,
  showContactPanel: true,
  showContactEmail: true,
  showContactPhone: true,
  showOfficeHours: true,
  showContactNote: true,
  showManagementAxes: true,
}

export function mergeIntendenciaContent(base, remote) {
  if (!remote || typeof remote !== 'object') return { ...base }
  return {
    ...base,
    heroEyebrow: String(remote.heroEyebrow || base.heroEyebrow || ''),
    heroTitle: String(remote.heroTitle || base.heroTitle || ''),
    heroSubtitle: String(remote.heroSubtitle || base.heroSubtitle || ''),
    heroImageUrl: String(remote.heroImageUrl || base.heroImageUrl || ''),
    mayorName: String(remote.mayorName || base.mayorName || ''),
    mayorRole: String(remote.mayorRole || base.mayorRole || ''),
    mayorBio: String(remote.mayorBio || base.mayorBio || ''),
    mayorPhotoUrl: String(remote.mayorPhotoUrl || base.mayorPhotoUrl || ''),
    contactEmail: String(remote.contactEmail || base.contactEmail || ''),
    contactPhone: String(remote.contactPhone || base.contactPhone || ''),
    officeHours: String(remote.officeHours || base.officeHours || ''),
    showMayorPhoto: toBoolFlag(remote.showMayorPhoto, base.showMayorPhoto),
    showMayorRole: toBoolFlag(remote.showMayorRole, base.showMayorRole),
    showMayorBio: toBoolFlag(remote.showMayorBio, base.showMayorBio),
    showContactPanel: toBoolFlag(remote.showContactPanel, base.showContactPanel),
    showContactEmail: toBoolFlag(remote.showContactEmail, base.showContactEmail),
    showContactPhone: toBoolFlag(remote.showContactPhone, base.showContactPhone),
    showOfficeHours: toBoolFlag(remote.showOfficeHours, base.showOfficeHours),
    showContactNote: toBoolFlag(remote.showContactNote, base.showContactNote),
    showManagementAxes: toBoolFlag(remote.showManagementAxes, base.showManagementAxes),
  }
}
