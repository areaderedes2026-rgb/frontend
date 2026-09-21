import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GastronomyVenuesExplorer } from '../../components/gastronomy/GastronomyVenuesExplorer.jsx'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { PageListHeroHeader } from '../../components/shared/PageListHeroHeader.jsx'
import { Container } from '../../components/ui/Container.jsx'
import {
  DEFAULT_GASTRONOMIC_CATALOG_CONTENT,
  gastronomyHeroToHeaderProps,
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

  const liveStats = [
    { label: 'Locales', value: String(venues.length) },
    {
      label: 'Tipos',
      value: String(
        new Set(venues.map((v) => v.category).filter((c) => c && c !== 'Todos')).size ||
          Math.max((categories || []).filter((c) => c !== 'Todos').length, 0),
      ),
    },
  ]

  return (
    <section className="relative -mt-[calc(var(--navbar-h,5rem)+1.5rem)] overflow-hidden bg-[#f6f3ee] pb-16 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_10%_-8%,rgba(180,83,9,0.1),transparent_55%)]"
        aria-hidden
      />

      <PageListHeroHeader {...heroProps} />

      <Container className="relative max-w-[min(100%,88rem)]!">
        <p className="pt-6 text-sm font-medium text-[#7a4a1e] sm:pt-8">
          <Link to={ROUTES.home} className="transition-colors hover:text-[#171b22]">
            ← Volver al inicio
          </Link>
        </p>

        <RevealOnScroll variant="slow">
          <div className="mt-8 grid items-end gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.7fr)] lg:gap-12">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b45309]">Contexto</p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#171b22] sm:text-[2.35rem]">
                {page.introTitle}
              </h2>
              <div className="mt-4 max-w-2xl space-y-3 text-sm leading-relaxed text-[#5c6169] sm:text-base">
                {(page.introParagraphs || []).map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:gap-4">
              {liveStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.2rem] bg-white px-4 py-4 shadow-[0_16px_40px_-32px_rgba(23,27,34,0.5)] ring-1 ring-[#171b22]/6"
                >
                  <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b45309]">{item.label}</dt>
                  <dd className="mt-1 font-serif text-3xl font-bold tabular-nums tracking-tight text-[#171b22]">
                    {item.value}
                  </dd>
                </div>
              ))}
              {(page.highlights || []).length > 0 ? (
                <div className="col-span-2 space-y-3 rounded-[1.2rem] bg-[#171b22] px-4 py-4 text-white">
                  {(page.highlights || []).map((item) => (
                    <div key={`${item.label}-${item.value}`}>
                      <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f3d5b0]">{item.label}</dt>
                      <dd className="mt-0.5 text-sm font-semibold leading-snug">{item.value}</dd>
                    </div>
                  ))}
                </div>
              ) : null}
            </dl>
          </div>
        </RevealOnScroll>

        <div className="mt-12 sm:mt-16">
          <GastronomyVenuesExplorer
            categories={categories}
            venues={venues}
            searchPlaceholder={page.heroSearchPlaceholder}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {page.ctaTitle || page.ctaBody ? (
          <RevealOnScroll variant="slow">
            <section className="mt-14 overflow-hidden rounded-[1.6rem] bg-[#171b22] px-6 py-8 text-white sm:mt-16 sm:px-10 sm:py-10">
              <div className="max-w-3xl">
                <h2 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">{page.ctaTitle}</h2>
                {page.ctaBody ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/75 sm:text-base">
                    {page.ctaBody}
                  </p>
                ) : null}
                <Link
                  to={ROUTES.atencionCiudadano}
                  className="mt-6 inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-[#171b22] transition hover:bg-[#f3efe6]"
                >
                  Ir a atención al ciudadano
                </Link>
              </div>
            </section>
          </RevealOnScroll>
        ) : null}
      </Container>
    </section>
  )
}
