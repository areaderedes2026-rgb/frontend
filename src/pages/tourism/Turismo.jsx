import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { NewsCoverMedia } from '../../components/news/NewsCoverMedia.jsx'
import { Container } from '../../components/ui/Container.jsx'
import { PageListHeroHeader } from '../../components/shared/PageListHeroHeader.jsx'
import { DEFAULT_TOURISM_PAGE_CONTENT } from '../../data/tourismPageContent.js'
import {
  DEFAULT_TOURISM_PAGE_HERO,
  TOURISM_LIST_DEFAULT_HERO_IMAGE,
  mergePageHeroCover,
  pageHeroToHeaderProps,
} from '../../data/pageHeroCoverContent.js'
import { fetchSitePageBanner } from '../../services/sitePageBannerService.js'
import { fetchTourismPlacesPublic } from '../../services/tourismPlacesService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'

export function Turismo() {
  const page = DEFAULT_TOURISM_PAGE_CONTENT
  const apiEnabled = isApiConfigured()
  const [tourismPlaces, setTourismPlaces] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loadingPlaces, setLoadingPlaces] = useState(true)
  const [pageContent, setPageContent] = useState(DEFAULT_TOURISM_PAGE_HERO)
  const [pageContentHydrated, setPageContentHydrated] = useState(!apiEnabled)

  useEffect(() => {
    let cancelled = false
    if (!apiEnabled) return () => {}
    fetchSitePageBanner('tourism')
      .then((content) => {
        if (!cancelled) setPageContent(mergePageHeroCover(DEFAULT_TOURISM_PAGE_HERO, content))
      })
      .catch(() => {
        if (!cancelled) setPageContent(DEFAULT_TOURISM_PAGE_HERO)
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
    pageContent.heroImageUrl?.trim() ||
    page.heroImageUrl?.trim() ||
    TOURISM_LIST_DEFAULT_HERO_IMAGE

  const heroProps = {
    ...(pageContentHydrated ? pageHeroToHeaderProps(pageContent, DEFAULT_TOURISM_PAGE_HERO) : {}),
    imageUrl: pageContentHydrated ? heroImage : '',
    contentReady: pageContentHydrated,
  }

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

      <PageListHeroHeader {...heroProps} />

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
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse overflow-hidden rounded-2xl border border-[#ddd7ca] bg-white"
                  >
                    <div className="aspect-4/3 bg-slate-200" />
                    <div className="p-4">
                      <div className="h-4 w-2/3 rounded bg-slate-200" />
                      <div className="mt-2 h-3 w-full rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visiblePlaces.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[#d8d5cd] bg-[#f8f7f3] px-5 py-8 text-center text-sm text-[#4b505a]">
                Todavía no hay puntos turísticos publicados. Volvé pronto para descubrir Trancas.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visiblePlaces.map((spot) => (
                  <RevealOnScroll key={spot.id} variant="slow">
                    <Link
                      to={ROUTES.tourismPlaceDetail(spot.slug)}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-md"
                    >
                      <NewsCoverMedia
                        imageUrl={spot.imageUrl}
                        className="aspect-4/3 w-full"
                        imgClassName="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                      />
                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-sky-800">
                          {spot.category}
                        </p>
                        <h3 className="mt-1 font-serif text-lg font-bold text-[#171b22] group-hover:text-sky-900">
                          {spot.name}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#4b505a]">
                          {spot.shortDescription}
                        </p>
                        <span className="mt-4 text-sm font-semibold text-sky-800">
                          Ver detalle →
                        </span>
                      </div>
                    </Link>
                  </RevealOnScroll>
                ))}
              </div>
            )}
          </div>
        </article>

        <p className="mt-8 text-center text-sm text-[#4b505a]">
          <Link to={ROUTES.home} className="font-semibold text-sky-800 transition hover:text-sky-900">
            ← Volver al inicio
          </Link>
        </p>
      </Container>
    </section>
  )
}
