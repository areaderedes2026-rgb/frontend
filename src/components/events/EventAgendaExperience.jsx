import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'
import { ROUTES } from '../../utils/constants.js'
import { formatDateTime, formatShortDate } from '../../utils/formatDate.js'
import { resolveMediaUrl, withCloudinaryTransform } from '../../utils/imageUrl.js'
import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  dayKey,
  defaultSelectedDayKey,
  formatEventHour,
  groupEventsByDay,
  monthGridDays,
  normalizeCalendarEvents,
  parseEventDate,
  startOfMonth,
  toMonthKey,
} from '../../utils/eventCalendar.js'
import { pickUpcomingPublicEvents } from '../../utils/publicEvents.js'

function CalendarIcon({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  )
}

function getTheme(variant) {
  const isDark = variant === 'dark'
  return {
    isDark,
    eyebrow: isDark
      ? 'inline-flex rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100'
      : 'inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-800',
    title: isDark
      ? 'mt-3 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl'
      : 'mt-3 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl lg:text-4xl',
    subtitle: isDark
      ? 'mt-2 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base'
      : 'mt-2 max-w-xl text-sm leading-relaxed text-[#4b505a] sm:text-base',
    headerLink: isDark
      ? 'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/14 bg-white/8 px-4 py-2.5 text-sm font-semibold text-sky-100 shadow-sm transition hover:border-sky-200/60 hover:bg-white/12 hover:text-white'
      : 'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#ddd7ca] bg-white px-4 py-2.5 text-sm font-semibold text-sky-800 shadow-sm transition hover:border-sky-200 hover:bg-sky-50',
    calendarShell: isDark
      ? 'rounded-3xl border border-white/12 bg-white/[0.06] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur sm:p-5'
      : 'rounded-3xl border border-[#ddd7ca] bg-white p-4 shadow-sm sm:p-5',
    calendarNavBtn: isDark
      ? 'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/14 bg-white/8 text-sky-100 transition hover:border-sky-300/40 hover:bg-white/12 hover:text-white'
      : 'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#d8d5cd] bg-[#fcfcfa] text-slate-700 transition hover:border-sky-200 hover:text-sky-800',
    calendarMonth: isDark ? 'text-sm font-bold text-white sm:text-base' : 'text-sm font-bold text-[#171b22] sm:text-base',
    calendarWeekday: isDark
      ? 'text-[10px] font-semibold uppercase tracking-wide text-sky-100/80 sm:text-[11px]'
      : 'text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[11px]',
    dayBase: isDark
      ? 'relative min-h-10 rounded-xl border text-xs font-semibold transition duration-200 sm:min-h-11 sm:text-sm'
      : 'relative min-h-10 rounded-xl border text-xs font-semibold transition duration-200 sm:min-h-11 sm:text-sm',
    daySelected: isDark
      ? 'border-sky-300 bg-sky-400/25 text-white shadow-[0_0_0_1px_rgba(125,211,252,0.45)]'
      : 'border-sky-500 bg-sky-50 text-sky-900 shadow-[0_0_0_1px_rgba(14,165,233,0.25)]',
    dayHasEvents: isDark
      ? 'border-sky-300/35 bg-sky-400/10 text-white hover:border-sky-200/60 hover:bg-sky-400/18'
      : 'border-sky-200 bg-sky-50/70 text-slate-900 hover:border-sky-300',
    dayEmpty: isDark
      ? 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
      : 'border-[#e6e1d6] bg-[#fcfcfa] text-slate-600 hover:border-slate-300',
    dayBadge: isDark
      ? 'absolute right-1 bottom-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-sky-300 px-0.5 text-[9px] font-bold text-slate-900'
      : 'absolute right-1 bottom-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-sky-700 px-0.5 text-[9px] font-bold text-white',
    card: isDark
      ? 'group grid h-full overflow-hidden rounded-3xl border border-white/12 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur transition duration-300 hover:border-sky-200/35 hover:bg-white/10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]'
      : 'group grid h-full overflow-hidden rounded-3xl border border-[#ddd7ca] bg-white shadow-sm ring-1 ring-[#1a1d24]/5 transition duration-300 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]',
    datePill: isDark
      ? 'inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100'
      : 'inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-800',
    datePillDay: isDark ? 'tabular-nums text-sm font-bold text-white' : 'tabular-nums text-sm font-bold text-sky-900',
    meta: isDark ? 'text-xs capitalize text-slate-300' : 'text-xs capitalize text-slate-500',
    counter: isDark
      ? 'rounded-full border border-white/12 bg-white/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300'
      : 'rounded-full border border-[#ddd7ca] bg-[#f8f7f3] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500',
    eventTitle: isDark
      ? 'mt-3 font-serif text-xl font-bold tracking-tight text-white sm:text-2xl'
      : 'mt-3 font-serif text-xl font-bold tracking-tight text-[#171b22] sm:text-2xl',
    eventSummary: isDark
      ? 'mt-2 line-clamp-3 text-sm leading-relaxed text-slate-200/95 sm:line-clamp-4'
      : 'mt-2 line-clamp-3 text-sm leading-relaxed text-[#4b505a] sm:line-clamp-4',
    eventPlace: isDark
      ? 'mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100/85'
      : 'mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500',
    flyerShell: isDark
      ? 'relative flex min-h-56 items-center justify-center bg-[#11151c] p-4 sm:min-h-64 lg:min-h-full lg:p-6'
      : 'relative flex min-h-56 items-center justify-center bg-[#f3efe6] p-4 sm:min-h-64 lg:min-h-full lg:p-6',
    emptyState: isDark
      ? 'flex h-full min-h-72 items-center justify-center rounded-3xl border border-dashed border-white/16 bg-white/[0.04] px-6 text-center text-sm text-slate-300'
      : 'flex h-full min-h-72 items-center justify-center rounded-3xl border border-dashed border-[#ddd7ca] bg-[#f8f7f3] px-6 text-center text-sm text-[#4b505a]',
    carouselLabel: isDark
      ? 'text-xs font-semibold uppercase tracking-[0.16em] text-sky-100/85'
      : 'text-xs font-semibold uppercase tracking-[0.16em] text-sky-800',
    carouselArrow: isDark
      ? 'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/14 bg-white/8 text-sky-100 transition hover:border-sky-300/40 hover:bg-white/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-40'
      : 'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#d8d5cd] bg-white text-slate-700 transition hover:border-sky-200 hover:text-sky-800 disabled:cursor-not-allowed disabled:opacity-40',
    dotActive: isDark ? 'w-5 bg-sky-300' : 'w-5 bg-sky-600',
    dotIdle: isDark ? 'w-2 bg-white/25 hover:bg-white/40' : 'w-2 bg-slate-300 hover:bg-slate-400',
    railTitle: isDark
      ? 'text-xs font-semibold uppercase tracking-[0.18em] text-sky-100/90'
      : 'text-xs font-semibold uppercase tracking-[0.18em] text-sky-800',
    railHint: isDark ? 'text-xs text-slate-400' : 'text-xs text-slate-500',
    railSelected: isDark
      ? 'border-sky-300/50 bg-sky-400/15 shadow-[0_8px_30px_-12px_rgba(56,189,248,0.55)]'
      : 'border-sky-300 bg-sky-50 shadow-[0_8px_30px_-12px_rgba(56,189,248,0.25)]',
    railIdle: isDark
      ? 'border-white/12 bg-white/[0.05] hover:border-sky-200/35 hover:bg-white/10'
      : 'border-[#ddd7ca] bg-white hover:border-sky-200 hover:bg-sky-50/60',
    railDate: isDark
      ? 'text-[10px] font-bold uppercase tracking-[0.16em] text-sky-100/85'
      : 'text-[10px] font-bold uppercase tracking-[0.16em] text-sky-800',
    railEventTitle: isDark
      ? 'mt-1 line-clamp-2 text-sm font-semibold leading-snug text-white'
      : 'mt-1 line-clamp-2 text-sm font-semibold leading-snug text-[#171b22]',
    railMeta: isDark ? 'mt-1 line-clamp-1 text-xs text-slate-300' : 'mt-1 line-clamp-1 text-xs text-slate-500',
    featuredShell: isDark
      ? 'mb-8 overflow-hidden rounded-3xl border border-white/12 bg-white/[0.06] shadow-sm'
      : 'mb-8 overflow-hidden rounded-3xl border border-[#ddd7ca] bg-white shadow-sm ring-1 ring-[#1a1d24]/5',
    featuredBadge: isDark
      ? 'text-xs font-bold uppercase tracking-[0.18em] text-sky-200'
      : 'text-xs font-bold uppercase tracking-[0.18em] text-sky-800',
    skeletonBlock: isDark ? 'animate-pulse rounded-3xl bg-white/8' : 'animate-pulse rounded-3xl bg-slate-100',
    skeletonPill: isDark ? 'animate-pulse rounded-full bg-white/10' : 'animate-pulse rounded-full bg-slate-200',
  }
}

