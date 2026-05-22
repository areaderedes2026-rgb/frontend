/**
 * Funciones principales del HCD — estructura editable desde admin.
 * Se persiste en blocks_json del backend.
 */

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function cleanConcejoSortOrder(value, fallback = 0) {
  const n = Number(value)
  if (!Number.isFinite(n)) return Math.max(0, Math.round(fallback))
  return Math.max(0, Math.round(n))
}

function cleanLines(input, maxItems = 24, maxLen = 2000) {
  const raw = Array.isArray(input) ? input : []
  const out = []
  for (const line of raw.slice(0, maxItems)) {
    const s = String(line || '').replace(/\r\n/g, '\n').trim()
    if (s) out.push(s.slice(0, maxLen))
  }
  return out
}

function normalizeListGroup(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const title = String(raw.title || '').trim()
  const items = cleanLines(raw.items, 20, 1200)
  if (!title && !items.length) return null
  return {
    id: String(raw.id || '').trim() || makeId('list'),
    sortOrder:
      raw?.sortOrder == null || raw?.sortOrder === ''
        ? (index + 1) * 10
        : cleanConcejoSortOrder(raw.sortOrder, (index + 1) * 10),
    title,
    items,
  }
}

function normalizeExamples(raw) {
  if (!raw || typeof raw !== 'object') return null
  const title = String(raw.title || '').trim()
  const items = cleanLines(raw.items, 16, 1200)
  if (!title && !items.length) return null
  return { title: title || 'Ejemplos', items }
}

function normalizeSubsection(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const title = String(raw.title || '').trim()
  const paragraphs = cleanLines(raw.paragraphs, 12, 2500)
  const listGroups = (Array.isArray(raw.listGroups) ? raw.listGroups : [])
    .map((g, idx) => normalizeListGroup(g, idx))
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const examples = normalizeExamples(raw.examples)
  if (!title && !paragraphs.length && !listGroups.length && !examples) return null
  return {
    id: String(raw.id || '').trim() || makeId('sub'),
    sortOrder:
      raw?.sortOrder == null || raw?.sortOrder === ''
        ? (index + 1) * 10
        : cleanConcejoSortOrder(raw.sortOrder, (index + 1) * 10),
    title,
    paragraphs,
    listGroups,
    examples,
  }
}

function normalizeFunctionSection(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const title = String(raw.title || '').trim()
  const number = String(raw.number || '').trim()
  const paragraphs = cleanLines(raw.paragraphs, 16, 2500)
  const subsections = (Array.isArray(raw.subsections) ? raw.subsections : [])
    .map((s, idx) => normalizeSubsection(s, idx))
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  if (!title && !paragraphs.length && !subsections.length) return null
  return {
    id: String(raw.id || '').trim() || makeId('func'),
    sortOrder:
      raw?.sortOrder == null || raw?.sortOrder === ''
        ? (index + 1) * 10
        : cleanConcejoSortOrder(raw.sortOrder, (index + 1) * 10),
    number,
    title,
    paragraphs,
    subsections,
  }
}

