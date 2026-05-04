/**
 * Enlaces del índice lateral del detalle de área. Algunas áreas declaran bloques extra
 * (p. ej. escuelas en Cultura) vía `profile.schoolsSection`.
 */
export function getAreaDetailNavLinks(profile) {
  if (!profile) return []
  const extras =
    profile.schoolsSection?.items?.length > 0
      ? [['#escuelas-area', profile.schoolsSection.navLabel || 'Escuelas']]
      : []
  return [
    ['#director-area', 'Dirección'],
    ['#servicios-area', 'Servicios'],
    ['#iniciativas-area', 'Iniciativas'],
    ...extras,
    ['#ubicacion-area', 'Ubicación y contacto'],
  ]
}
