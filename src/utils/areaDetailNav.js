import { isProceduresSectionVisible } from './areaProcedures.js'
import {
  isAnnouncementsSectionVisible,
  normalizeAnnouncementsSection,
} from './areaAnnouncements.js'

/**
 * Enlaces del índice lateral del detalle de área. Algunas áreas declaran bloques extra
 * (p. ej. escuelas en Cultura) vía `profile.schoolsSection`.
 * `showOffices`: hay oficinas publicadas (API) y se muestra la sección correspondiente.
 */
export function getAreaDetailNavLinks(profile, { showOffices = false } = {}) {
  if (!profile) return []
  const extras = []
  const announcements = profile.announcementsSection
  if (
    isAnnouncementsSectionVisible(announcements) &&
    normalizeAnnouncementsSection(announcements).displayMode === 'inline'
  ) {
    extras.push(['#anuncios-area', 'Anuncios'])
  }
  if (profile.schoolsSection?.items?.length > 0) {
    extras.push(['#escuelas-area', profile.schoolsSection.navLabel || 'Escuelas'])
  }
  if (isProceduresSectionVisible(profile.proceduresSection)) {
    extras.push([
      '#tramites-area',
      profile.proceduresSection.navLabel || 'Trámites',
    ])
  }
  const afterDirector = showOffices ? [['#oficinas-area', 'Oficinas']] : []
  const servicesLink =
    (profile.serviceBlocks || []).length > 0 ? [['#servicios-area', 'Servicios']] : []
  return [
    ['#director-area', 'Dirección'],
    ...afterDirector,
    ...servicesLink,
    ...extras,
    ['#ubicacion-area', 'Ubicación y contacto'],
  ]
}
