import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AcademicOffersExplorer } from '../../components/oferta/AcademicOffersExplorer.jsx'
import { RevealOnScroll } from '../../components/home/RevealOnScroll.jsx'
import { Container } from '../../components/ui/Container.jsx'
import { LinkButton } from '../../components/ui/LinkButton.jsx'
import {
  DEFAULT_OFERTA_ACADEMICA_CONTENT,
  mergeOfertaAcademicaContent,
} from '../../data/ofertaAcademicaContent.js'
import { fetchOfertaAcademicaContent } from '../../services/ofertaAcademicaService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'
import {
  HydrationHeroDarkBackdrop,
  HydrationHeroLightTextBlock,
} from '../../components/skeleton/PageHydrationSkeleton.jsx'

export function OfertaAcademica() {
  const apiEnabled = isApiConfigured()
  const [page, setPage] = useState(() =>
    apiEnabled
      ? { ...DEFAULT_OFERTA_ACADEMICA_CONTENT, heroImageUrl: '' }
      : { ...DEFAULT_OFERTA_ACADEMICA_CONTENT },
  )
  const [loadingContent, setLoadingContent] = useState(apiEnabled)

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
        if (!cancelled) setLoadingContent(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [apiEnabled])

  const categories =
    page.categories?.length > 0 ? page.categories : DEFAULT_OFERTA_ACADEMICA_CONTENT.categories

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

      <div className="relative min-h-[48dvh] overflow-hidden border-b border-white/10 bg-[#171b22] sm:min-h-[52dvh] lg:min-h-[54dvh]">
        {loadingContent ? (
          <HydrationHeroDarkBackdrop />
        ) : (
          <img
            src={page.heroImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/75 to-slate-900/35" />
        <Container className="relative z-10 flex min-h-[48dvh] flex-col justify-center pt-[calc(var(--navbar-h,5rem)+1rem)] pb-8 sm:min-h-[52dvh] sm:pt-[calc(var(--navbar-h,5rem)+1.5rem)] sm:pb-10 lg:min-h-[54dvh] lg:pb-12">
          <div className="max-w-4xl">
            {loadingContent ? (
              <HydrationHeroLightTextBlock />
            ) : (
              <>
                <p className="hero-enter-eyebrow text-[11px] font-bold uppercase tracking-[0.28em] text-sky-200 sm:text-xs">
                  {page.heroEyebrow}
                </p>
                <h1 className="hero-enter-title mt-2 max-w-3xl font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                  {page.heroTitle}
                </h1>
                <p className="hero-enter-subtitle mt-3 max-w-2xl text-sm leading-relaxed text-slate-100 sm:text-base">
                  {page.heroSubtitle}
                </p>
              </>
            )}
            <div className="hero-enter-actions mt-6 flex flex-wrap gap-3">
              <a
                href="#ofertas-lista"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[#171b22] shadow-sm transition hover:bg-slate-100"
              >
                Ver ofertas
              </a>
              <Link
                to={ROUTES.areas}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/45 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/15"
              >
                Áreas municipales
              </Link>
            </div>
          </div>
        </Container>
      </div>

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
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#3e434d] sm:text-base">
                  {page.introParagraphs.map((p, i) => (
                    <p key={`intro-${i}`}>{p}</p>
                  ))}
                </div>
              </section>
            </RevealOnScroll>

            <RevealOnScroll variant="newsCardSlow" delayMs={60}>
              <ul className="grid gap-4 sm:grid-cols-3">
                {page.highlights.map((h, i) => (
                  <li
                    key={`highlight-${i}-${h.label || 'x'}`}
                    className="rounded-2xl border border-[#ddd7ca] bg-white px-4 py-5 text-center shadow-sm"
                  >
                    <p className="text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">{h.value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-sky-800">
                      {h.label}
                    </p>
                  </li>
                ))}
              </ul>
            </RevealOnScroll>

            <AcademicOffersExplorer categories={categories} offers={page.offers || []} />

            <RevealOnScroll variant="slow" delayMs={100}>
              <section className="rounded-3xl border border-[#ddd7ca] bg-linear-to-br from-sky-50/90 via-white to-[#f8f7f3] p-6 sm:p-8">
                <h2 className="text-lg font-bold tracking-tight text-[#171b22] sm:text-xl">
                  {page.ctaTitle || DEFAULT_OFERTA_ACADEMICA_CONTENT.ctaTitle}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#4b505a] sm:text-base">
                  {page.ctaBody || DEFAULT_OFERTA_ACADEMICA_CONTENT.ctaBody}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <LinkButton to={ROUTES.atencionCiudadano}>Atención al ciudadano</LinkButton>
                  <Link
                    to={ROUTES.governmentIntendencia}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d8d5cd] bg-white px-5 text-sm font-semibold text-[#171b22] transition hover:border-sky-200 hover:text-sky-900"
                  >
                    Intendencia
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
