import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, LayoutGroup, motion as Motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { getResponsiveMediaImage, resolveMediaUrl, withCloudinaryTransform } from '../../utils/imageUrl.js'
import { fdcArtistsShowDailyLineup, normalizeFdcArtistLineupDays } from '../../data/fdcContent.js'
import { useFdcSectionTone } from './FdcSectionToneContext.jsx'
import { FdcSectionTitle } from './FdcFestivalSections.jsx'

const VIEW_CAROUSEL = 'carousel'
const VIEW_POSTER = 'poster'

const softEase = [0.22, 1, 0.36, 1]

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduce(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduce
}

function SmartLink({ href, className, children, ...rest }) {
  const target = String(href || '').trim() || '#'
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return (
      <a href={target} className={className} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    )
  }
  if (target.startsWith('#')) {
    return (
      <a href={target} className={className} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <Link to={target} className={className} {...rest}>
      {children}
    </Link>
  )
}

function parseDateBadge(tag) {
  const raw = String(tag || '').trim()
  if (!raw) return { day: '', num: '' }
  const spaced = raw.match(/^([A-Za-zÁÉÍÓÚÜÑáéíóúüñ.]{2,6})\s*[.\-]?\s*(\d{1,2})$/u)
  if (spaced) {
    return {
      day: spaced[1].replace(/\./g, '').toUpperCase().slice(0, 3),
      num: spaced[2],
    }
  }
  const flipped = raw.match(/^(\d{1,2})\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ.]{2,6})$/u)
  if (flipped) {
    return {
      day: flipped[2].replace(/\./g, '').toUpperCase().slice(0, 3),
      num: flipped[1],
    }
  }
  return { day: raw.toUpperCase(), num: '' }
}

