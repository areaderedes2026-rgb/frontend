import { ROUTES } from '../utils/constants.js'
import {
  DEFAULT_SERVICE_CATEGORIES,
  findServiceCategory,
  normalizeServiceCategories,
  resolveServiceCategoryId,
} from './serviceCategoriesContent.js'

export const DEFAULT_MUNICIPAL_SERVICES = [
  {
    id: 1,
    slug: 'partidas',
    title: 'Solicitud de partidas',
    category: 'svc-cat-documentacion',
    mode: 'Presencial y web',
    eta: '48 hs hábiles',
    summary:
      'Gestión de partidas de nacimiento, matrimonio y defunción para vecinos y trámites administrativos.',
    description:
      'Trámite para obtener copias certificadas de actas del Registro Civil. Podés iniciarlo de forma presencial en mesa de entrada o mediante el formulario web de Atención al ciudadano.',
    requirements: [
      'Ser titular del acta o contar con autorización cuando corresponda',
      'Indicar tipo de partida y datos registrales completos',
      'Presentar DNI vigente del solicitante',
    ],
    docs: ['DNI vigente', 'Datos registrales', 'Formulario de solicitud'],
    linkUrl: '',
    linkLabel: '',
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 2,
    slug: 'habilitacion-comercial',
    title: 'Habilitación comercial',
    category: 'svc-cat-comunidad',
    mode: 'Sin turno previo',
    eta: 'Dependiendo del trámite',
    summary:
      'Alta o renovación de habilitaciones para comercios, con revisión de requisitos y seguimiento del expediente.',
    description:
      'Para realizar el trámite de habilitación comercial, deberá presentarse en la Dirección de Habilitaciones Comerciales, ubicada en calle 25 de Mayo N° 455, de lunes a viernes de 7:00 a 13:00 hs.',
    requirements: [
      'Contar con local habilitado o en condiciones de inspección',
      'Presentar documentación completa del titular y del establecimiento',
      'Abonar tasas municipales correspondientes cuando aplique',
    ],
    docs: [
      'Nombre y apellido',
      'CUIL',
      'Domicilio',
      'Nacionalidad',
      'Estado civil',
      'Profesión u oficio',
      'DNI (frente y dorso)',
      'CUIT',
      'Constancia de inscripción en AFIP',
      'Constancia de inscripción en Rentas',
    ],
    linkUrl: '',
    linkLabel: '',
    sortOrder: 20,
    isActive: true,
  },
  {
    id: 3,
    slug: 'reclamo-urbano',
    title: 'Reclamos de servicios urbanos',
    category: 'svc-cat-obras',
    mode: 'Formulario web',
    eta: 'Respuesta inicial en 72 hs',
    summary:
      'Canal para luminarias, bacheo, limpieza y mantenimiento de espacios públicos con seguimiento interno.',
    description:
      'Registrá reclamos por luminarias, bacheo, limpieza u otros servicios urbanos. El equipo operativo asigna el caso y te informa el estado de gestión.',
    requirements: [
      'Indicar dirección exacta o referencia del lugar',
      'Describir el inconveniente con el mayor detalle posible',
      'Adjuntar foto o referencia visual si está disponible',
    ],
    docs: ['Nombre y apellido', 'DNI', 'Teléfono', 'Detalle del reclamo'],
    linkUrl: ROUTES.atencionCiudadano,
    linkLabel: 'Iniciar reclamo en línea',
    sortOrder: 30,
    isActive: true,
  },
  {
    id: 4,
    slug: 'apoyo-social',
    title: 'Programas de asistencia social',
    category: 'svc-cat-comunidad',
    mode: 'Entrevista presencial',
    eta: 'Según evaluación',
    summary:
      'Orientación y derivación a programas de apoyo familiar, becas y acompañamiento comunitario.',
    description:
      'Accedé a orientación sobre programas de asistencia social, becas y acompañamiento familiar. La evaluación se realiza en entrevista presencial con el equipo del área.',
    requirements: [
      'Solicitar turno o acercarse en horario de atención',
      'Acreditar situación del grupo familiar cuando corresponda',
      'Completar entrevista de evaluación social',
    ],
    docs: ['DNI actualizado', 'Comprobante de domicilio', 'Documentación respaldatoria'],
    linkUrl: '',
    linkLabel: '',
    sortOrder: 40,
    isActive: true,
  },
  {
    id: 5,
    slug: 'turnos-salud',
    title: 'Turnos de salud municipal',
    category: 'svc-cat-salud',
    mode: 'Telefónico y presencial',
    eta: 'Asignación diaria',
    summary:
      'Reserva de turnos de atención primaria y campañas sanitarias coordinadas por la red local.',
    description:
      'Gestión de turnos para atención primaria y campañas de salud municipal. La asignación puede realizarse por teléfono o de forma presencial según disponibilidad diaria.',
    requirements: [
      'Contar con DNI del paciente',
      'Informar teléfono de contacto actualizado',
      'Presentar orden médica cuando el trámite lo requiera',
    ],
    docs: ['DNI del paciente', 'Orden médica (si aplica)', 'Teléfono de contacto'],
    linkUrl: '',
    linkLabel: '',
    sortOrder: 50,
    isActive: true,
  },
  {
    id: 6,
    slug: 'licencia-conducir',
    title: 'Licencia de conducir',
    category: 'svc-cat-documentacion',
    mode: 'Turno previo',
    eta: '1 a 3 días',
    summary:
      'Emisión y renovación de licencias con circuito de examen médico y validación de antecedentes.',
    description:
      'Trámite de emisión o renovación de licencia de conducir con examen médico, validación de antecedentes y pago de tasas correspondientes.',
    requirements: [
      'Solicitar turno previo',
      'Aprobar examen médico habilitante',
      'No registrar infracciones pendientes que impidan la emisión',
    ],
    docs: ['DNI', 'Certificado médico', 'Comprobante de pago'],
    linkUrl: '',
    linkLabel: '',
    sortOrder: 60,
    isActive: true,
  },
]

