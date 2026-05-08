import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/ui/Container.jsx'
import { RevealOnScroll } from '../components/home/RevealOnScroll.jsx'
import { LinkButton } from '../components/ui/LinkButton.jsx'
import { EventsInteractiveCalendar } from '../components/events/EventsInteractiveCalendar.jsx'
import { fetchPublicEvents } from '../services/eventsService.js'
import { fetchSitePageBanner } from '../services/sitePageBannerService.js'
import { isApiConfigured } from '../utils/apiConfig.js'
import { ROUTES } from '../utils/constants.js'
import { HydrationHeroDarkBackdrop } from '../components/skeleton/PageHydrationSkeleton.jsx'

const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1900&q=80'

function EventTag({ children }) {
  return (
    <span className="inline-flex rounded-full border border-[#d8d5cd] bg-[#f8f7f3] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#3e434d]">
      {children}
    </span>
  )
}

export function Events() {
  const apiEnabled = isApiConfigured()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [calendarFocusDate, setCalendarFocusDate] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [heroHydrated, setHeroHydrated] = useState(!apiEnabled)
  const featured = events[0] || null

  useEffect(() => {
    let cancelled = false
    if (!apiEnabled) return () => {}
    fetchSitePageBanner('events')
      .then((content) => {
        if (!cancelled) setHeroImageUrl(String(content?.heroImageUrl || ''))
      })
      .catch(() => {
        if (!cancelled) setHeroImageUrl('')
      })
      .finally(() => {
        if (!cancelled) setHeroHydrated(true)
      })
    return () => {
      cancelled = true
    }
  }, [apiEnabled])

  useEffect(() => {
    let cancelled = false
    fetchPublicEvents()
      .then((list) => {
        if (cancelled) return
        const sorted = (Array.isArray(list) ? list : []).sort(
          (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
        )
        setEvents(sorted)
      })
      .catch(() => {
        if (!cancelled) setEvents([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const visibleEvents = useMemo(() => events, [events])

  return (
    <section className="relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] overflow-hidden bg-linear-to-b from-[#f1eee8] via-[#f7f7f5] to-[#fcfcfa] pb-12 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_20%_-10%,rgba(56,189,248,0.12),transparent_65%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_10%,rgba(15,23,42,0.12),transparent_70%)]" aria-hidden />

      <div className="relative min-h-[52dvh] overflow-hidden border-b border-white/10 bg-[#171b22] sm:min-h-[56dvh] lg:min-h-[58dvh]">
        <header className="relative overflow-hidden">
          {heroHydrated ? (
            <img
              src={heroImageUrl || DEFAULT_HERO_IMAGE}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          ) : (
            <HydrationHeroDarkBackdrop />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/85 to-slate-900/35" />
          <Container className="relative z-10 flex min-h-[52dvh] flex-col justify-center pt-[calc(var(--navbar-h,5rem)+1rem)] pb-8 sm:min-h-[56dvh] sm:pt-[calc(var(--navbar-h,5rem)+1.5rem)] sm:pb-10 lg:min-h-[58dvh] lg:pb-12">
            <p className="hero-enter-eyebrow text-xs font-bold uppercase tracking-[0.22em] text-sky-200">
              Agenda municipal
            </p>
            <h1 className="hero-enter-title mt-3 max-w-4xl font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Eventos en Trancas
            </h1>
            <p className="hero-enter-subtitle mt-3 max-w-3xl text-sm leading-relaxed text-slate-100 sm:text-base">
              Conoce actividades culturales, deportivas e institucionales para toda la comunidad.
            </p>
            <div className="hero-enter-actions mt-5 flex flex-wrap gap-3">
              <a
                href="#proximos-eventos"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#171b22] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222831]"
              >
                Ver agenda
              </a>
              <LinkButton to={ROUTES.atencionCiudadano} variant="secondary">
                Consultar un evento
              </LinkButton>
            </div>
          </Container>
        </header>
      </div>

      <Container className="relative">
        <RevealOnScroll variant="slow">
          <article className="mt-8 overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
            <div className="grid gap-0 border-t border-[#ddd7ca] lg:grid-cols-12">
              <div className="border-b border-[#ddd7ca] p-5 sm:p-6 lg:col-span-7 lg:border-r lg:border-b-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-800">Evento destacado</p>
                {featured ? (
                  <>
                    <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                      {featured.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-[#4b505a]">{featured.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <EventTag>{new Date(featured.eventDate).toLocaleString('es-AR')}</EventTag>
                      <EventTag>{featured.place}</EventTag>
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-[#4b505a]">
                    {loading ? 'Cargando eventos destacados…' : 'Todavía no hay eventos publicados.'}
                  </p>
                )}
              </div>
              <aside className="p-5 sm:p-6 lg:col-span-5">
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-sky-800">Inscripciones</h3>
                <ul className="mt-3 space-y-2 text-sm text-[#3e434d]">
                  <li className="rounded-lg border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2">
                    Cupos limitados segun actividad
                  </li>
                  <li className="rounded-lg border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2">
                    Confirmacion por correo o WhatsApp
                  </li>
                  <li className="rounded-lg border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2">
                    Prioridad a residentes de Trancas
                  </li>
                </ul>
                <Link
                  to={ROUTES.atencionCiudadano}
                  className="mt-4 inline-flex text-sm font-semibold text-sky-800 transition hover:text-[#0f1319]"
                >
                  Solicitar informacion →
                </Link>
              </aside>
            </div>
          </article>
        </RevealOnScroll>

        <section id="proximos-eventos" className="mt-10 sm:mt-12">
          <RevealOnScroll variant="slow">
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-800">
                  Proximos encuentros
                </p>
                <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                  Agenda de eventos
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                {loading ? 'Cargando agenda…' : `${visibleEvents.length} evento(s) disponible(s)`}
              </p>
            </div>
          </RevealOnScroll>

          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-12">
            {visibleEvents.map((event, idx) => (
              <li
                key={event.id}
                className={idx === 0 ? 'sm:col-span-2 xl:col-span-7' : 'xl:col-span-5'}
              >
                <RevealOnScroll variant="newsCardSlow" delayMs={idx * 80}>
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarFocusDate(event.datetime)
                      const node = document.getElementById('calendario-eventos')
                      if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] text-left shadow-sm ring-1 ring-[#1a1d24]/5 transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/10"
                  >
                    <div className="relative flex min-h-72 items-center justify-center bg-slate-900/95 p-3 sm:min-h-80">
                      <img
                        src={event.flyerUrl}
                        alt={event.title}
                        className="max-h-120 w-auto max-w-full rounded-md object-contain transition duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap gap-2">
                        <EventTag>{new Date(event.eventDate).toLocaleString('es-AR')}</EventTag>
                      </div>
                      <h3 className="mt-3 text-lg font-bold tracking-tight text-[#171b22]">
                        {event.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#4b505a]">
                        {event.summary}
                      </p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {event.place}
                      </p>
                      <span className="mt-3 text-sm font-semibold text-sky-800 transition group-hover:text-[#0f1319]">
                        Ver en calendario →
                      </span>
                    </div>
                  </button>
                </RevealOnScroll>
              </li>
            ))}
          </ul>
        </section>

        <section id="calendario-eventos" className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-10">
          <RevealOnScroll variant="slow" className="lg:col-span-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sky-800">Calendario interactivo</h2>
            <p className="mt-2 font-serif text-2xl font-bold text-[#171b22]">Selecciona una fecha</p>
            <p className="mt-3 text-sm leading-relaxed text-[#4b505a]">
              Los dias con actividades muestran un indicador. Hace clic para ver el detalle de cada evento.
            </p>
          </RevealOnScroll>
          <RevealOnScroll variant="slow" delayMs={120} className="lg:col-span-7">
            <EventsInteractiveCalendar
              events={visibleEvents.map((event) => ({
                id: event.id,
                type: 'Evento',
                title: event.title,
                summary: event.summary,
                place: event.place,
                datetime: event.eventDate,
              }))}
              focusDate={calendarFocusDate}
            />
          </RevealOnScroll>
        </section>

        <RevealOnScroll variant="newsCardSlow" delayMs={140}>
          <section className="mt-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-center shadow-lg sm:mt-12 sm:p-10">
            <p className="font-serif text-xl font-bold text-white sm:text-2xl">
              Queres sumar un evento comunitario?
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
              Envia tu propuesta y nuestro equipo evaluara su incorporacion a la agenda oficial.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <LinkButton to={ROUTES.atencionCiudadano}>
                Enviar propuesta
              </LinkButton>
              <Link
                to={ROUTES.services}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Ver otros servicios
              </Link>
            </div>
          </section>
        </RevealOnScroll>
      </Container>
    </section>
  )
}
