import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '../../utils/imageUrl.js'

function SectionHeading({ eyebrow, title, className = '' }) {
  if (!title && !eyebrow) return null
  return (
    <div className={`border-b border-[#ddd7ca] pb-4 ${className}`}>
      {eyebrow ? (
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-800">{eyebrow}</p>
      ) : null}
      {title ? (
        <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
          {title}
        </h2>
      ) : null}
    </div>
  )
}

function NavIcon({ name, className = 'h-4 w-4' }) {
  const props = { className, fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2, 'aria-hidden': true }
  switch (name) {
    case 'calendar':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M4.5 9.75h15M5.25 5.25h13.5A1.5 1.5 0 0 1 20.25 6.75v12A1.5 1.5 0 0 1 18.75 20.25H5.25A1.5 1.5 0 0 1 3.75 18.75v-12A1.5 1.5 0 0 1 5.25 5.25Z" />
        </svg>
      )
    case 'music':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 18.75 6-3v-9l-6 3v9Zm0 0v-9m6 3 6-3v-9l-6 3v9Z" />
        </svg>
      )
    case 'ticket':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75M4.5 9.75h15a1.5 1.5 0 0 1 1.5 1.5v1.5a3 3 0 0 0 0 6v1.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.75v-1.5a3 3 0 0 0 0-6v-1.5A1.5 1.5 0 0 1 4.5 9.75Z" />
        </svg>
      )
    case 'news':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5M12 12h1.5M12 16.5h1.5M6.75 7.5h1.5M6.75 12h1.5M6.75 16.5h1.5M4.5 5.25h15A1.5 1.5 0 0 1 21 6.75v10.5A1.5 1.5 0 0 1 19.5 18.75h-15A1.5 1.5 0 0 1 3 17.25V6.75A1.5 1.5 0 0 1 4.5 5.25Z" />
        </svg>
      )
    case 'info':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
      )
    case 'store':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-9 0H4.875A2.625 2.625 0 0 1 2.25 18.375V9.375A2.625 2.625 0 0 1 4.875 6.75h14.25A2.625 2.625 0 0 1 21.75 9.375v9A2.625 2.625 0 0 1 19.125 21H15.75m-9 0v-4.875A2.625 2.625 0 0 1 9.375 13.5h5.25A2.625 2.625 0 0 1 17.25 16.125V21" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 0 0-6.364 0l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
        </svg>
      )
  }
}

function isExternalHref(href) {
  const h = String(href || '').trim()
  return h.startsWith('http://') || h.startsWith('https://')
}

