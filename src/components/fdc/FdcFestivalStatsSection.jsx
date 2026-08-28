import { motion as Motion } from 'motion/react'
import { formatFdcStatNumber, normalizeFdcFestivalStats } from '../../data/fdcContent.js'
import { useCountUp } from '../../hooks/useCountUp.js'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'

const softEase = [0.22, 1, 0.36, 1]

function FdcStatIcon({ name, className = 'h-9 w-9 sm:h-10 sm:w-10' }) {
  const svgProps = {
    className: `${className} text-[#171b22]`,
    viewBox: '0 0 32 32',
    fill: 'currentColor',
    'aria-hidden': true,
  }

  switch (name) {
    case 'people':
      return (
        <svg {...svgProps}>
          <circle cx="16" cy="8.2" r="3.1" />
          <path d="M10.2 18.4c0-2.4 2.6-3.9 5.8-3.9s5.8 1.5 5.8 3.9V20H10.2v-1.6Z" />
          <circle cx="7.4" cy="10.1" r="2.35" />
          <path d="M3.8 18.8c0-1.55 1.75-2.55 3.6-2.55 1.05 0 1.95.35 2.55.95V20H3.8v-1.2Z" />
          <circle cx="24.6" cy="10.1" r="2.35" />
          <path d="M24.6 16.25c1.85 0 3.6 1 3.6 2.55V20H22v-1.2c.6-.6 1.5-.95 2.6-.95Z" />
        </svg>
      )
    case 'music':
      return (
        <svg {...svgProps}>
          <ellipse cx="11.2" cy="9.4" rx="3.8" ry="5.2" transform="rotate(-18 11.2 9.4)" />
          <path d="M14.2 5.2 22.8 3v11.8c0 1.45-1.15 2.65-2.55 2.65-1.45 0-2.65-1.2-2.65-2.65s1.2-2.65 2.65-2.65c.55 0 1.05.15 1.45.45V8.1l-6.2 1.45V5.2Z" />
          <rect x="10.1" y="14.2" width="2.2" height="8.8" rx=".6" />
          <path d="M6.8 23h8.8l-1.1 2.2H7.9l-1.1-2.2Z" />
        </svg>
      )
    case 'jineteada':
      return (
        <svg {...svgProps}>
          <path d="M4 23.5h24v1.5H4V23.5Z" />
          <path d="M8.5 21.2c1.2-1.1 2.8-1.7 4.6-1.7h6.3c1.4 0 2.7.45 3.8 1.2l-1.1 1.4h-12.6l-1-1Z" />
          <path d="M10.8 19.4c1.4-2.8 3.6-4.8 6.4-5.8l1.8 1.1-2.1 2.4 1.4 1.2 2.6-2.9 1.2.9-3.2 3.6c-.9.8-2 1.4-3.2 1.7l-4.9 1.1Z" />
          <circle cx="12.4" cy="11.2" r="1.7" />
          <path d="M13.8 10.1c.8-.9 1.9-1.4 3.1-1.4 2.2 0 4 1.8 4 4 0 .5-.1 1-.25 1.45l-1.35-.55c.1-.25.15-.55.15-.9 0-1.35-1.1-2.45-2.45-2.45-.75 0-1.4.35-1.85.9l-1.35-.91Z" />
          <path d="M18.8 8.2c.55-1.45 1.85-2.45 3.45-2.45 2.15 0 3.9 1.75 3.9 3.9 0 .75-.2 1.45-.55 2.05l-1.25-.85c.2-.4.3-.85.3-1.3 0-1.05-.85-1.9-1.9-1.9-.85 0-1.55.55-1.8 1.3l-1.15-.75Z" />
        </svg>
      )
    case 'peruvianHorse':
      return (
        <svg {...svgProps}>
          <path d="M6.5 24.5c1.2-2.2 3.1-3.6 5.6-4.1 1.1-.2 2.2-.15 3.2.15l1.4.45c.9.25 1.85.35 2.8.25 1.65-.15 3.15-.85 4.25-2.05l1.2 1.35c-1.45 1.55-3.35 2.45-5.45 2.65-1.25.1-2.5-.05-3.65-.55l-1.35-.55c-.85-.35-1.8-.5-2.75-.4-1.75.2-3.25 1.05-4.2 2.45l-1.11-1.25Z" />
          <path d="M10.2 20.4c1.35-2.45 3.35-4.05 5.85-4.65.95-.2 1.95-.25 2.95-.1l2.35.35c1.05.15 2.1.05 3.05-.35 1.05-.45 1.95-1.2 2.55-2.15l1.15.95c-.85 1.35-2.05 2.35-3.45 2.95-1.15.5-2.45.65-3.7.45l-2.2-.35c-.75-.1-1.55-.05-2.25.2-1.55.55-2.85 1.65-3.55 3.05l-1.05-.95Z" />
          <path d="M12.8 15.8c1.1-1.85 2.75-3.05 4.75-3.45l1.65-.3c1.35-.25 2.55-.95 3.35-2.05l.95 1.15c-.95 1.25-2.25 2.05-3.75 2.35l-1.55.3c-1.45.25-2.7 1.15-3.45 2.45l-1.05-.45Z" />
          <path d="M14.5 11.5c.55-1.35 1.75-2.25 3.2-2.25 1.75 0 3.15 1.4 3.15 3.15 0 .35-.05.7-.15 1l-1.2-.35c.05-.2.05-.4.05-.65 0-.75-.6-1.35-1.35-1.35-.65 0-1.2.45-1.35 1.05l-1.35-.5Z" />
          <path d="M18.2 7.8c.45-1.1 1.45-1.85 2.65-1.85 1.55 0 2.8 1.25 2.8 2.8 0 .55-.15 1.05-.4 1.5l-1.05-.55c.15-.3.25-.65.25-1.05 0-.65-.55-1.2-1.2-1.2-.55 0-1 .35-1.2.85l-.85-.5Z" />
          <path d="M8.5 22.8c-.55-.95-.85-2.05-.85-3.2 0-3.55 2.9-6.45 6.45-6.45.85 0 1.65.15 2.4.45l-.55 1.45c-.55-.2-1.15-.3-1.85-.3-2.55 0-4.65 2.1-4.65 4.65 0 .85.25 1.65.65 2.35l-2.5-.95Z" />
        </svg>
      )
    case 'food':
      return (
        <svg {...svgProps}>
          <path d="M10.2 4.5c.85 0 1.55.7 1.55 1.55v14.9c0 .85-.7 1.55-1.55 1.55s-1.55-.7-1.55-1.55V6.05c0-.85.7-1.55 1.55-1.55Z" />
          <path d="M13.3 4.5c.85 0 1.55.7 1.55 1.55v14.9c0 .85-.7 1.55-1.55 1.55s-1.55-.7-1.55-1.55V6.05c0-.85.7-1.55 1.55-1.55Z" />
          <path d="M11.75 12.8h-3.1v1.55h3.1V12.8Z" />
          <path d="M20.8 4.5c1.25 0 2.25 1 2.25 2.25v5.2c0 1.65-1.35 3-3 3h-.75v7.55c0 .85-.7 1.55-1.55 1.55s-1.55-.7-1.55-1.55V14.95h-.75c-1.65 0-3-1.35-3-3V6.75c0-1.25 1-2.25 2.25-2.25h6.1Z" />
        </svg>
      )
    case 'market':
      return (
        <svg {...svgProps}>
          <path d="M5 12.2 6.8 7.5h18.4L27 12.2v1.3H5v-1.3Z" />
          <path d="M6.5 13.5h19v8.5c0 .85-.7 1.55-1.55 1.55H8.05c-.85 0-1.55-.7-1.55-1.55v-8.5Z" />
          <path d="M10.5 13.5V24M16 13.5V24M21.5 13.5V24" opacity=".35" />
          <path d="M7.2 9.8h17.6l.9-2.3H6.3l.9 2.3Z" />
          <path d="M8.5 7.5 9.8 4.5h12.4l1.3 3h-15Z" />
          <path d="M11.5 18.5c0-.85.7-1.55 1.55-1.55h.9c.85 0 1.55.7 1.55 1.55v2.1h-4V18.5Z" />
          <path d="M18.5 18.5c0-.85.7-1.55 1.55-1.55h.9c.85 0 1.55.7 1.55 1.55v2.1h-4V18.5Z" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...svgProps}>
          <path d="M8 4.5v2.5M24 4.5v2.5M6 9.5h20v16.5c0 .85-.7 1.55-1.55 1.55H7.55C6.7 27.5 6 26.8 6 26V9.5Z" />
          <path d="M6 13.5h20v-4H6v4Z" opacity=".25" />
          <rect x="10" y="16.5" width="3.5" height="3.5" rx=".6" />
          <rect x="16.25" y="16.5" width="3.5" height="3.5" rx=".6" />
          <rect x="10" y="21.5" width="3.5" height="3.5" rx=".6" opacity=".65" />
        </svg>
      )
    case 'ticket':
      return (
        <svg {...svgProps}>
          <path d="M8 6.5h16c.85 0 1.55.7 1.55 1.55v2.05c-.85.35-1.45 1.15-1.45 2.1s.6 1.75 1.45 2.1v2.05c0 .85-.7 1.55-1.55 1.55H8c-.85 0-1.55-.7-1.55-1.55v-2.2c.95-.25 1.65-1.1 1.65-2.15s-.7-1.9-1.65-2.15V8.05c0-.85.7-1.55 1.55-1.55Z" />
          <path d="M17 6.5v19" opacity=".35" />
        </svg>
      )
    case 'horse':
    default:
      return (
        <svg {...svgProps}>
          <path d="M6.5 24.5c1.1-2.35 3-3.85 5.45-4.35 1.05-.2 2.15-.15 3.15.2l1.35.45c.85.25 1.75.35 2.65.25 1.55-.15 2.95-.85 4-2.05l1.15 1.3c-1.35 1.45-3.1 2.3-5.05 2.5-1.2.1-2.35-.05-3.45-.55l-1.3-.55c-.8-.35-1.7-.5-2.6-.4-1.65.2-3.05 1.05-3.95 2.4l-1.05-1.2Z" />
          <path d="M10.5 20.2c1.25-2.3 3.15-3.85 5.55-4.4.9-.2 1.85-.25 2.8-.1l2.25.35c1 .15 2.05.05 2.95-.35 1-.45 1.85-1.15 2.4-2.05l1.1.9c-.8 1.25-1.95 2.15-3.3 2.7-1.1.45-2.35.6-3.55.4l-2.1-.35c-.7-.1-1.45-.05-2.15.2-1.5.55-2.75 1.65-3.4 3.05l-1-.9Z" />
          <path d="M13.2 15.5c1-1.7 2.55-2.85 4.45-3.2l1.55-.3c1.25-.25 2.35-.9 3.1-1.85l.9 1.1c-.85 1.15-2.05 1.9-3.45 2.2l-1.45.3c-1.35.25-2.5 1.1-3.2 2.35l-.9-.4Z" />
          <path d="M15 11.2c.5-1.25 1.65-2.05 3-2.05 1.65 0 3 1.35 3 3 0 .35-.05.65-.15.95l-1.15-.35c.05-.2.05-.4.05-.6 0-.7-.55-1.25-1.25-1.25-.6 0-1.1.4-1.25.95l-1.25-.45Z" />
          <path d="M18.5 7.5c.4-1 1.35-1.65 2.45-1.65 1.45 0 2.65 1.2 2.65 2.65 0 .5-.15 1-.35 1.4l-1-.5c.1-.25.15-.55.15-.9 0-.75-.6-1.35-1.35-1.35-.55 0-1.05.3-1.25.75l-.9-.45Z" />
          <path d="M8.8 22.5c-.5-.85-.75-1.85-.75-2.9 0-3.2 2.6-5.8 5.8-5.8.75 0 1.45.15 2.1.4l-.5 1.3c-.5-.15-1.05-.25-1.6-.25-2.3 0-4.2 1.9-4.2 4.2 0 .75.2 1.45.55 2.05l-1.5-.6Z" />
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
          className="mb-3 flex h-11 w-11 items-center justify-center sm:mb-3.5 sm:h-12 sm:w-12"
          initial={{ opacity: 0, scale: 0.88 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: delayMs / 1000 + 0.05, ease: softEase }}
        >
          <FdcStatIcon name={item.icon} className="h-full w-full" />
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
