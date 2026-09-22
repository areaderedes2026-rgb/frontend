import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GastronomyVenuesExplorer } from '../../components/gastronomy/GastronomyVenuesExplorer.jsx'
import { GastronomyVenuesMap } from '../../components/gastronomy/GastronomyVenuesMap.jsx'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { PageListHeroHeader } from '../../components/shared/PageListHeroHeader.jsx'
import { Container } from '../../components/ui/Container.jsx'
import {
  DEFAULT_GASTRONOMIC_CATALOG_CONTENT,
  gastronomyHeroToHeaderProps,
  gastronomyVenueHasMapPoint,
  getActiveGastronomyVenues,
  mergeGastronomicCatalogContent,
} from '../../data/gastronomicCatalogContent.js'
import { fetchGastronomicCatalogContent } from '../../services/gastronomicCatalogService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'

export function CatalogoGastronomico() {
  const apiEnabled = isApiConfigured()
  const location = useLocation()
  const [page, setPage] = useState(() =>
    apiEnabled
      ? { ...DEFAULT_GASTRONOMIC_CATALOG_CONTENT, heroImageUrl: '' }
      : { ...DEFAULT_GASTRONOMIC_CATALOG_CONTENT },
  )
  const [pageContentHydrated, setPageContentHydrated] = useState(!apiEnabled)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapFocus, setMapFocus] = useState({ id: '', token: 0 })
  const mapFocusTimer = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!apiEnabled) return
      try {
        const remote = await fetchGastronomicCatalogContent()
        const merged = mergeGastronomicCatalogContent(DEFAULT_GASTRONOMIC_CATALOG_CONTENT, remote || {})
        if (!cancelled) setPage(merged)
      } catch {
        if (!cancelled) setPage({ ...DEFAULT_GASTRONOMIC_CATALOG_CONTENT })
      } finally {
        if (!cancelled) setPageContentHydrated(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [apiEnabled])

  useEffect(() => {
    if (!pageContentHydrated) return
    const hash = String(location.hash || '').replace('#', '')
    if (!hash) return
    const el = document.getElementById(hash)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash, pageContentHydrated, page.venues])

  const categories =
    page.categories?.length > 0 ? page.categories : DEFAULT_GASTRONOMIC_CATALOG_CONTENT.categories
  const venues = useMemo(() => getActiveGastronomyVenues(page), [page])

  const showVenueOnMap = useCallback((venue) => {
    if (!venue || !gastronomyVenueHasMapPoint(venue)) return
    const id = String(venue.id || '').trim()
    if (!id) return
    const target = document.getElementById('catalogo-mapa')
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.clearTimeout(mapFocusTimer.current)
    mapFocusTimer.current = window.setTimeout(() => {
      setMapFocus((prev) => ({ id, token: prev.token + 1 }))
    }, 420)
  }, [])

  useEffect(
    () => () => {
      window.clearTimeout(mapFocusTimer.current)
    },
    [],
  )

  const heroImage =
    page.heroImageUrl?.trim() || DEFAULT_GASTRONOMIC_CATALOG_CONTENT.heroImageUrl?.trim() || ''

  const heroProps = {
    ...(pageContentHydrated ? gastronomyHeroToHeaderProps(page) : {}),
    imageUrl: pageContentHydrated ? heroImage : '',
    contentReady: pageContentHydrated,
    searchQuery,
    onSearchChange: setSearchQuery,
    onSearchSubmit: (e) => {
      e?.preventDefault?.()
      const target = document.getElementById('catalogo-locales')
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
  }

  return (
    <section className="relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] overflow-hidden bg-linear-to-b from-[#f1eee8] via-[#f7f7f5] to-[#fcfcfa] pb-12 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_45%_at_20%_-10%,rgba(56,189,248,0.12),transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_10%,rgba(15,23,42,0.12),transparent_70%)]"
        aria-hidden
      />

      <PageListHeroHeader {...heroProps} />

      <Container className="relative max-w-[min(100%,96rem)]!">
        <article className="mt-8 overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
          <div className="space-y-10 p-5 sm:p-7 lg:p-10">
            <GastronomyVenuesExplorer
              categories={categories}
              venues={venues}
              searchPlaceholder={page.heroSearchPlaceholder}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onShowOnMap={showVenueOnMap}
            />

            {page.ctaTitle || page.ctaBody ? (
              <RevealOnScroll variant="slow">
                <section className="rounded-3xl border border-[#ddd7ca] bg-linear-to-br from-sky-50/90 via-white to-[#f8f7f3] p-6 sm:p-8">
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                    {page.ctaTitle}
                  </h2>
                  {page.ctaBody ? (
                    <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-[#4b505a] sm:text-base">
                      {page.ctaBody}
                    </p>
                  ) : null}
                  <Link
                    to={ROUTES.atencionCiudadano}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#171b22] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222831]"
                  >
                    Ir a atención al ciudadano
                  </Link>
                </section>
              </RevealOnScroll>
            ) : null}

            <GastronomyVenuesMap
              venues={venues}
              focusVenueId={mapFocus.id}
              focusToken={String(mapFocus.token)}
            />
          </div>
        </article>
      </Container>
    </section>
  )
}
