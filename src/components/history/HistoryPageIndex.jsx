import { useCallback } from 'react'
import { scrollToHistorySection } from '../../utils/historyPageNav.js'

function IndexLink({ item, index, active, onSelect, compact = false }) {
  const isActive = active === item.id

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        aria-current={isActive ? 'location' : undefined}
        className={`history-index-link group relative flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isActive
            ? 'history-index-link-active border-sky-300/90 bg-white shadow-md shadow-sky-500/10 ring-1 ring-sky-200/60'
            : 'border-[#ddd7ca] bg-white/90 hover:border-sky-200/80 hover:bg-white hover:shadow-sm'
        } ${compact ? 'min-w-[10.5rem] shrink-0 snap-start' : ''}`}
      >
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums transition-colors duration-300 ${
            isActive
              ? 'bg-sky-700 text-white'
              : 'bg-[#f1eee8] text-slate-600 group-hover:bg-sky-50 group-hover:text-sky-800'
          }`}
          aria-hidden
        >
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block text-sm font-semibold leading-snug transition-colors duration-300 ${
              isActive ? 'text-[#0f1319]' : 'text-[#171b22] group-hover:text-[#0f1319]'
            } ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}
          >
            {item.label}
          </span>
        </span>
      </button>
    </li>
  )
}

export function HistoryPageIndex({
  items = [],
  activeId = '',
  onNavigate,
  className = '',
}) {
  const handleSelect = useCallback(
    (id) => {
      onNavigate?.(id)
      scrollToHistorySection(id)
    },
    [onNavigate],
  )

  if (!items.length) return null

  return (
    <nav
      aria-label="Índice de la historia"
      className={`history-page-index ${className}`.trim()}
    >
      {/* Escritorio: columna izquierda fija */}
      <div className="hidden lg:block">
        <div className="sticky top-[calc(var(--navbar-h,5rem)+1rem)] z-20">
          <div className="rounded-2xl border border-[#ddd7ca] bg-[#f8f7f3]/95 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
              Índice
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Navegá por los capítulos de la historia local.
            </p>
            <ol className="mt-4 space-y-2">
              {items.map((item, index) => (
                <IndexLink
                  key={item.id}
                  item={item}
                  index={index}
                  active={activeId}
                  onSelect={handleSelect}
                />
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Móvil: franja horizontal fija */}
      <div className="history-page-index-mobile lg:hidden">
        <div className="sticky top-[calc(var(--navbar-h,5rem)+0.5rem)] z-20 -mx-1 rounded-2xl border border-[#ddd7ca] bg-[#f8f7f3]/95 px-3 py-3 shadow-sm backdrop-blur-sm">
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-800">
            Índice
          </p>
          <ol className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((item, index) => (
              <IndexLink
                key={item.id}
                item={item}
                index={index}
                active={activeId}
                onSelect={handleSelect}
                compact
              />
            ))}
          </ol>
        </div>
      </div>
    </nav>
  )
}
