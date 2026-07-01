import { useId } from 'react'
import { Container } from '../ui/Container.jsx'
import { resolveMediaUrl } from '../../utils/imageUrl.js'

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
 * Portada de Servicios: título centrado y buscador de trámites (estilo guía municipal).
 */
export function ServicesHeroHeader({
  title = 'Guía de trámites',
  imageUrl = '',
  searchPlaceholder = '¿Qué trámite estás buscando?',
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  previewMode = false,
  searchDisabled = false,
  className = '',
}) {
  const inputId = useId()
  const heroImage = imageUrl ? resolveMediaUrl(imageUrl) || imageUrl : ''

  function handleSubmit(e) {
    e.preventDefault()
    onSearchSubmit?.(searchQuery)
  }

  return (
    <header
      className={`relative overflow-hidden border-b border-white/10 bg-[#171b22] ${className}`.trim()}
    >
      {heroImage ? (
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading={previewMode ? 'lazy' : 'eager'}
          decoding="async"
        />
      ) : (
        <div
          className="absolute inset-0 bg-linear-to-br from-slate-800 via-slate-900 to-[#171b22]"
          aria-hidden
        />
      )}
      <div
        className="absolute inset-0 bg-linear-to-b from-slate-950/55 via-slate-950/78 to-slate-950/92"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-black/25" aria-hidden />

      <Container
        className={`relative z-10 flex min-h-[44dvh] flex-col items-center justify-center px-4 text-center sm:min-h-[48dvh] lg:min-h-[52dvh] ${
          previewMode
            ? 'py-12'
            : 'pb-10 pt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-12 sm:pt-[calc(var(--navbar-h,5rem)+2.5rem)] lg:pb-14'
        }`}
      >
        <h1 className="hero-enter-title max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
          {title}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="hero-enter-actions mt-8 w-full max-w-2xl sm:mt-10"
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
              aria-label="Buscar trámite"
            >
              <SearchIcon />
            </button>
          </div>
        </form>
      </Container>
    </header>
  )
}
