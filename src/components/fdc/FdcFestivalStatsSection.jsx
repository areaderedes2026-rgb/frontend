import { motion as Motion } from 'motion/react'
import { formatFdcStatNumber, normalizeFdcFestivalStats } from '../../data/fdcContent.js'
import { useCountUp } from '../../hooks/useCountUp.js'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'
import { FdcSectionTitle } from './FdcFestivalSections.jsx'

const softEase = [0.22, 1, 0.36, 1]

function FdcStatIcon({ name, className = 'h-9 w-9 sm:h-10 sm:w-10' }) {
  const svgProps = {
    className: `${className} text-[#171b22]`,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  switch (name) {
    case 'people':
      return (
        <svg {...svgProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'music':
      return (
        <svg {...svgProps}>
          <path d="M12 16a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
          <path d="M12 19v3" />
          <path d="M8 22h8" />
        </svg>
      )
    case 'jineteada':
      return (
        <svg {...svgProps}>
          <path d="M4 20h16" />
          <path d="M7 17h10" />
          <path d="M9 14l2-4 3 2-1.5 2" />
          <circle cx="10.5" cy="7.5" r="1.75" />
          <path d="M12 7.5c1-1.5 2.5-2.25 4.25-2 1.25.17 2.25 1.17 2.5 2.42" />
          <path d="M16.75 5.25c.5-1.1 1.55-1.85 2.75-1.85 1.65 0 3 1.35 3 3 0 .55-.15 1.05-.4 1.48" />
        </svg>
      )
    case 'peruvianHorse':
      return (
        <svg {...svgProps}>
          <path d="M5 19c1.2-2 3-3.25 5.25-3.65" />
          <path d="M8.5 15.5c1-1.75 2.55-2.9 4.5-3.35" />
          <path d="M11.5 12c.85-1.45 2.15-2.35 3.75-2.65" />
          <path d="M13.5 8.75c.45-1 1.35-1.65 2.45-1.65 1.45 0 2.65 1.2 2.65 2.65" />
          <path d="M16.25 5.75c.35-.85 1.12-1.42 2.05-1.42 1.28 0 2.32 1.04 2.32 2.32" />
          <path d="M7.5 17.5c-.5-.85-.75-1.82-.75-2.82 0-2.75 2.25-5 5-5 .72 0 1.4.15 2 .42" />
        </svg>
      )
    case 'food':
      return (
        <svg {...svgProps}>
          <path d="M8 2v8a2 2 0 0 0 4 0V2" />
          <path d="M10 10v12" />
          <path d="M16 2v6a2 2 0 0 1-2 2h-1v14" />
        </svg>
      )
    case 'market':
      return (
        <svg {...svgProps}>
          <path d="M3 9 4.5 4.5h15L21 9v1H3V9Z" />
          <path d="M5 10v8.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V10" />
          <path d="M10 10v10M14 10v10" />
          <path d="M8 14h8" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...svgProps}>
          <path d="M8 2v4M16 2v4" />
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M3 10h18" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
        </svg>
      )
    case 'ticket':
      return (
        <svg {...svgProps}>
          <path d="M2 9a3 3 0 0 1 0 6v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1a3 3 0 0 1 0-6V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v1Z" />
          <path d="M13 5v14" />
        </svg>
      )
    case 'horse':
    default:
      return (
        <svg {...svgProps}>
          <path d="M5 19c1-1.85 2.65-3.05 4.75-3.55" />
          <path d="M8.5 15.5c1.15-2.05 2.88-3.38 5.12-3.88" />
          <path d="M11.5 11.8c.92-1.48 2.32-2.42 4.05-2.72" />
          <path d="M13.5 8.4c.48-1.08 1.52-1.78 2.72-1.78 1.58 0 2.88 1.3 2.88 2.88" />
          <path d="M16.5 5.2c.38-.92 1.22-1.55 2.22-1.55 1.38 0 2.5 1.12 2.5 2.5" />
          <path d="M8.2 18.2c-.48-.82-.72-1.75-.72-2.72 0-2.98 2.42-5.4 5.4-5.4" />
        </svg>
      )
  }
}

function FestivalStatBlock({ item, delayMs = 0 }) {
  const label = String(item.label || '').trim()
  const numericValue = Math.max(0, Number(item.value) || 0)
  const { ref, value } = useCountUp(numericValue, { duration: 2400 })
  const displayNumber = formatFdcStatNumber(value, item.prefix || '')

  return (
    <RevealOnScroll variant="newsCardSlow" delayMs={delayMs}>
      <Motion.div
        className="mx-auto flex h-full max-w-[9.5rem] flex-col items-center px-2 py-1 text-center sm:max-w-none sm:px-3 sm:py-2"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, delay: delayMs / 1000, ease: softEase }}
      >
        <Motion.div
          className="mb-2.5 flex h-10 w-10 shrink-0 items-center justify-center sm:mb-3 sm:h-11 sm:w-11 lg:h-12 lg:w-12"
          initial={{ opacity: 0, scale: 0.88 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: delayMs / 1000 + 0.05, ease: softEase }}
        >
          <FdcStatIcon name={item.icon} className="h-full w-full" />
        </Motion.div>

        {label ? (
          <p className="min-h-[2.5rem] text-[10px] font-bold uppercase leading-tight tracking-[0.14em] text-[#171b22]/88 sm:min-h-0 sm:text-[11px] sm:tracking-[0.18em]">
            {label}
          </p>
        ) : null}

        <p
          ref={ref}
          className="mt-1.5 font-serif text-[1.65rem] font-bold tabular-nums leading-none tracking-tight text-[#171b22] sm:mt-2 sm:text-[1.75rem] lg:text-3xl"
        >
          {displayNumber}
        </p>
      </Motion.div>
    </RevealOnScroll>
  )
}

