import { ROUTES } from '../utils/constants.js'

export const DEFAULT_MUNICIPAL_SERVICES = [
  {
    id: 1,
    slug: 'partidas',
    title: 'Solicitud de partidas',
    category: 'Documentación',
    mode: 'Presencial y web',
    eta: '48 hs hábiles',
    summary:
      'Gestión de partidas de nacimiento, matrimonio y defunción para vecinos y trámites administrativos.',
    docs: ['DNI vigente', 'Datos registrales', 'Formulario de solicitud'],
    linkHref: ROUTES.atencionCiudadano,
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 2,
    slug: 'habilitacion-comercial',
    title: 'Habilitación comercial',
    category: 'Comunidad',
    mode: 'Turno previo',
    eta: '5 a 10 días',
    summary:
      'Alta o renovación de habilitaciones para comercios, con revisión de requisitos y estado de expediente.',
    docs: ['DNI del titular', 'Constancia fiscal', 'Plano o croquis del local'],
    linkHref: ROUTES.atencionCiudadano,
    sortOrder: 20,
    isActive: true,
  },
  {
    id: 3,
    slug: 'reclamo-urbano',
    title: 'Reclamos de servicios urbanos',
    category: 'Obras',
    mode: 'Web / Mesa de entrada',
    eta: 'Respuesta inicial en 72 hs',
    summary:
      'Canal para luminarias, bacheo, limpieza y mantenimiento de espacios públicos con seguimiento interno.',
    docs: ['DNI', 'Dirección exacta', 'Referencia o foto del incidente'],
    linkHref: ROUTES.atencionCiudadano,
    sortOrder: 30,
    isActive: true,
  },
  {
    id: 4,
    slug: 'apoyo-social',
    title: 'Programas de asistencia social',
    category: 'Comunidad',
    mode: 'Entrevista presencial',
    eta: 'Según evaluación',
    summary:
      'Orientación y derivación a programas de apoyo familiar, becas y acompañamiento comunitario.',
    docs: ['DNI del grupo familiar', 'Comprobante de domicilio', 'Documentación respaldatoria'],
    linkHref: ROUTES.atencionCiudadano,
    sortOrder: 40,
    isActive: true,
  },
  {
    id: 5,
    slug: 'turnos-salud',
    title: 'Turnos de salud municipal',
    category: 'Salud',
    mode: 'Telefónico y presencial',
    eta: 'Asignación diaria',
    summary:
      'Reserva de turnos de atención primaria y campañas sanitarias coordinadas por la red local.',
    docs: ['DNI del paciente', 'Orden médica (si aplica)', 'Teléfono de contacto'],
    linkHref: ROUTES.atencionCiudadano,
    sortOrder: 50,
    isActive: true,
  },
  {
    id: 6,
    slug: 'licencia-conducir',
    title: 'Licencia de conducir',
    category: 'Documentación',
    mode: 'Turno previo',
    eta: '1 a 3 días',
    summary:
      'Emisión y renovación de licencias con circuito de examen médico y validación de antecedentes.',
    docs: ['DNI', 'Certificado médico', 'Comprobante de pago'],
    linkHref: ROUTES.atencionCiudadano,
    sortOrder: 60,
    isActive: true,
  },
]

export const DEFAULT_SERVICES_PAGE_CONTENT = {
  heroEyebrow: 'Guía municipal',
  heroTitle: 'Servicios al vecino',
  heroSubtitle:
    'Encontrá trámites, requisitos y canales de gestión en un solo lugar. Diseñado para que puedas resolver tus gestiones de forma rápida y clara.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1900&q=80',
  heroPrimaryLabel: 'Ver trámites',
  heroPrimaryHref: '#tramites-disponibles',
  heroSecondaryLabel: 'Atención al ciudadano',
  heroSecondaryHref: ROUTES.atencionCiudadano,
  steps: [
    'Elegí el trámite y revisá requisitos.',
    'Reuní documentación y solicitá turno si corresponde.',
    'Presentate o enviá la solicitud por canal habilitado.',
    'Recibí estado de gestión y retiro o resolución.',
  ],
  scheduleLines: [
    'Lunes a viernes · 8:00 a 14:00',
    'Mesa de entrada y áreas operativas',
    'Canales digitales en despliegue progresivo',
  ],
  categories: ['Documentación', 'Comunidad', 'Obras', 'Salud'],
  proceduresEyebrow: 'Trámites disponibles',
  proceduresTitle: 'Directorio de servicios',
  faq: [
    {
      id: 'faq-1',
      q: '¿Necesito turno para todos los servicios?',
      a: 'No. Algunos trámites son por demanda espontánea y otros requieren turno previo para ordenar la atención.',
    },
    {
      id: 'faq-2',
      q: '¿Puedo iniciar un trámite por otra persona?',
      a: 'Sí, en varios casos con autorización firmada y copia de DNI. Revisá requisitos específicos del trámite.',
    },
    {
      id: 'faq-3',
      q: '¿Cómo sé si mi trámite está resuelto?',
      a: 'Vas a recibir notificación por el canal informado. Para consultas, podés usar Atención al ciudadano.',
    },
  ],
  finalCtaTitle: '¿No encontrás tu trámite?',
  finalCtaText:
    'En Atención al ciudadano podés dejar una consulta y el equipo municipal la deriva al área correspondiente para seguimiento.',
  finalPrimaryLabel: 'Ir a Atención al ciudadano',
  finalPrimaryHref: ROUTES.atencionCiudadano,
  finalSecondaryLabel: 'Ver novedades',
  finalSecondaryHref: ROUTES.news,
}

export function mergeServicesPageContent(base, remote) {
  if (!remote || typeof remote !== 'object') return { ...base }
  return {
    ...base,
    ...remote,
    steps: Array.isArray(remote.steps) && remote.steps.length ? remote.steps : base.steps,
    scheduleLines:
      Array.isArray(remote.scheduleLines) && remote.scheduleLines.length
        ? remote.scheduleLines
        : base.scheduleLines,
    categories:
      Array.isArray(remote.categories) && remote.categories.length
        ? remote.categories
        : base.categories,
    faq: Array.isArray(remote.faq) && remote.faq.length ? remote.faq : base.faq,
  }
}

export function buildServiceCategories(content) {
  const cats = Array.isArray(content?.categories) ? content.categories.filter(Boolean) : []
  return ['Todos', ...cats]
}
