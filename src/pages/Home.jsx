import { useEffect, useMemo, useState } from 'react'
import { HomeInteractiveMap } from '../components/home/HomeInteractiveMap.jsx'
import { Link } from 'react-router-dom'
import { AreasCarousel } from '../components/home/AreasCarousel.jsx'
import { RevealOnScroll } from '../components/home/RevealOnScroll.jsx'
import { StoryCard } from '../components/home/StoryCard.jsx'
import { StorySection } from '../components/home/StorySection.jsx'
import { NewsCoverMedia } from '../components/news/NewsCoverMedia.jsx'
import { Container } from '../components/ui/Container.jsx'
import { LinkButton } from '../components/ui/LinkButton.jsx'
import { DEFAULT_HOME_MAP_CONTENT, mergeHomeMapContent } from '../data/homeMapContent.js'
import { useNewsList } from '../hooks/useNewsList.js'
import { fetchPublicEvents } from '../services/eventsService.js'
import { fetchHomeMapContent } from '../services/homeMapService.js'
import { formatShortDate } from '../utils/formatDate.js'
import { ROUTES } from '../utils/constants.js'

const HERO_IMAGE = '/rio.jpeg'

const SERVICE_PREVIEW = [
  {
    name: 'Partidas y documentación',
    eta: '48 hs hábiles',
    to: ROUTES.services,
    category: 'Documentación',
    text: 'Solicitudes administrativas y requisitos obligatorios.',
  },
  {
    name: 'Reclamos urbanos',
    eta: '72 hs iniciales',
    to: ROUTES.services,
    category: 'Obras',
    text: 'Reportes de alumbrado, limpieza y mantenimiento.',
  },
  {
    name: 'Asistencia social',
    eta: 'Entrevista previa',
    to: ROUTES.services,
    category: 'Comunidad',
    text: 'Programas de acompañamiento y orientación social.',
  },
  {
    name: 'Turnos de salud',
    eta: 'Asignación diaria',
    to: ROUTES.services,
    category: 'Salud',
    text: 'Gestión de turnos y prestaciones municipales.',
  },
]

function excerptWords(text, maxWords = 14) {
  const value = String(text || '').trim()
  if (!value) return ''
  const words = value.split(/\s+/)
  if (words.length <= maxWords) return value
  return `${words.slice(0, maxWords).join(' ')}...`
}

