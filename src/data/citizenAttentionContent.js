/** Contenido por defecto de la sección Atención al ciudadano. */

export const DEFAULT_CITIZEN_ATTENTION_CONTENT = {
  heroEyebrow: 'Tu municipio te escucha',
  heroTitle: 'Atención al ciudadano',
  heroSubtitle:
    'Un solo lugar para consultas, reclamos y orientación. Diseñamos esta experiencia para que encuentres rápido el canal adecuado y nos dejes tu mensaje con total claridad.',
  heroImageUrl: '/images/atencion-hero-bg.jpg',
  channels: [
  {
    id: 'presencial',
    title: 'Mesa de entrada',
    subtitle: 'Documentación y trámites',
    description:
      'Recibí asesoramiento sobre trámites, presentación de notas y constancias. Llevá DNI y, si aplica, la documentación respaldatoria.',
    accent: 'from-sky-600 to-cyan-600',
    icon: 'building',
  },
  {
    id: 'telefono',
    title: 'Teléfonos útiles',
    subtitle: 'Voz a voz con el equipo',
    description:
      'Comunicate con las áreas operativas. Tenemos derivación interna para que tu consulta llegue a quien corresponda.',
    accent: 'from-emerald-600 to-teal-600',
    icon: 'phone',
  },
  {
    id: 'digital',
    title: 'Consulta web',
    subtitle: 'Este formulario',
    description:
      'Dejanos tu mensaje detallado. Es la vía recomendada para reclamos, sugerencias o pedidos que requieran seguimiento por escrito.',
    accent: 'from-violet-600 to-indigo-600',
    icon: 'mail',
  },
  {
    id: 'redes',
    title: 'Redes sociales',
    subtitle: 'Instagram y Facebook',
    description:
      'Seguí novedades y avisos urgentes. Para trámites formales siempre preferimos mesa de entrada o consulta web.',
    accent: 'from-fuchsia-600 to-pink-600',
    icon: 'share',
  },
  ],
  faq: [
  {
    id: 'horario',
    q: '¿Cuál es el horario de atención al público?',
    a: 'De lunes a viernes de 8:00 a 14:00 en la sede central. Los feriados nacionales y provinciales no hay atención presencial salvo avisos especiales en redes.',
  },
  {
    id: 'demora',
    q: '¿Cuánto tarda una respuesta por el formulario web?',
    a: 'Trabajamos con un plazo orientativo de hasta 48 horas hábiles para la primera respuesta. Temas complejos pueden requerir más tiempo; en ese caso te avisamos.',
  },
  {
    id: 'urgente',
    q: '¿Dónde comunico una urgencia (ej. calle inundada)?',
    a: 'Para emergencias operativas usá la línea vecinal o los números publicados por Defensa Civil. Este sitio es informativo: en emergencias reales llamá al 100 o al servicio que corresponda.',
  },
  {
    id: 'datos',
    q: '¿Mis datos están protegidos?',
    a: 'Sí. Solo usamos la información para gestionar tu consulta dentro del municipio y conforme a la normativa vigente.',
  },
  ],
  tips: [
    'Llevá siempre DNI o documento que acredite identidad en mesa de entrada.',
    'En consultas web, cuanto más contexto (dirección, fechas y referencias), mejor.',
  ],
  formTopics: [
    { value: 'consulta', label: 'Consulta general' },
    { value: 'reclamo', label: 'Reclamo o inconveniente' },
    { value: 'sugerencia', label: 'Sugerencia o felicitación' },
    { value: 'turno', label: 'Turno o documentación' },
    { value: 'otro', label: 'Otro' },
  ],
  formIntroText:
    'Completá tus datos para que podamos gestionar tu consulta.',
  finalCtaTitle: '¿Preferís ver el mapa de servicios?',
  finalCtaText:
    'Desde Servicios podés ubicar trámites y requisitos. La atención al ciudadano complementa esa información con contacto directo.',
  finalPrimaryLabel: 'Ir a Servicios',
  finalPrimaryHref: '/services',
  finalSecondaryLabel: 'Ver noticias',
  finalSecondaryHref: '/news',
}

function mergeList(base, incoming, mapper) {
  if (!Array.isArray(incoming) || incoming.length === 0) return base
  return incoming.map((item, i) => mapper(item, base[i], i)).filter(Boolean)
}

export function mergeCitizenAttentionContent(base, remote) {
  if (!remote || typeof remote !== 'object') return base
  return {
    ...base,
    heroEyebrow: remote.heroEyebrow || base.heroEyebrow,
    heroTitle: remote.heroTitle || base.heroTitle,
    heroSubtitle: remote.heroSubtitle || base.heroSubtitle,
    heroImageUrl: remote.heroImageUrl || base.heroImageUrl,
    channels: mergeList(base.channels, remote.channels, (item, fallback, i) => ({
      id: item?.id || fallback?.id || `canal-${i + 1}`,
      title: item?.title || fallback?.title || '',
      subtitle: item?.subtitle || fallback?.subtitle || '',
      description: item?.description || fallback?.description || '',
      accent: item?.accent || fallback?.accent || 'from-sky-600 to-cyan-600',
      icon: item?.icon || fallback?.icon || 'mail',
    })),
    faq: mergeList(base.faq, remote.faq, (item, fallback, i) => ({
      id: item?.id || fallback?.id || `faq-${i + 1}`,
      q: item?.q || fallback?.q || '',
      a: item?.a || fallback?.a || '',
    })),
    tips: mergeList(base.tips, remote.tips, (item, fallback) => item || fallback || ''),
    formTopics: mergeList(base.formTopics, remote.formTopics, (item, fallback, i) => ({
      value: item?.value || fallback?.value || `tema-${i + 1}`,
      label: item?.label || fallback?.label || '',
    })),
    formIntroText: remote.formIntroText || base.formIntroText,
    finalCtaTitle: remote.finalCtaTitle || base.finalCtaTitle,
    finalCtaText: remote.finalCtaText || base.finalCtaText,
    finalPrimaryLabel: remote.finalPrimaryLabel || base.finalPrimaryLabel,
    finalPrimaryHref: remote.finalPrimaryHref || base.finalPrimaryHref,
    finalSecondaryLabel: remote.finalSecondaryLabel || base.finalSecondaryLabel,
    finalSecondaryHref: remote.finalSecondaryHref || base.finalSecondaryHref,
  }
}
