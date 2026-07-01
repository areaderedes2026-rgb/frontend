import {
  normalizeHistoryStorySections,
  storySectionsMatchQuery,
} from './historyStorySections.js'

export const DEFAULT_HISTORY_SECTION_VISIBILITY = {
  storySections: true,
  legacyCards: true,
  documentary: true,
  closing: true,
}

export const DEFAULT_HISTORY_DOCUMENTARY = {
  title: 'Documental: Memoria de Trancas',
  description:
    'Serie audiovisual que recorre episodios de la historia local. Cada capítulo está disponible en el enlace de Google Drive.',
  chapters: [],
}

const DEFAULT_INTRO_STORY =
  'Trancas es una tierra de memoria profunda, forjada por generaciones de familias que hicieron del trabajo, la solidaridad y la identidad cultural un rasgo distintivo del norte tucumano. A lo largo de su historia, el territorio creció como punto de encuentro entre caminos productivos, tradiciones rurales y expresiones comunitarias que todavía hoy sostienen su vida cotidiana. Cada etapa dejó huellas en sus barrios, en sus instituciones y en la manera en que vecinos y vecinas construyen pertenencia: desde las primeras formas de organización local hasta la consolidación de un perfil social, cultural y económico propio. En la actualidad, Trancas continúa esa trayectoria con una mirada puesta en el futuro, integrando desarrollo, turismo, patrimonio e innovación pública, sin perder el vínculo con sus raíces ni con los relatos que dieron forma a su historia.'

export const DEFAULT_HISTORY_CONTENT = {
  heroBadge: 'Identidad tucumana',
  heroTitle: 'Historia de Trancas',
  heroSubtitle:
    'Un recorrido por los hechos, paisajes y protagonistas que construyeron la memoria histórica de Trancas y su proyección hacia el futuro.',
  heroSearchPlaceholder: '¿Qué querés conocer de Trancas?',
  heroImageUrl:
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80',
  storySections: normalizeHistoryStorySections(null, DEFAULT_INTRO_STORY),
  ctaPrimaryLabel: 'Leer la historia',
  ctaPrimaryHref: '#historia-secciones',
  ctaSecondaryLabel: 'Puntos turísticos',
  ctaSecondaryHref: '/turismo',
  legacyItems: [
    {
      title: 'Identidad cultural',
      text: 'Tradiciones, fiestas y prácticas comunitarias que mantienen viva la memoria local.',
    },
    {
      title: 'Patrimonio vivo',
      text: 'Edificios, espacios públicos y relatos que conectan pasado y presente.',
    },
    {
      title: 'Proyección regional',
      text: 'Una ciudad que combina historia, servicios y oportunidades para visitantes y vecinos.',
    },
  ],
  documentary: {
    title: 'Documental: Memoria de Trancas',
    description:
      'Serie audiovisual que recorre episodios de la historia local. Cada capítulo está disponible en el enlace de Google Drive.',
    chapters: [
      {
        id: 'doc-ch-1',
        title: 'Capítulo 1 — Orígenes',
        description: 'Primeras huellas del territorio y las familias que dieron forma a la comunidad.',
        driveUrl: '',
        sortOrder: 10,
      },
    ],
  },
  sectionVisibility: { ...DEFAULT_HISTORY_SECTION_VISIBILITY },
  tourismCategories: [
    { id: 'all', label: 'Todos' },
    { id: 'nature', label: 'Naturaleza' },
    { id: 'culture', label: 'Patrimonio' },
    { id: 'faith', label: 'Espiritual' },
  ],
  tourismSpots: [],
  closingTitle: 'Trancas: memoria, cultura y futuro',
  closingText:
    'Esta sección reúne hitos históricos y relatos para que vecinos y visitantes conozcan la identidad local. Explorá el documental, las secciones narrativas y los contenidos que iremos sumando.',
}

function mergeList(baseList, incomingList, mapper) {
  if (!Array.isArray(incomingList) || incomingList.length === 0) return baseList
  return incomingList.map((item, index) => mapper(item, baseList[index], index)).filter(Boolean)
}

export function normalizeHistorySectionVisibility(raw) {
  const base = DEFAULT_HISTORY_SECTION_VISIBILITY
  if (!raw || typeof raw !== 'object') return { ...base }
  const storyVisible = raw.storySections !== false && raw.introStory !== false
  return {
    storySections: storyVisible,
    legacyCards: raw.legacyCards !== false,
    documentary: raw.documentary !== false,
    closing: raw.closing !== false,
  }
}

export function isHistorySectionVisible(content, key) {
  const visibility = normalizeHistorySectionVisibility(content?.sectionVisibility)
  if (key === 'introStory') return visibility.storySections !== false
  return visibility[key] !== false
}

function normalizeChapter(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const title = String(raw.title || '').trim()
  if (!title) return null
  const id = String(raw.id || '').trim() || `doc-ch-${index + 1}`
  return {
    id,
    title,
    description: String(raw.description || '').trim(),
    driveUrl: String(raw.driveUrl || raw.linkUrl || '').trim(),
    sortOrder: Number.isFinite(Number(raw.sortOrder)) ? Math.max(Number(raw.sortOrder), 0) : (index + 1) * 10,
  }
}

