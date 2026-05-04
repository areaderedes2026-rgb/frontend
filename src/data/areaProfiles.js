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
  cultura: {
    heroTag: 'Identidad, arte y educación popular',
    mission:
      'Promovemos el acceso a la cultura con talleres, festivales y espacios de encuentro para todas las edades, articulando con escuelas y organizaciones locales.',
    director: {
      name: 'Lic. Carla Mendoza',
      role: 'Directora de Cultura',
      bio: 'Coordina la agenda cultural municipal, las escuelas artísticas y la difusión de proyectos comunitarios con enfoque federal e inclusivo.',
      photoUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
      email: 'cultura@trancas.gob.ar',
      phone: '+54 381 400-1310',
      officeHours: 'Lunes a viernes, 08:00 a 14:00',
    },
    highlights: [
      { label: 'Escuelas activas', value: '4' },
      { label: 'Talleres anuales', value: '35+' },
      { label: 'Participación', value: 'Todo público' },
    ],
    serviceBlocks: [
      {
        title: 'Agenda cultural y eventos',
        description:
          'Festivales, muestras, peñas y actividades en espacios públicos con información centralizada y reservas cuando corresponda.',
        mode: 'Comunicación y producción',
      },
      {
        title: 'Patrimonio y memoria',
        description:
          'Rescate de historias locales, archivo audiovisual comunitario y apoyo a iniciativas de valor patrimonial.',
        mode: 'Territorio',
      },
      {
        title: 'Biblioteca y lectura',
        description:
          'Préstamos, clubes de lectura y actividades para infancias y adultos en la red municipal de bibliotecas.',
        mode: 'Presencial',
      },
      {
        title: 'Apoyo a artistas locales',
        description:
          'Convocatorias, microbecas y articulación con instituciones para visibilizar propuestas de creadores y colectivos.',
        mode: 'Convocatorias',
      },
    ],
    initiatives: [
      {
        title: 'Cultura en los barrios',
        description:
          'Circuito itinerante de talleres abiertos y espectáculos en plazas y centros vecinales.',
      },
      {
        title: 'Muestra anual de fin de año',
        description:
          'Integración de las escuelas municipales en una gala comunitaria con danza, música y artes visuales.',
      },
      {
        title: 'Laboratorio audiovisual',
        description:
          'Espacio de formación en guion, cámara y edición para jóvenes con producción de piezas sobre la vida en el departamento.',
      },
    ],
    contactCards: [
      {
        label: 'Secretaría de Cultura',
        value: '+54 381 400-1310',
        note: 'Consultas y talleres',
      },
      {
        label: 'Correo',
        value: 'cultura@trancas.gob.ar',
        note: 'Propuestas y agenda',
      },
      {
        label: 'Redes',
        value: '@CulturaTrancas',
        note: 'Novedades y convocatorias',
      },
    ],
    location: {
      address: 'Casa de la Cultura, Av. principal y Sarmiento, Trancas',
      references: 'Planta alta: dirección y administración. Planta baja: talleres y sala de ensayo.',
      mapEmbedUrl: DEFAULT_MAP_EMBED,
      mapExternalUrl:
        'https://www.openstreetmap.org/?mlat=-26.2366&mlon=-65.2852#map=15/-26.2366/-65.2852',
    },
    notices: [
      'Las inscripciones a escuelas municipales se publican al inicio de cada cuatrimestre.',
      'Consultá cupos y requisitos en la secretaría o por correo oficial.',
    ],
    schoolsSection: {
      navLabel: 'Escuelas',
      eyebrow: 'Escuelas municipales',
      title: 'Escuelas de formación artística y cultural',
      intro:
        'Espacios gratuitos o de bajo costo para aprender música, danza, teatro y artes plásticas con docentes de la región. Las vacantes y cronogramas se confirman cada período en la secretaría del área.',
      items: [
        {
          id: 'escuela-musica',
          name: 'Escuela Municipal de Música',
          discipline: 'Música',
          schedule: 'Lunes y miércoles, 17:00 a 20:00 · Nivel inicial e intermedio',
          venue: 'Casa de la Cultura — Salas 2 y 3',
          description:
            'Lenguaje musical, ensamble y práctica instrumental grupal. Se prioriza repertorio latinoamericano y composición comunitaria.',
          imageUrl:
            'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80',
        },
        {
          id: 'escuela-danza',
          name: 'Escuela Municipal de Danza',
          discipline: 'Danza',
          schedule: 'Martes y jueves, 16:30 a 19:30 · Infancias y juventudes',
          venue: 'Anexo polideportivo — Sala multiuso',
          description:
            'Técnicas contemporáneas y folclore con mirada inclusiva. Cierre de año con muestra abierta a la comunidad.',
          imageUrl:
            'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?auto=format&fit=crop&w=1200&q=80',
        },
        {
          id: 'escuela-teatro',
          name: 'Escuela Municipal de Teatro',
          discipline: 'Teatro',
          schedule: 'Viernes, 18:00 a 21:00 · Adolescentes y adultos',
          venue: 'Casa de la Cultura — Sala de ensayo',
          description:
            'Voz, cuerpo, improvisación y dramaturgia breve. Se articula con la agenda de ferias y encuentros culturales del municipio.',
          imageUrl:
            'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80',
        },
        {
          id: 'taller-artes-visuales',
          name: 'Taller integral de artes visuales',
          discipline: 'Artes visuales',
          schedule: 'Sábados, 10:00 a 13:00',
          venue: 'Casa de la Cultura — Taller sur',
          description:
            'Dibujo, pintura y serigrafía aplicada a cartelería comunitaria y murales participativos en espacios públicos.',
          imageUrl:
            'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
        },
      ],
    },
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
    schoolsSection:
      'schoolsSection' in custom
        ? custom.schoolsSection
        : baseProfile.schoolsSection ?? null,
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