export function Home() {
  const { items: news } = useNewsList()
  const [homeMapContent, setHomeMapContent] = useState(DEFAULT_HOME_MAP_CONTENT)
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [mobileEventSlide, setMobileEventSlide] = useState(0)
  const [mobileSliderPaused, setMobileSliderPaused] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )

  const featuredNews = news[0] ?? null
  const secondaryNews = useMemo(() => news.slice(1, 5), [news])
  const featuredEvent = events[0] ?? null
  const secondaryEvents = useMemo(() => events.slice(1, 4), [events])
  const safeMobileEventSlide =
    secondaryEvents.length > 0 ? mobileEventSlide % secondaryEvents.length : 0

  useEffect(() => {
    let cancelled = false
    async function loadMap() {
      try {
        const remote = await fetchHomeMapContent()
        if (!cancelled) {
          setHomeMapContent(mergeHomeMapContent(DEFAULT_HOME_MAP_CONTENT, remote || {}))
        }
      } catch {
        if (!cancelled) {
          setHomeMapContent(DEFAULT_HOME_MAP_CONTENT)
        }
      }
    }
    void loadMap()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (secondaryEvents.length <= 1 || mobileSliderPaused) return undefined
    const id = window.setInterval(() => {
      if (document.hidden) return
      setMobileEventSlide((prev) => (prev + 1) % secondaryEvents.length)
    }, 4800)
    return () => window.clearInterval(id)
  }, [secondaryEvents.length, mobileSliderPaused])

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
        if (!cancelled) setEventsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <section className="relative isolate min-h-dvh overflow-hidden border-b border-slate-200/40">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/60 to-black/35" aria-hidden />
        </div>

        <Container className="relative z-10 flex min-h-dvh flex-col justify-center pt-[calc(var(--navbar-h,5rem)+1.25rem)] pb-10 sm:pt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-14 lg:pb-16">
          <div className="max-w-4xl">
            <p className="hero-enter-eyebrow text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Municipalidad de Trancas
            </p>
            <h1 className="hero-enter-title mt-2 font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Trancas tierra gaucha
            </h1>
            <div className="hero-enter-actions mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <LinkButton to={ROUTES.atencionCiudadano}>
                Realizar consulta
              </LinkButton>
              <LinkButton to={ROUTES.services} variant="secondary">
                Ver servicios
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>

      <StorySection
        eyebrow="Agenda activa"
        title="Eventos en Trancas"
        subtitle="Descubrí próximos encuentros culturales, deportivos e institucionales desde la portada."
        actions={
          <div className="flex flex-wrap gap-3">
            <LinkButton to={ROUTES.events}>
              Ver agenda completa
            </LinkButton>
            <LinkButton to={ROUTES.atencionCiudadano} variant="secondary">
              Consultar un evento
            </LinkButton>
          </div>
        }
        tone="soft"
        className="relative"
      >
        {featuredEvent ? (
          <div className="grid gap-5 lg:grid-cols-12">
            <RevealOnScroll className="lg:col-span-7" variant="slow">
              <article className="group overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm ring-1 ring-[#1a1d24]/5 transition-all duration-500 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/10">
                <div className="relative flex min-h-72 items-center justify-center bg-slate-900/95 p-3 sm:min-h-80">
                  <img
                    src={featuredEvent.flyerUrl}
                    alt={featuredEvent.title}
                    className="max-h-120 w-auto max-w-full rounded-md object-contain transition duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="absolute left-4 top-4 rounded-full border border-sky-300/50 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-100">
                    Destacado
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">
                    {formatShortDate(featuredEvent.eventDate)} · {featuredEvent.place}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22]">
                    {featuredEvent.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4b505a]">
                    {excerptWords(featuredEvent.summary, 26)}
                  </p>
                  <Link
                    to={ROUTES.events}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-800 transition hover:text-[#0f1319]"
                  >
                    Ver evento y calendario
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </article>
            </RevealOnScroll>
            <RevealOnScroll className="lg:col-span-5 lg:h-full" variant="slow" delayMs={120}>
              <div className="sm:hidden">
                {secondaryEvents.length > 0 ? (
                  <div
                    className="rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-4 shadow-sm ring-1 ring-[#1a1d24]/5"
                    onMouseEnter={() => setMobileSliderPaused(true)}
                    onMouseLeave={() => setMobileSliderPaused(false)}
                  >
                    <article key={secondaryEvents[safeMobileEventSlide].id}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">
                        {formatShortDate(secondaryEvents[safeMobileEventSlide].eventDate)}
                      </p>
                      <h4 className="mt-1 line-clamp-2 text-base font-semibold text-[#171b22]">
                        {secondaryEvents[safeMobileEventSlide].title}
                      </h4>
                      <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[#4b505a]">
                        {excerptWords(secondaryEvents[safeMobileEventSlide].summary, 14)}
                      </p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {secondaryEvents[safeMobileEventSlide].place}
                      </p>
                    </article>
                    {secondaryEvents.length > 1 ? (
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5" role="tablist" aria-label="Eventos secundarios">
                          {secondaryEvents.map((event, index) => (
                            <button
                              key={event.id}
                              type="button"
                              role="tab"
                              aria-selected={safeMobileEventSlide === index}
                              aria-label={`Ir al evento ${index + 1}`}
                              className={`h-2.5 w-2.5 rounded-full transition ${
                                safeMobileEventSlide === index ? 'bg-sky-700' : 'bg-slate-300'
                              }`}
                              onClick={() => setMobileEventSlide(index)}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                            onClick={() =>
                              setMobileEventSlide(
                                (prev) =>
                                  (prev - 1 + secondaryEvents.length) % secondaryEvents.length,
                              )
                            }
                            aria-label="Evento anterior"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                            onClick={() =>
                              setMobileEventSlide((prev) => (prev + 1) % secondaryEvents.length)
                            }
                            aria-label="Evento siguiente"
                          >
                            ›
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                            onClick={() => setMobileSliderPaused((prev) => !prev)}
                            aria-label={
                              mobileSliderPaused ? 'Reanudar reproducción' : 'Pausar reproducción'
                            }
                          >
                            {mobileSliderPaused ? 'Reanudar' : 'Pausar'}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="hidden auto-rows-fr gap-4 sm:grid sm:grid-cols-2 lg:h-full lg:grid-cols-1">
                {secondaryEvents.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-4 shadow-sm ring-1 ring-[#1a1d24]/5 transition-all duration-500 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/10 sm:p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">
                      {formatShortDate(event.eventDate)}
                    </p>
                    <h4 className="mt-1 line-clamp-2 text-base font-semibold text-[#171b22]">
                      {event.title}
                    </h4>
                    <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[#4b505a]">
                      {excerptWords(event.summary, 14)}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {event.place}
                    </p>
                  </article>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-6 text-sm text-[#4b505a]">
            {eventsLoading
              ? 'Cargando próximos eventos...'
              : 'Todavía no hay eventos publicados. Pronto se mostrarán aquí.'}
          </div>
        )}
      </StorySection>

      <StorySection
        id="servicios-rapidos"
        eyebrow="Servicios"
        title="Trámites y servicios"
        subtitle="Consultá requisitos, tiempos de respuesta y canales para iniciar cada gestión."
        actions={
          <div className="flex flex-wrap gap-3">
            <LinkButton to={ROUTES.services}>
              Ver todos los servicios
            </LinkButton>
            <LinkButton to={ROUTES.atencionCiudadano} variant="secondary">
              Consulta web
            </LinkButton>
          </div>
        }
        tone="light"
        className="relative"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_PREVIEW.map((item, i) => (
            <RevealOnScroll key={item.name} variant="slow" delayMs={i * 120} className="h-full">
              <StoryCard
                badge={item.category}
                title={item.name}
                text={`${item.text} Tiempo orientativo: ${item.eta}.`}
                to={item.to}
                cta="Gestionar"
              />
            </RevealOnScroll>
          ))}
        </div>
      </StorySection>

      <StorySection
        eyebrow="Actualidad municipal"
        title="Noticias destacadas"
        subtitle="Información oficial sobre obras, servicios y actividades del municipio."
        tone="soft"
        className="relative"
      >
        <div className="grid gap-6 lg:grid-cols-12">
          <RevealOnScroll className="lg:col-span-7" variant="slow">
            {featuredNews ? (
              <article className="group overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm ring-1 ring-[#1a1d24]/5 transition-all duration-500 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/10">
                <NewsCoverMedia
                  imageUrl={featuredNews.imageUrl}
                  className="aspect-16/10 w-full"
                  imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="lazy"
                  iconScale="lg"
                />
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">
                    {featuredNews.category} · {formatShortDate(featuredNews.publishedAt)}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22]">
                    <Link to={ROUTES.newsDetail(featuredNews.id)} className="transition-colors hover:text-[#0f1319]">
                      {featuredNews.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4b505a]">
                    {excerptWords(featuredNews.summary, 24)}
                  </p>
                </div>
              </article>
            ) : (
              <article className="rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-6 text-sm text-[#4b505a]">
                Estamos preparando novedades destacadas.
              </article>
            )}
          </RevealOnScroll>

          <RevealOnScroll className="lg:col-span-5 lg:h-full" variant="slow" delayMs={130}>
            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:h-full lg:grid-cols-1">
              {secondaryNews.length > 0 ? (
                secondaryNews.map((item) => (
                  <article
                    key={item.id}
                    className="group flex h-full flex-col rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-4 shadow-sm ring-1 ring-[#1a1d24]/5 transition-all duration-500 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/10 sm:p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">{item.category}</p>
                    <h4 className="mt-1 line-clamp-2 text-base font-semibold text-[#171b22]">
                      <Link to={ROUTES.newsDetail(item.id)} className="transition-colors hover:text-[#0f1319]">
                        {item.title}
                      </Link>
                    </h4>
                    <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[#4b505a] lg:line-clamp-2">
                      {excerptWords(item.summary, 12)}
                    </p>
                  </article>
                ))
              ) : (
                <article className="rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-4 text-sm text-[#4b505a] sm:p-5">
                  Próximamente aparecerán más novedades aquí.
                </article>
              )}

            </div>
          </RevealOnScroll>
        </div>
      </StorySection>

      <StorySection
        eyebrow="Áreas municipales"
        title="Explorá las áreas municipales"
        subtitle="Conocé las dependencias, sus funciones y la información principal de cada área."
        tone="light"
        className="relative"
      >
        <RevealOnScroll variant="slow">
          <AreasCarousel showHeader={false} />
        </RevealOnScroll>
      </StorySection>

      <StorySection
        eyebrow="Mapa de Trancas"
        title="Puntos clave del municipio"
        subtitle="Explorá ubicaciones importantes y conocé información útil directamente desde el mapa interactivo."
        tone="light"
        className="relative"
      >
        <RevealOnScroll variant="slow">
          <HomeInteractiveMap content={homeMapContent} />
        </RevealOnScroll>
      </StorySection>

      <StorySection
        eyebrow="Gestiones"
        title="Accesos directos"
        subtitle="Seleccioná la opción que necesitás para continuar con tu trámite o consulta."
        tone="accent"
        className="relative"
      >
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              title: 'Iniciar trámite',
              text: 'Entrá al directorio y comenzá tu gestión.',
              to: ROUTES.services,
              cta: 'Ir a servicios',
            },
            {
              title: 'Enviar consulta',
              text: 'Canal ciudadano para consultas y seguimiento.',
              to: ROUTES.atencionCiudadano,
              cta: 'Ir a atención',
            },
            {
              title: 'Ver novedades',
              text: 'Últimas noticias y comunicados oficiales.',
              to: ROUTES.news,
              cta: 'Ir a noticias',
            },
          ].map((card, i) => (
            <RevealOnScroll key={card.title} variant="slow" delayMs={i * 120} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/5 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-sky-200/70 hover:bg-white/10">
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-200">{card.text}</p>
                <Link
                  to={card.to}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-sky-200 transition-colors hover:text-white"
                >
                  {card.cta}
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </Link>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </StorySection>
    </>
  )
}
