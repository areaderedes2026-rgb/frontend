import { RevealOnScroll } from '../home/RevealOnScroll.jsx'

function IconClock({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.65} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function IconMap({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.65} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  )
}

function IconSpark({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  )
}

/**
 * @param {{ schoolsSection: { title: string, intro: string, eyebrow?: string, items: Array<{ id: string, name: string, discipline: string, schedule: string, venue: string, description: string, imageUrl?: string }> } }} props
 */
export function AreaSchoolsSection({ schoolsSection }) {
  const { title, intro, eyebrow = 'Formación y comunidad', items = [] } = schoolsSection || {}
  if (!items.length) return null

  return (
    <RevealOnScroll variant="slow">
      <section
        id="escuelas-area"
        className="scroll-mt-[calc(var(--navbar-h)+1rem)] rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-7"
      >
        <div className="flex flex-col gap-4 border-b border-[#e8e4da] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
              <IconSpark className="h-4 w-4 text-sky-600" />
              {eyebrow}
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#4b505a] sm:text-base">{intro}</p>
          </div>
        </div>

        <ul className="mt-6 grid gap-5 sm:grid-cols-2">
          {items.map((school) => (
            <li key={school.id || school.name}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-white shadow-sm ring-1 ring-[#1a1d24]/5 transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/90 hover:shadow-lg hover:shadow-sky-500/10">
                <div className="relative aspect-16/10 w-full overflow-hidden bg-linear-to-br from-slate-800 via-slate-700 to-sky-900">
                  {school.imageUrl ? (
                    <img
                      src={school.imageUrl}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 opacity-90"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.35), transparent 45%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.12), transparent 40%)',
                      }}
                      aria-hidden
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-800 shadow-sm ring-1 ring-sky-100">
                      {school.discipline}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="text-lg font-bold tracking-tight text-[#171b22] sm:text-xl">{school.name}</h3>
                  <dl className="mt-3 space-y-2 text-sm text-[#4b505a]">
                    <div className="flex gap-2">
                      <dt className="sr-only">Horarios</dt>
                      <dd className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 text-sky-600">
                          <IconClock />
                        </span>
                        <span>{school.schedule}</span>
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="sr-only">Lugar</dt>
                      <dd className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 text-sky-600">
                          <IconMap />
                        </span>
                        <span>{school.venue}</span>
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-[#4b505a]">{school.description}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </RevealOnScroll>
  )
}
