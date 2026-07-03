import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RevealOnScroll } from './RevealOnScroll.jsx'
import { Container } from '../ui/Container.jsx'
import { ROUTES } from '../../utils/constants.js'
import { formatDateTime, formatShortDate } from '../../utils/formatDate.js'
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

function AgendaSkeleton() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#171b22] py-12 text-white sm:py-14">
      <Container className="relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto h-6 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="mx-auto mt-4 h-9 w-64 animate-pulse rounded-lg bg-white/10" />
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-12 lg:gap-6">
          <div className="h-80 animate-pulse rounded-3xl bg-white/8 lg:col-span-4" />
          <div className="h-80 animate-pulse rounded-3xl bg-white/8 lg:col-span-8" />
        </div>
      </Container>
    </section>
  )
}

function MiniMonthCalendar({ eventsByDay, visibleMonth, selectedDay, onSelectDay, onMoveMonth }) {
  const days = useMemo(() => monthGridDays(visibleMonth), [visibleMonth])

  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onMoveMonth(-1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/14 bg-white/8 text-sky-100 transition hover:border-sky-300/40 hover:bg-white/12 hover:text-white"
          aria-label="Mes anterior"
        >
          ←
        </button>
        <p className="text-sm font-bold text-white sm:text-base">
          {MONTH_LABELS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
        </p>
        <button
          type="button"
          onClick={() => onMoveMonth(1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/14 bg-white/8 text-sky-100 transition hover:border-sky-300/40 hover:bg-white/12 hover:text-white"
          aria-label="Mes siguiente"
        >
          →
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-sky-100/80 sm:text-[11px]">
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
              className={`relative min-h-10 rounded-xl border text-xs font-semibold transition duration-200 sm:min-h-11 sm:text-sm ${
                isSelected
                  ? 'border-sky-300 bg-sky-400/25 text-white shadow-[0_0_0_1px_rgba(125,211,252,0.45)]'
                  : hasEvents
                    ? 'border-sky-300/35 bg-sky-400/10 text-white hover:border-sky-200/60 hover:bg-sky-400/18'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
              } ${isCurrentMonth ? '' : 'opacity-40'}`}
            >
              {date.getDate()}
              {hasEvents ? (
                <span className="absolute right-1 bottom-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-sky-300 px-0.5 text-[9px] font-bold text-slate-900">
                  {count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EventFlyer({ event, className = '' }) {
  if (event.flyerUrl) {
    return (
      <img
        src={event.flyerUrl}
        alt=""
        className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${className}`.trim()}
        loading="lazy"
        decoding="async"
      />
    )
  }

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-linear-to-br from-slate-800 via-slate-900 to-[#171b22] text-sky-100/80 ${className}`.trim()}
      aria-hidden
    >
      <CalendarIcon className="h-8 w-8" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Evento</span>
    </div>
  )
}

function EventDetailCard({ event, index, total }) {
  const date = parseEventDate(event.eventDate)
  const day = date ? date.getDate() : '—'
  const month = date ? MONTH_LABELS[date.getMonth()] : ''
  const weekday = date
    ? date.toLocaleDateString('es-AR', { weekday: 'long' })
    : ''

  return (
    <article
      key={event.id}
      className="group grid h-full gap-4 overflow-hidden rounded-3xl border border-white/12 bg-white/[0.07] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur transition duration-300 hover:border-sky-200/35 hover:bg-white/10 sm:grid-cols-[minmax(0,1fr)_11rem] sm:gap-5 sm:p-5 lg:grid-cols-[minmax(0,1fr)_12.5rem]"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100">
            <span className="tabular-nums text-sm font-bold text-white">{day}</span>
            {month}
          </span>
          {date ? (
            <span className="text-xs capitalize text-slate-300">
              {weekday} · {formatEventHour(date)} hs
            </span>
          ) : null}
          {total > 1 ? (
            <span className="rounded-full border border-white/12 bg-white/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
              {index + 1} de {total}
            </span>
          ) : null}
        </div>

        <h3 className="mt-3 font-serif text-xl font-bold tracking-tight text-white sm:text-2xl">
          {event.title}
        </h3>
        {event.summary ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-200/95 sm:line-clamp-4">
            {event.summary}
          </p>
        ) : null}
        {event.place ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100/85">
            {event.place}
          </p>
        ) : null}

        <Link
          to={ROUTES.events}
          className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-sky-200 transition hover:text-white"
        >
          Ver en la agenda completa
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="relative min-h-44 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1319] sm:min-h-0 sm:h-full">
        <EventFlyer event={event} />
      </div>
    </article>
  )
}

function UpcomingRail({ events, selectedDay, onSelectDay }) {
  if (events.length === 0) return null

  return (
    <div className="mt-6 sm:mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-100/90">
          Próximos encuentros
        </p>
        <p className="text-xs text-slate-400">Deslizá para ver más</p>
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
              className={`group min-w-[11.5rem] shrink-0 snap-start rounded-2xl border p-3 text-left transition duration-200 sm:min-w-[12.5rem] ${
                isSelected
                  ? 'border-sky-300/50 bg-sky-400/15 shadow-[0_8px_30px_-12px_rgba(56,189,248,0.55)]'
                  : 'border-white/12 bg-white/[0.05] hover:border-sky-200/35 hover:bg-white/10'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-100/85">
                {date ? formatShortDate(event.eventDate) : 'Sin fecha'}
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-white">
                {event.title}
              </p>
              <p className="mt-1 line-clamp-1 text-xs text-slate-300">
                {event.place || formatDateTime(event.eventDate)}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function HomeEventsAgenda({ events = [], loading = false }) {
  const parsedEvents = useMemo(() => normalizeCalendarEvents(events), [events])
  const eventsByDay = useMemo(() => groupEventsByDay(events), [events])
  const upcomingRail = useMemo(() => pickUpcomingPublicEvents(events, 8), [events])

  const initialDay = useMemo(() => defaultSelectedDayKey(events), [events])
  const initialMonth = useMemo(() => {
    const first = parsedEvents[0]?.date
    return first ? startOfMonth(first) : startOfMonth(new Date())
  }, [parsedEvents])

  const [selectedDay, setSelectedDay] = useState(initialDay)
  const [visibleMonth, setVisibleMonth] = useState(initialMonth)
  const [detailKey, setDetailKey] = useState(0)

  useEffect(() => {
    setSelectedDay(initialDay)
    setVisibleMonth(initialMonth)
  }, [initialDay, initialMonth])

  const selectedEvents = eventsByDay.get(selectedDay) || []
  const hasSelection = selectedEvents.length > 0
  const fallbackEvent = upcomingRail[0] || parsedEvents[parsedEvents.length - 1] || null
  const displayEvents = hasSelection ? selectedEvents : fallbackEvent ? [fallbackEvent] : []

  function handleSelectDay(key, date) {
    setSelectedDay(key)
    setVisibleMonth(startOfMonth(date))
    setDetailKey((value) => value + 1)
  }

  function handleMoveMonth(delta) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))
  }

  if (loading) return <AgendaSkeleton />
  if (parsedEvents.length === 0) return null

  return (
    <section
      className="relative isolate overflow-hidden border-b border-white/10 bg-[#171b22] py-12 text-white sm:py-14"
      aria-labelledby="titulo-agenda-inicio"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_18%_28%,rgba(56,189,248,0.18),transparent_62%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_100%_100%,rgba(14,165,233,0.14),transparent_68%)]"
        aria-hidden
      />

      <Container className="relative z-10">
        <RevealOnScroll variant="slow">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
                Agenda municipal
              </p>
              <h2
                id="titulo-agenda-inicio"
                className="mt-3 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
              >
                Explorá los próximos eventos
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Elegí una fecha en el calendario o un encuentro de la lista para ver el detalle al instante.
              </p>
            </div>
            <Link
              to={ROUTES.events}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/14 bg-white/8 px-4 py-2.5 text-sm font-semibold text-sky-100 shadow-sm transition hover:border-sky-200/60 hover:bg-white/12 hover:text-white"
            >
              Ver agenda completa
              <span aria-hidden>→</span>
            </Link>
          </div>
        </RevealOnScroll>

        <div className="mt-8 grid gap-5 lg:grid-cols-12 lg:gap-6">
          <RevealOnScroll variant="slow" className="lg:col-span-4">
            <MiniMonthCalendar
              eventsByDay={eventsByDay}
              visibleMonth={visibleMonth}
              selectedDay={selectedDay}
              onSelectDay={handleSelectDay}
              onMoveMonth={handleMoveMonth}
            />
          </RevealOnScroll>

          <RevealOnScroll variant="slow" delayMs={100} className="lg:col-span-8">
            <div key={detailKey} className="news-fade-up h-full space-y-3">
              {displayEvents.length === 0 ? (
                <div className="flex h-full min-h-72 items-center justify-center rounded-3xl border border-dashed border-white/16 bg-white/[0.04] px-6 text-center text-sm text-slate-300">
                  No hay eventos para esta fecha. Elegí otro día con actividades en el calendario.
                </div>
              ) : (
                displayEvents.map((event, index) => (
                  <EventDetailCard
                    key={event.id}
                    event={event}
                    index={index}
                    total={displayEvents.length}
                  />
                ))
              )}
            </div>
          </RevealOnScroll>
        </div>

        <UpcomingRail
          events={upcomingRail}
          selectedDay={selectedDay}
          onSelectDay={handleSelectDay}
        />
      </Container>
    </section>
  )
}
