import { useMemo, useState } from 'react'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'

function Chevron({ open }) {
  return (
    <span
      className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#ddd7ca] bg-white text-slate-500 transition duration-300 ${
        open ? 'rotate-180 border-sky-200 text-sky-700' : ''
      }`}
      aria-hidden
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </span>
  )
}

/**
 * Filtros por categoría + acordeón de ofertas (un panel abierto a la vez).
 */
export function AcademicOffersExplorer({ categories, offers }) {
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'Todos')
  const [openId, setOpenId] = useState(null)

  const filtered = useMemo(() => {
    if (!activeCategory || activeCategory === 'Todos') return offers
    return offers.filter((o) => o.category === activeCategory)
  }, [activeCategory, offers])

  function toggleOffer(id) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <div id="ofertas-lista" className="scroll-mt-[calc(var(--navbar-h)+1rem)]">
      <RevealOnScroll variant="slow">
        <div className="flex flex-col gap-3 border-b border-[#ddd7ca] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">Explorar</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
              Ofertas y trayectos
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#4b505a]">
              Filtrá por tipo de propuesta y desplegá cada ficha para ver detalle, requisitos e
              inscripción.
            </p>
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll variant="newsCardSlow" delayMs={40}>
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat)
                setOpenId(null)
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                cat === activeCategory
                  ? 'bg-[#171b22] text-white shadow-sm'
                  : 'border border-[#d8d5cd] bg-white text-[#3e434d] hover:border-sky-200 hover:text-[#171b22]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </RevealOnScroll>

      <ul className="mt-6 space-y-4">
        {filtered.map((offer, idx) => {
          const open = openId === offer.id
          const btnId = `oferta-btn-${offer.id}`
          const panelId = `oferta-panel-${offer.id}`
          return (
            <li key={offer.id}>
              <RevealOnScroll variant="newsCardSlow" delayMs={Math.min(idx * 45, 180)}>
                <div className="overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm ring-1 ring-[#1a1d24]/5 transition duration-300 hover:border-sky-200/80 hover:shadow-md hover:shadow-sky-500/8">
                  <button
                    type="button"
                    id={btnId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggleOffer(offer.id)}
                    className="flex w-full items-start gap-3 p-5 text-left transition hover:bg-[#f8f7f3]/90 sm:gap-4 sm:p-6"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-700">
                        {offer.provider}
                      </p>
                      <h3 className="mt-1 font-serif text-lg font-bold tracking-tight text-[#171b22] sm:text-xl">
                        {offer.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-md bg-[#f0f4f8] px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200/80">
                          {offer.modality}
                        </span>
                        <span className="rounded-md bg-[#f0f4f8] px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200/80">
                          {offer.duration}
                        </span>
                        {offer.tags?.map((tag) => (
                          <span
                            key={`${offer.id}-${tag}`}
                            className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-900 ring-1 ring-sky-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-[#4b505a]">{offer.summary}</p>
                    </div>
                    <Chevron open={open} />
                  </button>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    className={`grid border-t border-[#e8e4da] transition-[grid-template-rows] duration-300 ease-out ${
                      open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden bg-[#f8f7f3]/90">
                      <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Ubicación / alcance
                        </p>
                        <p className="text-sm text-[#3e434d]">{offer.location}</p>
                        {offer.details?.map((p, i) => (
                          <p key={`${offer.id}-d-${i}`} className="text-sm leading-relaxed text-[#4b505a]">
                            {p}
                          </p>
                        ))}
                        {offer.requirements?.length ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Requisitos habituales
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[#4b505a]">
                              {offer.requirements.map((r, ri) => (
                                <li key={`${offer.id}-req-${ri}`}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        <div className="rounded-xl border border-sky-200/60 bg-sky-50/80 px-4 py-3 text-sm text-sky-950">
                          <span className="font-semibold">Inscripción: </span>
                          {offer.inscription}
                        </div>
                        {offer.link?.href ? (
                          <a
                            href={offer.link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#2a313b] bg-[#171b22] px-4 text-sm font-semibold text-white transition hover:bg-[#222831]"
                          >
                            {offer.link.label || 'Más información'}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </li>
          )
        })}
      </ul>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
          No hay ofertas en esta categoría por ahora. Probá con «Todos» o volvé más adelante.
        </p>
      ) : null}
    </div>
  )
}
