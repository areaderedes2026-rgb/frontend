import { RevealOnScroll } from '../home/RevealOnScroll.jsx'

function PlayIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
    </svg>
  )
}

function ExternalIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  )
}

export function HistoryDocumentarySection({
  documentary,
  chapters = [],
  previewMode = false,
  showHeader = true,
}) {
  const title = documentary?.title || 'Documental'
  const description = documentary?.description || ''
  const list = Array.isArray(chapters) && chapters.length > 0 ? chapters : documentary?.chapters || []

  if (!title && !description && list.length === 0) return null

  return (
    <section id="documental-historia" className="scroll-mt-[calc(var(--navbar-h,5rem)+1.25rem)] max-lg:scroll-mt-[calc(var(--navbar-h,5rem)+5.75rem)]">
      {showHeader ? (
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-800">Documental</p>
          <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#4b505a] sm:text-base">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}

      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-8 text-center text-sm text-slate-600">
          Los capítulos del documental se publicarán próximamente.
        </p>
      ) : (
        <ol className="grid gap-4 lg:grid-cols-2">
          {list.map((chapter, idx) => {
            const driveUrl = String(chapter.driveUrl || '').trim()
            const hasLink = Boolean(driveUrl)
            const Wrapper = hasLink && !previewMode ? 'a' : 'article'
            const wrapperProps =
              hasLink && !previewMode
                ? {
                    href: driveUrl,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  }
                : {}

            return (
              <li key={chapter.id || `chapter-${idx}`}>
                <RevealOnScroll variant="newsCardSlow" delayMs={idx * 70}>
                  <Wrapper
                    {...wrapperProps}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm transition duration-300 ${
                      hasLink
                        ? 'hover:-translate-y-0.5 hover:border-sky-200/90 hover:shadow-lg hover:shadow-sky-500/10'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-4 p-5 sm:p-6">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          hasLink
                            ? 'bg-sky-700 text-white shadow-sm group-hover:bg-sky-800'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                        aria-hidden
                      >
                        <PlayIcon />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-800">
                          Capítulo {idx + 1}
                        </p>
                        <h3 className="mt-1 text-lg font-bold tracking-tight text-[#171b22]">
                          {chapter.title}
                        </h3>
                        {chapter.description ? (
                          <p className="mt-2 text-sm leading-relaxed text-[#4b505a]">
                            {chapter.description}
                          </p>
                        ) : null}
                        {hasLink ? (
                          <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-800 group-hover:text-sky-900">
                            Ver en Google Drive
                            <ExternalIcon />
                          </p>
                        ) : (
                          <p className="mt-4 text-xs font-medium text-slate-500">
                            Enlace próximamente
                          </p>
                        )}
                      </div>
                    </div>
                  </Wrapper>
                </RevealOnScroll>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
