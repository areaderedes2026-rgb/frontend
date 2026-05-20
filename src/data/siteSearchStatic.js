/**
 * Páginas fijas indexadas en el buscador (sin depender de la API).
 * `hints`: palabras clave en minúsculas para coincidencias flexibles.
 */
export const SITE_SEARCH_STATIC_ENTRIES = [
  { path: '/', title: 'Inicio', hints: ['inicio', 'home', 'principal', 'portada', 'municipalidad'] },
  { path: '/news', title: 'Noticias', hints: ['noticias', 'novedades', 'actualidad', 'prensa'] },
  { path: '/services', title: 'Servicios municipales', hints: ['servicios', 'tramites', 'trámites', 'gestiones'] },
  { path: '/eventos', title: 'Eventos y agenda', hints: ['eventos', 'agenda', 'actividades', 'calendario'] },
  { path: '/history', title: 'Historia y patrimonio', hints: ['historia', 'patrimonio', 'cultura', 'memoria'] },
  { path: '/turismo', title: 'Turismo', hints: ['turismo', 'puntos turisticos', 'lugares', 'destinos', 'visitar'] },
  { path: '/areas', title: 'Áreas municipales', hints: ['areas', 'áreas', 'secretarías', 'dependencias'] },
  { path: '/atencion-ciudadano', title: 'Atención al ciudadano', hints: ['atención', 'atencion', 'consultas', 'contacto', 'ciudadano'] },
  { path: '/gobierno/intendencia', title: 'Intendencia', hints: ['intendencia', 'intendente', 'intendenta', 'gobierno'] },
  { path: '/gobierno/legislador-este', title: 'Legislador por el Este', hints: ['legislador', 'este', 'diputado'] },
  { path: '/gobierno/concejo-deliberante', title: 'Concejo Deliberante', hints: ['concejo', 'deliberante', 'concejales'] },
  { path: '/gobierno/oferta-academica', title: 'Oferta académica', hints: ['oferta', 'academica', 'académica', 'educación', 'escuelas'] },
]

export function filterStaticSiteSearch(query) {
  const ql = String(query || '')
    .trim()
    .toLowerCase()
  if (ql.length < 2) return []
  return SITE_SEARCH_STATIC_ENTRIES.filter((entry) => {
    if (entry.title.toLowerCase().includes(ql)) return true
    return (entry.hints || []).some((h) => h.includes(ql) || ql.includes(h))
  }).map((entry) => ({
    kind: 'page',
    id: entry.path,
    title: entry.title,
    subtitle: 'Sitio municipal',
    path: entry.path,
  }))
}