function PosterLineup({ days, usesDarkTone }) {
  if (!days.length) return null
  const panelClass = usesDarkTone
    ? 'relative overflow-hidden rounded-[1.6rem] border border-[#d4b483]/35 bg-linear-to-b from-[#1c222c]/90 to-[#0c1017]/95 p-4 shadow-[0_32px_80px_-36px_rgba(0,0,0,0.75)] sm:p-5 lg:p-6'
    : 'relative overflow-hidden rounded-[1.6rem] border border-[#d4b483]/50 bg-[#fcfaf6] p-4 shadow-[0_28px_70px_-38px_rgba(23,27,34,0.35)] sm:p-5 lg:p-6'
  const dayTitleClass = usesDarkTone
    ? 'font-serif text-lg font-bold uppercase tracking-[0.12em] text-[#d4b483] sm:text-xl'
    : 'font-serif text-lg font-bold uppercase tracking-[0.12em] text-[#8a7048] sm:text-xl'
  const nameClass = usesDarkTone
    ? 'text-[12px] font-semibold uppercase leading-snug tracking-[0.08em] text-white/90 sm:text-[13px]'
    : 'text-[12px] font-semibold uppercase leading-snug tracking-[0.08em] text-[#171b22]/90 sm:text-[13px]'
  const ruleClass = usesDarkTone ? 'border-[#d4b483]/25' : 'border-[#d4b483]/40'

  return (
    <div className={panelClass}>
      <p
        className={
          usesDarkTone
            ? 'mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d4b483]/80'
            : 'mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7048]/90'
        }
      >
        Programación
      </p>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        {days.map((day) => (
          <article key={day.id || day.label} className={`min-w-0 border-t pt-3 ${ruleClass}`}>
            <h3 className={dayTitleClass}>{day.label || 'Día'}</h3>
            {day.names.length ? (
              <ul className="mt-2.5 space-y-1.5">
                {day.names.map((name, nameIdx) => (
                  <li key={`${day.id || day.label}-${nameIdx}`} className={nameClass}>
                    {name}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  )
}

const ctaButtonClassLight =
  'inline-flex min-h-11 items-center justify-center rounded-md border border-[#171b22]/80 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#171b22] transition hover:bg-[#171b22] hover:text-white sm:text-xs'

const ctaButtonClassDark =
  'inline-flex min-h-11 items-center justify-center rounded-md border border-white/75 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-[#171b22] sm:text-xs'

function PosterLightbox({ imageUrl, title, onClose, reduceMotion }) {
  const titleId = useId()
  const closeRef = useRef(null)
  const src = resolveMediaUrl(imageUrl) || imageUrl
  const label = String(title || '').trim() || 'Cartelera completa'

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    const id = requestAnimationFrame(() => closeRef.current?.focus())
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
      cancelAnimationFrame(id)
    }
  }, [onClose])

  return (
    <Motion.div
      className="fixed inset-0 z-[160] flex items-center justify-center overflow-hidden p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.28, ease: softEase }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#0c1017]/75 backdrop-blur-md"
        aria-label="Cerrar cartelera ampliada"
        onClick={onClose}
      />
      <Motion.div
        layoutId={reduceMotion ? undefined : 'fdc-full-poster'}
        className="relative z-10 flex max-h-[min(96dvh,60rem)] w-full max-w-[min(96vw,44rem)] flex-col overflow-hidden rounded-2xl bg-[#0c1017] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.75)] ring-1 ring-white/10"
        initial={reduceMotion ? false : { scale: 0.96, y: 12, filter: 'blur(4px)' }}
        animate={{ scale: 1, y: 0, filter: 'blur(0px)' }}
        exit={reduceMotion ? undefined : { scale: 0.97, y: 8, opacity: 0.7, filter: 'blur(2px)' }}
        transition={{ duration: reduceMotion ? 0.12 : 0.36, ease: softEase }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <p
            id={titleId}
            className="min-w-0 truncate font-serif text-sm font-bold uppercase tracking-[0.12em] text-[#d4b483] sm:text-base"
          >
            {label}
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#0c1017] p-3 sm:p-4">
          <img
            src={src}
            alt={label}
            className="mx-auto max-h-[min(calc(96dvh-7rem),54rem)] w-auto max-w-full object-contain"
            decoding="async"
          />
        </div>
        <p className="border-t border-white/10 px-4 py-2.5 text-center text-[11px] text-white/55 sm:text-xs">
          Tocá fuera o Escape para cerrar
        </p>
      </Motion.div>
    </Motion.div>
  )
}

function CarouselArrow({ direction, onClick, dark }) {
  const isPrev = direction === 'prev'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-lg transition md:inline-flex ${
        isPrev ? 'left-0 -translate-x-1/2 lg:-translate-x-1/4' : 'right-0 translate-x-1/2 lg:translate-x-1/4'
      } ${
        dark
          ? 'bg-white/12 text-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.65)] backdrop-blur-md hover:bg-white/22'
          : 'border border-[#ddd7ca] bg-white text-[#171b22] shadow-md hover:bg-[#f7f7f5]'
      }`}
      aria-label={isPrev ? 'Artistas anteriores' : 'Artistas siguientes'}
    >
      {isPrev ? '←' : '→'}
    </button>
  )
}

const ARTIST_CARD_SIZES =
  '(max-width: 640px) 72vw, (max-width: 1024px) 280px, (max-width: 1280px) 320px, 360px'

function OptimizedArtistPhoto({ artist, idx }) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef(null)
  const image = getResponsiveMediaImage(artist.photoUrl, {
    widths: [360, 480, 640, 800, 960],
    fallbackWidth: 640,
    sizes: ARTIST_CARD_SIZES,
  })
  const eager = idx < 3

  useEffect(() => {
    setLoaded(false)
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [image.src])

  if (!image.src) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-[#2a3140] to-[#151a22] text-5xl text-[#d4b483]/35"
        aria-hidden
      >
        ♪
      </div>
    )
  }

  return (
    <>
      {image.placeholder && !loaded ? (
        <img
          src={image.placeholder}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-md"
          decoding="async"
        />
      ) : null}
      <img
        ref={imgRef}
        src={image.src}
        srcSet={image.srcSet || undefined}
        sizes={image.srcSet ? image.sizes : undefined}
        alt={artist.name}
        className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.06] ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={idx < 2 ? 'high' : 'low'}
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </>
  )
}

function ArtistCard({ artist, idx, reduceMotion, dark }) {
  const badge = parseDateBadge(artist.dateTag)

  return (
    <Motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: reduceMotion ? 0.12 : 0.45,
        delay: reduceMotion ? 0 : Math.min(idx, 8) * 0.05,
        ease: softEase,
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -10,
              transition: { duration: 0.35, ease: softEase },
            }
      }
      className="group relative h-[min(54svh,22rem)] w-[calc(min(54svh,22rem)*0.72)] shrink-0 snap-center sm:h-[min(58svh,26rem)] sm:w-[calc(min(58svh,26rem)*0.72)] lg:h-[min(60svh,30rem)] lg:w-[calc(min(60svh,30rem)*0.72)] xl:h-[min(62svh,32rem)] xl:w-[calc(min(62svh,32rem)*0.72)]"
    >
      <div
        className={`relative h-full w-full overflow-hidden rounded-[1.35rem] ${
          dark
            ? 'bg-[#151a22] shadow-[0_32px_70px_-30px_rgba(0,0,0,0.85)]'
            : 'bg-[#1a1f28] shadow-[0_28px_60px_-28px_rgba(23,27,34,0.55)]'
        }`}
      >
        <OptimizedArtistPhoto artist={artist} idx={idx} />

        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0a0d12] via-[#0a0d12]/25 to-transparent opacity-95"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-black/35 to-transparent"
          aria-hidden
        />

        {badge.day || badge.num ? (
          <div className="absolute left-3 top-3 z-10 overflow-hidden rounded-xl bg-[#d4b483] px-2.5 py-2 text-[#171b22] shadow-[0_10px_28px_-12px_rgba(212,180,131,0.7)] sm:left-4 sm:top-4 sm:px-3 sm:py-2.5">
            {badge.day ? (
              <span className="block text-[10px] font-bold uppercase leading-none tracking-[0.14em] sm:text-[11px]">
                {badge.day}
              </span>
            ) : null}
            {badge.num ? (
              <span className="mt-1 block font-serif text-xl font-bold leading-none sm:text-2xl">
                {badge.num}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-5 pt-16 sm:px-5 sm:pb-6">
          <div
            className="mb-3 h-px w-10 origin-left bg-[#d4b483] transition duration-500 ease-out group-hover:w-16"
            aria-hidden
          />
          <h3 className="font-serif text-lg font-bold uppercase leading-[1.15] tracking-[0.04em] text-white sm:text-xl lg:text-[1.35rem]">
            {artist.name}
          </h3>
        </div>

        <div
          className="pointer-events-none absolute inset-0 rounded-[1.35rem] opacity-0 ring-1 ring-[#d4b483]/45 transition duration-500 group-hover:opacity-100"
          aria-hidden
        />
      </div>
    </Motion.article>
  )
}

/**
 * Cartelera FDC: afiche general (por defecto) y, si está activado en admin,
 * carrusel de artistas por día.
 */
export function FdcArtistsSection({ artists }) {
  const items = (artists?.items || []).filter((a) => a?.name)
  const posterImageUrl = String(artists?.posterImageUrl || '').trim()
  const reduceMotion = usePrefersReducedMotion()
  const scrollRef = useRef(null)
  const [view, setView] = useState(VIEW_POSTER)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const title = String(artists?.title || 'Cartelera artística').trim()
  const ctaLabel = String(artists?.ctaLabel || '').trim() || 'Ver cartelera completa'
  const ctaHref = String(artists?.ctaHref || '').trim()
  const { titleTone, usesDarkTone } = useFdcSectionTone(artists)
  const ctaButtonClass = usesDarkTone ? ctaButtonClassDark : ctaButtonClassLight
  const hasPoster = Boolean(posterImageUrl)
  const lineupDays = normalizeFdcArtistLineupDays(artists?.lineupDays)
  const hasLineup = lineupDays.some((day) => day.label || day.names.length > 0)
  const showDaily = fdcArtistsShowDailyLineup(artists) && items.length > 0
  const showingPoster = (hasPoster || hasLineup) && (!showDaily || view === VIEW_POSTER)
  const posterSrc = hasPoster ? resolveMediaUrl(posterImageUrl) || posterImageUrl : ''
  const posterOptimized = posterSrc
    ? withCloudinaryTransform(posterSrc, 'f_auto,q_auto:good,c_limit,w_1200') || posterSrc
    : ''
  const posterLightbox = posterSrc
    ? withCloudinaryTransform(posterSrc, 'f_auto,q_auto:good,c_limit,w_1800') || posterSrc
    : ''
  const preloadKey = showDaily
    ? items
        .slice(0, 3)
        .map((a) => String(a?.photoUrl || ''))
        .join('|')
    : ''

  const openPoster = useCallback(() => {
    setView(VIEW_POSTER)
    setLightboxOpen(false)
  }, [])

  const openCarousel = useCallback(() => {
    setView(VIEW_CAROUSEL)
    setLightboxOpen(false)
  }, [])

  useEffect(() => {
    if (!showDaily) setView(VIEW_POSTER)
  }, [showDaily])

  useEffect(() => {
    if (typeof document === 'undefined' || !preloadKey) return undefined
    const photos = preloadKey.split('|').filter(Boolean)
    const links = photos.map((photoUrl) => {
      const image = getResponsiveMediaImage(photoUrl, {
        widths: [360, 480, 640],
        fallbackWidth: 640,
        sizes: ARTIST_CARD_SIZES,
      })
      if (!image.src) return null
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = image.src
      if (image.srcSet) link.setAttribute('imagesrcset', image.srcSet)
      if (image.sizes) link.setAttribute('imagesizes', image.sizes)
      document.head.appendChild(link)
      return link
    })
    return () => {
      links.forEach((link) => link?.remove())
    }
  }, [preloadKey])

  function scrollBy(delta) {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  function scrollStep(direction) {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector('[data-artist-card]')
    const step = card ? card.getBoundingClientRect().width + 24 : 360
    scrollBy(direction * step)
  }

  if (!hasPoster && !showDaily && !hasLineup) return null

  const cta = showingPoster
    ? showDaily ? (
        <button type="button" className={ctaButtonClass} onClick={openCarousel}>
          Ver artistas
        </button>
      ) : ctaHref && ctaLabel ? (
        <SmartLink href={ctaHref} className={ctaButtonClass}>
          {ctaLabel}
        </SmartLink>
      ) : null
    : hasPoster ? (
        <button type="button" className={ctaButtonClass} onClick={openPoster}>
          {ctaLabel}
        </button>
      ) : ctaLabel ? (
        ctaHref ? (
          <SmartLink href={ctaHref} className={ctaButtonClass}>
            {ctaLabel}
          </SmartLink>
        ) : (
          <span className={`${ctaButtonClass} cursor-default opacity-80`}>{ctaLabel}</span>
        )
      ) : null

  const stageDuration = reduceMotion ? 0.15 : 0.4
  const captionClass = usesDarkTone
    ? 'mt-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d4b483]/90'
    : 'mt-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a7048]'
  const frameClass = usesDarkTone
    ? 'group relative w-full overflow-hidden rounded-[1.6rem] border border-[#d4b483]/35 bg-linear-to-b from-[#1c222c] to-[#0c1017] p-2.5 text-left shadow-[0_32px_80px_-36px_rgba(0,0,0,0.75)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483] sm:p-3.5'
    : 'group relative w-full overflow-hidden rounded-[1.6rem] border border-[#d4b483]/50 bg-[#fcfaf6] p-2.5 text-left shadow-[0_28px_70px_-38px_rgba(23,27,34,0.45)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483] sm:p-3.5'

  const goldCorner = 'pointer-events-none absolute z-10 h-7 w-7 border-[#d4b483]/80 sm:h-8 sm:w-8'

  return (
    <div className={showDaily ? 'flex min-h-0 flex-1 flex-col justify-center' : ''}>
      <FdcSectionTitle
        title={title}
        tone={titleTone}
        className="mb-5 shrink-0 sm:mb-6 lg:mb-7"
        actions={cta}
      />

      <LayoutGroup>
        <div className="relative flex min-h-0 flex-1 flex-col justify-center perspective-[1400px]">
          <AnimatePresence mode="wait" initial={false}>
            {showingPoster ? (
              <Motion.div
                key="poster"
                className="origin-center"
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        rotateX: 8,
                        y: 20,
                        filter: 'blur(6px)',
                      }
                }
                animate={{
                  opacity: 1,
                  rotateX: 0,
                  y: 0,
                  filter: 'blur(0px)',
                }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        rotateX: -5,
                        y: -12,
                        filter: 'blur(4px)',
                      }
                }
                transition={{ duration: stageDuration, ease: softEase }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  className={
                    hasPoster && hasLineup
                      ? 'grid items-center gap-6 lg:grid-cols-2 lg:gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:gap-10'
                      : 'mx-auto w-full max-w-[min(100%,40rem)]'
                  }
                >
                  {hasPoster ? (
                    <figure className="mx-auto w-full max-w-[min(100%,40rem)] lg:max-w-none">
                      <Motion.button
                        type="button"
                        layoutId={reduceMotion ? undefined : 'fdc-full-poster'}
                        onClick={() => setLightboxOpen(true)}
                        className={frameClass}
                        whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.35 } }}
                        whileTap={reduceMotion ? undefined : { scale: 0.992 }}
                        aria-label="Ampliar cartelera"
                      >
                        <span className={`${goldCorner} left-3 top-3 rounded-tl-md border-t-2 border-l-2`} />
                        <span className={`${goldCorner} right-3 top-3 rounded-tr-md border-t-2 border-r-2`} />
                        <span className={`${goldCorner} bottom-3 left-3 rounded-bl-md border-b-2 border-l-2`} />
                        <span className={`${goldCorner} bottom-3 right-3 rounded-br-md border-b-2 border-r-2`} />
                        <img
                          src={posterOptimized}
                          alt={title || 'Cartelera completa'}
                          className="mx-auto h-auto max-h-[min(72svh,46rem)] w-full rounded-[1.15rem] object-contain"
                          loading="eager"
                          decoding="async"
                        />
                        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-[#0c1017]/70 via-[#0c1017]/5 to-transparent px-4 pb-4 pt-16 text-center opacity-0 transition duration-300 group-hover:opacity-100 sm:px-5">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d4b483]">
                            Ampliar
                          </span>
                        </span>
                      </Motion.button>
                      <figcaption className={captionClass}>Tocá la imagen para verla en grande</figcaption>
                    </figure>
                  ) : null}
                  {hasLineup ? <PosterLineup days={lineupDays} usesDarkTone={usesDarkTone} /> : null}
                </div>
              </Motion.div>
            ) : (
              <Motion.div
                key="carousel"
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -12, filter: 'blur(4px)', scale: 0.98 }
                }
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        y: 16,
                        scale: 0.96,
                        filter: 'blur(5px)',
                        rotateX: 6,
                      }
                }
                transition={{ duration: stageDuration, ease: softEase }}
                className="relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {items.length > 1 ? (
                  <>
                    <CarouselArrow
                      direction="prev"
                      dark={usesDarkTone}
                      onClick={() => scrollStep(-1)}
                    />
                    <CarouselArrow
                      direction="next"
                      dark={usesDarkTone}
                      onClick={() => scrollStep(1)}
                    />
                  </>
                ) : null}

                <div
                  ref={scrollRef}
                  className="flex items-center gap-5 overflow-x-auto px-1 py-3 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-6 sm:py-4 md:gap-7 [&::-webkit-scrollbar]:hidden"
                >
                  {items.map((artist, idx) => (
                    <div key={artist.id || artist.name || idx} data-artist-card>
                      <ArtistCard
                        artist={artist}
                        idx={idx}
                        reduceMotion={reduceMotion}
                        dark={usesDarkTone}
                      />
                    </div>
                  ))}
                </div>

                {items.length > 1 ? (
                  <div className="mt-5 flex justify-center gap-3 md:hidden">
                    <button
                      type="button"
                      onClick={() => scrollStep(-1)}
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-base transition ${
                        usesDarkTone
                          ? 'bg-white/12 text-white backdrop-blur-md hover:bg-white/22'
                          : 'border border-[#ddd7ca] bg-white text-[#171b22]'
                      }`}
                      aria-label="Anterior"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollStep(1)}
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-base transition ${
                        usesDarkTone
                          ? 'bg-white/12 text-white backdrop-blur-md hover:bg-white/22'
                          : 'border border-[#ddd7ca] bg-white text-[#171b22]'
                      }`}
                      aria-label="Siguiente"
                    >
                      →
                    </button>
                  </div>
                ) : null}
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {lightboxOpen && hasPoster ? (
                <PosterLightbox
                  key={posterImageUrl}
                  imageUrl={posterLightbox || posterImageUrl}
                  title={title}
                  onClose={() => setLightboxOpen(false)}
                  reduceMotion={reduceMotion}
                />
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  )
}
