import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_HOME_HERO_CONTENT, getActiveHomeHeroSlides } from '../../data/homeHeroContent.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { Container } from '../ui/Container.jsx'
import { buttonBase, buttonVariants } from '../ui/buttonVariants.js'

function resolveHref(href, fallback = '/') {
  const value = String(href || '').trim()
  if (!value) return fallback
  if (value.startsWith('#') || value.startsWith('http')) return value
  return value.startsWith('/') ? value : `/${value}`
}

function isExternalHref(href) {
  return String(href || '').startsWith('http')
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  return reduced
}

function HeroAction({ href, label, variant = 'primary', preview = false }) {
  const resolved = resolveHref(href)
  const classes = `${buttonBase} ${buttonVariants[variant] ?? buttonVariants.primary}`.trim()

  if (preview) {
    return <span className={classes}>{label}</span>
  }

  if (isExternalHref(resolved) || resolved.startsWith('#')) {
    return (
      <a
        href={resolved}
        target={isExternalHref(resolved) ? '_blank' : undefined}
        rel={isExternalHref(resolved) ? 'noreferrer' : undefined}
        className={classes}
      >
        {label}
      </a>
    )
  }

  return (
    <Link to={resolved} className={classes}>
      {label}
    </Link>
  )
}

const alignClasses = {
  left: {
    box: 'items-start text-left',
    content: '',
    actions: 'justify-start',
  },
  center: {
    box: 'items-center text-center',
    content: 'mx-auto',
    actions: 'justify-center',
  },
  right: {
    box: 'items-end text-right',
    content: 'ml-auto',
    actions: 'justify-end',
  },
}

const desktopAlignClasses = {
  left: {
    box: 'md:items-start md:text-left',
    content: 'md:mx-0',
    actions: 'md:justify-start',
  },
  center: {
    box: 'md:items-center md:text-center',
    content: 'md:mx-auto',
    actions: 'md:justify-center',
  },
  right: {
    box: 'md:items-end md:text-right',
    content: 'md:ml-auto md:mr-0',
    actions: 'md:justify-end',
  },
}

export function HomeHeroBanner({ content = DEFAULT_HOME_HERO_CONTENT, preview = false }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  const slides = useMemo(() => getActiveHomeHeroSlides(content), [content])
  const displayIndex = slides.length ? Math.min(activeIndex, slides.length - 1) : 0
  const current = slides[displayIndex] || slides[0] || DEFAULT_HOME_HERO_CONTENT.slides[0]
  const isCarousel = content?.displayMode === 'carousel' && slides.length > 1
  const autoplay = isCarousel && content?.autoplayEnabled !== false && !paused && !reducedMotion
  const seconds = Math.min(30, Math.max(3, Number(content?.autoplaySeconds) || 6))
  const imageUrl = current?.imageUrl ? resolveMediaUrl(current.imageUrl) || current.imageUrl : ''
  const mobileImageUrl = current?.mobileImageUrl
    ? resolveMediaUrl(current.mobileImageUrl) || current.mobileImageUrl
    : ''
  const primaryImageUrl = imageUrl || mobileImageUrl
  const mobileAlign = alignClasses[current?.mobileTextAlign || current?.textAlign] || alignClasses.left
  const desktopAlign =
    desktopAlignClasses[current?.desktopTextAlign || current?.textAlign] || desktopAlignClasses.left
  const overlayOpacity = Math.min(90, Math.max(0, Number(current?.overlayOpacity ?? 65))) / 100

  useEffect(() => {
    if (!autoplay) return undefined
    const timer = window.setInterval(() => {
      setActiveIndex((idx) => (idx + 1) % slides.length)
    }, seconds * 1000)
    return () => window.clearInterval(timer)
  }, [autoplay, seconds, slides.length])

  function goTo(index) {
    if (!slides.length) return
    setActiveIndex((index + slides.length) % slides.length)
  }

  const showPrimary = current?.showPrimaryButton !== false && current?.primaryLabel && current?.primaryHref
  const showSecondary = current?.showSecondaryButton !== false && current?.secondaryLabel && current?.secondaryHref
  const minHeightClass = preview ? 'min-h-[28rem]' : 'min-h-dvh'
  const containerHeightClass = preview
    ? 'min-h-[28rem] py-10'
    : 'min-h-dvh pt-[calc(var(--navbar-h,5rem)+1.25rem)] pb-10 sm:pt-[calc(var(--navbar-h,5rem)+2rem)] sm:pb-14 lg:pb-16'

  return (
    <section
      className={`relative isolate overflow-hidden border-b border-slate-200/40 ${minHeightClass}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Banners principales"
    >
      <div className="absolute inset-0">
        {primaryImageUrl ? (
          <picture key={current.id} className="block h-full w-full">
            {mobileImageUrl ? <source media="(max-width: 767px)" srcSet={mobileImageUrl} /> : null}
            <img
              src={primaryImageUrl}
              alt=""
              fetchPriority={preview ? undefined : 'high'}
              decoding="async"
              className="h-full w-full object-cover object-center motion-safe:animate-[hero-fade_780ms_ease-out_both]"
            />
          </picture>
        ) : (
          <div className="h-full w-full bg-linear-to-br from-slate-900 via-slate-800 to-sky-950" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, rgba(0,0,0,${Math.min(0.92, overlayOpacity + 0.18)}), rgba(0,0,0,${overlayOpacity}), rgba(0,0,0,${Math.max(0, overlayOpacity - 0.25)}))`,
          }}
          aria-hidden
        />
      </div>

      <Container className={`relative z-10 flex flex-col justify-center ${containerHeightClass}`}>
        <div className={`flex max-w-4xl flex-col ${mobileAlign.box} ${desktopAlign.box} ${mobileAlign.content} ${desktopAlign.content}`.trim()}>
          {current?.showEyebrow !== false && current?.eyebrow ? (
            <p className="hero-enter-eyebrow text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              {current.eyebrow}
            </p>
          ) : null}
          {current?.showTitle !== false && current?.title ? (
            <h1 className="hero-enter-title mt-2 font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {current.title}
            </h1>
          ) : null}
          {current?.showSubtitle !== false && current?.subtitle ? (
            <p className="hero-enter-subtitle mt-4 max-w-3xl text-base leading-relaxed text-white/84 sm:text-lg">
              {current.subtitle}
            </p>
          ) : null}
          {showPrimary || showSecondary ? (
            <div className={`hero-enter-actions mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 ${mobileAlign.actions} ${desktopAlign.actions}`}>
              {showPrimary ? (
                <HeroAction href={current.primaryHref} label={current.primaryLabel} preview={preview} />
              ) : null}
              {showSecondary ? (
                <HeroAction
                  href={current.secondaryHref}
                  label={current.secondaryLabel}
                  variant="secondary"
                  preview={preview}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </Container>

      {isCarousel ? (
        <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-3 px-4">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur transition hover:bg-black/40"
            onClick={() => goTo(displayIndex - 1)}
            aria-label="Banner anterior"
          >
            ‹
          </button>
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-2 backdrop-blur">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                className={`h-2.5 rounded-full transition-all ${
                  idx === displayIndex ? 'w-7 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'
                }`}
                onClick={() => goTo(idx)}
                aria-label={`Mostrar banner ${idx + 1}`}
                aria-current={idx === displayIndex ? 'true' : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur transition hover:bg-black/40"
            onClick={() => goTo(displayIndex + 1)}
            aria-label="Banner siguiente"
          >
            ›
          </button>
        </div>
      ) : null}
    </section>
  )
}
