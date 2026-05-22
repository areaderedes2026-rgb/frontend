/**
 * Anclas de navegación de la página pública del Concejo Deliberante.
 */
export function buildConcejoNavSections({ hasPresidencia = false } = {}) {
  const items = [
    { id: 'intro-concejo', label: 'Órgano legislativo' },
    { id: 'funciones-principales', label: 'Funciones' },
  ]
  if (hasPresidencia) {
    items.push({ id: 'presidencia', label: 'Presidencia' })
  }
  items.push(
    { id: 'concejales', label: 'Concejales' },
    { id: 'comisiones-trabajo', label: 'Comisiones' },
    { id: 'contacto-concejo', label: 'Contacto' },
  )
  return items
}
