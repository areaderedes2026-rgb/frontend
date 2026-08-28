import { Fragment } from 'react'
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
          <path d="M7 17.5c1.2-.8 2.6-1.2 4-1.2h3.5" />
          <path d="M9.5 14.5 11.5 10l2.5 1.5-1 2.5" />
          <circle cx="10.5" cy="8" r="1.5" />
          <path d="M14 8.5c.8-1.2 2-2 3.5-1.8 1.4.2 2.5 1.3 2.8 2.7" />
          <path d="M18 6.5c.4-.9 1.3-1.5 2.3-1.5 1.5 0 2.7 1.2 2.7 2.7" />
        </svg>
      )
    case 'peruvianHorse':
      return (
        <svg {...svgProps}>
          <path d="M22 5h-2l-3 3h-4l-2-3h-2" />
          <path d="M4 20h2l1-3 4-1 3 1 1 3h3" />
          <path d="M7 17l-2-5 2-2 3 1" />
          <path d="M13 14l1.5-3" />
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
          <path d="M22 5h-2l-3 3h-4l-2-3h-2" />
          <path d="M4 20h2l1-3 4-1 3 1 1 3h3" />
          <path d="M7 17l-2-5 2-2 3 1" />
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
        className="flex w-[8.75rem] flex-col items-center px-2 py-1 text-center sm:w-[9.25rem] sm:px-3 sm:py-2 lg:w-[9.5rem]"
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

function StatItemDivider({ show }) {
  if (!show) return null
  return (
    <li
      className="hidden w-px shrink-0 self-stretch bg-[#d4b483]/40 sm:block"
      aria-hidden
    />
  )
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

      <ul className="mx-auto flex w-full max-w-5xl list-none flex-wrap items-start justify-center gap-x-6 gap-y-10 p-0 sm:gap-x-8 lg:gap-x-10">
        {items.map((item, index) => (
          <Fragment key={item.id || index}>
            <StatItemDivider show={index > 0} />
            <li className="flex justify-center">
              <FestivalStatBlock item={item} delayMs={70 + index * 80} />
            </li>
          </Fragment>
        ))}
      </ul>
    </section>
  )
}

export { FdcStatIcon }
