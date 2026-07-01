import { RevealOnScroll } from '../home/RevealOnScroll.jsx'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { storySectionAnchorId } from '../../data/historyStorySections.js'

export function HistoryStorySections({
  sections = [],
  loading = false,
  previewMode = false,
}) {
  if (!loading && (!sections || sections.length === 0)) return null

  return (
    <div id="historia-secciones" className="scroll-mt-[calc(var(--navbar-h,5rem)+1.25rem)] max-lg:scroll-mt-[calc(var(--navbar-h,5rem)+5.75rem)] space-y-8">
      {(loading ? [{ id: 'skeleton' }, { id: 'skeleton-2' }] : sections).map((section, idx) => (
        <RevealOnScroll key={section.id || `story-${idx}`} variant="slow" delayMs={idx * 80}>
          <article
            id={loading ? undefined : storySectionAnchorId(section)}
            className="history-story-section scroll-mt-[calc(var(--navbar-h,5rem)+1.25rem)] max-lg:scroll-mt-[calc(var(--navbar-h,5rem)+5.75rem)] overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#f8f7f3]"
          >
            <div className="border-b border-[#ddd7ca]/80 bg-[#fcfcfa] px-6 py-5 sm:px-8 sm:py-6">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="h-7 w-2/3 max-w-md animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-full max-w-lg animate-pulse rounded bg-slate-100" />
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-800">
                    Sección {idx + 1}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                    {section.title}
                  </h2>
                  {section.subtitle ? (
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#4b505a] sm:text-base">
                      {section.subtitle}
                    </p>
                  ) : null}
                </>
              )}
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                </div>
              ) : (
                <>
                  {(section.paragraphs || []).map((paragraph, pIdx) => (
                    <p
                      key={`${section.id}-p-${pIdx}`}
                      className="whitespace-pre-wrap text-sm leading-relaxed text-[#3e434d] sm:text-base"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {(section.images || []).length > 0 ? (
                    <ul
                      className={`grid gap-4 ${
                        section.images.length > 1 ? 'sm:grid-cols-2' : 'max-w-3xl'
                      }`}
                    >
                      {section.images.map((image, imageIdx) => {
                        const src = image.imageUrl ? resolveMediaUrl(image.imageUrl) : ''
                        if (!src) return null
                        return (
                          <li key={image.id || `${section.id}-img-${imageIdx}`}>
                            <figure className="overflow-hidden rounded-2xl border border-[#ddd7ca] bg-white shadow-sm">
                              <div className="aspect-16/10 w-full overflow-hidden bg-slate-100">
                                <img
                                  src={src}
                                  alt={image.caption || section.title}
                                  loading={previewMode ? 'lazy' : 'lazy'}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              {image.caption ? (
                                <figcaption className="px-4 py-3 text-xs leading-relaxed text-[#4b505a] sm:text-sm">
                                  {image.caption}
                                </figcaption>
                              ) : null}
                            </figure>
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                </>
              )}
            </div>
          </article>
        </RevealOnScroll>
      ))}
    </div>
  )
}
