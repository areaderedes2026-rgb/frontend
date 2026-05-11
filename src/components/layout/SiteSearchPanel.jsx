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
      className={`inline-block h-[1.05rem] w-[1.05rem] shrink-0 rounded-full border-2 border-white/12 border-t-white/65 motion-safe:animate-[spin_1.15s_linear_infinite] ${className}`}
      aria-hidden
    />
  )
}

function EmptyStateIcon({ className, minimal }) {
  if (minimal) {
    return (
      <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] ${className}`} aria-hidden>
        <SearchIcon className="h-[1.15rem] w-[1.15rem] text-white/30" />
      </div>
    )
  }
  return (
    <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] ${className}`} aria-hidden>
      <SearchIcon className="h-5 w-5 text-white/35" />
    </div>
  )
}

function SearchResultsBody({
  listboxId,
  listRef,
  trimmed,
  loading,
  items,
  resultsKey,
  activeIdx,
  setActiveIdx,
  onSelect,
  variant,
}) {
  const showResultsChrome = trimmed.length >= 2
  const isMobile = variant === 'mobile'
  const panelTone = isMobile
    ? 'max-h-[min(58dvh,26rem)] overflow-y-auto overscroll-y-contain rounded-2xl bg-[#141922]/95 py-1 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.75)] backdrop-blur-2xl'
    : 'max-h-[min(70dvh,21rem)] overflow-y-auto overscroll-y-contain rounded-2xl bg-[#141922]/94 py-1 shadow-[0_20px_56px_-22px_rgba(0,0,0,0.72)] backdrop-blur-2xl'

  return (
    <div
      id={listboxId}
      role="listbox"
      aria-label="Resultados de búsqueda"
      ref={listRef}
      className={`${panelTone} motion-safe:transition-[opacity,transform] motion-safe:duration-[720ms] motion-safe:ease-out ${
        isMobile ? '' : 'absolute right-0 left-auto top-full z-70 mt-2 w-full min-w-0'
      }`}
    >
      {!showResultsChrome ? (
        <div className="motion-safe:[animation:site-search-results-shell_0.75s_cubic-bezier(0.16,1,0.3,1)_both] px-4 py-7 text-center sm:px-5 sm:py-8">
          <EmptyStateIcon minimal={!isMobile} />
          <p className="text-sm font-medium leading-relaxed text-white/48">Escribí al menos 2 caracteres.</p>
          <p className="mt-2 text-xs leading-relaxed text-white/32">Flechas, Enter y Escape.</p>
        </div>
      ) : loading && items.length === 0 ? (
        <div className="motion-safe:[animation:site-search-results-shell_0.75s_cubic-bezier(0.16,1,0.3,1)_both] flex flex-col items-center px-5 py-9">
          <Spinner className="mb-3.5 scale-110" />
          <p className="text-sm font-medium text-white/50">Buscando…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="motion-safe:[animation:site-search-results-shell_0.75s_cubic-bezier(0.16,1,0.3,1)_both] px-4 py-7 text-center sm:px-5 sm:py-8">
          <EmptyStateIcon minimal={!isMobile} />
          <p className="text-sm font-medium text-white/48">No hay resultados.</p>
          <p className="mt-2 text-xs text-white/32">Probá otras palabras.</p>
        </div>
      ) : (
        <div key={resultsKey} className="motion-safe:[animation:site-search-results-shell_0.78s_cubic-bezier(0.16,1,0.3,1)_both]">
          <div className="mx-3 mb-1.5 mt-2 h-px bg-linear-to-r from-transparent via-white/12 to-transparent" aria-hidden />
          <ul className="site-search-results-list px-1 pb-2 pt-0.5">
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
                    className={`group relative flex w-full flex-col gap-0.5 rounded-lg px-3 py-3 text-left transition-[background-color,box-shadow,transform] duration-[560ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:duration-[640ms] ${
                      active
                        ? 'bg-white/[0.09] shadow-[inset_2px_0_0_0_rgba(255,255,255,0.45)]'
                        : 'hover:bg-white/[0.05] motion-safe:hover:translate-x-[0.04rem]'
                    }`}
                  >
                    <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/40 transition-colors duration-500 group-hover:text-white/55">
                      {label}
                    </span>
                    <span className="site-search-result-title text-[0.95rem] text-white/94 sm:text-[1rem]">{item.title}</span>
                    {item.subtitle ? (
                      <span className="line-clamp-2 text-[0.8rem] leading-relaxed text-white/45 transition-colors duration-500 group-hover:text-white/52">
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

  if (isMobile) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="relative rounded-[1.2rem] bg-linear-to-br from-white/[0.1] via-white/[0.04] to-transparent p-px shadow-[0_10px_36px_-16px_rgba(0,0,0,0.55)]">
          <div
            className={`flex w-full min-w-0 items-center gap-2 rounded-[1.14rem] bg-linear-to-b from-[#181c26]/98 to-[#0f1116]/98 px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl ${
              compact ? 'py-1.5' : ''
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/72 transition-colors duration-500 hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              aria-label="Cerrar búsqueda"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex h-7 w-px shrink-0 bg-white/10" aria-hidden />
            <SearchIcon className="pointer-events-none h-[1.05rem] w-[1.05rem] shrink-0 text-white/45" />
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
              aria-expanded={trimmed.length >= 2}
              className="min-w-0 flex-1 border-0 bg-transparent py-1.5 text-[0.9375rem] font-medium text-white outline-none placeholder:text-white/35 sm:text-base"
            />
            {loading ? <Spinner /> : null}
          </div>
        </div>
        <SearchResultsBody
          listboxId={listboxId}
          listRef={listRef}
          trimmed={trimmed}
          loading={loading}
          items={items}
          resultsKey={resultsKey}
          activeIdx={activeIdx}
          setActiveIdx={setActiveIdx}
          onSelect={onSelect}
          variant="mobile"
        />
      </div>
    )
  }

  /* Escritorio: sin marcos, integrado a la barra (derecha), solo volumen suave */
  return (
    <div className="relative w-full">
      <div
        className={`flex w-full min-w-0 items-center gap-1.5 rounded-full bg-white/[0.07] px-1.5 transition-[background-color] duration-[800ms] ease-out focus-within:bg-white/[0.11] ${
          compact ? 'py-1' : 'py-1.5 sm:py-2'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/65 transition-all duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/[0.1] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          aria-label="Cerrar búsqueda"
        >
          <svg className="h-[1.1rem] w-[1.1rem]" fill="none" viewBox="0 0 24 24" strokeWidth={1.85} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        <SearchIcon className="pointer-events-none h-[1rem] w-[1rem] shrink-0 text-white/40" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar…"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={trimmed.length >= 2}
          className="min-w-0 flex-1 border-0 bg-transparent py-1 text-[0.9rem] font-medium tracking-wide text-white/95 outline-none placeholder:text-white/35 sm:text-[0.9375rem]"
        />
        {loading ? <Spinner /> : null}
      </div>
      <SearchResultsBody
        listboxId={listboxId}
        listRef={listRef}
        trimmed={trimmed}
        loading={loading}
        items={items}
        resultsKey={resultsKey}
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
        onSelect={onSelect}
        variant="desktop"
      />
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
      className={`group inline-flex items-center justify-center rounded-xl border-0 bg-transparent text-white transition-[transform,background-color,opacity] duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] hover:bg-white/[0.07] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/22 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161a21] motion-reduce:duration-200 ${scrolled ? 'h-9 w-9' : 'h-10 w-10'} ${className}`}
    >
      <svg
        className="h-[1.15rem] w-[1.15rem] transition-transform duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 motion-reduce:transition-none"
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
