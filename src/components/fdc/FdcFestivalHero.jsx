import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { heroOverlayGradientStyle, normalizeHeroOverlayOpacity } from '../../utils/heroOverlay.js'
import { Container } from '../ui/Container.jsx'

function splitFestivalTitle(title) {
  const raw = String(title || '').trim()
  if (!raw) return { lead: '', emphasis: '' }
  const match = raw.match(/^(.*?\bdel)\s+(caballo\b.*)$/i)
  if (match) {
    return { lead: match[1].trim(), emphasis: match[2].trim() }
  }
  return { lead: raw, emphasis: '' }
}

function HeroLink({ href, className, children, previewMode = false }) {
  const target = String(href || '').trim() || '#'
  if (previewMode) {
    return <span className={className}>{children}</span>
  }
  if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('#')) {
    return (
      <a
        href={target}
        className={className}
        target={target.startsWith('http') ? '_blank' : undefined}
        rel={target.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  }
  return (
    <Link to={target} className={className}>
      {children}
    </Link>
  )
}

function CalendarIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M4.5 9.75h15M5.25 5.25h13.5A1.5 1.5 0 0 1 20.25 6.75v12A1.5 1.5 0 0 1 18.75 20.25H5.25A1.5 1.5 0 0 1 3.75 18.75v-12A1.5 1.5 0 0 1 5.25 5.25Z"
      />
    </svg>
  )
}

/**
 * Hero a viewport completo para Fiesta del Caballo (imagen + contenido tipográfico).
 * Pensado para vivir en un contenedor flex con la barra de secciones debajo.
 */
export function FdcFestivalHero({
  contentReady = true,
  previewMode = false,
  imageUrl = '',
  overlayOpacity = 58,
  eyebrow = '',
  title = '',
  subtitle = '',
  slogan = '',
  dateBadge = '',
  primaryCta,
  secondaryCta,
  className = '',
}) {
  const ready = previewMode || contentReady
  const heroImage = imageUrl ? resolveMediaUrl(imageUrl) || imageUrl : ''
  const overlay = normalizeHeroOverlayOpacity(overlayOpacity, 58)
  const { lead, emphasis } = splitFestivalTitle(title)

  return (
    <header
      className={`relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#0c1017] ${className}`.trim()}
      aria-busy={!ready}
    >
      {!ready ? (
        <div className="absolute inset-0 animate-pulse bg-[#171b22]" aria-hidden />
      ) : heroImage ? (
        <img
          src={heroImage}
          alt=""
          width={1920}
          height={1080}
          fetchPriority={previewMode ? undefined : 'high'}
          className="absolute inset-0 h-full w-full object-cover object-[68%_center] sm:object-[72%_center] lg:object-[75%_center]"
          loading={previewMode ? 'lazy' : 'eager'}
          decoding="async"
        />
      ) : (
        <div
          className="absolute inset-0 bg-linear-to-br from-slate-800 via-slate-900 to-[#0c1017]"
          aria-hidden
        />
      )}

      {ready ? (
        <>
          <div
            className="absolute inset-0"
            style={heroOverlayGradientStyle(overlay)}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-linear-to-r from-black/75 via-black/45 to-black/15 sm:from-black/70 sm:via-black/35 sm:to-transparent"
            aria-hidden
          />
          <div
            className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-[#0c1017]/90 to-transparent sm:h-36"
            aria-hidden
          />
        </>
      ) : null}

      <Container className="relative z-10 flex h-full flex-col justify-end px-4 pb-6 pt-[calc(var(--navbar-h,5rem)+1.25rem)] sm:px-6 sm:pb-8 sm:pt-[calc(var(--navbar-h,5rem)+1.75rem)] lg:px-8 lg:pb-10 xl:px-10">
        {!ready ? (
          <div className="max-w-xl space-y-3" aria-hidden>
            <div className="h-3 w-24 rounded bg-white/15" />
            <div className="h-10 w-full max-w-md rounded bg-white/20" />
            <div className="h-16 w-48 rounded bg-white/25" />
            <div className="h-4 w-64 rounded bg-white/10" />
          </div>
        ) : (
          <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div className="max-w-3xl text-left">
              {eyebrow ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/95 sm:text-xs">
                  {eyebrow}
                </p>
              ) : null}

              {title ? (
                <h1 className="mt-3 font-serif font-bold tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
                  {emphasis ? (
                    <>
                      <span className="block text-balance text-2xl leading-snug sm:text-3xl md:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
                        {lead}
                      </span>
                      <span className="mt-1 block text-[clamp(2.6rem,8vw,5.5rem)] uppercase leading-[0.95] tracking-tight">
                        {emphasis}
                      </span>
                    </>
                  ) : (
                    <span className="block text-balance text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                      {lead}
                    </span>
                  )}
                </h1>
              ) : null}

              {slogan ? (
                <p className="mt-4 max-w-xl font-serif text-sm italic leading-relaxed text-white/90 sm:text-base md:text-lg">
                  {slogan}
                </p>
              ) : subtitle ? (
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-100/95 sm:text-base">
                  {subtitle}
                </p>
              ) : null}

              {dateBadge ? (
                <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-amber-300 sm:text-sm">
                  <CalendarIcon className="h-4 w-4 shrink-0 text-amber-300" />
                  <span>{dateBadge}</span>
                </p>
              ) : null}

              {primaryCta?.label ? (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <HeroLink
                    href={primaryCta.href}
                    previewMode={previewMode}
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#d4b483] px-6 text-xs font-bold uppercase tracking-[0.16em] text-[#171b22] shadow-[0_12px_32px_-12px_rgba(0,0,0,0.55)] transition hover:bg-[#e0c49a] sm:min-h-12 sm:px-7 sm:text-sm"
                  >
                    {primaryCta.label}
                  </HeroLink>
                </div>
              ) : null}
            </div>

            {secondaryCta?.label ? (
              <div className="lg:pb-1 lg:text-right">
                <HeroLink
                  href={secondaryCta.href}
                  previewMode={previewMode}
                  className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/90 transition hover:text-amber-200 sm:text-xs"
                >
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/55 text-white"
                    aria-hidden
                  >
                    <svg className="h-4 w-4 translate-x-px" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.25 5.25v13.5l11.25-6.75L8.25 5.25Z" />
                    </svg>
                  </span>
                  <span>{secondaryCta.label}</span>
                </HeroLink>
              </div>
            ) : null}
          </div>
        )}
      </Container>
    </header>
  )
}
