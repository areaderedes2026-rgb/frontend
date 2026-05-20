const CATEGORY_KEYS = {
  documentación: 'document',
  documentacion: 'document',
  comunidad: 'community',
  obras: 'works',
  salud: 'health',
  educación: 'education',
  educacion: 'education',
  cultura: 'culture',
  turismo: 'culture',
  ambiente: 'environment',
  seguridad: 'security',
  transporte: 'transport',
  tributario: 'tax',
  comercial: 'tax',
}

const SLUG_HINTS = [
  { match: /partida|licencia|document/i, key: 'document' },
  { match: /habilitacion|comercial|tribut/i, key: 'tax' },
  { match: /reclamo|obra|urbano|bache/i, key: 'works' },
  { match: /social|apoyo|comunidad/i, key: 'community' },
  { match: /salud|turno/i, key: 'health' },
  { match: /educ|escuela/i, key: 'education' },
  { match: /cultura|arte/i, key: 'culture' },
  { match: /ambiente|recicl/i, key: 'environment' },
  { match: /seguridad|emergencia/i, key: 'security' },
  { match: /transporte|movilidad/i, key: 'transport' },
]

function normalizeKey(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function resolveMunicipalServiceIconKey(service) {
  const category = normalizeKey(service?.category)
  if (CATEGORY_KEYS[category]) return CATEGORY_KEYS[category]

  const slugTitle = `${service?.slug || ''} ${service?.title || ''}`
  for (const { match, key } of SLUG_HINTS) {
    if (match.test(slugTitle)) return key
  }
  return 'default'
}

function IconPaths({ iconKey }) {
  const common = {
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  switch (iconKey) {
    case 'document':
      return (
        <svg {...common} aria-hidden>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
      )
    case 'tax':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    case 'works':
      return (
        <svg {...common} aria-hidden>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    case 'community':
      return (
        <svg {...common} aria-hidden>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'health':
      return (
        <svg {...common} aria-hidden>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    case 'education':
      return (
        <svg {...common} aria-hidden>
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
        </svg>
      )
    case 'culture':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 3a9 9 0 1 0 9 9" />
          <path d="M12 3v9l6.4 3.6" />
          <path d="M8 14h8M8 18h5" />
        </svg>
      )
    case 'environment':
      return (
        <svg {...common} aria-hidden>
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      )
    case 'security':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    case 'transport':
      return (
        <svg {...common} aria-hidden>
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      )
    default:
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      )
  }
}

export function MunicipalServiceIcon({ service, className = 'h-7 w-7' }) {
  const iconKey = resolveMunicipalServiceIconKey(service)
  return (
    <span className={`inline-flex text-sky-600 ${className}`.trim()}>
      <IconPaths iconKey={iconKey} />
    </span>
  )
}
