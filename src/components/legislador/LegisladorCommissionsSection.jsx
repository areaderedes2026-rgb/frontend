import { useCallback, useId, useState } from 'react'
import { RevealOnScroll } from '../home/RevealOnScroll.jsx'
import { sortLegislatorCommissions } from '../../data/legisladorCommissionsContent.js'

function RoleStamp({ label, holder }) {
  const hasHolder = Boolean(holder?.trim())
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center rounded-lg border border-sky-200/80 bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-900">
        {label}
      </span>
      {hasHolder ? (
        <span className="text-sm font-semibold text-[#171b22]">{holder}</span>
      ) : (
        <span className="text-sm italic text-[#9ca3af]">Integrante</span>
      )}
    </div>
  )
}

function CommissionFolio({ commission, index, isOpen, onToggle }) {
  const panelId = useId()
  const displayNumber = commission.number || String(index + 1)

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-[#fcfcfa] transition-all duration-300 ${
        isOpen
          ? 'border-sky-300/80 shadow-[0_16px_48px_-28px_rgba(14,116,144,0.28)]'
          : 'border-[#ddd7ca] shadow-sm hover:border-[#cfc8b8] hover:shadow-md'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-sky-700"
        aria-hidden
      />
      <button
        type="button"
        className="flex w-full flex-1 flex-col px-5 py-5 pl-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:px-6 sm:py-6 sm:pl-7"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <div className="flex items-start gap-3">
          <span
            className={`inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold tabular-nums transition-colors ${
              isOpen ? 'bg-[#171b22] text-white' : 'bg-[#ece8df] text-[#171b22]'
            }`}
          >
            {displayNumber}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-base font-bold leading-snug tracking-tight text-[#171b22] sm:text-lg">
              {commission.name}
            </h3>
            <RoleStamp label={commission.roleLabel} holder={commission.roleHolder} />
          </div>
        </div>
        {commission.competencies ? (
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#ece8df] pt-3">
            <span className="text-xs font-semibold text-[#6b7280]">
              {isOpen ? 'Ocultar competencias' : 'Ver competencias reglamentarias'}
            </span>
            <svg
              className={`h-4 w-4 shrink-0 text-sky-800 transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        ) : null}
      </button>

      {commission.competencies ? (
        <div
          id={panelId}
          role="region"
          aria-label={`Competencias: ${commission.name}`}
          className={`grid border-t border-[#e8e4dc] bg-[#f8f7f3]/80 transition-[grid-template-rows] duration-300 ease-out ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <p className="px-5 py-4 pl-6 text-sm leading-relaxed text-[#4b505a] sm:px-6 sm:pl-7">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-sky-800">
                Competencias según reglamento
              </span>
              {commission.competencies}
            </p>
          </div>
        </div>
      ) : null}
    </article>
  )
}

export function LegisladorCommissionsSection({ section }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set())

  const toggle = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  if (!section?.enabled) return null
  const items = sortLegislatorCommissions(section.items || [])
  if (!items.length) return null

  return (
    <section
      id="comisiones-legislador"
      className="scroll-mt-[calc(var(--navbar-h,5rem)+1rem)] mt-12 sm:mt-14"
      aria-labelledby="leg-comisiones-heading"
    >
      <RevealOnScroll variant="slow">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-800">
            Trabajo en comisiones
          </p>
          <h2
            id="leg-comisiones-heading"
            className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl"
          >
            {section.title || 'Comisiones que integra el legislador'}
          </h2>
          {section.subtitle ? (
            <p className="mt-2 text-sm leading-relaxed text-[#5c6169] sm:text-base">
              {section.subtitle}
            </p>
          ) : null}
        </div>
      </RevealOnScroll>

      <ul className="mt-8 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 md:gap-5">
        {items.map((commission, index) => (
          <li key={commission.id} className="min-w-0 self-stretch">
            <RevealOnScroll variant="newsCardSlow" delayMs={60 + index * 70}>
              <CommissionFolio
                commission={commission}
                index={index}
                isOpen={expandedIds.has(commission.id)}
                onToggle={() => toggle(commission.id)}
              />
            </RevealOnScroll>
          </li>
        ))}
      </ul>
    </section>
  )
}
