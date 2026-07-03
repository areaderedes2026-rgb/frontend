import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Container } from '../components/ui/Container.jsx'
import { LinkButton } from '../components/ui/LinkButton.jsx'
import { RevealOnScroll } from '../components/home/RevealOnScroll.jsx'
import { PageListHeroHeader } from '../components/shared/PageListHeroHeader.jsx'
import { EventAgendaExperience } from '../components/events/EventAgendaExperience.jsx'
import { fetchPublicEvents } from '../services/eventsService.js'
import { fetchSitePageBanner } from '../services/sitePageBannerService.js'
import { isApiConfigured } from '../utils/apiConfig.js'
import { ROUTES } from '../utils/constants.js'
import { pickNextFeaturedEvent, sortPublicEventsForDisplay } from '../utils/publicEvents.js'
import {
  DEFAULT_EVENTS_PAGE_HERO,
  EVENTS_LIST_DEFAULT_HERO_IMAGE,
  mergePageHeroCover,
  pageHeroToHeaderProps,
} from '../data/pageHeroCoverContent.js'

function InscriptionsAside() {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
      <div className="grid gap-0 lg:grid-cols-12">
        <div className="border-b border-[#ddd7ca] p-5 sm:p-6 lg:col-span-7 lg:border-r lg:border-b-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-800">Inscripciones</p>
          <h3 className="mt-2 font-serif text-xl font-bold tracking-tight text-[#171b22] sm:text-2xl">
            Reservá tu lugar a tiempo
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[#4b505a]">
            Algunas actividades tienen cupos limitados. Consultá requisitos y confirmá tu participación con anticipación.
          </p>
        </div>
        <aside className="p-5 sm:p-6 lg:col-span-5">
          <ul className="space-y-2 text-sm text-[#3e434d]">
            <li className="rounded-lg border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2">
              Cupos limitados según actividad
            </li>
            <li className="rounded-lg border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2">
              Confirmación por correo o WhatsApp
            </li>
            <li className="rounded-lg border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2">
              Prioridad a residentes de Trancas
            </li>
          </ul>
          <Link
            to={ROUTES.atencionCiudadano}
            className="mt-4 inline-flex text-sm font-semibold text-sky-800 transition hover:text-[#0f1319]"
          >
            Solicitar información →
          </Link>
        </aside>
      </div>
    </article>
  )
}

export function Events() {
  const apiEnabled = isApiConfigured()
  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageContent, setPageContent] = useState(DEFAULT_EVENTS_PAGE_HERO)
  const [pageContentHydrated, setPageContentHydrated] = useState(!apiEnabled)
  const [focusEventId, setFocusEventId] = useState('')
  const [highlightEventId, setHighlightEventId] = useState('')

  const visibleEvents = useMemo(() => sortPublicEventsForDisplay(events), [events])
  const featured = useMemo(() => pickNextFeaturedEvent(events), [events])
  const eventIdParam = searchParams.get('eventId')

  useEffect(() => {
    let cancelled = false
    if (!apiEnabled) return () => {}
    fetchSitePageBanner('events')
      .then((content) => {
        if (!cancelled) setPageContent(mergePageHeroCover(DEFAULT_EVENTS_PAGE_HERO, content))
      })
      .catch(() => {
        if (!cancelled) setPageContent(DEFAULT_EVENTS_PAGE_HERO)
      })
      .finally(() => {
        if (!cancelled) setPageContentHydrated(true)
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
        setEvents(Array.isArray(list) ? list : [])
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

  useEffect(() => {
    if (!eventIdParam || loading) return
    const id = String(eventIdParam)
    setFocusEventId(id)
    setHighlightEventId(id)

    const t = window.setTimeout(() => {
      const el = document.getElementById('agenda-eventos')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete('eventId')
          return next
        },
        { replace: true },
      )
    }, 120)

    return () => window.clearTimeout(t)
  }, [eventIdParam, loading, setSearchParams])

  useEffect(() => {
    if (!highlightEventId) return
    const t = window.setTimeout(() => setHighlightEventId(''), 3200)
    return () => window.clearTimeout(t)
  }, [highlightEventId])

  const heroImage =
    pageContent.heroImageUrl?.trim() || EVENTS_LIST_DEFAULT_HERO_IMAGE

  const heroProps = {
    ...(pageContentHydrated ? pageHeroToHeaderProps(pageContent, DEFAULT_EVENTS_PAGE_HERO) : {}),
    imageUrl: pageContentHydrated ? heroImage : '',
    contentReady: pageContentHydrated,
  }

  return (
    <section className="relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] overflow-hidden bg-linear-to-b from-[#f1eee8] via-[#f7f7f5] to-[#fcfcfa] pb-12 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_20%_-10%,rgba(56,189,248,0.12),transparent_65%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_10%,rgba(15,23,42,0.12),transparent_70%)]" aria-hidden />

      <PageListHeroHeader {...heroProps} />

      <Container className="relative mt-8 sm:mt-10">
        <EventAgendaExperience
          events={visibleEvents}
          loading={loading}
          variant="light"
          headerId="titulo-agenda-eventos"
          eyebrow="Agenda municipal"
          title="Todos los eventos de Trancas"
          subtitle="Navegá el calendario, explorá cada fecha y descubrí actividades culturales, deportivas y comunitarias del municipio."
          featuredEvent={featured}
          focusEventId={focusEventId}
          highlightEventId={highlightEventId}
          railLimit={16}
          infoAside={<InscriptionsAside />}
        />

        <RevealOnScroll variant="newsCardSlow" delayMs={140}>
          <section className="mt-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-center shadow-lg sm:mt-12 sm:p-10">
            <p className="font-serif text-xl font-bold text-white sm:text-2xl">
              ¿Querés sumar un evento comunitario?
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
              Enviá tu propuesta y nuestro equipo evaluará su incorporación a la agenda oficial.
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
