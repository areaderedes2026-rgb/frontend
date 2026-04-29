import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RevealOnScroll } from '../components/home/RevealOnScroll.jsx'
import { NewsCoverMedia } from '../components/news/NewsCoverMedia.jsx'
import { Container } from '../components/ui/Container.jsx'
import { LinkButton } from '../components/ui/LinkButton.jsx'
import {
  DEFAULT_HISTORY_CONTENT,
  mergeHistoryContent,
} from '../data/historyContent.js'
import { fetchHistoryContent } from '../services/historyService.js'
import { fetchTourismPlacesPublic } from '../services/tourismPlacesService.js'
import { isApiConfigured } from '../utils/apiConfig.js'
import { ROUTES } from '../utils/constants.js'
import {
  HydrationBodyParagraphLines,
  HydrationHeroDarkBackdrop,
  HydrationHeroLightTextBlock,
  HydrationLegacyCardBlock,
  HydrationSectionHeadingBlock,
} from '../components/skeleton/PageHydrationSkeleton.jsx'

export function History() {
  const apiEnabled = isApiConfigured()
  const [content, setContent] = useState(DEFAULT_HISTORY_CONTENT)
  const [tourismPlaces, setTourismPlaces] = useState([])
  const [activeTourismCategory, setActiveTourismCategory] = useState('all')
  const [loadingContent, setLoadingContent] = useState(apiEnabled)

  useEffect(() => {
    let cancelled = false
    async function loadContent() {
      if (!apiEnabled) return
      try {
        const remote = await fetchHistoryContent()
        if (!remote || cancelled) return
        const merged = mergeHistoryContent(DEFAULT_HISTORY_CONTENT, remote)
        setContent(merged)
        setActiveTourismCategory((current) => {
          if (merged.tourismCategories.some((item) => item.id === current)) return current
          return merged.tourismCategories[0]?.id || 'all'
        })
      } catch {
        // Si falla la API se usa el contenido por defecto.
      } finally {
        if (!cancelled) setLoadingContent(false)
      }
    }
    loadContent()
    return () => {
      cancelled = true
    }
  }, [apiEnabled])

  useEffect(() => {
    let cancelled = false
    async function loadPlaces() {
      try {
        const places = await fetchTourismPlacesPublic()
        if (cancelled) return
        setTourismPlaces(Array.isArray(places) ? places : [])
      } catch {
        if (!cancelled) setTourismPlaces([])
      }
    }
    loadPlaces()
    return () => {
      cancelled = true
    }
  }, [])

  const tourismCategories = useMemo(() => {
    const unique = []
    for (const place of tourismPlaces) {
      const category = String(place.category || '').trim()
      if (!category) continue
      if (!unique.includes(category)) unique.push(category)
    }
    return ['all', ...unique]
  }, [tourismPlaces])

  const effectiveTourismCategory = tourismCategories.includes(activeTourismCategory)
    ? activeTourismCategory
    : 'all'

  const visibleSpots = useMemo(() => {
    if (effectiveTourismCategory === 'all') return tourismPlaces
    return tourismPlaces.filter((spot) => String(spot.category || '') === effectiveTourismCategory)
  }, [effectiveTourismCategory, tourismPlaces])
  const showContentSkeleton = apiEnabled && loadingContent

  return (
    <section className="relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] overflow-hidden bg-linear-to-b from-[#f1eee8] via-[#f7f7f5] to-[#fcfcfa] pb-10 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-14">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_20%_-10%,rgba(56,189,248,0.12),transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_10%,rgba(15,23,42,0.12),transparent_70%)]"
        aria-hidden
      />

      <div className="relative min-h-[52dvh] overflow-hidden border-b border-white/10 bg-[#171b22] sm:min-h-[56dvh] lg:min-h-[58dvh]">
        <header className="relative overflow-hidden">
            {showContentSkeleton ? (
              <HydrationHeroDarkBackdrop />
            ) : (
              <img
                src={content.heroImageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/50 to-slate-900/10" />
            <Container className="relative z-10 flex min-h-[52dvh] flex-col justify-center pt-[calc(var(--navbar-h,5rem)+1rem)] pb-8 sm:min-h-[56dvh] sm:pt-[calc(var(--navbar-h,5rem)+1.5rem)] sm:pb-10 lg:min-h-[58dvh] lg:pb-12">
              {showContentSkeleton ? (
                <HydrationHeroLightTextBlock />
              ) : (
                <>
                  <p className="hero-enter-eyebrow text-xs font-bold uppercase tracking-[0.24em] text-sky-200">
                    {content.heroBadge}
                  </p>
                  <h1 className="hero-enter-title mt-3 max-w-4xl font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    {content.heroTitle}
                  </h1>
                  <p className="hero-enter-subtitle mt-3 max-w-3xl text-sm leading-relaxed text-slate-100 sm:text-base">
                    {content.heroSubtitle}
                  </p>
                </>
              )}
              <div className="hero-enter-actions mt-5 flex flex-wrap gap-3">
                <LinkButton to={content.ctaPrimaryHref || '#resumen-historia'}>
                  {content.ctaPrimaryLabel || 'Leer resumen histórico'}
                </LinkButton>
                <a
                  href={content.ctaPrimaryHref || '#resumen-historia'}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/15"
                >
                  {content.ctaSecondaryLabel || 'Puntos turísticos'}
                </a>
              </div>
            </Container>
          </header>
      </div>

      <Container className="relative">
        <article className="mt-8 overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
          <div className="space-y-10 p-5 sm:p-7 lg:p-10">
            <RevealOnScroll variant="slow">
              <section
              id="resumen-historia"
              className="rounded-3xl border border-[#ddd7ca] bg-[#f8f7f3] p-6 sm:p-8"
            >
              {showContentSkeleton ? (
                <HydrationBodyParagraphLines />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#3e434d] sm:text-base">
                  {content.introStory}
                </p>
              )}
              </section>
            </RevealOnScroll>

            <ul className="grid gap-5 lg:grid-cols-3">
              {(showContentSkeleton
                ? Array.from({ length: 3 }, (_, idx) => ({ idx }))
                : content.legacyItems
              ).map((item, idx) => (
                <li key={showContentSkeleton ? `legacy-skeleton-${idx}` : `${item.title}-${item.text}`}>
                  <RevealOnScroll variant="newsCardSlow" delayMs={idx * 90}>
                    <article
                      className="rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/8"
                    >
                      {showContentSkeleton ? (
                        <HydrationLegacyCardBlock />
                      ) : (
                        <>
                          <h2 className="text-lg font-bold tracking-tight text-[#171b22]">
                            {item.title}
                          </h2>
                          <p className="mt-2 text-sm leading-relaxed text-[#4b505a]">{item.text}</p>
                        </>
                      )}
                    </article>
                  </RevealOnScroll>
                </li>
              ))}
            </ul>

            <section id="turismo">
              <RevealOnScroll variant="slow">
                <div className="flex flex-col gap-2 border-b border-[#ddd7ca] pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
                    Turismo histórico
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                    Lugares para descubrir
                  </h2>
                </div>
                </div>
              </RevealOnScroll>

              <div className="mt-5 flex flex-wrap gap-2">
                {tourismCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveTourismCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      category === effectiveTourismCategory
                        ? 'bg-[#171b22] text-white'
                        : 'border border-[#d8d5cd] bg-white text-[#3e434d] hover:border-sky-200 hover:text-[#171b22]'
                    }`}
                  >
                    {category === 'all' ? 'Todos' : category}
                  </button>
                ))}
              </div>

              <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {visibleSpots.map((spot, idx) => (
                  <li key={spot.id}>
                    <RevealOnScroll variant="newsCardSlow" delayMs={idx * 80}>
                      <Link
                        to={ROUTES.tourismPlaceDetail(spot.slug)}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm ring-1 ring-[#1a1d24]/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/8"
                      >
                        <NewsCoverMedia
                          imageUrl={spot.imageUrl}
                          className="aspect-16/10 w-full shrink-0"
                          imgClassName="transition duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                          iconScale="md"
                        />
                        <div className="flex flex-1 flex-col p-4">
                          <h3 className="text-lg font-bold tracking-tight text-[#171b22]">
                            {spot.name}
                          </h3>
                          <p className="mt-2 flex-1 text-sm leading-relaxed text-[#4b505a]">
                            {spot.shortDescription}
                          </p>
                          <span className="mt-3 inline-flex text-sm font-semibold text-sky-800">
                            Ver detalle →
                          </span>
                        </div>
                      </Link>
                    </RevealOnScroll>
                  </li>
                ))}
              </ul>
            </section>

            <RevealOnScroll variant="newsCardSlow" delayMs={120}>
              <section className="rounded-3xl border border-[#ddd7ca] bg-[#f8f7f3] p-6 sm:p-7">
              {showContentSkeleton ? (
                <HydrationSectionHeadingBlock />
              ) : (
                <>
                  <h2 className="text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                    {content.closingTitle}
                  </h2>
                  <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-[#4b505a] sm:text-base">
                    {content.closingText}
                  </p>
                </>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <LinkButton to="#resumen-historia">
                  Volver al resumen
                </LinkButton>
                <a
                  href="#turismo"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#2a313b] bg-[#171b22] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222831]"
                >
                  Explorar turismo
                </a>
              </div>
              </section>
            </RevealOnScroll>
          </div>
        </article>
      </Container>
    </section>
  )
}
