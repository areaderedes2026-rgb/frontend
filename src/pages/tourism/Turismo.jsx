import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { NewsCoverMedia } from '../../components/news/NewsCoverMedia.jsx'
import { Container } from '../../components/ui/Container.jsx'
import { DEFAULT_TOURISM_PAGE_CONTENT } from '../../data/tourismPageContent.js'
import { fetchTourismPlacesPublic } from '../../services/tourismPlacesService.js'
import { ROUTES } from '../../utils/constants.js'
import {
  HydrationHeroDarkBackdrop,
  HydrationHeroLightTextBlock,
} from '../../components/skeleton/PageHydrationSkeleton.jsx'

export function Turismo() {
  const page = DEFAULT_TOURISM_PAGE_CONTENT
  const [tourismPlaces, setTourismPlaces] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loadingPlaces, setLoadingPlaces] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadPlaces() {
      setLoadingPlaces(true)
      try {
        const places = await fetchTourismPlacesPublic()
        if (!cancelled) setTourismPlaces(Array.isArray(places) ? places : [])
      } catch {
        if (!cancelled) setTourismPlaces([])
      } finally {
        if (!cancelled) setLoadingPlaces(false)
      }
    }
    loadPlaces()
    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(() => {
    const unique = []
    for (const place of tourismPlaces) {
      const category = String(place.category || '').trim()
      if (!category) continue
      if (!unique.includes(category)) unique.push(category)
    }
    return ['all', ...unique]
  }, [tourismPlaces])

  const effectiveCategory = categories.includes(activeCategory) ? activeCategory : 'all'

  const visiblePlaces = useMemo(() => {
    if (effectiveCategory === 'all') return tourismPlaces
    return tourismPlaces.filter((spot) => String(spot.category || '') === effectiveCategory)
  }, [effectiveCategory, tourismPlaces])

  const heroImage =
    tourismPlaces.find((place) => place.imageUrl)?.imageUrl || page.heroImageUrl

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

      <div className="relative min-h-[46dvh] overflow-hidden border-b border-white/10 bg-[#171b22] sm:min-h-[50dvh] lg:min-h-[52dvh]">
        <header className="relative overflow-hidden">
          {loadingPlaces ? (
            <HydrationHeroDarkBackdrop />
          ) : (
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/55 to-slate-900/15" />
          <Container className="relative z-10 flex min-h-[46dvh] flex-col justify-center pt-[calc(var(--navbar-h,5rem)+0.75rem)] pb-8 sm:min-h-[50dvh] sm:pb-10 lg:min-h-[52dvh] lg:pb-12">
            {loadingPlaces ? (
              <HydrationHeroLightTextBlock />
            ) : (
              <>
                <p className="hero-enter-eyebrow text-xs font-bold uppercase tracking-[0.24em] text-sky-200">
                  {page.heroBadge}
                </p>
                <h1 className="hero-enter-title mt-3 max-w-4xl font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {page.heroTitle}
                </h1>
                <p className="hero-enter-subtitle mt-3 max-w-3xl text-sm leading-relaxed text-slate-100 sm:text-base">
                  {page.heroSubtitle}
                </p>
              </>
            )}
            <div className="hero-enter-actions mt-5 flex flex-wrap gap-3">
              <a
                href="#puntos-turisticos"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[#171b22] shadow-sm transition hover:bg-slate-100"
              >
                Ver puntos turísticos
              </a>
              <Link
                to={ROUTES.history}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/15"
              >
                Conocer la historia
              </Link>
            </div>
          </Container>
        </header>
      </div>

      <Container className="relative">
        <article
          id="puntos-turisticos"
          className="mt-8 overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm"
        >
          <div className="space-y-8 p-5 sm:p-7 lg:p-10">
            <RevealOnScroll variant="slow">
              <div className="flex flex-col gap-2 border-b border-[#ddd7ca] pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
                    {page.sectionEyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                    {page.sectionTitle}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4b505a] sm:text-base">
                    {page.sectionSubtitle}
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            {categories.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      category === effectiveCategory
                        ? 'bg-[#171b22] text-white'
                        : 'border border-[#d8d5cd] bg-white text-[#3e434d] hover:border-sky-200 hover:text-[#171b22]'
                    }`}
                  >
                    {category === 'all' ? 'Todos' : category}
                  </button>
                ))}
              </div>
            ) : null}

            {loadingPlaces ? (
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }, (_, idx) => (
                  <li key={idx}>
                    <div className="animate-pulse overflow-hidden rounded-2xl border border-[#ddd7ca] bg-white">
                      <div className="aspect-video bg-slate-100" />
                      <div className="space-y-3 p-4">
                        <div className="h-5 w-3/4 rounded bg-slate-100" />
                        <div className="h-4 w-full rounded bg-slate-50" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : visiblePlaces.length > 0 ? (
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {visiblePlaces.map((spot, idx) => (
                  <li key={spot.id}>
                    <RevealOnScroll variant="newsCardSlow" delayMs={idx * 80}>
                      <Link
                        to={ROUTES.tourismPlaceDetail(spot.slug)}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm ring-1 ring-[#1a1d24]/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/8"
                      >
                        <NewsCoverMedia
                          imageUrl={spot.imageUrl}
                          className="aspect-video w-full shrink-0"
                          imgClassName="transition duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                          iconScale="md"
                        />
                        <div className="flex flex-1 flex-col p-4">
                          {spot.category ? (
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-800">
                              {spot.category}
                            </p>
                          ) : null}
                          <h3 className="mt-1 text-lg font-bold tracking-tight text-[#171b22]">
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
            ) : (
              <div className="rounded-2xl border border-dashed border-[#ddd7ca] bg-[#f8f7f3] px-6 py-10 text-center">
                <p className="text-base font-semibold text-[#171b22]">
                  Próximamente sumaremos nuevos puntos turísticos.
                </p>
                <p className="mt-2 text-sm text-[#4b505a]">
                  Volvé más adelante para descubrir destinos destacados de la región.
                </p>
              </div>
            )}
          </div>
        </article>
      </Container>
    </section>
  )
}
