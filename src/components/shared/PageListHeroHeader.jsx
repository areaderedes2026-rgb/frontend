import { useId } from 'react'
import { Link } from 'react-router-dom'
import { LinkButton } from '../ui/LinkButton.jsx'
import { PageListHeroBackdrop } from './PageListHeroBackdrop.jsx'

function SearchIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  )
}

/**
 * Portada genérica de listados (Eventos, Turismo, Oferta académica, etc.).
 */
export function PageListHeroHeader({
  badge = '',
  title = '',
  subtitle = '',
  imageUrl = '',
  contentReady = true,
  overlayOpacity = 65,
  searchPlaceholder = 'Buscar…',
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  primaryCta,
  secondaryCta,
  previewMode = false,
  searchDisabled = false,
  showSearch = false,
  titleClassName = '',
  subtitleClassName = '',
  searchAriaLabel = 'Buscar',
  className = '',
  containerClassName = '',
}) {
  const inputId = useId()

  function handleSubmit(e) {
    e.preventDefault()
    onSearchSubmit?.(searchQuery)
  }

  const titleClasses = [
    'hero-enter-title mt-2 max-w-4xl text-balance font-serif text-3xl font-bold tracking-tight text-white drop-shadow-sm sm:text-4xl lg:text-[2.75rem] lg:leading-tight',
    titleClassName,
  ]
    .filter(Boolean)
    .join(' ')

  const subtitleClasses = [
    'hero-enter-subtitle mt-3 max-w-3xl text-sm leading-relaxed text-slate-100 drop-shadow-sm sm:text-base',
    subtitleClassName,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <PageListHeroBackdrop
      contentReady={contentReady}
      previewMode={previewMode}
      imageUrl={imageUrl}
      overlayOpacity={overlayOpacity}
      className={className}
      containerClassName={containerClassName}
    >
      {badge ? (
        <p className="hero-enter-eyebrow text-xs font-bold uppercase tracking-[0.24em] text-sky-200">
          {badge}
        </p>
      ) : null}
      {title ? (
        <h1 className={titleClasses}>{title}</h1>
      ) : null}
      {subtitle ? <p className={subtitleClasses}>{subtitle}</p> : null}

      {showSearch ? (
        <form
          onSubmit={handleSubmit}
          className="hero-enter-actions mx-auto mt-6 w-full max-w-2xl sm:mt-8"
          role="search"
        >
          <label htmlFor={inputId} className="sr-only">
            {searchPlaceholder}
          </label>
          <div className="relative flex items-center overflow-hidden rounded-2xl bg-white shadow-[0_16px_48px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/80">
            <input
              id={inputId}
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              disabled={searchDisabled}
              placeholder={searchPlaceholder}
              autoComplete="off"
              enterKeyHint="search"
              className="min-h-[3.25rem] w-full border-0 bg-transparent py-3 pl-5 pr-14 text-base text-[#171b22] placeholder:text-slate-400 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[3.5rem] sm:text-[17px]"
            />
            <button
              type="submit"
              disabled={searchDisabled}
              className="absolute right-1.5 inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-sky-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={searchAriaLabel}
            >
              <SearchIcon />
            </button>
          </div>
        </form>
      ) : null}

      {primaryCta?.label || secondaryCta?.label ? (
        <div className="hero-enter-actions mx-auto mt-5 flex flex-wrap justify-center gap-3">
          {primaryCta?.label ? (
            String(primaryCta.href || '').startsWith('#') ? (
              <a
                href={primaryCta.href || '#'}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[#171b22] shadow-sm transition hover:bg-slate-100"
              >
                {primaryCta.label}
              </a>
            ) : (
              <LinkButton to={primaryCta.href || '#'}>{primaryCta.label}</LinkButton>
            )
          ) : null}
          {secondaryCta?.label ? (
            String(secondaryCta.href || '').startsWith('#') ? (
              <a
                href={secondaryCta.href || '#'}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/15"
              >
                {secondaryCta.label}
              </a>
            ) : (
              <Link
                to={secondaryCta.href || '#'}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/15"
              >
                {secondaryCta.label}
              </Link>
            )
          ) : null}
        </div>
      ) : null}
    </PageListHeroBackdrop>
  )
}