function SmartLink({ href, className, children, ...rest }) {
  const target = String(href || '').trim()
  if (!target) return null
  if (isExternalHref(target)) {
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

export function FdcSectionNav({ items = [], className = '' }) {
  const navItems = (items || []).filter((n) => n?.label && n?.href)
  if (navItems.length === 0) return null

  return (
    <nav
      aria-label="Secciones del festival"
      className={`sticky top-[calc(var(--navbar-h,5rem))] z-30 shrink-0 border-b border-white/10 bg-[#0c1017] ${className}`.trim()}
    >
      <div className="mx-auto w-full max-w-[min(100%,90rem)] px-3 sm:px-6 lg:px-8 xl:px-10">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:gap-0 sm:overflow-visible sm:px-0 sm:py-3 [&::-webkit-scrollbar]:hidden lg:justify-center">
          <div className="flex min-w-max items-stretch justify-center gap-1 sm:w-full sm:min-w-0 sm:max-w-5xl sm:flex-wrap sm:gap-1.5 lg:flex-nowrap lg:gap-0">
            {navItems.map((item) => (
              <a
                key={item.id || item.href}
                href={item.href}
                className="group flex min-w-[5.5rem] flex-col items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-center transition hover:bg-white/8 sm:min-w-0 sm:flex-1 sm:px-3 lg:px-4"
              >
                <span className="text-[#d4b483] transition group-hover:text-amber-200">
                  <NavIcon name={item.icon} className="h-5 w-5" />
                </span>
                <span className="max-w-[7.5rem] text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-[#d4b483]/95 transition group-hover:text-amber-100 sm:max-w-none sm:text-[11px] lg:text-xs">
                  {item.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

function ScheduleClockIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 8.25V12l2.5 1.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ScheduleTitleOrnament({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 18"
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M8 9H58M102 9H152"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M68 9c4-5 8-5 12 0 4 5 8 5 12 0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="80" cy="9" r="2" fill="currentColor" />
    </svg>
  )
}

function splitScheduleText(text) {
  const raw = String(text || '').trim()
  if (!raw) return { title: '', note: '' }
  const parts = raw.split(/\s+[—–-]\s+/)
  if (parts.length >= 2) {
    return { title: parts[0].trim(), note: parts.slice(1).join(' — ').trim() }
  }
  return { title: raw, note: '' }
}

export function FdcScheduleSection({ schedule }) {
  const days = schedule?.days || []
  if (days.length === 0) return null

  const [activeIdx, setActiveIdx] = useState(0)
  const [imageIdx, setImageIdx] = useState(0)
  const [showAllDays, setShowAllDays] = useState(false)

  const safeDayIdx = Math.min(activeIdx, Math.max(0, days.length - 1))
  const activeDay = days[safeDayIdx]

  const images = (schedule?.images || [])
    .map((img) => ({
      id: img?.id,
      src: resolveMediaUrl(img?.imageUrl) || String(img?.imageUrl || '').trim(),
      caption: String(img?.caption || '').trim(),
    }))
    .filter((img) => img.src)
  const safeImageIdx = images.length ? Math.min(imageIdx, images.length - 1) : 0
  const activeImage = images[safeImageIdx] || null

  const title = String(schedule?.title || 'Cronograma de actividades').trim()
  const ctaLabel = String(schedule?.ctaLabel || '').trim()
  const ctaHref = String(schedule?.ctaHref || '').trim()

  function goNextImage() {
    if (images.length < 2) return
    setImageIdx((prev) => (prev + 1) % images.length)
  }

  function goPrevImage() {
    if (images.length < 2) return
    setImageIdx((prev) => (prev - 1 + images.length) % images.length)
  }

  function formatTime(time) {
    const t = String(time || '').trim()
    if (!t) return ''
    if (/hs$/i.test(t)) return t
    return `${t} hs`
  }

  function renderActivityRow(item, idx) {
    const { title: itemTitle, note } = splitScheduleText(item.text)
    return (
      <li key={item.id || `${item.time}-${idx}`} className="flex gap-3 py-3.5 sm:gap-4 sm:py-4">
        <span className="mt-0.5 shrink-0 text-[#d4b483]" aria-hidden>
          <ScheduleClockIcon className="h-[1.15rem] w-[1.15rem] sm:h-5 sm:w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            {item.time ? (
              <time className="shrink-0 text-sm font-bold tabular-nums text-white sm:text-[15px]">
                {formatTime(item.time)}
              </time>
            ) : null}
            <p className="min-w-0 text-sm leading-relaxed text-white/90 sm:text-[15px]">
              {itemTitle}
            </p>
          </div>
          {note ? (
            <p className="mt-0.5 text-xs leading-relaxed text-white/50 sm:text-[13px]">{note}</p>
          ) : null}
        </div>
      </li>
    )
  }

  const ctaClassName =
    'inline-flex min-h-11 items-center justify-center rounded-sm bg-[#d4b483] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#171b22] transition hover:bg-[#e2c28a] sm:text-xs'

  return (
    <div>
      <header className="mb-7 text-center sm:mb-9">
        <h2 className="font-serif text-2xl font-bold uppercase tracking-[0.04em] text-white sm:text-3xl lg:text-[2.35rem]">
          {title}
        </h2>
        <ScheduleTitleOrnament className="mx-auto mt-3 h-4 w-36 text-[#d4b483] sm:mt-4 sm:h-[1.125rem] sm:w-40" />
      </header>

      {days.length > 1 && !showAllDays ? (
        <div
          className="mb-6 flex overflow-x-auto rounded-sm border border-white/15 [-ms-overflow-style:none] [scrollbar-width:none] sm:mb-8 [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Días del cronograma"
        >
          {days.map((day, idx) => {
            const active = idx === safeDayIdx
            return (
              <button
                key={day.id || day.label || idx}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveIdx(idx)}
                className={`min-h-11 shrink-0 flex-1 border-r border-white/15 px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.1em] transition last:border-r-0 sm:min-h-12 sm:px-4 sm:text-[11px] lg:text-xs ${
                  active
                    ? 'bg-[#d4b483] text-[#171b22]'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {day.label || `Día ${idx + 1}`}
              </button>
            )
          })}
        </div>
      ) : null}

      <div
        className={`grid gap-8 lg:items-stretch lg:gap-10 ${
          activeImage ? 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]' : ''
        }`}
      >
        <div className="flex min-w-0 flex-col" role="tabpanel">
          {showAllDays ? (
            <ul className="flex-1 divide-y divide-white/12">
              {days.map((day) => (
                <li key={day?.id || day?.label} className="py-4 first:pt-0 last:pb-0">
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-[#d4b483]">
                    {day?.label}
                  </p>
                  <ul className="divide-y divide-white/12">
                    {(day?.items || []).map((item, idx) => renderActivityRow(item, idx))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="flex-1 divide-y divide-white/12">
              {(activeDay?.items || []).map((item, idx) => renderActivityRow(item, idx))}
              {(activeDay?.items || []).length === 0 ? (
                <li className="py-8 text-sm text-white/55">Sin actividades cargadas para este día.</li>
              ) : null}
            </ul>
          )}

          {ctaLabel ? (
            <div className="mt-6 sm:mt-8">
              {ctaHref ? (
                <SmartLink href={ctaHref} className={ctaClassName}>
                  {ctaLabel}
                </SmartLink>
              ) : (
                <button type="button" onClick={() => setShowAllDays((v) => !v)} className={ctaClassName}>
                  {showAllDays ? 'Ver por día' : ctaLabel}
                </button>
              )}
            </div>
          ) : null}
        </div>

        {activeImage ? (
          <div className="relative min-h-[220px] overflow-hidden rounded-lg sm:min-h-[300px] sm:rounded-xl lg:min-h-full">
            <img
              key={activeImage.src}
              src={activeImage.src}
              alt={activeImage.caption || ''}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goPrevImage}
                  className="absolute left-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#171b22]/80 text-white shadow-md transition hover:bg-[#171b22] sm:left-4"
                  aria-label="Imagen anterior"
                >
                  <span aria-hidden>←</span>
                </button>
                <button
                  type="button"
                  onClick={goNextImage}
                  className="absolute right-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#171b22]/80 text-white shadow-md transition hover:bg-[#171b22] sm:right-4"
                  aria-label="Imagen siguiente"
                >
                  <span aria-hidden>→</span>
                </button>
                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || img.src}
                      type="button"
                      aria-label={`Ir a imagen ${idx + 1}`}
                      aria-current={idx === safeImageIdx}
                      onClick={() => setImageIdx(idx)}
                      className={`h-1.5 rounded-full transition ${
                        idx === safeImageIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function FdcArtistsSection({ artists }) {
  const items = (artists?.items || []).filter((a) => a?.name)
  if (items.length === 0) return null

  const scrollRef = useRef(null)
  const titleRaw = String(artists?.title || 'Cartelera artística').trim()
  const titleMatch = titleRaw.match(/^(cartelera)\s+(.+)$/i)
  const eyebrow = titleMatch ? titleMatch[1] : 'Cartelera'
  const heading = titleMatch ? titleMatch[2] : titleRaw
  const ctaLabel = String(artists?.ctaLabel || '').trim()
  const ctaHref = String(artists?.ctaHref || '').trim()

  function scrollBy(delta) {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  function parseDateBadge(tag) {
    const raw = String(tag || '').trim()
    if (!raw) return { day: '', num: '' }
    const spaced = raw.match(/^([A-Za-zÁÉÍÓÚÜÑáéíóúüñ.]{2,6})\s*[.\-]?\s*(\d{1,2})$/u)
    if (spaced) {
      return {
        day: spaced[1].replace(/\./g, '').toUpperCase().slice(0, 3),
        num: spaced[2],
      }
    }
    const flipped = raw.match(/^(\d{1,2})\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ.]{2,6})$/u)
    if (flipped) {
      return {
        day: flipped[2].replace(/\./g, '').toUpperCase().slice(0, 3),
        num: flipped[1],
      }
    }
    return { day: raw.toUpperCase(), num: '' }
  }

  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#b08948]">
            {eyebrow}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h2 className="font-serif text-3xl font-bold uppercase tracking-tight text-[#171b22] sm:text-4xl lg:text-[2.75rem]">
              {heading}
            </h2>
            <span className="hidden items-center gap-1 text-[#b08948] sm:inline-flex" aria-hidden>
              <span className="h-px w-8 bg-current" />
              <span className="text-[10px]">◆</span>
            </span>
          </div>
        </div>
        {ctaLabel ? (
          ctaHref ? (
            <SmartLink
              href={ctaHref}
              className="inline-flex min-h-11 shrink-0 items-center justify-center self-start rounded-md border border-[#171b22]/80 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#171b22] transition hover:bg-[#171b22] hover:text-white sm:self-auto sm:text-xs"
            >
              {ctaLabel}
            </SmartLink>
          ) : (
            <span className="inline-flex min-h-11 shrink-0 items-center justify-center self-start rounded-md border border-[#171b22]/80 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#171b22] sm:self-auto sm:text-xs">
              {ctaLabel}
            </span>
          )
        ) : null}
      </header>

      <div className="relative">
        {items.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => scrollBy(-300)}
              className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#ddd7ca] bg-white text-[#171b22] shadow-md transition hover:bg-[#f7f7f5] md:inline-flex lg:-translate-x-1/3"
              aria-label="Artistas anteriores"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollBy(300)}
              className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#ddd7ca] bg-white text-[#171b22] shadow-md transition hover:bg-[#f7f7f5] md:inline-flex lg:translate-x-1/3"
              aria-label="Artistas siguientes"
            >
              →
            </button>
          </>
        ) : null}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] md:gap-5 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((artist, idx) => {
            const src = resolveMediaUrl(artist.photoUrl)
            const badge = parseDateBadge(artist.dateTag)
            return (
              <article
                key={artist.id || artist.name || idx}
                className="group relative w-[min(72vw,14.5rem)] shrink-0 snap-start overflow-hidden rounded-xl shadow-[0_12px_36px_-24px_rgba(23,27,34,0.4)] ring-1 ring-[#e8e4dc] sm:w-[min(42vw,15.5rem)] lg:w-[13.75rem]"
              >
                <div className="relative aspect-3/4 bg-[#efe8dc]">
                  {src ? (
                    <img
                      src={src}
                      alt={artist.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div
                      className="flex h-full items-center justify-center text-4xl text-[#b08948]/40"
                      aria-hidden
                    >
                      ♪
                    </div>
                  )}
                  <div
                    className="absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-transparent"
                    aria-hidden
                  />
                  {badge.day || badge.num ? (
                    <div className="absolute left-0 top-0 flex min-w-[2.75rem] flex-col items-center bg-[#d4b483] px-2 py-1.5 text-[#171b22]">
                      {badge.day ? (
                        <span className="text-[10px] font-bold uppercase leading-none tracking-wide">
                          {badge.day}
                        </span>
                      ) : null}
                      {badge.num ? (
                        <span className="mt-0.5 font-serif text-lg font-bold leading-none">
                          {badge.num}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <h3 className="absolute inset-x-0 bottom-0 px-3 pb-4 text-center font-serif text-sm font-bold uppercase leading-snug tracking-wide text-white sm:text-[15px]">
                    {artist.name}
                  </h3>
                </div>
              </article>
            )
          })}
        </div>

        {items.length > 1 ? (
          <div className="mt-4 flex justify-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => scrollBy(-260)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd7ca] bg-white text-[#171b22]"
              aria-label="Anterior"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollBy(260)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd7ca] bg-white text-[#171b22]"
              aria-label="Siguiente"
            >
              →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function FdcTicketsSection({ tickets, hideHeading = false, embedded = false }) {
  const title = String(tickets?.title || '').trim()
  if (!title) return null

  const bullets = (tickets?.bullets || []).filter(Boolean)
  const imageSrc = resolveMediaUrl(tickets?.imageUrl)
  const ctaUrl = String(tickets?.ctaUrl || '').trim()

  const inner = (
    <div className={`grid ${imageSrc ? 'lg:grid-cols-2' : ''} ${embedded ? 'gap-8' : ''}`}>
      <div className={`flex flex-col justify-center ${embedded ? '' : 'p-6 sm:p-8 lg:p-10'}`}>
        {!hideHeading ? (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">Acceso</p>
            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {title}
            </h2>
          </>
        ) : null}
        {tickets?.body ? (
          <p className={`${hideHeading ? '' : 'mt-3 '}text-sm leading-relaxed text-slate-300 sm:text-base`}>
            {tickets.body}
          </p>
        ) : null}
        {bullets.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm text-slate-200">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden />
                {bullet}
              </li>
            ))}
          </ul>
        ) : null}
        {ctaUrl && tickets?.ctaLabel ? (
          <SmartLink
            href={ctaUrl}
            className="mt-6 inline-flex min-h-11 w-fit items-center justify-center rounded-2xl bg-amber-500 px-5 text-sm font-semibold text-[#171b22] transition hover:bg-amber-400"
          >
            {tickets.ctaLabel}
          </SmartLink>
        ) : null}
      </div>
      {imageSrc ? (
        <div
          className={`relative overflow-hidden ${
            embedded
              ? 'min-h-[240px] rounded-3xl border border-white/12'
              : 'min-h-[220px] lg:min-h-full'
          }`}
        >
          <img
            src={imageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-[#171b22]/40 via-transparent to-transparent lg:bg-linear-to-l lg:from-[#171b22]/30"
            aria-hidden
          />
        </div>
      ) : null}
    </div>
  )

  if (embedded) {
    return (
      <div id={hideHeading ? undefined : 'entradas'} className="scroll-mt-[calc(var(--navbar-h,5rem)+4rem)]">
        {inner}
      </div>
    )
  }

  return (
    <div id={hideHeading ? undefined : 'entradas'} className="scroll-mt-[calc(var(--navbar-h,5rem)+4rem)]">
      <div className="overflow-hidden rounded-3xl border border-[#171b22] bg-[#171b22] shadow-[0_20px_50px_-24px_rgba(23,27,34,0.55)]">
        {inner}
      </div>
    </div>
  )
}

export function FdcNewsSection({ news }) {
  const items = (news?.items || []).filter((n) => n?.title)
  if (items.length === 0) return null

  const titleRaw = String(news?.title || 'Noticias del festival').trim()
  const titleMatch = titleRaw.match(/^(noticias)\s+(.+)$/i)
  const eyebrow = titleMatch ? titleMatch[1] : 'Noticias'
  const heading = titleMatch ? titleMatch[2] : titleRaw
  const ctaLabel = String(news?.ctaLabel || '').trim()
  const ctaHref = String(news?.ctaHref || '').trim()

  function parseNewsDate(dateStr) {
    const raw = String(dateStr || '').trim()
    if (!raw) return { day: '', month: '' }
    const named = raw.match(/^(\d{1,2})\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ.]{3,})$/u)
    if (named) {
      return {
        day: String(Number(named[1])),
        month: named[2].replace(/\./g, '').slice(0, 3).toUpperCase(),
      }
    }
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (iso) {
      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
      return { day: String(Number(iso[3])), month: months[Number(iso[2]) - 1] || '' }
    }
    const slash = raw.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-]\d{2,4})?$/)
    if (slash) {
      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
      return { day: String(Number(slash[1])), month: months[Number(slash[2]) - 1] || '' }
    }
    return { day: '', month: raw.toUpperCase().slice(0, 6) }
  }

  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#b08948]">
            {eyebrow}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h2 className="font-serif text-3xl font-bold uppercase tracking-tight text-[#171b22] sm:text-4xl lg:text-[2.75rem]">
              {heading}
            </h2>
            <span className="hidden items-center gap-1 text-[#b08948] sm:inline-flex" aria-hidden>
              <span className="h-px w-8 bg-current" />
              <span className="text-[10px]">▸</span>
            </span>
          </div>
        </div>
        {ctaLabel && ctaHref ? (
          <SmartLink
            href={ctaHref}
            className="inline-flex min-h-11 shrink-0 items-center justify-center self-start rounded-md border border-[#171b22]/80 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#171b22] transition hover:bg-[#171b22] hover:text-white sm:self-auto sm:text-xs"
          >
            {ctaLabel}
          </SmartLink>
        ) : null}
      </header>

      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item, idx) => {
          const src = resolveMediaUrl(item.imageUrl)
          const badge = parseNewsDate(item.date)
          const cardInner = (
            <>
              <div className="relative aspect-16/10 overflow-hidden bg-[#efe8dc]">
                {src ? (
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-medium text-[#4b505a]">
                    Noticia
                  </div>
                )}
                {badge.day || badge.month ? (
                  <div className="absolute bottom-0 left-0 flex min-w-[3rem] flex-col items-center bg-[#c4a574] px-2.5 py-1.5 text-white">
                    {badge.day ? (
                      <span className="font-serif text-lg font-bold leading-none">{badge.day}</span>
                    ) : null}
                    {badge.month ? (
                      <span className="mt-0.5 text-[10px] font-bold uppercase leading-none tracking-wide">
                        {badge.month}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col px-4 pb-4 pt-5 sm:px-5 sm:pb-5">
                <h3 className="line-clamp-3 text-[15px] font-bold leading-snug text-[#171b22] transition group-hover:text-[#3a414d] sm:text-base">
                  {item.title}
                </h3>
                {item.link ? (
                  <span className="mt-auto pt-4 text-sm font-medium text-[#6b7280] transition group-hover:text-[#171b22]">
                    Leer más →
                  </span>
                ) : (
                  <span className="mt-auto pt-4" aria-hidden />
                )}
              </div>
            </>
          )

          return (
            <li key={item.id || item.title || idx}>
              {item.link ? (
                <SmartLink
                  href={item.link}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_36px_-24px_rgba(23,27,34,0.35)] ring-1 ring-[#e8e4dc] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-22px_rgba(23,27,34,0.4)]"
                >
                  {cardInner}
                </SmartLink>
              ) : (
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_36px_-24px_rgba(23,27,34,0.35)] ring-1 ring-[#e8e4dc]">
                  {cardInner}
                </article>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function FdcGallerySection({ gallery, hideHeading = false }) {
  const items = (gallery?.items || []).filter((g) => g?.imageUrl)
  if (items.length === 0) return null

  return (
    <div id={hideHeading ? undefined : 'galeria'} className="scroll-mt-[calc(var(--navbar-h,5rem)+4rem)]">
      {!hideHeading ? <SectionHeading eyebrow="Imágenes" title={gallery?.title} /> : null}
      <div
        className={`${hideHeading ? '' : 'mt-6 '}flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {items.map((item, idx) => {
          const src = resolveMediaUrl(item.imageUrl)
          const caption = String(item.caption || '').trim()
          return (
            <figure
              key={item.id || idx}
              className="w-[min(85vw,18rem)] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/12 bg-white/95 shadow-sm sm:w-[min(70vw,20rem)]"
            >
              <img
                src={src}
                alt={caption || ''}
                className="aspect-4/3 w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              {caption ? (
                <figcaption className="border-t border-[#e8e4dc] px-3 py-2.5 text-xs leading-relaxed text-[#4b505a]">
                  {caption}
                </figcaption>
              ) : null}
            </figure>
          )
        })}
      </div>
    </div>
  )
}

export function FdcSponsorsSection({ sponsors, hideHeading = false }) {
  const items = (sponsors?.items || []).filter((s) => s?.logoUrl || s?.name)
  if (items.length === 0) return null

  return (
    <div className="scroll-mt-[calc(var(--navbar-h,5rem)+4rem)]">
      {!hideHeading ? <SectionHeading eyebrow="Patrocinios" title={sponsors?.title} /> : null}
      <ul className={`${hideHeading ? '' : 'mt-6 '}flex flex-wrap items-center justify-center gap-4 sm:gap-6`}>
        {items.map((sponsor, idx) => {
          const src = resolveMediaUrl(sponsor.logoUrl)
          const inner = (
            <div className="flex h-20 w-36 items-center justify-center rounded-2xl border border-[#ddd7ca] bg-white px-4 py-3 sm:h-24 sm:w-44">
              {src ? (
                <img
                  src={src}
                  alt={sponsor.name || 'Auspiciante'}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="text-center text-xs font-semibold text-[#4b505a]">{sponsor.name}</span>
              )}
            </div>
          )
          return (
            <li key={sponsor.id || sponsor.name || idx}>
              {sponsor.url ? (
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition hover:-translate-y-0.5"
                  title={sponsor.name}
                >
                  {inner}
                </a>
              ) : (
                inner
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
