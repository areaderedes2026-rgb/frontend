import { useEffect, useId, useMemo, useRef, useState } from 'react'

const KIND_LABEL = {
  news: 'Noticia',
  event: 'Evento',
  area: 'Área municipal',
  tourism: 'Lugar / turismo',
  page: 'Sitio',
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.65} stroke="currentColor" aria-hidden>
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
      className={`inline-block h-[1.05rem] w-[1.05rem] shrink-0 rounded-full border-2 border-white/15 border-t-white/70 motion-safe:animate-[spin_1.15s_linear_infinite] ${className}`}
      aria-hidden
    />
  )
}

function EmptyStateIcon({ className }) {
  return (
    <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] ${className}`} aria-hidden>
      <SearchIcon className="h-5 w-5 text-white/35" />
    </div>
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

  const resultsKey = useMemo(() => items.map((i) => i.path).join('|'), [items])

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
  const trimmed = query.trim()
  const showResultsChrome = trimmed.length >= 2

  return (
    <div className={`flex w-full flex-col ${isMobile ? 'gap-4' : 'relative gap-3'}`}>
      {/* Marco exterior suave (gradiente) */}
      <div
        className={`relative rounded-[1.35rem] bg-linear-to-br from-white/[0.14] via-white/[0.05] to-white/[0.02] p-[1px] shadow-[0_12px_40px_-18px_rgba(0,0,0,0.65)] transition-[box-shadow,transform] duration-[620ms] ease-out motion-safe:hover:shadow-[0_18px_48px_-18px_rgba(0,0,0,0.55)] ${
          compact ? '' : ''
        }`}
      >
        <div
          className={`flex w-full min-w-0 items-center gap-2 rounded-[1.32rem] bg-linear-to-b from-[#181c26]/98 via-[#12151c]/98 to-[#0a0c10]/98 px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-[box-shadow] duration-[520ms] ease-out focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_0_0_1px_rgba(255,255,255,0.12),0_12px_40px_-20px_rgba(0,0,0,0.45)] ${
            compact ? 'py-1.5 sm:py-2' : 'py-2 sm:py-2.5'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/75 transition-all duration-[480ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] hover:bg-white/[0.08] hover:text-white active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
            aria-label="Cerrar búsqueda"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex h-8 w-px shrink-0 bg-linear-to-b from-transparent via-white/15 to-transparent" aria-hidden />
          <SearchIcon className="pointer-events-none h-[1.05rem] w-[1.05rem] shrink-0 text-white/55" />
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
            className="min-w-0 flex-1 border-0 bg-transparent py-1.5 text-[0.9375rem] font-medium tracking-[0.01em] text-white outline-none transition-[color,letter-spacing] duration-500 placeholder:text-white/38 placeholder:transition-opacity placeholder:duration-500 focus:placeholder:text-white/28 sm:text-base"
          />
          {loading ? <Spinner /> : null}
        </div>
      </div>

      <div
        id={listboxId}
        role="listbox"
        aria-label="Resultados de búsqueda"
        ref={listRef}
        className={
          isMobile
            ? 'max-h-[min(58dvh,26rem)] overflow-y-auto overscroll-y-contain rounded-[1.25rem] border border-white/[0.09] bg-[#12151d]/95 py-1 shadow-[0_24px_56px_-28px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl motion-safe:transition-[opacity,transform,box-shadow] motion-safe:duration-[680ms] motion-safe:ease-out'
            : `absolute left-0 right-0 top-full z-[70] mt-3 max-h-[min(72dvh,23rem)] overflow-y-auto overscroll-y-contain rounded-[1.25rem] border border-white/[0.1] bg-[#12151d]/96 py-1 shadow-[0_28px_64px_-24px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl motion-safe:transition-[opacity,transform,box-shadow] motion-safe:duration-[680ms] motion-safe:ease-out`
        }
      >
        {!showResultsChrome ? (
          <div className="motion-safe:[animation:site-search-results-shell_0.75s_cubic-bezier(0.16,1,0.3,1)_both] px-5 py-8 text-center">
            <EmptyStateIcon />
            <p className="text-sm font-medium leading-relaxed text-white/50">Escribí al menos 2 caracteres.</p>
            <p className="mt-2 text-xs leading-relaxed text-white/35">Podés usar el teclado: flechas, Enter y Escape.</p>
          </div>
        ) : loading && items.length === 0 ? (
          <div className="motion-safe:[animation:site-search-results-shell_0.75s_cubic-bezier(0.16,1,0.3,1)_both] flex flex-col items-center px-5 py-10">
            <Spinner className="mb-4 scale-110" />
            <p className="text-sm font-medium text-white/55">Buscando en el sitio…</p>
            <p className="mt-1.5 text-xs text-white/38">Un momento</p>
          </div>
        ) : items.length === 0 ? (
          <div className="motion-safe:[animation:site-search-results-shell_0.75s_cubic-bezier(0.16,1,0.3,1)_both] px-5 py-8 text-center">
            <EmptyStateIcon />
            <p className="text-sm font-medium text-white/52">No hay resultados para esa búsqueda.</p>
            <p className="mt-2 text-xs text-white/35">Probá con otras palabras o revisá la ortografía.</p>
          </div>
        ) : (
          <div key={resultsKey} className="motion-safe:[animation:site-search-results-shell_0.78s_cubic-bezier(0.16,1,0.3,1)_both]">
            <div
              className="mx-3 mb-2 mt-2 h-px bg-linear-to-r from-transparent via-white/20 to-transparent opacity-90"
              aria-hidden
            />
            <ul className="site-search-results-list px-1.5 pb-2 pt-1">
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
                      className={`group relative flex w-full flex-col gap-1 rounded-xl border border-transparent px-3.5 py-3.5 text-left transition-[background-color,border-color,box-shadow,transform] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:duration-[580ms] ${
                        active
                          ? 'border-white/12 bg-white/[0.08] shadow-[inset_3px_0_0_0_rgba(255,255,255,0.5)]'
                          : 'hover:border-white/[0.07] hover:bg-white/[0.05] motion-safe:hover:translate-x-[0.06rem]'
                      }`}
                    >
                      <span className="text-[0.625rem] font-bold uppercase tracking-[0.22em] text-white/45 transition-colors duration-[480ms] group-hover:text-white/60">
                        {label}
                      </span>
                      <span className="site-search-result-title text-[0.98rem] text-white/95 sm:text-[1.02rem]">{item.title}</span>
                      {item.subtitle ? (
                        <span className="line-clamp-2 text-[0.8125rem] leading-relaxed text-white/48 transition-colors duration-[480ms] group-hover:text-white/58">
                          {item.subtitle}
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
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
      className={`group inline-flex items-center justify-center rounded-xl border-0 bg-transparent text-white transition-[transform,background-color,opacity] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.05] hover:bg-white/[0.07] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161a21] motion-reduce:duration-200 ${scrolled ? 'h-9 w-9' : 'h-10 w-10'} ${className}`}
    >
      <svg
        className="h-[1.15rem] w-[1.15rem] transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 motion-reduce:transition-none"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.75}
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