export function normalizeHistoryDocumentary(raw, fallback = DEFAULT_HISTORY_DOCUMENTARY) {
  const base = fallback || DEFAULT_HISTORY_DOCUMENTARY
  if (!raw || typeof raw !== 'object') {
    return {
      title: base.title,
      description: base.description,
      chapters: Array.isArray(base.chapters) ? base.chapters.map((c, i) => normalizeChapter(c, i)).filter(Boolean) : [],
    }
  }
  const chapters = Array.isArray(raw.chapters)
    ? raw.chapters.map((c, i) => normalizeChapter(c, i)).filter(Boolean)
    : []
  chapters.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, 'es'))
  return {
    title: String(raw.title || base.title || '').trim(),
    description: String(raw.description || base.description || '').trim(),
    chapters,
  }
}

export { normalizeHistoryStorySections }

export function mergeHistoryContent(base, remote) {
  if (!remote || typeof remote !== 'object') return { ...base }
  const storySections = normalizeHistoryStorySections(
    remote.storySections,
    remote.introStory || DEFAULT_INTRO_STORY,
  )
  return {
    ...base,
    heroBadge: remote.heroBadge || base.heroBadge,
    heroTitle: remote.heroTitle || base.heroTitle,
    heroSubtitle: remote.heroSubtitle || base.heroSubtitle,
    heroSearchPlaceholder: String(
      remote.heroSearchPlaceholder ?? base.heroSearchPlaceholder ?? '¿Qué querés conocer de Trancas?',
    ),
    heroImageUrl: remote.heroImageUrl || base.heroImageUrl,
    storySections: storySections.length > 0 ? storySections : base.storySections,
    ctaPrimaryLabel: remote.ctaPrimaryLabel || base.ctaPrimaryLabel,
    ctaPrimaryHref: remote.ctaPrimaryHref || base.ctaPrimaryHref,
    ctaSecondaryLabel: remote.ctaSecondaryLabel || base.ctaSecondaryLabel,
    ctaSecondaryHref: remote.ctaSecondaryHref || base.ctaSecondaryHref,
    legacyItems: mergeList(base.legacyItems, remote.legacyItems, (item, fallback) => ({
      title: item?.title || fallback?.title || '',
      text: item?.text || fallback?.text || '',
    })),
    documentary: normalizeHistoryDocumentary(remote.documentary, base.documentary),
    sectionVisibility: normalizeHistorySectionVisibility(
      remote.sectionVisibility ?? base.sectionVisibility,
    ),
    tourismCategories: mergeList(
      base.tourismCategories,
      remote.tourismCategories,
      (item, fallback, index) => ({
        id: item?.id || fallback?.id || `category-${index + 1}`,
        label: item?.label || fallback?.label || '',
      }),
    ),
    tourismSpots: mergeList(base.tourismSpots, remote.tourismSpots, (item, fallback, index) => ({
      id: item?.id || fallback?.id || `spot-${index + 1}`,
      name: item?.name || fallback?.name || '',
      category: item?.category || fallback?.category || '',
      image: item?.image || fallback?.image || '',
      summary: item?.summary || fallback?.summary || '',
      chips: Array.isArray(item?.chips)
        ? item.chips.filter(Boolean)
        : Array.isArray(fallback?.chips)
          ? fallback.chips
          : [],
    })),
    closingTitle: remote.closingTitle || base.closingTitle,
    closingText: remote.closingText || base.closingText,
  }
}

/** Filtra contenido de historia por texto libre (secciones, tarjetas, documental, cierre). */
export function filterHistoryByQuery(content, query) {
  const q = String(query || '')
    .trim()
    .toLowerCase()
  if (!q) return { hasMatches: true, sections: {} }

  const documentary = normalizeHistoryDocumentary(content?.documentary)
  const storySections = storySectionsMatchQuery(
    normalizeHistoryStorySections(content?.storySections, content?.introStory),
    q,
  )
  const legacyItems = (content?.legacyItems || []).filter((item) => {
    const hay = [item?.title, item?.text].join(' ').toLowerCase()
    return hay.includes(q)
  })
  const chapters = documentary.chapters.filter((ch) => {
    const hay = [ch.title, ch.description].join(' ').toLowerCase()
    return hay.includes(q)
  })

  const documentaryMetaMatch =
    documentary.title.toLowerCase().includes(q) || documentary.description.toLowerCase().includes(q)
  const closingMatch =
    String(content?.closingTitle || '').toLowerCase().includes(q) ||
    String(content?.closingText || '').toLowerCase().includes(q)

  const hasMatches =
    storySections.length > 0 ||
    legacyItems.length > 0 ||
    documentaryMetaMatch ||
    chapters.length > 0 ||
    closingMatch

  return {
    hasMatches,
    sections: {
      storySections,
      legacyItems,
      documentaryMetaMatch,
      chapters,
      closingMatch,
    },
  }
}
