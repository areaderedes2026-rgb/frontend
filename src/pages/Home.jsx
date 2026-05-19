import { useEffect, useMemo, useState } from 'react'
import { HomeHeroBanner } from '../components/home/HomeHeroBanner.jsx'
import { HomeInteractiveMap } from '../components/home/HomeInteractiveMap.jsx'
import { Link } from 'react-router-dom'
import { AreasCarousel } from '../components/home/AreasCarousel.jsx'
import { RevealOnScroll } from '../components/home/RevealOnScroll.jsx'
import { StorySection } from '../components/home/StorySection.jsx'
import { NewsCoverMedia } from '../components/news/NewsCoverMedia.jsx'
import { Container } from '../components/ui/Container.jsx'
import { LinkButton } from '../components/ui/LinkButton.jsx'
import { DEFAULT_HOME_HERO_CONTENT, mergeHomeHeroContent } from '../data/homeHeroContent.js'
import { DEFAULT_HOME_MAP_CONTENT, mergeHomeMapContent } from '../data/homeMapContent.js'
import { useNewsList } from '../hooks/useNewsList.js'
import { fetchPublicEvents } from '../services/eventsService.js'
import { fetchHomeHeroContent } from '../services/homeHeroService.js'
import { fetchHomeMapContent } from '../services/homeMapService.js'
import { formatShortDate } from '../utils/formatDate.js'
import { pickUpcomingPublicEvents } from '../utils/publicEvents.js'
import { ROUTES } from '../utils/constants.js'

function excerptWords(text, maxWords = 14) {
  const value = String(text || '').trim()
  if (!value) return ''
  const words = value.split(/\s+/)
  if (words.length <= maxWords) return value
  return `${words.slice(0, maxWords).join(' ')}...`
}

export function Home() {
  const { items: news } = useNewsList()
  const [homeHeroContent, setHomeHeroContent] = useState(DEFAULT_HOME_HERO_CONTENT)
  const [homeHeroLoading, setHomeHeroLoading] = useState(true)
  const [homeMapContent, setHomeMapContent] = useState(DEFAULT_HOME_MAP_CONTENT)
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)

  const featuredNews = news[0] ?? null
  const secondaryNews = useMemo(() => news.slice(1, 5), [news])

  const upcomingEvents = useMemo(() => pickUpcomingPublicEvents(events, 3), [events])
  const showEventsSection = !eventsLoading && upcomingEvents.length > 0

  useEffect(() => {
    let cancelled = false
    async function loadHero() {
      try {
        const remote = await fetchHomeHeroContent()
        if (!cancelled) {
          setHomeHeroContent(mergeHomeHeroContent(DEFAULT_HOME_HERO_CONTENT, remote || {}))
        }
      } catch {
        if (!cancelled) {
          setHomeHeroContent(DEFAULT_HOME_HERO_CONTENT)
        }
      } finally {
        if (!cancelled) {
          setHomeHeroLoading(false)
        }
      }
    }
    void loadHero()
    return () => {
      cancelled = true
    }
  }, [])

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
        if (!cancelled) setEventsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <HomeHeroBanner content={homeHeroContent} loading={homeHeroLoading} />

      <StorySection
        eyebrow="Actualidad municipal"
        title="Noticias destacadas"
        subtitle="Información oficial sobre obras, servicios y actividades del municipio."
        actions={
          <LinkButton to={ROUTES.news}>
            Ver todas las noticias
          </LinkButton>
        }
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

      {showEventsSection ? (
        <section className="relative border-y border-[#e8e5dd] bg-[#f7f7f5] py-10 sm:py-12">
          <Container>
            <RevealOnScroll variant="slow">
              <h2 className="text-center font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                Próximos eventos
              </h2>
            </RevealOnScroll>

            <div className="mt-6 sm:mt-8">
              <div className="mx-auto grid max-w-3xl justify-items-center gap-3 sm:grid-cols-3 sm:gap-4">
                {upcomingEvents.map((event, index) => (
                  <RevealOnScroll
                    key={event.id}
                    variant="slow"
                    delayMs={index * 90}
                    className="h-full w-full max-w-56"
                  >
                    <article className="group h-full overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm ring-1 ring-[#1a1d24]/5 transition-all duration-500 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/10">
                      <Link
                        to={ROUTES.events}
                        className="flex h-full flex-col"
                        aria-label={`${event.title}: ver agenda completa`}
                      >
                        <div className="relative flex aspect-3/4 w-full items-center justify-center bg-slate-900/95 p-2.5">
                          {event.flyerUrl ? (
                            <img
                              src={event.flyerUrl}
                              alt={event.title}
                              className="max-h-full max-w-full rounded-md object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Sin flyer
                            </span>
                          )}
                          <span className="absolute left-2.5 top-2.5 rounded-full border border-sky-300/40 bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100">
                            {formatShortDate(event.eventDate)}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col gap-1 p-3">
                          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[#171b22]">
                            {event.title}
                          </h3>
                          <p className="line-clamp-1 text-xs text-[#4b505a]">
                            {event.place}
                          </p>
                        </div>
                      </Link>
                    </article>
                  </RevealOnScroll>
                ))}
              </div>
              <div className="mt-5 flex justify-center sm:mt-6">
                <Link
                  to={ROUTES.events}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-800 transition-colors hover:text-[#0f1319]"
                >
                  Ver todos los eventos
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

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
