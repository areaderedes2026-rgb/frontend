import { useMemo, useState } from 'react'
import { motion as Motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { useFdcSectionTone } from './FdcSectionToneContext.jsx'
import { FdcSectionTitle } from './FdcFestivalSections.jsx'

const softEase = [0.22, 1, 0.36, 1]

function SmartLink({ href, className, children, ...rest }) {
  const target = String(href || '').trim() || '#'
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return (
      <a href={target} className={className} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    )
  }
  if (target.startsWith('#')) {
    return (
      <a href={target} className={className} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <Link to={target} className={className} {...rest}>
      {children}
    </Link>
  )
}

function displayHost(url) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  try {
    return new URL(raw).hostname.replace(/^www\./, '')
  } catch {
    return raw.replace(/^https?:\/\//i, '').replace(/\/$/, '')
  }
}

function mapsUrl(city, address) {
  const q = [city, address].filter(Boolean).join(' ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

function PaseshowWordmark() {
  return (
    <span className="inline-flex items-center gap-1.5 font-extrabold tracking-[0.14em] text-[1.15rem] leading-none sm:text-[1.35rem]">
      PASESHOW
      <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M3 13 13 3M6.5 3H13v6.5"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function FdcTicketsSection({ tickets, hideHeading = false, embedded = false }) {
  const title = String(tickets?.title || '').trim()
  const { titleTone, usesDarkTone } = useFdcSectionTone(tickets)
  const body = String(tickets?.body || '').trim()
  const price = String(tickets?.price || '').trim()
  const pricePrefix = String(tickets?.pricePrefix || '$').trim() || '$'
  const partnerName = String(tickets?.partnerName || '').trim()
  const onlineLabel = String(tickets?.onlineLabel || tickets?.ctaLabel || '').trim() || 'Comprá online'
  const onlineUrl = String(tickets?.onlineUrl || tickets?.ctaUrl || '').trim()
  const salePointsTitle =
    String(tickets?.salePointsTitle || '').trim() || 'También de forma presencial'
  const salePoints = useMemo(
    () =>
      (tickets?.salePoints || [])
        .map((p) => ({
          id: String(p?.id || p?.city || '').trim(),
          city: String(p?.city || '').trim(),
          addresses: (p?.addresses || []).map((a) => String(a || '').trim()).filter(Boolean),
        }))
        .filter((p) => p.city && p.addresses.length > 0),
    [tickets?.salePoints],
  )

  const [copied, setCopied] = useState('')

  if (!title) return null

  async function copyAddress(event, text) {
    event.preventDefault()
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(text)
      window.setTimeout(() => setCopied((cur) => (cur === text ? '' : cur)), 1600)
    } catch {
      setCopied('')
    }
  }

  const ink = usesDarkTone ? 'text-white' : 'text-[#171b22]'
  const muted = usesDarkTone ? 'text-white/60' : 'text-[#5a5f68]'
  const line = usesDarkTone ? 'bg-white/15' : 'bg-[#171b22]/12'

  const content = (
    <div className="mx-auto w-full max-w-5xl">
      {!hideHeading ? (
        <FdcSectionTitle
          title={title}
          tone={titleTone}
          subtitle={body || undefined}
          className="mb-10 sm:mb-12"
        />
      ) : null}

      <Motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: softEase }}
        className="flex flex-col items-center text-center"
      >
        {price ? (
          <p className="font-serif text-[clamp(3.4rem,12vw,6.5rem)] font-bold leading-[0.9] tracking-tight text-[#d4b483]">
            <span className="mr-1 align-top text-[0.38em] font-semibold">{pricePrefix}</span>
            {price}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col items-center gap-3">
          {partnerName ? (
            <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${muted}`}>
              Venta oficial
            </p>
          ) : null}

          {onlineUrl ? (
            <SmartLink
              href={onlineUrl}
              className="group inline-flex min-h-14 items-center gap-4 rounded-2xl bg-[#5c2d91] px-6 py-3 text-white shadow-[0_18px_40px_-18px_rgba(92,45,145,0.85)] transition hover:bg-[#6b35a8] hover:shadow-[0_22px_48px_-16px_rgba(92,45,145,0.95)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483] sm:px-7"
            >
              <span className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
                  {onlineLabel}
                </span>
                <span className="mt-1.5">
                  <PaseshowWordmark />
                </span>
              </span>
              <span className="hidden text-xs font-medium text-white/70 sm:inline">
                {displayHost(onlineUrl)}
              </span>
            </SmartLink>
          ) : null}
        </div>
      </Motion.div>

      {salePoints.length > 0 ? (
        <div className="mt-14 sm:mt-16">
          <Motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className={`mb-8 text-center text-[11px] font-bold uppercase tracking-[0.22em] ${muted}`}
          >
            {salePointsTitle}
          </Motion.p>

          <div className="relative grid gap-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-4 lg:gap-8">
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 hidden h-px lg:block ${line}`}
              aria-hidden
            />
            {salePoints.map((point, idx) => (
              <Motion.div
                key={point.id || point.city}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 + idx * 0.07, ease: softEase }}
                className="relative pt-0 lg:pt-8"
              >
                <span
                  className="absolute left-0 top-0 hidden h-2 w-2 -translate-y-1/2 rounded-full bg-[#d4b483] lg:block"
                  aria-hidden
                />
                <p className="font-serif text-xl font-bold uppercase tracking-[0.08em] text-[#d4b483] sm:text-[1.35rem]">
                  {point.city}
                </p>
                <ul className="mt-4 space-y-3">
                  {point.addresses.map((address) => {
                    const query = `${point.city} ${address}`
                    return (
                      <li key={address}>
                        <a
                          href={mapsUrl(point.city, address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`group/addr block text-sm leading-relaxed transition sm:text-[15px] ${ink} hover:text-[#d4b483]`}
                        >
                          {address}
                          <span className={`mt-1 block text-[10px] font-semibold uppercase tracking-[0.14em] ${muted} sm:opacity-0 sm:transition sm:group-hover/addr:opacity-100`}>
                            Ver en el mapa
                          </span>
                        </a>
                        <button
                          type="button"
                          onClick={(e) => copyAddress(e, query)}
                          className={`mt-1 text-[10px] font-medium uppercase tracking-[0.12em] ${muted} hover:text-[#d4b483]`}
                        >
                          {copied === query ? 'Copiado' : 'Copiar'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </Motion.div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )

  if (embedded) return content

  return (
    <section
      id={hideHeading ? undefined : 'entradas'}
      className="relative isolate overflow-hidden py-14 sm:py-16 lg:py-20 scroll-mt-[calc(var(--navbar-h,5rem)+4rem)]"
    >
      {content}
    </section>
  )
}
