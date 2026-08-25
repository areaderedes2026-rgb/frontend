import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
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

function HeroLink({ href, className, children, previewMode = false, onHashNavigate }) {
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
        onClick={
          target.startsWith('#') && onHashNavigate
            ? (e) => {
                e.preventDefault()
                onHashNavigate(target)
              }
            : undefined
        }
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

/**
 * Hero FDC orientado a afiche:
 * - Móvil: la imagen define la altura (sin recorte).
 * - Desktop: cover a viewport, foco al centro.
 * - Sin degradés oscuros.
 */
export function FdcFestivalHero({
  contentReady = true,
  previewMode = false,
  imageUrl = '',
  overlayOpacity: _overlayOpacity = 0,
  eyebrow = '',
  title = '',
  subtitle = '',
  primaryCta,
  secondaryCta,
  onHashNavigate,
  className = '',
}) {
  const ready = previewMode || contentReady
  const heroImage = imageUrl ? resolveMediaUrl(imageUrl) || imageUrl : ''
  const { lead, emphasis } = splitFestivalTitle(title)
  const hasCopy = Boolean(eyebrow || title || subtitle || primaryCta?.label || secondaryCta?.label)

  return (
    <header
      className={`relative bg-[#f3f1ec] md:min-h-0 md:flex-1 md:overflow-hidden ${className}`.trim()}
      aria-busy={!ready}
    >
      {!ready ? (
        <div
          className="min-h-[14rem] animate-pulse bg-[#e8e4dc] md:absolute md:inset-0 md:min-h-0"
          aria-hidden
        />
      ) : heroImage ? (
        <img
          src={heroImage}
          alt=""
          width={1920}
          height={1080}
          fetchPriority={previewMode ? undefined : 'high'}
          className="relative z-0 block h-auto w-full object-contain object-center md:absolute md:inset-0 md:h-full md:object-cover"
          loading={previewMode ? 'lazy' : 'eager'}
          decoding="async"
        />
      ) : (
        <div
          className="min-h-[16rem] bg-linear-to-br from-[#ebe7df] via-[#f3f1ec] to-[#ddd7ca] md:absolute md:inset-0 md:min-h-0"
          aria-hidden
        />
      )}

      {hasCopy ? (
        <Container
          className={`z-10 flex flex-col px-4 sm:px-6 lg:px-8 xl:px-10 ${
            heroImage
              ? 'relative mt-[-4.5rem] justify-end pb-4 md:absolute md:inset-0 md:mt-0 md:pb-7 md:pt-[calc(var(--navbar-h,5rem)+1rem)]'
              : 'relative justify-end pb-6 pt-[calc(var(--navbar-h,5rem)+1.25rem)] md:absolute md:inset-0 md:pb-8 md:pt-[calc(var(--navbar-h,5rem)+1.75rem)]'
          }`}
        >
          {!ready ? (
            <div className="max-w-xl space-y-3" aria-hidden>
              <div className="h-3 w-24 rounded bg-slate-300/50" />
              <div className="h-10 w-full max-w-md rounded bg-slate-300/40" />
            </div>
          ) : (
            <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
              <div
                className={`max-w-3xl text-left ${
                  heroImage
                    ? 'rounded-2xl bg-[#f3f1ec]/92 px-4 py-3 shadow-[0_8px_30px_-18px_rgba(23,27,34,0.35)] backdrop-blur-[2px] sm:px-5 sm:py-4'
                    : ''
                }`}
              >
                {eyebrow ? (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-800 sm:text-xs">
                    {eyebrow}
                  </p>
                ) : null}

                {title ? (
                  <h1 className="mt-2 font-serif font-bold tracking-tight text-[#171b22]">
                    {emphasis ? (
                      <>
                        <span className="block text-balance text-2xl leading-snug sm:text-3xl md:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
                          {lead}
                        </span>
                        <span className="mt-1 block text-[clamp(2.4rem,7.5vw,5.2rem)] uppercase leading-[0.95] tracking-tight">
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

                {subtitle ? (
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#3e434d] sm:text-base">
                    {subtitle}
                  </p>
                ) : null}

                {primaryCta?.label ? (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <HeroLink
                      href={primaryCta.href}
                      previewMode={previewMode}
                      onHashNavigate={onHashNavigate}
                      className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#d4b483] px-6 text-xs font-bold uppercase tracking-[0.16em] text-[#171b22] shadow-[0_12px_32px_-12px_rgba(0,0,0,0.35)] transition hover:bg-[#e0c49a] sm:min-h-12 sm:px-7 sm:text-sm"
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
                    onHashNavigate={onHashNavigate}
                    className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#171b22]/90 transition hover:text-amber-800 sm:text-xs"
                  >
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#171b22]/35 text-[#171b22]"
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
      ) : (
        <span className="sr-only">Fiesta del Caballo</span>
      )}
    </header>
  )
}
