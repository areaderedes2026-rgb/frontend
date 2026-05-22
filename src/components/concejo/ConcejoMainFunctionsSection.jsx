import { useCallback, useId, useState } from 'react'
import { sortMainFunctionSections } from '../../data/concejoMainFunctionsContent.js'

function formatInlineText(text) {
  const value = String(text || '')
  if (!value.includes('**')) return value
  const parts = value.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`b-${index}`} className="font-semibold text-[#171b22]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-sky-800 transition-transform duration-300 ${
        open ? 'rotate-180' : ''
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
  )
}

function LetteredList({ items, className = '' }) {
  if (!items?.length) return null
  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <li
          key={`li-${index}`}
          className="flex gap-2 text-sm leading-relaxed text-[#4b505a]"
        >
          <span className="shrink-0 font-semibold tabular-nums text-sky-800">
            {String.fromCharCode(97 + index)})
          </span>
          <span>{formatInlineText(item)}</span>
        </li>
      ))}
    </ul>
  )
}

function ExamplesBlock({ examples }) {
  if (!examples?.items?.length) return null
  return (
    <div className="mt-3 rounded-xl border border-[#e8e4dc] bg-[#f8f7f3] px-3.5 py-3">
      {examples.title ? (
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-800">
          {examples.title}
        </p>
      ) : null}
      <LetteredList items={examples.items} className={examples.title ? 'mt-2' : ''} />
    </div>
  )
}

function SubsectionBlock({ subsection }) {
  return (
    <article className="mt-4 border-t border-[#ece8df] pt-4 first:mt-0 first:border-t-0 first:pt-0">
      {subsection.title ? (
        <h4 className="text-sm font-bold text-[#171b22]">{subsection.title}</h4>
      ) : null}
      {subsection.paragraphs?.length ? (
        <div className={`space-y-2.5 ${subsection.title ? 'mt-2' : ''}`}>
          {subsection.paragraphs.map((p, i) => (
            <p
              key={`sub-p-${i}`}
              className={`text-sm leading-relaxed text-[#4b505a] ${
                i === 1 && subsection.paragraphs.length > 1
                  ? 'border-l-2 border-sky-200 pl-3 text-[13px] italic text-[#5c6169]'
                  : ''
              }`}
            >
              {formatInlineText(p)}
            </p>
          ))}
        </div>
      ) : null}
      {subsection.listGroups?.map((group) => (
        <div key={group.id} className="mt-3">
          {group.title ? (
            <p className="text-xs font-bold uppercase tracking-wide text-[#171b22]">
              {group.title}
            </p>
          ) : null}
          <LetteredList items={group.items} className={group.title ? 'mt-1.5' : ''} />
        </div>
      ))}
      <ExamplesBlock examples={subsection.examples} />
    </article>
  )
}

function FunctionSectionBody({ section }) {
  const hasBody =
    (section.paragraphs?.length ?? 0) > 0 || (section.subsections?.length ?? 0) > 0

  if (!hasBody) {
    return (
      <p className="text-sm italic text-[#9ca3af]">Sin contenido detallado cargado.</p>
    )
  }

  return (
    <>
      {section.paragraphs?.length ? (
        <div className="space-y-2.5">
          {section.paragraphs.map((p, i) => (
            <p key={`sec-p-${i}`} className="text-sm leading-relaxed text-[#4b505a]">
              {formatInlineText(p)}
            </p>
          ))}
        </div>
      ) : null}
      {section.subsections?.map((sub) => (
        <SubsectionBlock key={sub.id} subsection={sub} />
      ))}
    </>
  )
}

function ExpandableFunctionCard({ section, index, isOpen, onToggle }) {
  const panelId = useId()
  const displayNumber = section.number || String(index + 1)
  const title = section.title || 'Función'

  return (
    <article
      id={section.id ? `funcion-${section.id}` : undefined}
      className={`scroll-mt-[calc(var(--navbar-h,5rem)+var(--concejo-subnav-h,3.25rem)+1rem)] flex w-full flex-col overflow-hidden rounded-2xl border bg-[#fcfcfa] shadow-sm transition-[border-color,box-shadow] duration-300 ${
        isOpen
          ? 'border-sky-200/90 shadow-[0_12px_40px_-28px_rgba(14,116,144,0.22)]'
          : 'border-[#ddd7ca] hover:border-[#d4cec0] hover:shadow-md'
      }`}
    >
      <button
        type="button"
        className="flex w-full shrink-0 flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span
              className={`inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-xl px-2 text-sm font-bold tabular-nums transition-colors ${
                isOpen ? 'bg-sky-800 text-white' : 'bg-sky-100 text-sky-900'
              }`}
            >
              {displayNumber}
            </span>
            <h3 className="min-w-0 flex-1 font-serif text-lg font-bold leading-snug tracking-tight text-[#171b22] sm:text-xl">
              {title}
            </h3>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-[#ece8df] pt-3">
            <span className="text-xs font-semibold text-[#6b7280]">
              {isOpen ? 'Ocultar detalle' : 'Ver detalle'}
            </span>
            <ChevronIcon open={isOpen} />
          </div>
        </div>
      </button>

      <div
        id={panelId}
        role="region"
        aria-label={`Detalle: ${title}`}
        hidden={!isOpen}
        className={
          isOpen
            ? 'border-t border-[#e8e4dc] px-5 pb-5 pt-4 sm:px-6 sm:pb-6'
            : undefined
        }
      >
        {isOpen ? <FunctionSectionBody section={section} /> : null}
      </div>
    </article>
  )
}

export function ConcejoMainFunctionsSection({ mainFunctions }) {
  const sections = sortMainFunctionSections(mainFunctions?.sections || [])
  const [expandedIds, setExpandedIds] = useState(() => new Set())

  const toggleSection = useCallback((sectionId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }, [])

  if (!mainFunctions?.enabled) return null
  if (!sections.length && !mainFunctions.title) return null

  return (
    <section
      id="funciones-principales"
      className="scroll-mt-[calc(var(--navbar-h,5rem)+var(--concejo-subnav-h,3.25rem)+1rem)] mt-8 rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-6 lg:p-8"
      aria-labelledby="funciones-principales-heading"
    >
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-800">
          Marco institucional
        </p>
        <h2
          id="funciones-principales-heading"
          className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl"
        >
          {mainFunctions.title || 'Funciones principales del HCD'}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#5c6169] sm:text-base">
          Tocá cada función para ver el detalle completo.
        </p>
      </div>

      <ul className="mt-8 grid list-none grid-cols-1 items-start gap-4 p-0 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-5">
        {sections.map((section, index) => (
          <li key={section.id} className="min-w-0 self-start">
            <ExpandableFunctionCard
              section={section}
              index={index}
              isOpen={expandedIds.has(section.id)}
              onToggle={() => toggleSection(section.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
