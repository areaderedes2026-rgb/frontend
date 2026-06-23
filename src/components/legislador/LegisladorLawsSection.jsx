import { useMemo, useState } from 'react'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'
import { sortLegislatorLaws } from '../../data/legisladorLawsContent.js'

export function LegisladorLawsSection({ section }) {
  const [query, setQuery] = useState('')
  const items = sortLegislatorLaws(section?.items || [])
  const normalizedQuery = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!normalizedQuery) return items
    return items.filter((law) => {
      const haystack = `${law.label} ${law.number} ${law.body}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [items, normalizedQuery])

  if (!section?.enabled || !items.length) return null

  return (
    <section
      id="leyes-legislador"
      className="scroll-mt-[calc(var(--navbar-h,5rem)+1rem)] mt-12 sm:mt-14"
      aria-labelledby="leg-leyes-heading"
    >
      <RevealOnScroll variant="slow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-800">
              Normativa provincial
            </p>
            <h2
              id="leg-leyes-heading"
              className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl"
            >
              {section.title || 'Leyes'}
            </h2>
            {section.subtitle ? (
              <p className="mt-2 text-sm leading-relaxed text-[#5c6169] sm:text-base">
                {section.subtitle}
              </p>
            ) : null}
          </div>
          {items.length > 4 ? (
            <label className="w-full sm:max-w-xs">
              <span className="sr-only">Buscar ley</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por número o texto…"
                className="w-full rounded-xl border border-[#d8d5cd] bg-white px-3 py-2.5 text-sm text-[#171b22] shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </label>
          ) : null}
        </div>
      </RevealOnScroll>

      <ol className="relative mt-8 space-y-0 border-l-2 border-[#ddd7ca] pl-0">
        {filtered.map((law, index) => (
          <li key={law.id} className="relative pb-8 pl-8 last:pb-0 sm:pl-10">
            <RevealOnScroll variant="newsCardSlow" delayMs={50 + index * 45}>
              <span
                className="absolute -left-[9px] top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-sky-600 bg-[#f7f7f5] sm:-left-[11px] sm:h-[22px] sm:w-[22px]"
                aria-hidden
              >
                <span className="h-2 w-2 rounded-full bg-sky-700" />
              </span>
              <article className="overflow-hidden rounded-2xl border border-[#ddd7ca] bg-white shadow-sm transition duration-300 hover:border-sky-200/80 hover:shadow-md">
                <div className="flex flex-col gap-3 border-b border-[#ece8df] bg-[#f8f7f3]/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <p className="font-mono text-sm font-bold tracking-tight text-sky-900 sm:text-base">
                    {law.label || `LEY ${law.number}`}
                  </p>
                  {law.number ? (
                    <span className="inline-flex w-fit rounded-md bg-[#171b22] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      N.º {law.number}
                    </span>
                  ) : null}
                </div>
                <p className="px-4 py-4 text-sm leading-relaxed text-[#4b505a] sm:px-5 sm:text-[0.9375rem]">
                  {law.body}
                </p>
              </article>
            </RevealOnScroll>
          </li>
        ))}
      </ol>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-[#ddd7ca] bg-[#f8f7f3] px-4 py-8 text-center text-sm text-[#5c6169]">
          No hay leyes que coincidan con la búsqueda.
        </p>
      ) : null}
    </section>
  )
}
