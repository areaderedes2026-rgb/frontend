/**
 * Áreas municipales — una sola fuente de verdad para menú y rutas.
 * `coverImage`: imagen de ejemplo (reemplazar por fotos propias en producción).
 */
export const MUNICIPAL_AREAS = [
  {
    slug: 'asuntos-sociales',
    title: 'Asuntos Sociales',
    description:
      'Programas y acompañamiento a familias y grupos vulnerables de la comunidad.',
    coverImage:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'deportes',
    title: 'Deportes',
    description:
      'Instalaciones deportivas, escuelas y actividades para todas las edades.',
    coverImage:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'medio-ambiente',
    title: 'Medio ambiente',
    description:
      'Gestión ambiental local, saneamiento y concientización.',
    coverImage:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'medio-comunicacion',
    title: 'Medio de comunicación',
    description:
      'Difusión de información oficial y canales de la municipalidad.',
    coverImage:
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'obras-publicas',
    title: 'Obras públicas',
    description:
      'Infraestructura, mantenimiento de calles y espacios públicos.',
    coverImage:
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'punto-verde',
    title: 'Punto Verde',
    description:
      'Recepción de residuos reciclables y campañas de recolección.',
    coverImage:
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'cultura',
    title: 'Cultura',
    description:
      'Talleres, eventos y espacios para el desarrollo cultural local.',
    coverImage:
      'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80',
  },
]

export function getAreaBySlug(slug) {
  return MUNICIPAL_AREAS.find((a) => a.slug === slug) ?? null
}
