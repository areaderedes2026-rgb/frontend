import { Fragment } from 'react'
import { motion as Motion } from 'motion/react'
import { formatFdcStatNumber, normalizeFdcFestivalStats } from '../../data/fdcContent.js'
import { useCountUp } from '../../hooks/useCountUp.js'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'
import { FdcSectionTitle } from './FdcFestivalSections.jsx'
import { FdcStatIcon } from './FdcStatIcon.jsx'

const softEase = [0.22, 1, 0.36, 1]

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

export { FdcStatIcon } from './FdcStatIcon.jsx'
