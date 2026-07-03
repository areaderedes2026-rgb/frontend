export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
export const MONTH_LABELS = [
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

export function parseEventDate(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export function dayKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function toMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function weekdayIndexMondayFirst(date) {
  const day = date.getDay()
  return day === 0 ? 6 : day - 1
}

export function monthGridDays(monthDate) {
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

export function formatEventHour(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function normalizeCalendarEvents(events) {
  return (Array.isArray(events) ? events : [])
    .map((event) => {
      const date = parseEventDate(event.datetime ?? event.eventDate)
      if (!date) return null
      return { ...event, date }
    })
    .filter(Boolean)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

export function groupEventsByDay(events) {
  const map = new Map()
  for (const event of normalizeCalendarEvents(events)) {
    const key = dayKey(event.date)
    const list = map.get(key) || []
    list.push(event)
    map.set(key, list)
  }
  return map
}

export function defaultSelectedDayKey(events, nowMs = Date.now()) {
  const parsed = normalizeCalendarEvents(events)
  if (parsed.length === 0) return dayKey(new Date(nowMs))

  const todayKey = dayKey(new Date(nowMs))
  const eventsByDay = groupEventsByDay(events)
  if (eventsByDay.has(todayKey)) return todayKey

  const upcoming = parsed.find((event) => event.date.getTime() >= nowMs)
  if (upcoming) return dayKey(upcoming.date)

  return dayKey(parsed[parsed.length - 1].date)
}
