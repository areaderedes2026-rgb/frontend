import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AcademicOffersExplorer } from '../../components/oferta/AcademicOffersExplorer.jsx'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { PageListHeroHeader } from '../../components/shared/PageListHeroHeader.jsx'
import { Container } from '../../components/ui/Container.jsx'
import {
  DEFAULT_OFERTA_ACADEMICA_CONTENT,
  mergeOfertaAcademicaContent,
  ofertaHeroToHeaderProps,
} from '../../data/ofertaAcademicaContent.js'
import { fetchOfertaAcademicaContent } from '../../services/ofertaAcademicaService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'

export function OfertaAcademica() {
  const apiEnabled = isApiConfigured()
  const [page, setPage] = useState(() =>
    apiEnabled
      ? { ...DEFAULT_OFERTA_ACADEMICA_CONTENT, heroImageUrl: '' }
      : { ...DEFAULT_OFERTA_ACADEMICA_CONTENT },
  )
  const [pageContentHydrated, setPageContentHydrated] = useState(!apiEnabled)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!apiEnabled) return
      try {
        const remote = await fetchOfertaAcademicaContent()
        const merged = mergeOfertaAcademicaContent(DEFAULT_OFERTA_ACADEMICA_CONTENT, remote || {})
        if (!cancelled) setPage(merged)
      } catch {
        if (!cancelled) setPage({ ...DEFAULT_OFERTA_ACADEMICA_CONTENT })
      } finally {
        if (!cancelled) setPageContentHydrated(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [apiEnabled])

  const categories =
    page.categories?.length > 0 ? page.categories : DEFAULT_OFERTA_ACADEMICA_CONTENT.categories

  const heroImage =
    page.heroImageUrl?.trim() ||
    DEFAULT_OFERTA_ACADEMICA_CONTENT.heroImageUrl?.trim() ||
    ''

  const heroProps = {
    ...(pageContentHydrated ? ofertaHeroToHeaderProps(page) : {}),
    imageUrl: pageContentHydrated ? heroImage : '',
    contentReady: pageContentHydrated,
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
        <p className="pt-6 text-sm font-medium text-sky-700 sm:pt-8">
          <Link to={ROUTES.home} className="transition-colors hover:text-sky-900">
            ← Volver al inicio
          </Link>
        </p>

        <article className="mt-5 overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
          <div className="space-y-10 p-5 sm:p-7 lg:p-10">
            <RevealOnScroll variant="slow">
              <section className="rounded-3xl border border-[#ddd7ca] bg-[#f8f7f3] p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
                  Contexto
                </p>
                <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                  {page.introTitle}
                </h2>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#4b505a] sm:text-base">
                  {(page.introParagraphs || []).map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
                {page.highlights?.length > 0 ? (
                  <dl className="mt-6 grid gap-3 sm:grid-cols-3">
                    {page.highlights.map((item) => (
                      <div
                        key={`${item.label}-${item.value}`}
                        className="rounded-2xl border border-[#ddd7ca] bg-white px-4 py-3"
                      >
                        <dt className="text-[11px] font-bold uppercase tracking-wide text-sky-800">
                          {item.label}
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-[#171b22]">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </section>
            </RevealOnScroll>

            <RevealOnScroll variant="slow">
              <section id="ofertas-lista">
                <AcademicOffersExplorer categories={categories} offers={page.offers || []} />
              </section>
            </RevealOnScroll>

            <RevealOnScroll variant="slow">
              <section className="rounded-3xl border border-[#ddd7ca] bg-[#f8f7f3] p-6 sm:p-8">
                <h2 className="font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                  {page.ctaTitle}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#4b505a] sm:text-base">
                  {page.ctaBody}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to={ROUTES.atencionCiudadano}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#171b22] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222831]"
                  >
                    Mesa de atención
                  </Link>
                  <Link
                    to={ROUTES.areas}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d8d5cd] bg-white px-5 text-sm font-semibold text-[#171b22] transition hover:border-sky-200"
                  >
                    Ver áreas municipales
                  </Link>
                </div>
              </section>
            </RevealOnScroll>
          </div>
        </article>
      </Container>
    </section>
  )
}
