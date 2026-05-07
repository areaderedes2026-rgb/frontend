export const DEFAULT_LEGISLADOR_ESTE_CONTENT = {
  heroEyebrow: 'Gobierno municipal',
  heroTitle: 'Legislador por el Este',
  heroSubtitle:
    'Información institucional del legislador por el Este y su rol como representante de la región en la legislatura.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  legislatorName: 'Nombre del Legislador',
  legislatorRole: 'Legislador por la Sección Electoral Este',
  legislatorBio:
    'Representa a los municipios de la región Este en la Legislatura, articulando proyectos, gestiones y reclamos de los vecinos para impulsar el desarrollo local.',
  legislatorPhotoUrl:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  contactEmail: 'legisladoreste@trancas.gob.ar',
  contactPhone: '+54 381 4XX-XXXX',
  officeHours: 'Lunes a viernes, 09:00 a 13:00',
}

export function mergeLegisladorEsteContent(base, remote) {
  if (!remote || typeof remote !== 'object') return { ...base }
  return {
    ...base,
    heroEyebrow: String(remote.heroEyebrow || base.heroEyebrow || ''),
    heroTitle: String(remote.heroTitle || base.heroTitle || ''),
    heroSubtitle: String(remote.heroSubtitle || base.heroSubtitle || ''),
    heroImageUrl: String(remote.heroImageUrl || base.heroImageUrl || ''),
    legislatorName: String(remote.legislatorName || base.legislatorName || ''),
    legislatorRole: String(remote.legislatorRole || base.legislatorRole || ''),
    legislatorBio: String(remote.legislatorBio || base.legislatorBio || ''),
    legislatorPhotoUrl: String(
      remote.legislatorPhotoUrl || base.legislatorPhotoUrl || '',
    ),
    contactEmail: String(remote.contactEmail || base.contactEmail || ''),
    contactPhone: String(remote.contactPhone || base.contactPhone || ''),
    officeHours: String(remote.officeHours || base.officeHours || ''),
  }
}
