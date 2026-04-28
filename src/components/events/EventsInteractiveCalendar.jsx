import { useEffect, useMemo, useState } from 'react'

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']
const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

function toMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function parseEventDate(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function weekdayIndexMondayFirst(date) {
  const day = date.getDay()
  return day === 0 ? 6 : day - 1
}

function dayKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatHour(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function monthGridDays(monthDate) {
  const first = startOfMonth(monthDate)
  const startOffset = weekdayIndexMondayFirst(first)
  const startDate = new Date(first)
  startDate.setDate(first.getDate() - startOffset)

  const days = []
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    days.push(d)
  }
  return days
}

export function EventsInteractiveCalendar({ events, focusDate = '' }) {
  const parsedEvents = useMemo(
    () =>
      (Array.isArray(events) ? events : [])
        .map((event) => {
          const date = parseEventDate(event.datetime)
          if (!date) return null
          return { ...event, date }
        })
        .filter(Boolean)
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [events],
  )

  const initialMonth = parsedEvents[0]?.date
    ? startOfMonth(parsedEvents[0].date)
    : startOfMonth(new Date())

  const [visibleMonth, setVisibleMonth] = useState(initialMonth)
  const [selectedDay, setSelectedDay] = useState(
    parsedEvents[0]?.date ? dayKey(parsedEvents[0].date) : dayKey(initialMonth),
  )

  useEffect(() => {
    if (!focusDate) return
    const target = parseEventDate(focusDate)
    if (!target) return
    setVisibleMonth(startOfMonth(target))
    setSelectedDay(dayKey(target))
  }, [focusDate])

  const eventsByDay = useMemo(() => {
    const map = new Map()
    for (const event of parsedEvents) {
      const key = dayKey(event.date)
      const list = map.get(key) || []
      list.push(event)
      map.set(key, list)
    }
    return map
  }, [parsedEvents])

  const days = useMemo(() => monthGridDays(visibleMonth), [visibleMonth])
  const selectedEvents = eventsByDay.get(selectedDay) || []

  function moveMonth(delta) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
      <div className="grid gap-0 lg:grid-cols-12">
        <div className="border-b border-[#ddd7ca] p-5 sm:p-6 lg:col-span-8 lg:border-r lg:border-b-0">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8d5cd] bg-white text-slate-700 transition hover:border-sky-200 hover:text-sky-800"
              aria-label="Mes anterior"
            >
              ←
            </button>
            <h3 className="text-base font-bold text-[#171b22] sm:text-lg">
              {MONTH_LABELS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
            </h3>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8d5cd] bg-white text-slate-700 transition hover:border-sky-200 hover:text-sky-800"
              aria-label="Mes siguiente"
            >
              →
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {WEEKDAY_LABELS.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1.5">
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
                  onClick={() => setSelectedDay(key)}
                  className={`relative min-h-12 rounded-lg border text-sm font-semibold transition sm:min-h-14 ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 text-sky-900'
                      : hasEvents
                        ? 'border-sky-200 bg-sky-50/60 text-slate-900 hover:border-sky-300'
                        : 'border-[#e6e1d6] bg-white text-slate-600 hover:border-slate-300'
                  } ${isCurrentMonth ? '' : 'opacity-45'}`}
                >
                  {date.getDate()}
                  {hasEvents ? (
                    <span className="absolute right-1.5 bottom-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-700 px-1 text-[10px] font-bold text-white">
                      {count}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        <aside className="p-5 sm:p-6 lg:col-span-4">
          <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-sky-800">
            Detalle del dia
          </h4>
          {selectedEvents.length === 0 ? (
            <p className="mt-3 rounded-lg border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2 text-sm text-[#4b505a]">
              No hay eventos para esta fecha.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {selectedEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-xl border border-[#ddd7ca] bg-[#f8f7f3] p-3.5"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wide text-sky-800">
                    {event.type} · {formatHour(event.date)}
                  </p>
                  <h5 className="mt-1 text-sm font-semibold text-[#171b22]">{event.title}</h5>
                  <p className="mt-1 text-xs leading-relaxed text-[#4b505a]">{event.summary}</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {event.place}
                  </p>
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>
    </article>
  )
}
