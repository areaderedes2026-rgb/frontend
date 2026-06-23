import {
  DEFAULT_LEGISLATOR_COMMISSIONS,
  normalizeLegislatorCommissions,
} from './legisladorCommissionsContent.js'
import { DEFAULT_LEGISLATOR_LAWS, normalizeLegislatorLaws } from './legisladorLawsContent.js'
import {
  DEFAULT_PRESENTED_PROJECTS,
  normalizePresentedProjects,
} from './legisladorProjectsContent.js'

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

export const DEFAULT_LEGISLADOR_ESTE_CONTENT = {
  heroEyebrow: 'Gobierno municipal',
  heroTitle: 'Legislador por el Este',
  heroSubtitle:
    'Información institucional del legislador por el Este y su rol como representante de la región en la legislatura.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  legislatorName: 'D. Raúl Roberto Moreno',
  legislatorRole: 'Legislador por la Sección Electoral Este',
  legislatorBio:
    'Representa a los municipios de la región Este en la Legislatura, articulando proyectos, gestiones y reclamos de los vecinos para impulsar el desarrollo local.',
  legislatorPhotoUrl:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  contactEmail: 'legisladoreste@trancas.gob.ar',
  contactPhone: '+54 381 4XX-XXXX',
  officeHours: 'Lunes a viernes, 09:00 a 13:00',
  showLegislatorPhoto: true,
  showLegislatorRole: true,
  showLegislatorBio: true,
  showContactPanel: true,
  showContactEmail: true,
  showContactPhone: true,
  showOfficeHours: true,
  showContactNote: true,
  presentedProjects: { ...DEFAULT_PRESENTED_PROJECTS },
  commissions: { ...DEFAULT_LEGISLATOR_COMMISSIONS },
  laws: { ...DEFAULT_LEGISLATOR_LAWS },
  showPresentedProjects: true,
  showCommissions: true,
  showLaws: true,
}

export function mergeLegisladorEsteContent(base, remote) {
  if (!remote || typeof remote !== 'object') return { ...base }

  const projectsRemote =
    remote.presentedProjects && typeof remote.presentedProjects === 'object'
      ? remote.presentedProjects
      : null
  const commissionsRemote =
    remote.commissions && typeof remote.commissions === 'object' ? remote.commissions : null
  const lawsRemote = remote.laws && typeof remote.laws === 'object' ? remote.laws : null

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
    showLegislatorPhoto: toBoolFlag(
      remote.showLegislatorPhoto,
      base.showLegislatorPhoto,
    ),
    showLegislatorRole: toBoolFlag(
      remote.showLegislatorRole,
      base.showLegislatorRole,
    ),
    showLegislatorBio: toBoolFlag(remote.showLegislatorBio, base.showLegislatorBio),
    showContactPanel: toBoolFlag(remote.showContactPanel, base.showContactPanel),
    showContactEmail: toBoolFlag(remote.showContactEmail, base.showContactEmail),
    showContactPhone: toBoolFlag(remote.showContactPhone, base.showContactPhone),
    showOfficeHours: toBoolFlag(remote.showOfficeHours, base.showOfficeHours),
    showContactNote: toBoolFlag(remote.showContactNote, base.showContactNote),
    presentedProjects: projectsRemote
      ? normalizePresentedProjects(projectsRemote)
      : normalizePresentedProjects(base.presentedProjects),
    commissions: commissionsRemote
      ? normalizeLegislatorCommissions(commissionsRemote)
      : normalizeLegislatorCommissions(base.commissions),
    laws: lawsRemote
      ? normalizeLegislatorLaws(lawsRemote)
      : normalizeLegislatorLaws(base.laws),
    showPresentedProjects: toBoolFlag(
      remote.showPresentedProjects,
      base.showPresentedProjects,
    ),
    showCommissions: toBoolFlag(remote.showCommissions, base.showCommissions),
    showLaws: toBoolFlag(remote.showLaws, base.showLaws),
  }
}
