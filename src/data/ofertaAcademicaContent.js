/**
 * Contenido público de Oferta académica (vista ciudadana + valores por defecto del panel).
 */

export const OFERTA_ACADEMICA_CATEGORIES = [
  'Todos',
  'Terciaria y técnica',
  'Cursos y talleres',
  'Idiomas',
  'Articulación universitaria',
]

function normalizeOffer(remote) {
  if (!remote || typeof remote !== 'object') return null
  const link =
    remote.link &&
    typeof remote.link === 'object' &&
    String(remote.link.href || '').trim() &&
    (String(remote.link.href).startsWith('http://') || String(remote.link.href).startsWith('https://'))
      ? {
          label: String(remote.link.label || 'Más información').trim() || 'Más información',
          href: String(remote.link.href || '').trim(),
        }
      : null
  return {
    id: String(remote.id || '').trim() || `oferta-${Math.random().toString(36).slice(2, 10)}`,
    category: String(remote.category || '').trim() || 'Cursos y talleres',
    title: String(remote.title || '').trim(),
    provider: String(remote.provider || '').trim(),
    modality: String(remote.modality || '').trim(),
    duration: String(remote.duration || '').trim(),
    location: String(remote.location || '').trim(),
    summary: String(remote.summary || '').trim(),
    details: Array.isArray(remote.details)
      ? remote.details.map((d) => String(d || '').trim()).filter(Boolean)
      : [],
    requirements: Array.isArray(remote.requirements)
      ? remote.requirements.map((r) => String(r || '').trim()).filter(Boolean)
      : [],
    inscription: String(remote.inscription || '').trim(),
    tags: Array.isArray(remote.tags)
      ? remote.tags.map((t) => String(t || '').trim()).filter(Boolean)
      : [],
    link,
  }
}

