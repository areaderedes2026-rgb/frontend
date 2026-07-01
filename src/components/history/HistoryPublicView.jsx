import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'
import { Container } from '../ui/Container.jsx'
import { LinkButton } from '../ui/LinkButton.jsx'
import { HistoryHeroHeader } from './HistoryHeroHeader.jsx'
import { HistoryDocumentarySection } from './HistoryDocumentarySection.jsx'
import {
  filterHistoryByQuery,
  isHistorySectionVisible,
  normalizeHistoryDocumentary,
} from '../../data/historyContent.js'
import { ROUTES } from '../../utils/constants.js'
import {
  HydrationBodyParagraphLines,
  HydrationLegacyCardBlock,
  HydrationSectionHeadingBlock,
} from '../skeleton/PageHydrationSkeleton.jsx'

function resolveHref(href) {
  const value = String(href || '').trim()
  if (!value) return ROUTES.turismo
  if (value.startsWith('#') || value.startsWith('http')) return value
  return value.startsWith('/') ? value : `/${value}`
}

export function HistoryPublicView({
  content,
  loading = false,
  previewMode = false,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const trimmedSearch = searchQuery.trim()
  const isSearching = Boolean(trimmedSearch)

  const documentary = useMemo(
    () => normalizeHistoryDocumentary(content?.documentary),
    [content?.documentary],
  )

  const searchFilter = useMemo(
    () => filterHistoryByQuery(content, trimmedSearch),
    [content, trimmedSearch],
  )

  const showIntro = isHistorySectionVisible(content, 'introStory')
  const showLegacy = isHistorySectionVisible(content, 'legacyCards')
  const showDocumentary = isHistorySectionVisible(content, 'documentary')
  const showClosing = isHistorySectionVisible(content, 'closing')

  const legacyItems = useMemo(() => {
    const all = Array.isArray(content?.legacyItems) ? content.legacyItems : []
    if (!isSearching) return all
    return searchFilter.sections.legacyItems || []
  }, [content?.legacyItems, isSearching, searchFilter.sections.legacyItems])

  const documentaryChapters = useMemo(() => {
    if (!isSearching) return documentary.chapters
    return searchFilter.sections.chapters || []
  }, [documentary.chapters, isSearching, searchFilter.sections.chapters])

  const showIntroBlock = showIntro && (!isSearching || searchFilter.sections.introMatch)
  const showLegacyBlock = showLegacy && (!isSearching || legacyItems.length > 0)
  const showDocumentaryBlock =
    showDocumentary &&
    (!isSearching ||
      searchFilter.sections.documentaryMetaMatch ||
      documentaryChapters.length > 0)
  const showClosingBlock = showClosing && (!isSearching || searchFilter.sections.closingMatch)

  const hasVisibleContent =
    showIntroBlock || showLegacyBlock || showDocumentaryBlock || showClosingBlock

  function scrollToContent() {
    if (previewMode) return
    const target = isSearching ? 'resultados-busqueda-historia' : 'contenido-historia'
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const secondaryHref = resolveHref(content?.ctaSecondaryHref)

  return (
    <section
      className={`relative overflow-hidden bg-linear-to-b from-[#f1eee8] via-[#f7f7f5] to-[#fcfcfa] ${
        previewMode
          ? ''
          : '-mt-[calc(var(--navbar-h,5rem)+1.5rem)] pb-10 sm:-mt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-14'
      }`}
    >
      {!previewMode ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_20%_-10%,rgba(56,189,248,0.12),transparent_65%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_100%_10%,rgba(15,23,42,0.12),transparent_70%)]"
            aria-hidden
          />
        </>
      ) : null}

      <HistoryHeroHeader
        badge={content?.heroBadge || ''}
        title={content?.heroTitle || 'Historia de Trancas'}
        subtitle={content?.heroSubtitle || ''}
        imageUrl={content?.heroImageUrl || ''}
        searchPlaceholder={
          content?.heroSearchPlaceholder || '¿Qué querés conocer de Trancas?'
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={scrollToContent}
        primaryCta={
          content?.ctaPrimaryLabel
            ? { label: content.ctaPrimaryLabel, href: content.ctaPrimaryHref }
            : null
        }
        secondaryCta={
          content?.ctaSecondaryLabel
            ? { label: content.ctaSecondaryLabel, href: secondaryHref }
            : null
        }
        previewMode={previewMode}
        searchDisabled={loading}
      />

      <Container className="relative" id="contenido-historia">
        {isSearching ? (
          <div id="resultados-busqueda-historia" className="mt-8 scroll-mt-32">
            <p className="text-sm text-slate-600">
              {searchFilter.hasMatches ? (
                <>
                  Resultados para{' '}
                  <span className="font-semibold text-slate-900">«{trimmedSearch}»</span>
                </>
              ) : (
                <>
                  No encontramos resultados para{' '}
                  <span className="font-semibold text-slate-900">«{trimmedSearch}»</span>
                </>
              )}
            </p>
          </div>
        ) : null}

        {!isSearching || searchFilter.hasMatches ? (
          <article className="mt-8 overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
            <div className="space-y-10 p-5 sm:p-7 lg:p-10">
              {showIntroBlock ? (
                <RevealOnScroll variant="slow">
                  <section
                    id="resumen-historia"
                    className="scroll-mt-32 rounded-3xl border border-[#ddd7ca] bg-[#f8f7f3] p-6 sm:p-8"
                  >
                    {loading ? (
                      <HydrationBodyParagraphLines />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#3e434d] sm:text-base">
                        {content?.introStory}
                      </p>
                    )}
                  </section>
                </RevealOnScroll>
              ) : null}

              {showLegacyBlock ? (
                <ul className="grid gap-5 lg:grid-cols-3">
                  {(loading
                    ? Array.from({ length: 3 }, (_, idx) => ({ idx }))
                    : legacyItems
                  ).map((item, idx) => (
                    <li key={loading ? `legacy-skeleton-${idx}` : `${item.title}-${idx}`}>
                      <RevealOnScroll variant="newsCardSlow" delayMs={idx * 90}>
                        <article className="h-full rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/8">
                          {loading ? (
                            <HydrationLegacyCardBlock />
                          ) : (
                            <>
                              <h2 className="text-lg font-bold tracking-tight text-[#171b22]">
                                {item.title}
                              </h2>
                              <p className="mt-2 text-sm leading-relaxed text-[#4b505a]">
                                {item.text}
                              </p>
                            </>
                          )}
                        </article>
                      </RevealOnScroll>
                    </li>
                  ))}
                </ul>
              ) : null}

              {showDocumentaryBlock ? (
                <RevealOnScroll variant="slow">
                  <HistoryDocumentarySection
                    documentary={documentary}
                    chapters={documentaryChapters}
                    previewMode={previewMode}
                    showHeader={!isSearching || searchFilter.sections.documentaryMetaMatch}
                  />
                </RevealOnScroll>
              ) : null}

              {showClosingBlock ? (
                <RevealOnScroll variant="newsCardSlow" delayMs={120}>
                  <section
                    id="cierre-historia"
                    className="scroll-mt-32 rounded-3xl border border-[#ddd7ca] bg-[#f8f7f3] p-6 sm:p-7"
                  >
                    {loading ? (
                      <HydrationSectionHeadingBlock />
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                          {content?.closingTitle}
                        </h2>
                        <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-[#4b505a] sm:text-base">
                          {content?.closingText}
                        </p>
                      </>
                    )}
                    {!previewMode ? (
                      <div className="mt-5 flex flex-wrap gap-3">
                        <LinkButton to="#resumen-historia">Volver al resumen</LinkButton>
                        <Link
                          to={ROUTES.turismo}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#2a313b] bg-[#171b22] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222831]"
                        >
                          Explorar turismo
                        </Link>
                      </div>
                    ) : null}
                  </section>
                </RevealOnScroll>
              ) : null}

              {!hasVisibleContent && isSearching ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-10 text-center text-sm text-slate-600">
                  Probá con otras palabras o explorá el resumen y el documental sin filtro.
                </p>
              ) : null}
            </div>
          </article>
        ) : null}
      </Container>
    </section>
  )
}
