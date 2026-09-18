/** Un evento público se muestra el día del evento y todos los posteriores (no los ya pasados). */
function startOfLocalDay(ms) {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function isPublicEventStillVisible(eventDate, nowMs = Date.now()) {
  const t = new Date(eventDate).getTime()
  if (!Number.isFinite(t)) return false
  return startOfLocalDay(t) >= startOfLocalDay(nowMs)
}

export function filterPublicVisibleEvents(events, nowMs = Date.now()) {
  if (!Array.isArray(events)) return []
  return events.filter((e) => e && isPublicEventStillVisible(e.eventDate, nowMs))
}

/**
 * Próximo evento a realizarse (el de fecha más cercana hoy o en el futuro).
 */
export function pickNextFeaturedEvent(events, nowMs = Date.now()) {
  const visible = filterPublicVisibleEvents(events, nowMs)
  let best = null
  let bestTs = Infinity
  const todayStart = startOfLocalDay(nowMs)
  for (const e of visible) {
    const t = new Date(e.eventDate).getTime()
    if (!Number.isFinite(t) || startOfLocalDay(t) < todayStart) continue
    if (t < bestTs) {
      bestTs = t
      best = e
    }
  }
  return best
}

/** Solo actuales y futuros, del más próximo al más lejano. */
export function sortPublicEventsForDisplay(events, nowMs = Date.now()) {
  const visible = filterPublicVisibleEvents(events, nowMs)
  return visible
    .map((e) => ({ e, t: new Date(e.eventDate).getTime() }))
    .filter((x) => Number.isFinite(x.t))
    .sort((a, b) => a.t - b.t)
    .map((x) => x.e)
}

/** Próximos a ocurrir (hoy o después), orden ascendente, limit opcional. */
export function pickUpcomingPublicEvents(events, limit = 3, nowMs = Date.now()) {
  const sorted = sortPublicEventsForDisplay(events, nowMs)
  return typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted
}
