import { useEffect, useRef } from 'react'
import { useSectionScrollSpy } from '../../hooks/useSectionScrollSpy.js'

function IndexLink({ item, index, active, onSelect, layout = 'default', linkRef }) {
  const isActive = active === item.id
  const isMobile = layout === 'mobile'
  const isSidebar = layout === 'sidebar'

  return (
    <li className={isMobile ? 'shrink-0 snap-start' : undefined}>
      <a
        ref={linkRef}
        href={`#${item.id}`}
        onClick={(event) => {
          event.preventDefault()
          onSelect(item.id)
        }}
        aria-current={isActive ? 'location' : undefined}
        className={`history-index-link group relative flex items-start gap-1.5 rounded-xl border font-semibold transition-[border-color,background-color,box-shadow,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isSidebar
            ? 'w-full px-2.5 py-2 text-[11px] leading-snug'
            : isMobile
              ? 'min-w-38 px-2 py-2 text-xs leading-snug'
              : 'w-full px-3 py-2.5 text-sm'
        } ${
          isActive
            ? 'history-index-link-active border-sky-300/90 bg-white text-[#0f1319] shadow-md shadow-sky-500/10 ring-1 ring-sky-200/60'
            : 'border-[#ddd7ca] bg-white text-[#171b22] hover:border-sky-200 hover:text-[#0f1319] hover:shadow-sm'
        }`}
      >
        <span
          className={`flex shrink-0 items-center justify-center rounded-lg font-bold tabular-nums transition-colors duration-300 ${
            isSidebar ? 'mt-0.5 h-5 w-5 text-[10px]' : 'h-6 w-6 text-[11px]'
          } ${
            isActive
              ? 'bg-sky-700 text-white'
              : 'bg-[#f1eee8] text-slate-600 group-hover:bg-sky-50 group-hover:text-sky-800'
          }`}
          aria-hidden
        >
          {index + 1}
        </span>
        <span
          className={`min-w-0 flex-1 ${
            isMobile
              ? 'line-clamp-1'
              : isSidebar
                ? 'wrap-break-word whitespace-normal'
                : 'line-clamp-2 leading-snug'
          }`}
        >
          {item.label}
        </span>
        {!isMobile && !isSidebar ? (
          <span aria-hidden className="shrink-0 text-slate-400">
            ↘
          </span>
        ) : null}
      </a>
    </li>
  )
}

export function HistoryPageIndex({ items = [], className = '' }) {
  const sectionIds = items.map((item) => item.id)
  const { activeId, scrollToSection } = useSectionScrollSpy(sectionIds)
  const mobileNavRef = useRef(null)
  const mobileLinkRefs = useRef({})

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '').trim()
    if (!hash || !sectionIds.includes(hash)) return undefined
    const timer = window.setTimeout(() => scrollToSection(hash), 160)
    return () => window.clearTimeout(timer)
  }, [sectionIds.join('|'), scrollToSection])

  useEffect(() => {
    const link = mobileLinkRefs.current[activeId]
    const nav = mobileNavRef.current
    if (!link || !nav) return
    const linkLeft = link.offsetLeft
    const linkWidth = link.offsetWidth
    const navWidth = nav.clientWidth
    const scrollLeft = linkLeft - navWidth / 2 + linkWidth / 2
    nav.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' })
  }, [activeId])

  if (!items.length) return null

  return (
    <nav aria-label="Índice de la historia" className={`history-page-index ${className}`.trim()}>
      {/* Escritorio */}
      <div className="hidden lg:block">
        <div className="rounded-2xl border border-[#ddd7ca] bg-[#f8f7f3] p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">
            Navegación de contenido
          </p>
          <ol className="mt-3 space-y-1.5">
            {items.map((item, index) => (
              <IndexLink
                key={item.id}
                item={item}
                index={index}
                active={activeId}
                onSelect={scrollToSection}
                layout="sidebar"
              />
            ))}
          </ol>
        </div>
      </div>

      {/* Móvil */}
      <div className="history-page-index-mobile lg:hidden">
        <div className="rounded-2xl border border-[#ddd7ca] bg-[#f8f7f3]/95 px-3 py-3 shadow-sm backdrop-blur-sm">
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-800">
            Índice
          </p>
          <ol
            ref={mobileNavRef}
            className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item, index) => (
              <IndexLink
                key={item.id}
                item={item}
                index={index}
                active={activeId}
                onSelect={scrollToSection}
                layout="mobile"
                linkRef={(node) => {
                  if (node) mobileLinkRefs.current[item.id] = node
                }}
              />
            ))}
          </ol>
        </div>
      </div>
    </nav>
  )
}
