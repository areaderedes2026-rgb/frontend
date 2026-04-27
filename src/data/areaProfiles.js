import { getAreaBySlug } from './areas.js'

const DEFAULT_MAP_EMBED =
  'https://www.openstreetmap.org/export/embed.html?bbox=-65.335%2C-26.275%2C-65.236%2C-26.198&layer=mapnik&marker=-26.2366%2C-65.2852'

const AREA_PROFILES = {
  'asuntos-sociales': {
    heroTag: 'Gestión social integral',
    mission:
      'Acompañamos a familias, niñez, juventudes y personas mayores con programas de contención, inclusión y desarrollo comunitario.',
    director: {
      name: 'Lic. Mariana Albornoz',
      role: 'Directora de Asuntos Sociales',
      bio: 'Coordina los equipos territoriales y articula acciones con salud, educación y organizaciones comunitarias para fortalecer la red de acompañamiento local.',
      photoUrl:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80',
      email: 'asuntossociales@trancas.gob.ar',
      phone: '+54 381 400-1201',
      officeHours: 'Lunes a viernes, 07:30 a 13:30',
    },
    highlights: [
      { label: 'Programas activos', value: '12' },
      { label: 'Equipos territoriales', value: '6' },
      { label: 'Cobertura barrial', value: '100%' },
    ],
    serviceBlocks: [
      {
        title: 'Acompañamiento familiar',
        description:
          'Evaluación social, orientación y seguimiento de situaciones de vulnerabilidad para garantizar acceso a derechos.',
        mode: 'Presencial y territorial',
      },
      {
        title: 'Niñez y adolescencia',
        description:
          'Espacios de protección, intervenciones tempranas y trabajo conjunto con instituciones educativas y de salud.',
        mode: 'Interdisciplinario',
      },
      {
        title: 'Personas mayores',
        description:
          'Talleres, actividades recreativas y dispositivos de apoyo para una vejez activa e integrada.',
        mode: 'Programas comunitarios',
      },
      {
        title: 'Asistencia inmediata',
        description:
          'Respuesta social ante contingencias con derivación, contención y articulación con otras áreas municipales.',
        mode: 'Atención prioritaria',
      },
    ],
    initiatives: [
      {
        title: 'Red de Primera Escucha',
        description:
          'Puntos de atención distribuidos por zonas para detectar necesidades sociales y orientar de forma temprana.',
      },
      {
        title: 'Comunidad Acompaña',
        description:
          'Trabajo conjunto con centros vecinales y organizaciones para reforzar talleres, apoyo escolar y actividades comunitarias.',
      },
      {
        title: 'Agenda de cuidados',
        description:
          'Acciones para promover el autocuidado, hábitos saludables y prevención de situaciones de riesgo social.',
      },
    ],
    contactCards: [
      {
        label: 'Atención general',
        value: '+54 381 400-1201',
        note: 'Llamadas y WhatsApp institucional',
      },
      {
        label: 'Correo oficial',
        value: 'asuntossociales@trancas.gob.ar',
        note: 'Respuesta en 24 a 48 horas hábiles',
      },
      {
        label: 'Guardia social',
        value: '+54 381 400-1299',
        note: 'Prioridades y contingencias',
      },
    ],
    location: {
      address: 'Centro Cívico Municipal, Planta Baja, Trancas, Tucumán',
      references: 'Ingreso por hall principal, sector atención comunitaria.',
      mapEmbedUrl: DEFAULT_MAP_EMBED,
      mapExternalUrl:
        'https://www.openstreetmap.org/?mlat=-26.2366&mlon=-65.2852#map=15/-26.2366/-65.2852',
    },
    notices: [
      'Las entrevistas sociales se realizan con turno previo.',
      'La documentación requerida puede variar según el programa.',
      'Para urgencias, comunicarse con la guardia social municipal.',
    ],
  },
}

export function createDefaultProfile(area) {
  return {
    heroTag: 'Gestión municipal',
    mission: area.description,
    director: {
      name: 'Autoridad a confirmar',
      role: `Dirección de ${area.title}`,
      bio: 'Estamos consolidando el perfil completo de esta área para incluir programas, trámites y novedades.',
      photoUrl:
        'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=900&q=80',
      email: `${area.slug.replace(/-/g, '')}@trancas.gob.ar`,
      phone: '+54 381 400-1200',
      officeHours: 'Lunes a viernes, 08:00 a 13:00',
    },
    highlights: [
      { label: 'Estado de carga', value: 'En expansión' },
      { label: 'Canales activos', value: '2' },
      { label: 'Atención', value: 'Municipal' },
    ],
    serviceBlocks: [
      {
        title: `Servicios de ${area.title}`,
        description:
          'Próximamente publicaremos el detalle completo de prestaciones, requisitos y circuitos de atención.',
        mode: 'En actualización',
      },
      {
        title: 'Orientación ciudadana',
        description:
          'Canal inicial para consultas, derivaciones y seguimiento de solicitudes vinculadas al área.',
        mode: 'Atención al vecino',
      },
    ],
    initiatives: [
      {
        title: 'Hoja de ruta del área',
        description:
          'Estamos organizando objetivos, proyectos y cronograma para que toda la información esté disponible en esta sección.',
      },
    ],
    contactCards: [
      {
        label: 'Mesa de entradas',
        value: '+54 381 400-1200',
        note: 'Consultas generales',
      },
      {
        label: 'Correo institucional',
        value: `${area.slug.replace(/-/g, '')}@trancas.gob.ar`,
        note: 'Canal administrativo',
      },
    ],
    location: {
      address: 'Palacio Municipal de Trancas, Tucumán',
      references: 'Atención presencial en el edificio central.',
      mapEmbedUrl: DEFAULT_MAP_EMBED,
      mapExternalUrl:
        'https://www.openstreetmap.org/?mlat=-26.2366&mlon=-65.2852#map=15/-26.2366/-65.2852',
    },
    notices: [
      'Esta área está en proceso de carga detallada de contenidos.',
      'Mientras tanto, podés comunicarte por los canales oficiales.',
    ],
  }
}

export function mergeAreaProfile(baseProfile, custom = {}) {
  if (!baseProfile) return null
  return {
    ...baseProfile,
    ...custom,
    area: baseProfile.area,
    director: { ...(baseProfile.director || {}), ...(custom.director || {}) },
    location: { ...(baseProfile.location || {}), ...(custom.location || {}) },
    highlights: custom.highlights || baseProfile.highlights || [],
    serviceBlocks: custom.serviceBlocks || baseProfile.serviceBlocks || [],
    initiatives: custom.initiatives || baseProfile.initiatives || [],
    contactCards: custom.contactCards || baseProfile.contactCards || [],
    notices: custom.notices || baseProfile.notices || [],
  }
}

export function getAreaProfileBySlug(slug, areaOverride = null) {
  const area =
    areaOverride ||
    getAreaBySlug(slug) || {
      slug,
      title: String(slug || '').replace(/-/g, ' '),
      description: 'Área municipal',
      coverImage:
        'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?auto=format&fit=crop&w=1200&q=80',
    }
  if (!area) return null
  const fallback = createDefaultProfile(area)
  const base = { area, ...fallback }
  const custom = AREA_PROFILES[slug] || {}
  return mergeAreaProfile(base, custom)
}