function statDividerClass(index) {
  const mobileCol = index % 2
  const smCol = index % 3
  const lgCol = index % 6
  const mobileRow = index >= 2
  const smRow = index >= 3
  return [
    mobileCol === 1 ? 'border-l border-[#d4b483]/40' : '',
    mobileRow ? 'border-t border-[#d4b483]/35 pt-8' : '',
    smCol !== 0 ? 'sm:border-l sm:border-[#d4b483]/40' : 'sm:border-l-0',
    smRow ? 'sm:border-t sm:border-[#d4b483]/35 sm:pt-8' : 'sm:border-t-0 sm:pt-0',
    lgCol !== 0 ? 'lg:border-l lg:border-[#d4b483]/40' : 'lg:border-l-0',
    'lg:border-t-0 lg:pt-0',
  ]
    .filter(Boolean)
    .join(' ')
}

export function FdcFestivalStatsSection({ stats, className = '' }) {
  const normalized = normalizeFdcFestivalStats(stats)
  const items = normalized.items || []
  if (!items.length) return null

  const title = String(normalized.title || '').trim()
  const subtitle = String(normalized.subtitle || '').trim()
  const showHeading = normalized.showTitle === true && Boolean(title || subtitle)

  return (
    <section
      className={`relative ${className}`.trim()}
      aria-label={showHeading ? undefined : title || 'Estadísticas del festival'}
    >
      {showHeading ? (
        <FdcSectionTitle title={title} subtitle={subtitle || undefined} tone="light" />
      ) : null}

      <ul className="grid list-none grid-cols-2 gap-y-8 p-0 sm:grid-cols-3 lg:grid-cols-6 lg:gap-y-0">
        {items.map((item, index) => (
          <li
            key={item.id || index}
            className={`relative flex min-w-0 items-stretch ${statDividerClass(index)}`}
          >
            <FestivalStatBlock item={item} delayMs={70 + index * 80} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export { FdcStatIcon }
