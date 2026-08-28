import { motion as Motion } from 'motion/react'
import { formatFdcStatNumber, normalizeFdcFestivalStats } from '../../data/fdcContent.js'
import { useCountUp } from '../../hooks/useCountUp.js'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'

const softEase = [0.22, 1, 0.36, 1]

function FdcStatIcon({ name, className = 'h-9 w-9 sm:h-10 sm:w-10' }) {
  const props = {
    className: `${className} text-[#171b22]`,
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    'aria-hidden': true,
  }

  switch (name) {
    case 'people':
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19a4 4 0 0 0-8 0M12 11.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM18.75 19a3.75 3.75 0 0 0-7.5 0M16.5 10.5a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5ZM5.25 19a3.75 3.75 0 0 0 7.5 0M7.5 10.5a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z"
          />
        </svg>
      )
    case 'music':
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 18.75V6.75l9-2.25v12M9 18.75a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm9-2.25a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
          />
        </svg>
      )
    case 'jineteada':
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 17.25h15M7.5 14.25 10.5 9l2.25 1.5L15 8.25l2.25 3M6 17.25c0-1.5 1.5-2.25 3-2.25h6c1.5 0 3 .75 3 2.25"
          />
          <circle cx="7.5" cy="8.25" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'peruvianHorse':
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.25 16.5c1.5-3 3.75-4.5 6.75-4.5s5.25 1.5 6.75 4.5M8.25 12.75c1.2-2.25 2.85-3.75 5.25-4.5M12 8.25V5.25M10.5 6.75h3"
          />
          <path strokeLinecap="round" d="M6.75 16.5c.75-1.5 2.25-2.25 3.75-2.25" />
        </svg>
      )
    case 'food':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6v12M11.25 6v12M8.25 12h3" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6v4.5c0 1.5 1.5 2.25 2.25 2.25V6"
          />
        </svg>
      )
    case 'market':
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.25 9.75 6.75 5.25h10.5l1.5 4.5M6 9.75h12v8.25a1.5 1.5 0 0 1-1.5 1.5h-9a1.5 1.5 0 0 1-1.5-1.5V9.75Z"
          />
          <path strokeLinecap="round" d="M9 9.75V19.5M15 9.75V19.5" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M4.5 9.75h15M5.25 5.25h13.5A1.5 1.5 0 0 1 20.25 6.75v12A1.5 1.5 0 0 1 18.75 20.25H5.25A1.5 1.5 0 0 1 3.75 18.75v-12A1.5 1.5 0 0 1 5.25 5.25Z"
          />
        </svg>
      )
    case 'ticket':
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 6v12M5.25 8.25A2.25 2.25 0 0 1 7.5 6h9a2.25 2.25 0 0 1 2.25 2.25v1.5a1.5 1.5 0 0 0 0 3v1.5A2.25 2.25 0 0 1 16.5 18h-9a2.25 2.25 0 0 1-2.25-2.25v-1.5a1.5 1.5 0 0 0 0-3v-1.5A2.25 2.25 0 0 1 7.5 6Z"
          />
        </svg>
      )
    case 'horse':
    default:
      return (
        <svg {...props}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.25 16.5c1.35-2.85 3.6-4.5 6.75-4.5 2.1 0 4.05.9 5.55 2.55M8.25 12.75c1.05-2.1 2.55-3.45 4.5-4.05M12 8.25V5.25M10.5 6.75h3M6.75 16.5c.75-1.35 1.95-2.1 3.3-2.1"
          />
        </svg>
      )
  }
}

function FestivalStatBlock({ item, delayMs = 0 }) {
  const valueText = String(item.valueText || '').trim()
  const hasNumber = !valueText && Number(item.value) > 0
  const { ref, value } = useCountUp(hasNumber ? item.value : 0, { duration: 2400 })
  const displayNumber = formatFdcStatNumber(value, item.prefix || '')
  const labelLines = [item.label, item.sublabel].map((line) => String(line || '').trim()).filter(Boolean)

  return (
    <RevealOnScroll variant="newsCardSlow" delayMs={delayMs}>
      <Motion.div
        className="flex h-full flex-col items-center px-3 py-2 text-center sm:px-4"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, delay: delayMs / 1000, ease: softEase }}
      >
        <Motion.div
          className="mb-3 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.88 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: delayMs / 1000 + 0.05, ease: softEase }}
        >
          <FdcStatIcon name={item.icon} />
        </Motion.div>

        {valueText ? (
          <p className="font-serif text-lg font-bold uppercase leading-tight tracking-[0.04em] text-[#171b22] sm:text-xl lg:text-[1.35rem]">
            {valueText}
          </p>
        ) : (
          <p
            ref={hasNumber ? ref : undefined}
            className="font-serif text-2xl font-bold tabular-nums leading-none tracking-tight text-[#171b22] sm:text-[1.75rem] lg:text-3xl"
          >
            {displayNumber}
          </p>
        )}

        {labelLines.length > 0 ? (
          <div className="mt-2 space-y-0.5">
            {labelLines.map((line) => (
              <p
                key={line}
                className="text-[10px] font-bold uppercase leading-tight tracking-[0.16em] text-[#171b22]/88 sm:text-[11px] sm:tracking-[0.18em]"
              >
                {line}
              </p>
            ))}
          </div>
        ) : null}
      </Motion.div>
    </RevealOnScroll>
  )
}

export function FdcFestivalStatsSection({ stats, className = '' }) {
  const normalized = normalizeFdcFestivalStats(stats)
  const items = normalized.items || []
  if (!items.length) return null

  const title = String(normalized.title || '').trim()
  const subtitle = String(normalized.subtitle || '').trim()

  return (
    <section
      className={`relative ${className}`.trim()}
      aria-labelledby={title ? 'fdc-festival-stats-heading' : undefined}
    >
      {title ? (
        <header className="mb-8 flex items-center justify-center gap-3 sm:mb-10 sm:gap-4">
          <span className="h-px w-10 bg-[#d4b483]/75 sm:w-14" aria-hidden />
          <h2
            id="fdc-festival-stats-heading"
            className="max-w-[16rem] text-center font-serif text-xl font-bold uppercase leading-tight tracking-[0.08em] text-[#171b22] sm:max-w-none sm:text-2xl lg:text-[2rem] lg:tracking-[0.1em]"
          >
            {title}
          </h2>
          <span className="h-px w-10 bg-[#d4b483]/75 sm:w-14" aria-hidden />
        </header>
      ) : null}

      {subtitle ? (
        <p className="mx-auto -mt-4 mb-8 max-w-2xl text-center text-sm leading-relaxed text-[#4b505a] sm:-mt-6 sm:mb-10 sm:text-base">
          {subtitle}
        </p>
      ) : null}

      <ul className="grid list-none grid-cols-2 gap-y-8 p-0 sm:grid-cols-3 lg:grid-cols-6 lg:gap-y-0">
        {items.map((item, index) => (
          <li
            key={item.id || index}
            className={`relative min-w-0 ${
              index % 2 !== 0 ? 'border-l border-[#d4b483]/45' : ''
            } ${index >= 2 ? 'border-t border-[#d4b483]/35 pt-8 sm:border-t-0 sm:pt-0' : ''} ${
              index % 3 !== 0 ? 'sm:border-l sm:border-[#d4b483]/45' : 'sm:border-l-0'
            } lg:border-t-0 lg:pt-0 ${index % 6 !== 0 ? 'lg:border-l lg:border-[#d4b483]/45' : 'lg:border-l-0'}`}
          >
            <FestivalStatBlock item={item} delayMs={70 + index * 80} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export { FdcStatIcon }