export const DEFAULT_OFERTA_ACADEMICA_CONTENT = {
  heroEyebrow: 'Educación y formación',
  heroTitle: 'Oferta académica en Trancas',
  heroSubtitle:
    'Un espacio para conocer títulos, trayectos formativos y propuestas de capacitación con presencia local o articuladas con la región.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80',
  introTitle: 'Estudiar y capacitarse cerca de casa',
  introParagraphs: [
    'Trancas cuenta con instituciones y programas que acercan el derecho a la educación: desde trayectos técnicos y terciarios hasta cursos cortos, idiomas y articulaciones con universidades.',
    'Esta guía reúne información orientativa. Los requisitos definitivos, fechas de inscripción y aranceles los confirma cada institución en sus canales oficiales.',
  ],
  highlights: [
    { label: 'Propuestas listadas', value: '8+' },
    { label: 'Modalidades', value: 'Presencial / virtual / híbrido' },
    { label: 'Actualización', value: 'Referencia 2026' },
  ],
  categories: [...OFERTA_ACADEMICA_CATEGORIES],
  offers: [
    {
      id: 'ifts-local',
      category: 'Terciaria y técnica',
      title: 'Tecnicaturas y títulos de formación profesional (IFTS / similar)',
      provider: 'Instituto de Formación Técnico Superior (referencia regional)',
      modality: 'Presencial con encuentros virtuales',
      duration: '2 a 3 años según plan de estudios',
      location: 'Sede convenida en Trancas o departamentos vecinos',
      summary:
        'Trayectos orientados al empleo con prácticas en empresas y organismos. Ideales para quienes buscan salida laboral rápida con título oficial.',
      details: [
        'Las carreras y cupos dependen de la oferta anual del Ministerio de Educación y del instituto gestor.',
        'Suele pedirse título secundario completo y documentación de identidad; algunas orientaciones pueden requerir prueba de ingreso o entrevista.',
      ],
      requirements: ['Secundario completo', 'DNI', 'Certificado de alumno regular o título (según convocatoria)'],
      inscription: 'Consultá convocatoria y fechas en la secretaría del instituto o sitio web oficial.',
      tags: ['Título oficial', 'Empleabilidad'],
      link: null,
    },
    {
      id: 'cbc-articulacion',
      category: 'Articulación universitaria',
      title: 'Ciclo Básico Común (CBC) y materias introductorias',
      provider: 'Articulación con universidades de Tucumán',
      modality: 'Híbrido',
      duration: 'Según plan de carrera',
      location: 'Encuentros en sede regional; exámenes según calendario universitario',
      summary:
        'Opciones para iniciar carreras universitarias sin trasladarse de forma permanente, combinando clases locales y plataformas de la casa de estudios.',
      details: [
        'Las articulaciones varían según convenio vigente entre la municipalidad, el Ministerio y cada universidad.',
        'Es habitual combinar materias presenciales en nodos cercanos con acompañamiento tutorial.',
      ],
      requirements: ['Secundario completo', 'Inscripción en la universidad de referencia', 'Documentación del CBC'],
      inscription: 'Revisá el calendario académico de la universidad elegida y los puntos de inscripción habilitados.',
      tags: ['Universitario', 'CBC'],
      link: null,
    },
    {
      id: 'cursos-municipales',
      category: 'Cursos y talleres',
      title: 'Capacitación municipal y cooperativa',
      provider: 'Municipalidad de Trancas y redes asociadas',
      modality: 'Presencial y talleres intensivos',
      duration: 'De 4 semanas a 4 meses',
      location: 'Centros comunitarios y espacios municipales',
      summary:
        'Oficios, ofimática, emprendedurismo, seguridad vial, primeros auxilios y otras temáticas acordes a demandas del territorio.',
      details: [
        'Muchos cursos son gratuitos o con arancel simbólico según programa.',
        'Se prioriza inscripción por orden de llegada o por sorteo cuando hay cupos limitados.',
      ],
      requirements: ['Mayoría de edad o autorización para menores (según curso)', 'Domicilio en el departamento (en algunos casos)'],
      inscription: 'Seguí la agenda en redes oficiales y avisos en la Casa del Bicentenario / Centros vecinales.',
      tags: ['Gratuitos', 'Certificado'],
      link: null,
    },
    {
      id: 'idiomas',
      category: 'Idiomas',
      title: 'Inglés, portugués y talleres de comunicación',
      provider: 'Institutos privados con convenio y espacios culturales',
      modality: 'Presencial / online en vivo',
      duration: 'Niveles semestrales o intensivos',
      location: 'Trancas capital y localidades cercanas',
      summary:
        'Desde nivel inicial hasta preparación para exámenes internacionales; algunas propuestas incluyen intercambio cultural.',
      details: [
        'Los aranceles y certificaciones dependen de cada instituto.',
        'Existen becas parciales en algunas convocatorias comunitarias.',
      ],
      requirements: ['Varía por nivel (ninguno para iniciación)', 'Evaluación de ubicación en algunos casos'],
      inscription: 'Contacto directo con cada instituto; consultá también en la Dirección de Cultura por talleres abiertos.',
      tags: ['Idiomas', 'Certificación'],
      link: null,
    },
    {
      id: 'deporte-formativo',
      category: 'Cursos y talleres',
      title: 'Formación en deporte, recreación y lifeguard',
      provider: 'Dirección de Deportes y entes federados',
      modality: 'Presencial',
      duration: 'Entre 40 y 120 horas reloj',
      location: 'Polideportivo y piletas habilitadas',
      summary:
        'Actualización para profes, monitores y vecinos interesados en trabajo comunitario en espacios deportivos.',
      details: [
        'Los cursos habilitantes (RCP, rescate acuático) exigen aprobación teórica y práctica.',
        'Se entregan constancias con validez según normativa vigente.',
      ],
      requirements: ['Certificado médico (cuando corresponda)', 'Mayor de 16 años salvo excepciones'],
      inscription: 'Inscripciones en secretaría de Deportes en temporada alta.',
      tags: ['Deportes', 'Habilitaciones'],
      link: null,
    },
    {
      id: 'adultos-secundario',
      category: 'Cursos y talleres',
      title: 'Terminación de estudios y alfabetización digital',
      provider: 'Ministerio de Educación / programas provinciales en territorio',
      modality: 'Presencial flexible',
      duration: 'Plan anual o modular',
      location: 'Puntos de encuentro en la ciudad y zona rural',
      summary:
        'Trayectos para completar el secundario y talleres de inclusión digital vinculados a trámites y empleo.',
      details: [
        'La oferta se organiza por mesas de acompañamiento; no siempre hay cupo continuo.',
        'Coordinación con escuelas y centros de adultos.',
      ],
      requirements: ['Documentación de identidad', 'Encuesta socioeducativa inicial'],
      inscription: 'Consultá en la Delegación Educativa o en la mesa de Primera Escucha municipal.',
      tags: ['Adultos', 'Inclusión'],
      link: null,
    },
    {
      id: 'arte-diseno',
      category: 'Cursos y talleres',
      title: 'Artes, diseño y producción audiovisual',
      provider: 'Dirección de Cultura y escuelas artísticas',
      modality: 'Presencial',
      duration: 'Cuatrimestral',
      location: 'Casa de la Cultura y anexos',
      summary:
        'Laboratorios de diseño, fotografía, sonido y guion orientados a ferias y eventos locales.',
      details: [
        'Integración con la agenda de festivales municipales.',
        'Prioridad para vecinos de Trancas en etapas de inscripción.',
      ],
      requirements: ['Edad mínima según taller', 'Ficha de inscripción'],
      inscription: 'Publicación al inicio de cada cuatrimestre en cultura@trancas.gob.ar y redes oficiales.',
      tags: ['Cultura', 'Creativo'],
      link: null,
    },
    {
      id: 'agro-extension',
      category: 'Cursos y talleres',
      title: 'Extensión agraria y buenas prácticas',
      provider: 'INTA / cooperativas / área de Producción',
      modality: 'Salidas de campo y aula',
      duration: 'Talleres de 1 a 3 jornadas',
      location: 'Campo experimental y establecimientos asociados',
      summary:
        'Riego eficiente, sanidad vegetal, seguridad en agroquímicos y empaques para pequeños productores.',
      details: [
        'Algunas jornadas son sin costo con cupo limitado.',
        'Se entregan materiales de apoyo y constancia de asistencia.',
      ],
      requirements: ['Inscripción previa', 'EPP cuando se indique'],
      inscription: 'Avisos en INTA regional y boletines de la Cooperativa Agropecuaria.',
      tags: ['Agro', 'Extensión'],
      link: null,
    },
  ],
  ctaTitle: '¿Necesitás orientación personalizada?',
  ctaBody:
    'Si no encontrás una propuesta que se ajuste a tu situación, podés canalizar la consulta por la mesa de atención: te ayudamos a revisar requisitos y derivaciones según tu edad, estudios previos y disponibilidad horaria.',
}

