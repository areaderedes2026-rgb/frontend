import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RevealOnScroll } from '../components/home/RevealOnScroll.jsx'
import { Container } from '../components/ui/Container.jsx'
import { LinkButton } from '../components/ui/LinkButton.jsx'
import {
  DEFAULT_HISTORY_CONTENT,
  mergeHistoryContent,
} from '../data/historyContent.js'
import { fetchHistoryContent } from '../services/historyService.js'
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
  const [loadingContent, setLoadingContent] = useState(apiEnabled)

  useEffect(() => {
    let cancelled = false
    async function loadContent() {
      if (!apiEnabled) return
      try {
        const remote = await fetchHistoryContent()
        if (!remote || cancelled) return
        setContent(mergeHistoryContent(DEFAULT_HISTORY_CONTENT, remote))
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

  const showContentSkeleton = apiEnabled && loadingContent
  const secondaryHref =
    content.ctaSecondaryHref && !content.ctaSecondaryHref.startsWith('#')
      ? content.ctaSecondaryHref
      : ROUTES.turismo

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
              <Link
                to={secondaryHref}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/15"
              >
                {content.ctaSecondaryLabel || 'Puntos turísticos'}
              </Link>
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
                    <article className="rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/8">
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
                  <LinkButton to="#resumen-historia">Volver al resumen</LinkButton>
                  <Link
                    to={ROUTES.turismo}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#2a313b] bg-[#171b22] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222831]"
                  >
                    Explorar turismo
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
