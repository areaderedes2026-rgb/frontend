import { useEffect, useMemo, useState } from 'react'
import { HomeHeroBanner } from '../components/home/HomeHeroBanner.jsx'
import { HomeInteractiveMap } from '../components/home/HomeInteractiveMap.jsx'
import { HomeEventsAgenda } from '../components/home/HomeEventsAgenda.jsx'
import { HomeEmergencyNumbers } from '../components/home/HomeEmergencyNumbers.jsx'
import { Link } from 'react-router-dom'
import { AreasCarousel } from '../components/home/AreasCarousel.jsx'
import { RevealOnScroll } from '../components/home/RevealOnScroll.jsx'
import { StorySection } from '../components/home/StorySection.jsx'
import { NewsCoverMedia } from '../components/news/NewsCoverMedia.jsx'
import { Container } from '../components/ui/Container.jsx'
import { LinkButton } from '../components/ui/LinkButton.jsx'
import { DEFAULT_HOME_HERO_CONTENT, mergeHomeHeroContent } from '../data/homeHeroContent.js'
import {
  DEFAULT_HOME_EMERGENCY_CONTENT,
  mergeHomeEmergencyContent,
} from '../data/homeEmergencyContent.js'
import { DEFAULT_HOME_MAP_CONTENT, mergeHomeMapContent } from '../data/homeMapContent.js'
import { useNewsList } from '../hooks/useNewsList.js'
import { fetchPublicEvents } from '../services/eventsService.js'
import { fetchHomeEmergencyContent } from '../services/homeEmergencyService.js'
import { fetchHomeHeroContent } from '../services/homeHeroService.js'
import { fetchHomeMapContent } from '../services/homeMapService.js'
import { formatShortDate } from '../utils/formatDate.js'
import { sortPublicEventsForDisplay } from '../utils/publicEvents.js'
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
  const [homeEmergencyContent, setHomeEmergencyContent] = useState(DEFAULT_HOME_EMERGENCY_CONTENT)
  const [homeEmergencyLoading, setHomeEmergencyLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)

  const featuredNews = news[0] ?? null
  const secondaryNews = useMemo(() => news.slice(1, 5), [news])

  const visibleEvents = useMemo(() => sortPublicEventsForDisplay(events), [events])
  const showEventsSection = eventsLoading || visibleEvents.length > 0
  const hasPublishedEvents = visibleEvents.length > 0
  const areasTone = hasPublishedEvents ? 'light' : 'accent'
  const mapTone = hasPublishedEvents ? 'accent' : 'light'
  const accessTone = hasPublishedEvents ? 'light' : 'accent'
  const accessIsAccent = accessTone === 'accent'

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
    async function loadEmergency() {
      try {
        const remote = await fetchHomeEmergencyContent()
        if (!cancelled) {
          setHomeEmergencyContent(
            mergeHomeEmergencyContent(DEFAULT_HOME_EMERGENCY_CONTENT, remote || {}),
          )
        }
      } catch {
        if (!cancelled) {
          setHomeEmergencyContent(DEFAULT_HOME_EMERGENCY_CONTENT)
        }
      } finally {
        if (!cancelled) setHomeEmergencyLoading(false)
      }
    }
    void loadEmergency()
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
        tone="light"
        className="relative"
      >
        <div className="grid gap-6 lg:grid-cols-12">
          <RevealOnScroll className="lg:col-span-7" variant="slow">
            {featuredNews ? (
              <Link
                to={ROUTES.newsDetail(featuredNews.id)}
                className="group block overflow-hidden rounded-4xl border border-white/70 bg-white/72 shadow-[0_22px_70px_-38px_rgba(23,27,34,0.45)] ring-1 ring-[#171b22]/5 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-sky-200/80 hover:shadow-[0_28px_80px_-36px_rgba(2,132,199,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                <div className="relative overflow-hidden">
                  <NewsCoverMedia
                    imageUrl={featuredNews.imageUrl}
                    className="aspect-16/10 w-full"
                    imgClassName="transition-transform duration-700 group-hover:scale-[1.04]"
                    loading="lazy"
                    iconScale="lg"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#171b22]/28 via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <p className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-800">
                    {featuredNews.category} · {formatShortDate(featuredNews.publishedAt)}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] group-hover:text-[#0f1319]">
                    {featuredNews.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4b505a]">
                    {excerptWords(featuredNews.summary, 24)}
                  </p>
                </div>
              </Link>
            ) : (
              <article className="rounded-4xl border border-dashed border-[#d8d1c3] bg-white/65 p-6 text-sm text-[#4b505a] shadow-sm backdrop-blur">
                Estamos preparando novedades destacadas.
              </article>
            )}
          </RevealOnScroll>

          <RevealOnScroll className="lg:col-span-5 lg:h-full" variant="slow" delayMs={130}>
            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:h-full lg:grid-cols-1">
              {secondaryNews.length > 0 ? (
                secondaryNews.map((item) => (
                  <Link
                    key={item.id}
                    to={ROUTES.newsDetail(item.id)}
                    className="group flex h-full flex-col rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_16px_50px_-34px_rgba(23,27,34,0.45)] ring-1 ring-[#171b22]/5 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-sky-200/80 hover:bg-white/85 hover:shadow-[0_22px_60px_-34px_rgba(2,132,199,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">{item.category}</p>
                    <h4 className="mt-1 line-clamp-2 text-base font-semibold text-[#171b22] group-hover:text-[#0f1319]">
                      {item.title}
                    </h4>
                    <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[#4b505a] lg:line-clamp-2">
                      {excerptWords(item.summary, 12)}
                    </p>
                  </Link>
                ))
              ) : (
                <article className="rounded-3xl border border-dashed border-[#d8d1c3] bg-white/65 p-4 text-sm text-[#4b505a] sm:p-5">
                  Próximamente aparecerán más novedades aquí.
                </article>
              )}

            </div>
          </RevealOnScroll>
        </div>
      </StorySection>

      {showEventsSection ? (
        <HomeEventsAgenda events={visibleEvents} loading={eventsLoading} />
      ) : null}

      <StorySection
        eyebrow="Áreas municipales"
        title="Explorá las áreas municipales"
        subtitle="Conocé las dependencias, sus funciones y la información principal de cada área."
        tone={areasTone}
        className="relative"
      >
        <RevealOnScroll variant="slow">
          <AreasCarousel showHeader={false} tone={areasTone} />
        </RevealOnScroll>
      </StorySection>

      <StorySection
        eyebrow="Mapa de Trancas"
        title="Puntos clave del municipio"
        subtitle="Explorá ubicaciones importantes y conocé información útil directamente desde el mapa interactivo."
        tone={mapTone}
        className="relative"
      >
        <RevealOnScroll variant="slow">
          <HomeInteractiveMap content={homeMapContent} />
        </RevealOnScroll>
      </StorySection>

      <HomeEmergencyNumbers
        content={homeEmergencyContent}
        loading={homeEmergencyLoading}
        previousTone={mapTone}
      />

      <StorySection
        eyebrow="Gestiones"
        title="Accesos directos"
        subtitle="Seleccioná la opción que necesitás para continuar con tu trámite o consulta."
        tone={accessTone}
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
              <article
                className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] p-6 transition-all duration-500 hover:-translate-y-1 ${
                  accessIsAccent
                    ? 'border border-white/14 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-sky-200/60 hover:bg-white/11'
                    : 'border border-white/70 bg-white/72 shadow-[0_16px_50px_-34px_rgba(23,27,34,0.45)] ring-1 ring-[#171b22]/5 backdrop-blur hover:border-sky-200/80 hover:bg-white/85'
                }`}
              >
                <span
                  className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl transition ${
                    accessIsAccent ? 'bg-sky-300/10 group-hover:bg-sky-300/18' : 'bg-sky-300/16 group-hover:bg-sky-300/24'
                  }`}
                  aria-hidden
                />
                <span
                  className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-bold ${
                    accessIsAccent
                      ? 'border-white/12 bg-white/8 text-sky-100'
                      : 'border-[#ddd7ca] bg-[#171b22] text-white'
                  }`}
                >
                  0{i + 1}
                </span>
                <h3 className={`text-lg font-semibold ${accessIsAccent ? 'text-white' : 'text-[#171b22]'}`}>{card.title}</h3>
                <p className={`mt-2 flex-1 text-sm leading-relaxed ${accessIsAccent ? 'text-slate-200' : 'text-[#4b505a]'}`}>{card.text}</p>
                <Link
                  to={card.to}
                  className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors ${
                    accessIsAccent ? 'text-sky-200 hover:text-white' : 'text-sky-800 hover:text-[#0f1319]'
                  }`}
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
