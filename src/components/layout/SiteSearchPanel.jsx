import { useEffect, useId, useRef, useState } from 'react'

const KIND_LABEL = {
  news: 'Noticia',
  event: 'Evento',
  area: 'Área municipal',
  tourism: 'Lugar / turismo',
  page: 'Sitio',
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.85} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  )
}

function Spinner({ className }) {
  return (
    <span
      className={`inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-sky-300/30 border-t-sky-300 ${className}`}
      aria-hidden
    />
  )
}

/**
 * @param {object} props
 * @param {'desktop' | 'mobile'} props.variant
 * @param {string} props.query
 * @param {(v: string) => void} props.setQuery
 * @param {Array<{ kind: string, title: string, subtitle: string, path: string }>} props.items
 * @param {boolean} props.loading
 * @param {(item: object) => void} props.onSelect
 * @param {() => void} props.onClose
 * @param {boolean} props.autoFocus
 * @param {boolean} [props.compact]
 */
export function SiteSearchPanel({ variant, query, setQuery, items, loading, onSelect, onClose, autoFocus, compact }) {
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const baseId = useId()
  const listboxId = `${baseId}-listbox`
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const id = window.setTimeout(() => setActiveIdx(0), 0)
    return () => window.clearTimeout(id)
  }, [items])

  useEffect(() => {
    if (!autoFocus) return
    const t = window.requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
    return () => window.cancelAnimationFrame(t)
  }, [autoFocus])

  useEffect(() => {
    const el = listRef.current?.querySelector?.(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView?.({ block: 'nearest' })
  }, [activeIdx])

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }
    if (!items.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(items.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = items[activeIdx]
      if (item) onSelect(item)
    }
  }

  const isMobile = variant === 'mobile'

  return (
    <div className={`flex w-full flex-col ${isMobile ? 'gap-3' : 'relative gap-2'}`}>
      <div
        className={`flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/14 bg-[#0f1218]/95 px-2.5 shadow-inner shadow-black/25 backdrop-blur-md transition-[box-shadow,border-color] duration-300 focus-within:border-sky-400/35 focus-within:shadow-[0_0_0_1px_rgba(56,189,248,0.12)] ${
          compact ? 'py-1.5 sm:py-2' : 'py-2 sm:py-2.5'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
          aria-label="Cerrar búsqueda"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.85} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        <SearchIcon className="pointer-events-none h-4 w-4 shrink-0 text-sky-300/90" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar en el sitio…"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={items.length > 0}
          className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm font-medium text-white outline-none placeholder:text-white/40 sm:text-[0.9375rem]"
        />
        {loading ? <Spinner className="h-4 w-4 shrink-0 text-sky-300" /> : null}
      </div>

      <div
        id={listboxId}
        role="listbox"
        aria-label="Resultados de búsqueda"
        ref={listRef}
        className={
          isMobile
            ? 'max-h-[min(60dvh,28rem)] overflow-y-auto overscroll-y-contain rounded-2xl border border-white/10 bg-[#14171d]/98 py-1 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl'
            : 'absolute left-0 right-0 top-full z-[70] mt-2 max-h-[min(70dvh,22rem)] overflow-y-auto overscroll-y-contain rounded-2xl border border-white/12 bg-[#14171d]/98 py-1 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)] backdrop-blur-xl'
        }
      >
        {query.trim().length < 2 ? (
          <p className="px-4 py-6 text-center text-sm text-white/55">Escribí al menos 2 caracteres.</p>
        ) : loading && items.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-white/55">Buscando…</p>
        ) : items.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-white/55">No hay resultados para esa búsqueda.</p>
        ) : (
          <ul className="py-1">
            {items.map((item, idx) => {
              const label = KIND_LABEL[item.kind] || 'Resultado'
              const active = idx === activeIdx
              return (
                <li key={`${item.path}-${idx}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    data-idx={idx}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => onSelect(item)}
                    className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors duration-200 ${
                      active ? 'bg-sky-500/15' : 'hover:bg-white/6'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-300/95">{label}</span>
                    <span className="font-semibold text-white">{item.title}</span>
                    {item.subtitle ? (
                      <span className="line-clamp-2 text-xs leading-relaxed text-white/55">{item.subtitle}</span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export function SearchOpenButton({ onClick, scrolled, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir búsqueda"
      title="Buscar (Ctrl+K)"
      className={`group inline-flex items-center justify-center rounded-xl border-0 bg-transparent text-white transition-[transform,background-color] duration-300 ease-out hover:scale-[1.06] hover:bg-white/[0.07] active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161a21] ${scrolled ? 'h-9 w-9' : 'h-10 w-10'} ${className}`}
    >
      <svg
        className="h-[1.15rem] w-[1.15rem] transition-transform duration-300 ease-out group-hover:scale-110"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.85}
        stroke="currentColor"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
    </button>
  )
}
