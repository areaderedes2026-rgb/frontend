/**
 * Enlaces del índice lateral del detalle de área. Algunas áreas declaran bloques extra
 * (p. ej. escuelas en Cultura) vía `profile.schoolsSection`.
 * `showOffices`: hay oficinas publicadas (API) y se muestra la sección correspondiente.
 */
export function getAreaDetailNavLinks(profile, { showOffices = false } = {}) {
  if (!profile) return []
  const extras =
    profile.schoolsSection?.items?.length > 0
      ? [['#escuelas-area', profile.schoolsSection.navLabel || 'Escuelas']]
      : []
  const afterDirector = showOffices ? [['#oficinas-area', 'Oficinas']] : []
  return [
    ['#director-area', 'Dirección'],
    ...afterDirector,
    ['#servicios-area', 'Servicios'],
    ['#iniciativas-area', 'Iniciativas'],
    ...extras,
    ['#ubicacion-area', 'Ubicación y contacto'],
  ]
}
