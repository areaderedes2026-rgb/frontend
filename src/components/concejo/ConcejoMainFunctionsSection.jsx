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

function LetteredList({ items, className = '' }) {
  if (!items?.length) return null
  return (
    <ul className={`space-y-2.5 ${className}`}>
      {items.map((item, index) => (
        <li
          key={`li-${index}`}
          className="flex gap-2.5 text-sm leading-relaxed text-[#4b505a] sm:text-[0.95rem]"
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
    <div className="mt-4 rounded-xl border border-[#e8e4dc] bg-[#f8f7f3] px-4 py-3.5 sm:px-5">
      {examples.title ? (
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-800">
          {examples.title}
        </p>
      ) : null}
      <LetteredList items={examples.items} className={examples.title ? 'mt-2.5' : ''} />
    </div>
  )
}

function SubsectionBlock({ subsection }) {
  return (
    <article className="mt-6 border-t border-[#e8e4dc] pt-6 first:mt-0 first:border-t-0 first:pt-0">
      {subsection.title ? (
        <h4 className="font-serif text-lg font-bold tracking-tight text-[#171b22] underline decoration-sky-200/80 decoration-2 underline-offset-4 sm:text-xl">
          {subsection.title}
        </h4>
      ) : null}
      {subsection.paragraphs?.length ? (
        <div className={`space-y-3 ${subsection.title ? 'mt-3' : ''}`}>
          {subsection.paragraphs.map((p, i) => (
            <p
              key={`sub-p-${i}`}
              className={`text-sm leading-relaxed text-[#4b505a] sm:text-base ${
                i === 1 && subsection.paragraphs.length > 1
                  ? 'border-l-2 border-sky-200/90 pl-4 italic text-[#5c6169]'
                  : ''
              }`}
            >
              {formatInlineText(p)}
            </p>
          ))}
        </div>
      ) : null}
      {subsection.listGroups?.map((group) => (
        <div key={group.id} className="mt-4">
          {group.title ? (
            <p className="text-sm font-bold text-[#171b22] underline decoration-[#ddd7ca] underline-offset-4">
              {group.title}
            </p>
          ) : null}
          <LetteredList items={group.items} className={group.title ? 'mt-2.5' : ''} />
        </div>
      ))}
      <ExamplesBlock examples={subsection.examples} />
    </article>
  )
}

function FunctionSectionCard({ section, index }) {
  const displayNumber = section.number || String(index + 1)
  return (
    <article
      id={section.id ? `funcion-${section.id}` : undefined}
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_48px_-36px_rgba(15,23,42,0.14)]"
    >
      <div className="border-b border-[#e8e4dc] bg-linear-to-r from-sky-50/70 via-[#fcfcfa] to-[#fcfcfa] px-5 py-4 sm:px-7 sm:py-5">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-sky-800 px-2.5 text-sm font-bold tabular-nums text-white shadow-sm">
            {displayNumber}
          </span>
          <h3 className="font-serif text-xl font-bold tracking-tight text-[#171b22] sm:text-2xl">
            {section.title}
          </h3>
        </div>
      </div>
      <div className="px-5 py-5 sm:px-7 sm:py-6">
        {section.paragraphs?.length ? (
          <div className="space-y-3">
            {section.paragraphs.map((p, i) => (
              <p key={`sec-p-${i}`} className="text-sm leading-relaxed text-[#4b505a] sm:text-base">
                {formatInlineText(p)}
              </p>
            ))}
          </div>
        ) : null}
        {section.subsections?.map((sub) => (
          <SubsectionBlock key={sub.id} subsection={sub} />
        ))}
      </div>
    </article>
  )
}

export function ConcejoMainFunctionsSection({ mainFunctions }) {
  if (!mainFunctions?.enabled) return null
  const sections = sortMainFunctionSections(mainFunctions.sections || [])
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
          Conocé las tres funciones esenciales del Honorable Concejo Deliberante y cómo se
          ejercen en el municipio.
        </p>
      </div>

      <div className="mt-8 space-y-5 lg:space-y-6">
        {sections.map((section, index) => (
          <FunctionSectionCard key={section.id} section={section} index={index} />
        ))}
      </div>
    </section>
  )
}