export const DEFAULT_SERVICES_PAGE_CONTENT = {
  heroEyebrow: 'Guía municipal',
  heroTitle: 'Guía de trámites',
  heroSubtitle:
    'Encontrá trámites, requisitos y canales de gestión en un solo lugar. Diseñado para que puedas resolver tus gestiones de forma rápida y clara.',
  heroSearchPlaceholder: '¿Qué trámite estás buscando?',
  heroImageUrl:
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1900&q=80',
  heroPrimaryLabel: 'Ver trámites',
  heroPrimaryHref: '#categorias-tramites',
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
  categories: DEFAULT_SERVICE_CATEGORIES.map((item) => ({ ...item })),
  proceduresEyebrow: 'Categorías',
  proceduresTitle: 'Elegí un área para ver sus trámites',
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

export function normalizeMunicipalService(raw, fallbackId = 0, categories = DEFAULT_SERVICE_CATEGORIES) {
  const summary = String(raw?.summary || '').trim()
  const description = String(raw?.description || '').trim() || summary
  const requirements = Array.isArray(raw?.requirements)
    ? raw.requirements.map((x) => String(x || '').trim()).filter(Boolean)
    : []
  const docs = Array.isArray(raw?.docs)
    ? raw.docs.map((x) => String(x || '').trim()).filter(Boolean)
    : []
  const linkUrl = String(raw?.linkUrl || raw?.linkHref || '').trim()
  const linkLabel = String(raw?.linkLabel || '').trim()

  const category = resolveServiceCategoryId(raw?.category, categories)
  const categoryRow = findServiceCategory(categories, { id: category })

  return {
    id: Number(raw?.id) || fallbackId,
    slug: String(raw?.slug || ''),
    title: String(raw?.title || ''),
    category,
    categoryName: categoryRow?.name || '',
    mode: String(raw?.mode || ''),
    eta: String(raw?.eta || ''),
    summary: summary || description.slice(0, 280),
    description,
    requirements,
    docs,
    linkUrl,
    linkLabel,
    sortOrder: Number(raw?.sortOrder) || 0,
    isActive: raw?.isActive !== false,
    updatedAt: raw?.updatedAt || raw?.updated_at || null,
  }
}

export function mergeServicesPageContent(base, remote) {
  if (!remote || typeof remote !== 'object') return { ...base }
  return {
    ...base,
    ...remote,
    heroSearchPlaceholder: String(
      remote.heroSearchPlaceholder ?? base.heroSearchPlaceholder ?? '¿Qué trámite estás buscando?',
    ),
    steps: Array.isArray(remote.steps) && remote.steps.length ? remote.steps : base.steps,
    scheduleLines:
      Array.isArray(remote.scheduleLines) && remote.scheduleLines.length
        ? remote.scheduleLines
        : base.scheduleLines,
    categories: normalizeServiceCategories(
      remote.categories?.length ? remote.categories : base.categories,
      DEFAULT_SERVICE_CATEGORIES,
    ),
    faq: Array.isArray(remote.faq) && remote.faq.length ? remote.faq : base.faq,
  }
}

export function buildServiceCategories(content) {
  return normalizeServiceCategories(content?.categories)
}

/** Filtra trámites por texto libre (título, resumen, categoría, requisitos, etc.). */
export function filterMunicipalServicesByQuery(services, query) {
  const q = String(query || '')
    .trim()
    .toLowerCase()
  if (!q) return services

  return services.filter((service) => {
    const parts = [
      service?.title,
      service?.summary,
      service?.description,
      service?.category,
      service?.categoryName,
      service?.mode,
      service?.eta,
      ...(Array.isArray(service?.requirements) ? service.requirements : []),
      ...(Array.isArray(service?.docs) ? service.docs : []),
    ]
    return parts
      .map((part) => String(part || '').toLowerCase())
      .join(' ')
      .includes(q)
  })
}

export function linesToList(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function listToLines(items) {
  if (!Array.isArray(items)) return ''
  return items.map((x) => String(x || '').trim()).filter(Boolean).join('\n')
}
