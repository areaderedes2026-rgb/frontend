import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { useFdcSectionTone } from './FdcSectionToneContext.jsx'
import { FdcSectionTitle } from './FdcFestivalSections.jsx'

const softEase = [0.22, 1, 0.36, 1]
const PASESHOW_PURPLE = '#5c2d91'

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

function PinIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function GlobeIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.75 12h16.5M12 3.75c2.4 2.7 3.6 5.7 3.6 8.25S14.4 17.55 12 20.25C9.6 17.55 8.4 14.55 8.4 12S9.6 6.45 12 3.75Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function TicketIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.5 9.75h15a1.5 1.5 0 0 1 1.5 1.5v1.5a3 3 0 0 0 0 6v1.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20.25v-1.5a3 3 0 0 0 0-6v-1.5A1.5 1.5 0 0 1 4.5 9.75Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function FdcTicketsSection({ tickets, hideHeading = false, embedded = false }) {
  const title = String(tickets?.title || '').trim()
  const { titleTone, usesDarkTone } = useFdcSectionTone(tickets)
  const body = String(tickets?.body || '').trim()
  const bullets = (tickets?.bullets || []).filter(Boolean)
  const price = String(tickets?.price || '').trim()
  const pricePrefix = String(tickets?.pricePrefix || '$').trim() || '$'
  const partnerName = String(tickets?.partnerName || '').trim()
  const onlineLabel = String(tickets?.onlineLabel || tickets?.ctaLabel || '').trim() || 'Comprá online'
  const onlineUrl = String(tickets?.onlineUrl || tickets?.ctaUrl || '').trim()
  const salePointsTitle =
    String(tickets?.salePointsTitle || '').trim() || 'Puntos de venta presenciales'
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

  const defaultPointId = useMemo(() => {
    const tuc = salePoints.find((p) => /tucum/i.test(p.city))
    return (tuc || salePoints[0])?.id || ''
  }, [salePoints])

  const [activeId, setActiveId] = useState(defaultPointId)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    setActiveId((prev) => (salePoints.some((p) => p.id === prev) ? prev : defaultPointId))
  }, [defaultPointId, salePoints])

  if (!title) return null

  const active = salePoints.find((p) => p.id === activeId) || salePoints[0] || null

  async function copyAddress(text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(text)
      window.setTimeout(() => setCopied((cur) => (cur === text ? '' : cur)), 1800)
    } catch {
      setCopied('')
    }
  }

  const panel = usesDarkTone
    ? 'border-white/12 bg-white/6 text-white shadow-[0_24px_70px_-40px_rgba(0,0,0,0.7)] backdrop-blur-md'
    : 'border-[#e8e4dc] bg-white text-[#171b22] shadow-[0_24px_60px_-36px_rgba(23,27,34,0.28)]'
  const muted = usesDarkTone ? 'text-white/70' : 'text-[#4b505a]'
  const subtle = usesDarkTone ? 'border-white/12' : 'border-[#e8e4dc]'

  const content = (
    <>
      {!hideHeading ? (
        <FdcSectionTitle title={title} tone={titleTone} subtitle={body || undefined} className="mb-8 sm:mb-10" />
      ) : null}

      <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-7">
        <Motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: softEase }}
          className={`relative overflow-hidden rounded-[1.6rem] border p-6 sm:p-7 ${panel}`}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-[#d4b483]/18 blur-3xl"
            aria-hidden
          />
          <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${muted}`}>Valor de la entrada</p>
          {price ? (
            <p className="mt-3 font-serif text-5xl font-bold leading-none tracking-tight text-[#d4b483] sm:text-6xl">
              <span className="mr-1 align-top text-2xl sm:text-3xl">{pricePrefix}</span>
              {price}
              <span className="ml-0.5 text-3xl sm:text-4xl">,-</span>
            </p>
          ) : null}

          {partnerName ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#5c2d91] px-3.5 py-1.5 text-white shadow-[0_12px_28px_-16px_rgba(92,45,145,0.9)]">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">Venta oficial</span>
              <span className="text-sm font-extrabold tracking-wide">{partnerName}</span>
            </div>
          ) : null}

          {onlineUrl ? (
            <SmartLink
              href={onlineUrl}
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#d4b483] px-5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#171b22] transition hover:bg-[#e2c28a] sm:w-auto sm:min-w-[14rem]"
            >
              <GlobeIcon className="h-4 w-4" />
              {onlineLabel}
            </SmartLink>
          ) : null}

          {onlineUrl ? (
            <p className={`mt-3 text-sm ${muted}`}>
              Web:{' '}
              <a
                href={onlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#d4b483] underline-offset-2 hover:underline"
              >
                {displayHost(onlineUrl)}
              </a>
            </p>
          ) : null}

          {bullets.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {bullets.map((bullet) => (
                <li
                  key={bullet}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${subtle} ${muted}`}
                >
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </Motion.article>

        <Motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: softEase }}
          className={`rounded-[1.6rem] border p-5 sm:p-6 ${panel}`}
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#d4b483]/18 text-[#d4b483]">
              <TicketIcon />
            </span>
            <div>
              <h3 className="font-serif text-xl font-bold uppercase tracking-[0.06em]">Presencial</h3>
              <p className={`text-xs ${muted}`}>{salePointsTitle}</p>
            </div>
          </div>

          {salePoints.length > 0 ? (
            <>
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap">
                {salePoints.map((point) => {
                  const activeCity = point.id === active?.id
                  return (
                    <button
                      key={point.id}
                      type="button"
                      onClick={() => setActiveId(point.id)}
                      className={`shrink-0 rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.1em] transition ${
                        activeCity
                          ? 'bg-[#d4b483] text-[#171b22] shadow-[0_10px_24px_-14px_rgba(212,180,131,0.9)]'
                          : usesDarkTone
                            ? 'bg-white/8 text-white/80 hover:bg-white/14'
                            : 'bg-[#f4efe6] text-[#3e434d] hover:bg-[#ece4d6]'
                      }`}
                      aria-pressed={activeCity}
                    >
                      {point.city}
                    </button>
                  )
                })}
              </div>

              <AnimatePresence mode="wait">
                {active ? (
                  <Motion.ul
                    key={active.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: softEase }}
                    className="mt-5 space-y-3"
                  >
                    {active.addresses.map((address) => {
                      const query = `${active.city} ${address}`
                      return (
                        <li
                          key={address}
                          className={`flex items-start justify-between gap-3 rounded-2xl border px-3.5 py-3 ${subtle}`}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold leading-snug sm:text-[15px]">{address}</p>
                            <p className={`mt-1 text-[11px] uppercase tracking-[0.12em] ${muted}`}>
                              {active.city}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => copyAddress(query)}
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] transition ${
                                copied === query
                                  ? 'bg-emerald-500/90 text-white'
                                  : usesDarkTone
                                    ? 'bg-white/10 text-white/80 hover:bg-white/16'
                                    : 'bg-[#f4efe6] text-[#3e434d] hover:bg-[#ece4d6]'
                              }`}
                            >
                              {copied === query ? 'Copiado' : 'Copiar'}
                            </button>
                            <a
                              href={mapsUrl(active.city, address)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#d4b483] text-[#171b22] transition hover:bg-[#e2c28a]"
                              aria-label={`Ver ${address} en el mapa`}
                              title="Abrir en Maps"
                            >
                              <PinIcon />
                            </a>
                          </div>
                        </li>
                      )
                    })}
                  </Motion.ul>
                ) : null}
              </AnimatePresence>
            </>
          ) : (
            <p className={`text-sm ${muted}`}>Todavía no hay puntos de venta cargados.</p>
          )}
        </Motion.article>
      </div>
    </>
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