export function sortMainFunctionSections(sections) {
  return [...(Array.isArray(sections) ? sections : [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  )
}

export function nextMainFunctionSectionPriority(sections) {
  const max = (Array.isArray(sections) ? sections : []).reduce(
    (acc, item) => Math.max(acc, cleanConcejoSortOrder(item?.sortOrder, 0)),
    0,
  )
  return max + 10
}

export function normalizeMainFunctions(raw, base = DEFAULT_CONCEJO_MAIN_FUNCTIONS) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const b = base && typeof base === 'object' ? base : DEFAULT_CONCEJO_MAIN_FUNCTIONS
  const sections = sortMainFunctionSections(
    (Array.isArray(source.sections) ? source.sections : b.sections || [])
      .map((s, idx) => normalizeFunctionSection(s, idx))
      .filter(Boolean),
  )
  return {
    enabled: source.enabled !== false,
    title: String(source.title ?? b.title ?? '').trim() || b.title,
    sections: sections.length ? sections : [...(b.sections || [])],
  }
}

export const DEFAULT_CONCEJO_MAIN_FUNCTIONS = {
  enabled: true,
  title: 'Funciones principales del HCD',
  sections: [
    {
      id: 'func-legislativa',
      sortOrder: 10,
      number: '1',
      title: 'FUNCIÓN LEGISLATIVA',
      paragraphs: [
        'El HCD dicta normas de alcance general para el municipio, llamadas **Ordenanzas**; y eleva pedidos o recomendaciones al Ejecutivo Municipal, llamados **Minutas de Comunicación**.',
      ],
      subsections: [
        {
          id: 'sub-ordenanzas',
          sortOrder: 10,
          title: 'Ordenanzas',
          paragraphs: [
            'Tienen carácter similar a una ley, pero dentro del ámbito municipal.',
            'Las ordenanzas son la norma jurídica más importante dentro del ámbito municipal y son obligatorias para todos los habitantes del municipio.',
            'Pueden establecer sanciones o procedimientos administrativos por incumplimiento.',
          ],
          listGroups: [
            {
              id: 'lg-ordenanzas-caract',
              sortOrder: 10,
              title: 'Características',
              items: [
                'Crean derechos y obligaciones.',
                'Tienen vigencia permanente hasta su derogación por otra ordenanza posterior.',
                'Requieren promulgación del departamento ejecutivo mediante un Decreto para que entre en vigencia. El Ejecutivo tiene un plazo legal para hacerlo; de lo contrario, puede quedar promulgada tácitamente según lo estipula la Ley Orgánica de Municipalidades.',
              ],
            },
          ],
          examples: {
            title: 'Ejemplos',
            items: [
              'Ordenanza Tributaria.',
              'Ordenanza de Presupuesto.',
              'Ordenanza de tránsito.',
              'Ordenanza sobre habilitación de comercios.',
            ],
          },
        },
        {
          id: 'sub-minutas',
          sortOrder: 20,
          title: 'Minutas de comunicación',
          paragraphs: [
            'Las minutas de comunicación son pedidos o recomendaciones dirigidas al Departamento Ejecutivo u otros organismos. No tienen fuerza obligatoria como una ordenanza, pero constituyen una herramienta política e institucional importante.',
          ],
          listGroups: [
            {
              id: 'lg-minutas-finalidad',
              sortOrder: 10,
              title: 'Finalidad',
              items: [
                'Solicitar informes.',
                'Pedir realización de obras.',
                'Requerir mantenimiento de servicios.',
                'Transmitir reclamos vecinales.',
                'Recomendar medidas de gestión.',
              ],
            },
          ],
          examples: {
            title: 'Ejemplo',
            items: [
              '«Solicitar al Departamento Ejecutivo la reparación del alumbrado público en determinado barrio».',
            ],
          },
        },
      ],
    },
    {
      id: 'func-contralor',
      sortOrder: 20,
      number: '2',
      title: 'FUNCIÓN DE CONTRALOR',
      paragraphs: [
        'El HCD controla los actos del Departamento Ejecutivo Municipal.',
        'El contralor busca asegurar una gestión eficiente, legal y transparente de los recursos públicos.',
      ],
      subsections: [
        {
          id: 'sub-contralor-implica',
          sortOrder: 10,
          title: 'Esta función implica',
          paragraphs: [],
          listGroups: [
            {
              id: 'lg-contralor',
              sortOrder: 10,
              title: '',
              items: [
                'Controlar la ejecución del presupuesto.',
                'Pedir informes al intendente y funcionarios.',
                'Analizar cuentas públicas.',
                'Supervisar licitaciones y contrataciones.',
                'Verificar el cumplimiento de ordenanzas.',
                'Controlar la legalidad y transparencia de la administración municipal.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'func-representativa',
      sortOrder: 30,
      number: '3',
      title: 'FUNCIÓN REPRESENTATIVA',
      paragraphs: [
        'Los concejales representan a los vecinos del municipio. Reciben inquietudes, reclamos y propuestas de la comunidad y las trasladan al ámbito legislativo mediante proyectos o pedidos al Ejecutivo.',
        'El funcionamiento del cuerpo se rige por el principio de publicidad de los actos de gobierno: cualquier vecino o vecina puede asistir y conocer la agenda de los temas que se debaten cada semana.',
      ],
      subsections: [],
    },
  ],
}