function flyerSrc(url, width = 900) {
  const resolved = resolveMediaUrl(url)
  if (!resolved) return ''
  return withCloudinaryTransform(resolved, `f_auto,q_auto:good,c_limit,w_${width}`) || resolved
}

function FlyerLightbox({ src, title, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-[#0c1017]/80 backdrop-blur-sm"
        aria-label="Cerrar flyer"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-auto">
        <img
          src={src}
          alt={title || 'Flyer del evento'}
          className="mx-auto max-h-[88dvh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
        />
      </div>
    </div>
  )
}

function preloadFlyerUrls(events) {
  if (typeof window === 'undefined' || !Array.isArray(events)) return
  events.forEach((event) => {
    const src = flyerSrc(event?.flyerUrl, 900)
    if (!src) return
    const img = new Image()
    img.decoding = 'async'
    img.src = src
  })
}

function EventFlyer({ event, contain = true, className = '', priority = false }) {
  const [open, setOpen] = useState(false)
  const src = flyerSrc(event.flyerUrl, 900)
  const large = flyerSrc(event.flyerUrl, 1400)
  const [shownSrc, setShownSrc] = useState(src)

  useEffect(() => {
    if (!src) {
      setShownSrc('')
      return undefined
    }

    let cancelled = false
    const img = new Image()
    const commit = () => {
      if (!cancelled) setShownSrc(src)
    }
    img.onload = commit
    img.onerror = commit
    img.src = src
    if (img.complete) commit()
    return () => {
      cancelled = true
    }
  }, [src])

  if (!shownSrc) {
    return (
      <div
        className={`flex h-full min-h-48 w-full flex-col items-center justify-center gap-2 text-sky-100/70 ${className}`.trim()}
        aria-hidden
      >
        <CalendarIcon className="h-8 w-8" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Evento</span>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${className}`.trim()}
        aria-label={`Ampliar flyer de ${event.title || 'evento'}`}
      >
        <img
          src={shownSrc}
          alt=""
          className={`mx-auto max-h-[min(28rem,70vh)] w-auto max-w-full rounded-xl shadow-[0_18px_40px_-24px_rgba(15,23,42,0.55)] ${
            contain ? 'object-contain' : 'object-cover'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      </button>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <FlyerLightbox src={large || shownSrc} title={event.title} onClose={() => setOpen(false)} />,
            document.body,
          )
        : null}
    </>
  )
}

function AgendaCalendar({ theme, eventsByDay, visibleMonth, selectedDay, onSelectDay, onMoveMonth }) {
  const days = useMemo(() => monthGridDays(visibleMonth), [visibleMonth])

  return (
    <div className={theme.calendarShell}>
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => onMoveMonth(-1)} className={theme.calendarNavBtn} aria-label="Mes anterior">
          ←
        </button>
        <p className={theme.calendarMonth}>
          {MONTH_LABELS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
        </p>
        <button type="button" onClick={() => onMoveMonth(1)} className={theme.calendarNavBtn} aria-label="Mes siguiente">
          →
        </button>
      </div>

      <div className={`mt-4 grid grid-cols-7 gap-1 text-center ${theme.calendarWeekday}`}>
        {WEEKDAY_LABELS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((date) => {
          const key = dayKey(date)
          const isCurrentMonth = toMonthKey(date) === toMonthKey(visibleMonth)
          const hasEvents = eventsByDay.has(key)
          const isSelected = key === selectedDay
          const count = (eventsByDay.get(key) || []).length

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(key, date)}
              aria-label={`${date.getDate()} de ${MONTH_LABELS[date.getMonth()]}${hasEvents ? `, ${count} evento(s)` : ''}`}
              aria-pressed={isSelected}
              className={`${theme.dayBase} ${
                isSelected ? theme.daySelected : hasEvents ? theme.dayHasEvents : theme.dayEmpty
              } ${isCurrentMonth ? '' : 'opacity-40'}`}
            >
              {date.getDate()}
              {hasEvents ? <span className={theme.dayBadge}>{count}</span> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EventDetailCard({ event, index, total, theme, footerLink }) {
  const date = parseEventDate(event.eventDate ?? event.date)
  const day = date ? date.getDate() : '—'
  const month = date ? MONTH_LABELS[date.getMonth()] : ''
  const weekday = date ? date.toLocaleDateString('es-AR', { weekday: 'long' }) : ''

  return (
    <article id={`evento-publico-${event.id}`} className={`${theme.card} motion-reduce:transition-none`}>
      <div className={`${theme.flyerShell} order-1 lg:order-none`}>
        <EventFlyer event={event} contain priority />
      </div>

      <div className="flex min-w-0 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={theme.datePill}>
            <span className={theme.datePillDay}>{day}</span>
            {month}
          </span>
          {date ? (
            <span className={theme.meta}>
              {weekday} · {formatEventHour(date)} hs
            </span>
          ) : null}
          {total > 1 ? (
            <span className={theme.counter}>
              {index + 1} de {total}
            </span>
          ) : null}
        </div>

        <h3 className={theme.eventTitle}>{event.title}</h3>
        {event.summary ? <p className={theme.eventSummary}>{event.summary}</p> : null}
        {event.place ? <p className={theme.eventPlace}>{event.place}</p> : null}
        {footerLink}
      </div>
    </article>
  )
}

function EventDetailCarousel({ events, eventsSignature, theme, initialIndex = 0, footerLink }) {
  const total = events.length
  const [index, setIndex] = useState(() => Math.min(Math.max(0, initialIndex), Math.max(0, total - 1)))

  useLayoutEffect(() => {
    const next = Math.min(Math.max(0, initialIndex), Math.max(0, total - 1))
    setIndex(next)
  }, [eventsSignature, initialIndex, total])

  useEffect(() => {
    preloadFlyerUrls(events)
  }, [events, eventsSignature])

  useEffect(() => {
    if (total <= 1) return undefined
    function onKeyDown(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setIndex((current) => (current - 1 + total) % total)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setIndex((current) => (current + 1) % total)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [total])

  if (total === 0) return null

  const safeIndex = Math.min(index, total - 1)
  const current = events[safeIndex]

  return (
    <div className="flex h-full flex-col gap-3">
      {total > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className={theme.carouselLabel}>{total} eventos este día</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIndex((currentIndex) => (currentIndex - 1 + total) % total)}
              className={theme.carouselArrow}
              aria-label="Evento anterior"
            >
              ←
            </button>
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Eventos del día">
              {events.map((event, dotIndex) => (
                <button
                  key={event.id}
                  type="button"
                  role="tab"
                  aria-selected={dotIndex === safeIndex}
                  aria-label={`Evento ${dotIndex + 1}: ${event.title}`}
                  onClick={() => setIndex(dotIndex)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    dotIndex === safeIndex ? theme.dotActive : theme.dotIdle
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIndex((currentIndex) => (currentIndex + 1) % total)}
              className={theme.carouselArrow}
              aria-label="Evento siguiente"
            >
              →
            </button>
          </div>
        </div>
      ) : null}

      <div className="min-h-72" aria-live="polite">
        <EventDetailCard
          event={current}
          index={safeIndex}
          total={total}
          theme={theme}
          footerLink={footerLink}
        />
      </div>
    </div>
  )
}

function UpcomingRail({ events, selectedDay, onSelectDay, theme }) {
  if (events.length === 0) return null

  return (
    <div className="mt-6 sm:mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className={theme.railTitle}>Próximos encuentros</p>
        <p className={theme.railHint}>Deslizá para ver más</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {events.map((event) => {
          const date = parseEventDate(event.eventDate)
          const key = date ? dayKey(date) : event.id
          const isSelected = key === selectedDay

          return (
            <button
              key={event.id}
              type="button"
              onClick={() => date && onSelectDay(key, date)}
              className={`flex min-w-[13rem] shrink-0 snap-start gap-3 rounded-2xl border p-2.5 text-left transition duration-200 sm:min-w-[15rem] ${
                isSelected ? theme.railSelected : theme.railIdle
              }`}
            >
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f3efe6]">
                {event.flyerUrl ? (
                  <img
                    src={flyerSrc(event.flyerUrl, 240)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#d4b483]">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 py-0.5">
                <p className={theme.railDate}>{date ? formatShortDate(event.eventDate) : 'Sin fecha'}</p>
                <p className={theme.railEventTitle}>{event.title}</p>
                <p className={theme.railMeta}>{event.place || formatDateTime(event.eventDate)}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FeaturedEventSpotlight({ event, theme, onFocus }) {
  const date = parseEventDate(event.eventDate)
  if (!date) return null

  return (
    <RevealOnScroll variant="slow">
      <article className={theme.featuredShell}>
        <div className="grid gap-0 lg:grid-cols-12">
          <div className="flex min-h-56 items-center justify-center bg-[#f3efe6] p-5 lg:col-span-5 lg:min-h-72">
            <EventFlyer event={event} contain />
          </div>
          <div className="p-5 sm:p-6 lg:col-span-7">
            <p className={theme.featuredBadge}>Próximo evento destacado</p>
            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
              {event.title}
            </h2>
            {event.summary ? (
              <p className="mt-3 text-sm leading-relaxed text-[#4b505a]">{event.summary}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full border border-[#d8d5cd] bg-[#f8f7f3] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#3e434d]">
                {formatDateTime(event.eventDate)}
              </span>
              {event.place ? (
                <span className="inline-flex rounded-full border border-[#d8d5cd] bg-[#f8f7f3] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#3e434d]">
                  {event.place}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onFocus(dayKey(date), date, event.id)}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-800 transition hover:text-[#0f1319]"
            >
              Ver en el calendario
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </article>
    </RevealOnScroll>
  )
}

function AgendaSkeleton({ theme }) {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <div className={`h-6 w-40 ${theme.skeletonPill}`} />
        <div className={`mt-4 h-9 w-72 ${theme.skeletonBlock}`} />
        <div className={`mt-3 h-4 w-full max-w-xl ${theme.skeletonBlock}`} />
      </div>
      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        <div className={`h-80 lg:col-span-4 ${theme.skeletonBlock}`} />
        <div className={`h-80 lg:col-span-8 ${theme.skeletonBlock}`} />
      </div>
    </div>
  )
}

export function EventAgendaExperience({
  events = [],
  loading = false,
  variant = 'dark',
  eyebrow = 'Agenda municipal',
  title = 'Explorá los próximos eventos',
  subtitle = 'Elegí una fecha en el calendario o un encuentro de la lista para ver el detalle al instante.',
  headerId,
  headerAction = null,
  featuredEvent = null,
  focusDate = '',
  focusEventId = '',
  highlightEventId = '',
  railLimit = 12,
  showFeatured = true,
  showHeader = true,
  infoAside = null,
}) {
  const theme = useMemo(() => getTheme(variant), [variant])
  const parsedEvents = useMemo(() => normalizeCalendarEvents(events), [events])
  const eventsByDay = useMemo(() => groupEventsByDay(events), [events])
  const upcomingRail = useMemo(() => pickUpcomingPublicEvents(events, railLimit), [events, railLimit])

  const initialDay = useMemo(() => defaultSelectedDayKey(events), [events])
  const initialMonth = useMemo(() => {
    const first = parsedEvents[0]?.date
    return first ? startOfMonth(first) : startOfMonth(new Date())
  }, [parsedEvents])

  const [selectedDay, setSelectedDay] = useState(initialDay)
  const [visibleMonth, setVisibleMonth] = useState(initialMonth)
  const [carouselInitialIndex, setCarouselInitialIndex] = useState(0)

  useEffect(() => {
    setSelectedDay(initialDay)
    setVisibleMonth(initialMonth)
  }, [initialDay, initialMonth])

  useEffect(() => {
    if (!focusDate && !focusEventId) return

    let targetDate = parseEventDate(focusDate)
    let eventIndex = 0

    if (focusEventId) {
      const match = events.find((event) => String(event.id) === String(focusEventId))
      if (match) targetDate = parseEventDate(match.eventDate)
      if (match && targetDate) {
        const key = dayKey(targetDate)
        const dayEvents = eventsByDay.get(key) || []
        const idx = dayEvents.findIndex((event) => String(event.id) === String(focusEventId))
        eventIndex = idx >= 0 ? idx : 0
      }
    }

    if (!targetDate) return

    const key = dayKey(targetDate)
    setSelectedDay(key)
    setVisibleMonth(startOfMonth(targetDate))
    setCarouselInitialIndex(eventIndex)
  }, [focusDate, focusEventId, events, eventsByDay])

  const selectedEvents = eventsByDay.get(selectedDay) || []
  const hasSelection = selectedEvents.length > 0
  const fallbackEvent = upcomingRail[0] || parsedEvents[parsedEvents.length - 1] || null
  const displayEvents = hasSelection ? selectedEvents : fallbackEvent ? [fallbackEvent] : []
  const displaySignature = displayEvents.map((event) => event.id).join('|')

  useEffect(() => {
    preloadFlyerUrls([...displayEvents, ...upcomingRail])
  }, [displayEvents, upcomingRail])

  function handleSelectDay(key, date, eventId = '') {
    setSelectedDay(key)
    setVisibleMonth(startOfMonth(date))
    if (eventId) {
      const dayEvents = eventsByDay.get(key) || []
      const idx = dayEvents.findIndex((event) => String(event.id) === String(eventId))
      setCarouselInitialIndex(idx >= 0 ? idx : 0)
    } else {
      setCarouselInitialIndex(0)
    }
  }

  function handleMoveMonth(delta) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))
  }

  if (loading) return <AgendaSkeleton theme={theme} />

  if (parsedEvents.length === 0) {
    return (
      <div className={theme.emptyState}>
        Todavía no hay eventos próximos en la agenda municipal.
      </div>
    )
  }

  const highlighted =
    Boolean(highlightEventId) &&
    displayEvents.some((event) => String(event.id) === String(highlightEventId))

  return (
    <div id="agenda-eventos">
      {showFeatured && featuredEvent && variant === 'light' ? (
        <FeaturedEventSpotlight
          event={featuredEvent}
          theme={theme}
          onFocus={(key, date, eventId) => handleSelectDay(key, date, eventId)}
        />
      ) : null}

      {showHeader ? (
        <RevealOnScroll variant="slow">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className={theme.eyebrow}>{eyebrow}</p>
              <h2 id={headerId} className={theme.title}>
                {title}
              </h2>
              <p className={theme.subtitle}>{subtitle}</p>
            </div>
            {headerAction}
          </div>
        </RevealOnScroll>
      ) : null}

      {infoAside ? (
        <RevealOnScroll variant="slow" className="mt-6">
          {infoAside}
        </RevealOnScroll>
      ) : null}

      <div className={`grid gap-5 lg:grid-cols-12 lg:gap-6 ${showHeader || infoAside ? 'mt-8' : ''}`}>
        <div className="lg:col-span-4">
          <AgendaCalendar
            theme={theme}
            eventsByDay={eventsByDay}
            visibleMonth={visibleMonth}
            selectedDay={selectedDay}
            onSelectDay={handleSelectDay}
            onMoveMonth={handleMoveMonth}
          />
        </div>

        <div className="lg:col-span-8">
          <div
            className={`h-full transition-shadow duration-300 ${
              highlighted
                ? 'rounded-3xl shadow-[0_0_0_2px_rgba(56,189,248,0.65),0_12px_40px_-16px_rgba(56,189,248,0.35)]'
                : ''
            }`}
          >
            {displayEvents.length === 0 ? (
              <div className={theme.emptyState}>
                No hay eventos para esta fecha. Elegí otro día con actividades en el calendario.
              </div>
            ) : (
              <EventDetailCarousel
                events={displayEvents}
                eventsSignature={displaySignature}
                theme={theme}
                initialIndex={carouselInitialIndex}
                footerLink={
                  variant === 'dark' ? (
                    <Link
                      to={ROUTES.events}
                      className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-sky-200 transition hover:text-white"
                    >
                      Ver en la agenda completa
                      <span aria-hidden>→</span>
                    </Link>
                  ) : null
                }
              />
            )}
          </div>
        </div>
      </div>

      <UpcomingRail
        events={upcomingRail}
        selectedDay={selectedDay}
        onSelectDay={handleSelectDay}
        theme={theme}
      />
    </div>
  )
}
