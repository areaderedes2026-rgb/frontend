export const DEFAULT_HISTORY_CONTENT = {
  heroBadge: 'Identidad tucumana',
  heroTitle: 'Historia de Trancas',
  heroSubtitle:
    'Un recorrido por los hechos, paisajes y protagonistas que construyeron la memoria histórica de Trancas y su proyección hacia el futuro.',
  heroImageUrl:
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80',
  introStory:
    'Trancas es una tierra de memoria profunda, forjada por generaciones de familias que hicieron del trabajo, la solidaridad y la identidad cultural un rasgo distintivo del norte tucumano. A lo largo de su historia, el territorio creció como punto de encuentro entre caminos productivos, tradiciones rurales y expresiones comunitarias que todavía hoy sostienen su vida cotidiana. Cada etapa dejó huellas en sus barrios, en sus instituciones y en la manera en que vecinos y vecinas construyen pertenencia: desde las primeras formas de organización local hasta la consolidación de un perfil social, cultural y económico propio. En la actualidad, Trancas continúa esa trayectoria con una mirada puesta en el futuro, integrando desarrollo, turismo, patrimonio e innovación pública, sin perder el vínculo con sus raíces ni con los relatos que dieron forma a su historia.',
  ctaPrimaryLabel: 'Leer resumen histórico',
  ctaPrimaryHref: '#resumen-historia',
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
  tourismCategories: [
    { id: 'all', label: 'Todos' },
    { id: 'nature', label: 'Naturaleza' },
    { id: 'culture', label: 'Patrimonio' },
    { id: 'faith', label: 'Espiritual' },
  ],
  tourismSpots: [
    {
      id: 'potrero',
      name: 'Dique El Potrero',
      category: 'nature',
      image:
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
      summary:
        'Un entorno natural para descanso, pesca y actividades al aire libre con vistas abiertas del paisaje tucumano.',
      chips: ['Paisaje', 'Recreación', 'Aire libre'],
    },
    {
      id: 'templo',
      name: 'Parroquia local y circuito religioso',
      category: 'faith',
      image:
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=80',
      summary:
        'Espacios de valor espiritual y arquitectónico que forman parte del recorrido tradicional de la comunidad.',
      chips: ['Fe', 'Arquitectura', 'Tradición'],
    },
    {
      id: 'plaza',
      name: 'Plaza central y casco histórico',
      category: 'culture',
      image:
        'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?auto=format&fit=crop&w=1400&q=80',
      summary:
        'Punto de encuentro ciudadano con edificios representativos, memoria urbana y vida cultural activa.',
      chips: ['Historia', 'Cultura', 'Encuentro'],
    },
    {
      id: 'rural',
      name: 'Rutas rurales y miradores',
      category: 'nature',
      image:
        'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1400&q=80',
      summary:
        'Recorridos escénicos ideales para conocer la identidad productiva y el paisaje del entorno de Trancas.',
      chips: ['Circuito', 'Miradores', 'Tradición rural'],
    },
  ],
  closingTitle: 'Trancas: memoria, cultura y futuro',
  closingText:
    'Esta sección reúne hitos históricos y atractivos turísticos para que vecinos y visitantes conozcan la identidad local. En próximas etapas se incorporarán más galerías, documentos históricos y recorridos temáticos.',
}

function mergeList(baseList, incomingList, mapper) {
  if (!Array.isArray(incomingList) || incomingList.length === 0) return baseList
  return incomingList.map((item, index) => mapper(item, baseList[index], index)).filter(Boolean)
}

export function mergeHistoryContent(base, remote) {
  if (!remote || typeof remote !== 'object') return base
  return {
    ...base,
    heroBadge: remote.heroBadge || base.heroBadge,
    heroTitle: remote.heroTitle || base.heroTitle,
    heroSubtitle: remote.heroSubtitle || base.heroSubtitle,
    heroImageUrl: remote.heroImageUrl || base.heroImageUrl,
    introStory: remote.introStory || base.introStory,
    ctaPrimaryLabel: remote.ctaPrimaryLabel || base.ctaPrimaryLabel,
    ctaPrimaryHref: remote.ctaPrimaryHref || base.ctaPrimaryHref,
    ctaSecondaryLabel: remote.ctaSecondaryLabel || base.ctaSecondaryLabel,
    ctaSecondaryHref: remote.ctaSecondaryHref || base.ctaSecondaryHref,
    legacyItems: mergeList(base.legacyItems, remote.legacyItems, (item, fallback) => ({
      title: item?.title || fallback?.title || '',
      text: item?.text || fallback?.text || '',
    })),
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
