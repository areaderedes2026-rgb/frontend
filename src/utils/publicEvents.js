/** Coincide con backend/src/utils/publicEventVisibility.js */
export const PUBLIC_EVENT_RETENTION_MS = 5 * 24 * 60 * 60 * 1000

export function isPublicEventStillVisible(eventDate, nowMs = Date.now()) {
  const t = new Date(eventDate).getTime()
  if (!Number.isFinite(t)) return false
  return nowMs - t < PUBLIC_EVENT_RETENTION_MS
}

export function filterPublicVisibleEvents(events, nowMs = Date.now()) {
  if (!Array.isArray(events)) return []
  return events.filter((e) => e && isPublicEventStillVisible(e.eventDate, nowMs))
}

/**
 * Próximo evento a realizarse (el de fecha más cercana en el futuro o en el instante actual).
 */
export function pickNextFeaturedEvent(events, nowMs = Date.now()) {
  const visible = filterPublicVisibleEvents(events, nowMs)
  let best = null
  let bestTs = Infinity
  for (const e of visible) {
    const t = new Date(e.eventDate).getTime()
    if (!Number.isFinite(t) || t < nowMs) continue
    if (t < bestTs) {
      bestTs = t
      best = e
    }
  }
  return best
}

/**
 * Próximos primero (ascendente por fecha), luego recientes dentro de la ventana (descendente).
 */
export function sortPublicEventsForDisplay(events, nowMs = Date.now()) {
  const visible = filterPublicVisibleEvents(events, nowMs)
  const withTs = visible
    .map((e) => ({ e, t: new Date(e.eventDate).getTime() }))
    .filter((x) => Number.isFinite(x.t))
  const upcoming = withTs.filter((x) => x.t >= nowMs).sort((a, b) => a.t - b.t).map((x) => x.e)
  const past = withTs.filter((x) => x.t < nowMs).sort((a, b) => b.t - a.t).map((x) => x.e)
  return [...upcoming, ...past]
}

/** Próximos a ocurrir (fecha >= ahora), orden ascendente, limit opcional. */
export function pickUpcomingPublicEvents(events, limit = 3, nowMs = Date.now()) {
  const visible = filterPublicVisibleEvents(events, nowMs)
  const sorted = visible
    .map((e) => ({ e, t: new Date(e.eventDate).getTime() }))
    .filter((x) => Number.isFinite(x.t) && x.t >= nowMs)
    .sort((a, b) => a.t - b.t)
    .map((x) => x.e)
  return typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted
}