/** @deprecated Usá DEFAULT_OFERTA_ACADEMICA_CONTENT; se mantiene por compatibilidad. */
export const OFERTA_ACADEMICA_PAGE = DEFAULT_OFERTA_ACADEMICA_CONTENT

export function mergeOfertaAcademicaContent(base, remote) {
  if (!remote || typeof remote !== 'object') return { ...base, categories: [...(base.categories || [])] }

  const offersOut = Array.isArray(remote.offers)
    ? remote.offers.map((o) => normalizeOffer(o)).filter(Boolean)
    : (base.offers || []).map((o) => normalizeOffer(o)).filter(Boolean)

  return {
    ...base,
    heroEyebrow: String(remote.heroEyebrow ?? base.heroEyebrow ?? ''),
    heroTitle: String(remote.heroTitle ?? base.heroTitle ?? ''),
    heroSubtitle: String(remote.heroSubtitle ?? base.heroSubtitle ?? ''),
    heroImageUrl: String(remote.heroImageUrl ?? base.heroImageUrl ?? ''),
    introTitle: String(remote.introTitle ?? base.introTitle ?? ''),
    introParagraphs: Array.isArray(remote.introParagraphs)
      ? remote.introParagraphs.map((p) => String(p || '').trim()).filter(Boolean)
      : [...(base.introParagraphs || [])],
    highlights: Array.isArray(remote.highlights)
      ? remote.highlights
          .map((h) => ({
            label: String(h?.label || '').trim(),
            value: String(h?.value || '').trim(),
          }))
          .filter((h) => h.label || h.value)
      : [...(base.highlights || [])],
    categories:
      Array.isArray(remote.categories) && remote.categories.length > 0
        ? remote.categories.map((c) => String(c || '').trim()).filter(Boolean)
        : [...(base.categories?.length ? base.categories : OFERTA_ACADEMICA_CATEGORIES)],
    offers: offersOut,
    ctaTitle: String(remote.ctaTitle ?? base.ctaTitle ?? ''),
    ctaBody: String(remote.ctaBody ?? base.ctaBody ?? ''),
  }
}
