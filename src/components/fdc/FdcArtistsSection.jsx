import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, LayoutGroup, motion as Motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
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

/**
 * Cartelera FDC: carrusel de artistas por defecto;
 * el CTA revela la cartelera completa (una sola imagen centrada) y se amplía al tocar.
 */
export function FdcArtistsSection({ artists }) {
  const items = (artists?.items || []).filter((a) => a?.name)
  const posterImageUrl = String(artists?.posterImageUrl || '').trim()
  const reduceMotion = usePrefersReducedMotion()
  const scrollRef = useRef(null)
  const [view, setView] = useState(VIEW_CAROUSEL)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const title = String(artists?.title || 'Cartelera artística').trim()
  const ctaLabel = String(artists?.ctaLabel || '').trim() || 'Ver cartelera completa'
  const ctaHref = String(artists?.ctaHref || '').trim()
  const { titleTone, usesDarkTone } = useFdcSectionTone(artists)
  const ctaButtonClass = usesDarkTone ? ctaButtonClassDark : ctaButtonClassLight
  const hasPoster = Boolean(posterImageUrl)
  const showingPoster = hasPoster && (view === VIEW_POSTER || items.length === 0)
  const posterSrc = hasPoster ? resolveMediaUrl(posterImageUrl) || posterImageUrl : ''

  const openPoster = useCallback(() => {
    setView(VIEW_POSTER)
    setLightboxOpen(false)
  }, [])

  const openCarousel = useCallback(() => {
    setView(VIEW_CAROUSEL)
    setLightboxOpen(false)
  }, [])

  function scrollBy(delta) {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  if (items.length === 0 && !hasPoster) return null

  const cta = showingPoster ? (
    items.length > 0 ? (
      <button type="button" className={ctaButtonClass} onClick={openCarousel}>
        Ver artistas
      </button>
    ) : null
  ) : hasPoster ? (
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

  return (
    <div>
      <FdcSectionTitle
        title={title}
        tone={titleTone}
        subtitle={
          showingPoster
            ? 'Cartelera completa. Tocá la imagen para verla en grande.'
            : undefined
        }
        actions={cta}
      />

      <LayoutGroup>
        <div className="relative min-h-[12rem] perspective-[1400px]">
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
                <div className="mx-auto flex w-full max-w-[min(100%,36rem)] justify-center sm:max-w-[min(100%,40rem)]">
                  <Motion.button
                    type="button"
                    layoutId={reduceMotion ? undefined : 'fdc-full-poster'}
                    onClick={() => setLightboxOpen(true)}
                    className="group relative w-full overflow-hidden rounded-2xl bg-[#efe8dc]/40 text-left shadow-[0_24px_60px_-36px_rgba(23,27,34,0.55)] ring-1 ring-[#e8e4dc] transition hover:ring-[#d4b483]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483]"
                    whileHover={reduceMotion ? undefined : { y: -3, transition: { duration: 0.35 } }}
                    whileTap={reduceMotion ? undefined : { scale: 0.992 }}
                  >
                    <div className="flex items-center justify-center px-3 py-4 sm:px-5 sm:py-6">
                      <img
                        src={posterSrc}
                        alt={title || 'Cartelera completa'}
                        className="mx-auto h-auto max-h-[min(78vh,52rem)] w-auto max-w-full object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-[#0c1017]/55 via-[#0c1017]/10 to-transparent px-4 pb-4 pt-12 text-center opacity-0 transition duration-300 group-hover:opacity-100 sm:px-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d4b483]">
                        Ampliar cartelera
                      </p>
                    </div>
                  </Motion.button>
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
                    <button
                      type="button"
                      onClick={() => scrollBy(-300)}
                      className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#ddd7ca] bg-white text-[#171b22] shadow-md transition hover:bg-[#f7f7f5] md:inline-flex lg:-translate-x-1/3"
                      aria-label="Artistas anteriores"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollBy(300)}
                      className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#ddd7ca] bg-white text-[#171b22] shadow-md transition hover:bg-[#f7f7f5] md:inline-flex lg:translate-x-1/3"
                      aria-label="Artistas siguientes"
                    >
                      →
                    </button>
                  </>
                ) : null}

                <div
                  ref={scrollRef}
                  className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] md:gap-5 [&::-webkit-scrollbar]:hidden"
                >
                  {items.map((artist, idx) => {
                    const src = resolveMediaUrl(artist.photoUrl)
                    const badge = parseDateBadge(artist.dateTag)
                    return (
                      <Motion.article
                        key={artist.id || artist.name || idx}
                        initial={reduceMotion ? false : { opacity: 0, x: 28 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: reduceMotion ? 0.12 : 0.35,
                          delay: reduceMotion ? 0 : Math.min(idx, 6) * 0.03,
                          ease: softEase,
                        }}
                        className="group relative w-[min(72vw,14.5rem)] shrink-0 snap-start overflow-hidden rounded-xl shadow-[0_12px_36px_-24px_rgba(23,27,34,0.4)] ring-1 ring-[#e8e4dc] sm:w-[min(42vw,15.5rem)] lg:w-[13.75rem]"
                      >
                        <div className="relative aspect-3/4 bg-[#efe8dc]">
                          {src ? (
                            <img
                              src={src}
                              alt={artist.name}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div
                              className="flex h-full items-center justify-center text-4xl text-[#b08948]/40"
                              aria-hidden
                            >
                              ♪
                            </div>
                          )}
                          <div
                            className="absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-transparent"
                            aria-hidden
                          />
                          {badge.day || badge.num ? (
                            <div className="absolute left-0 top-0 flex min-w-[2.75rem] flex-col items-center bg-[#d4b483] px-2 py-1.5 text-[#171b22]">
                              {badge.day ? (
                                <span className="text-[10px] font-bold uppercase leading-none tracking-wide">
                                  {badge.day}
                                </span>
                              ) : null}
                              {badge.num ? (
                                <span className="mt-0.5 font-serif text-lg font-bold leading-none">
                                  {badge.num}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                          <h3 className="absolute inset-x-0 bottom-0 px-3 pb-4 text-center font-serif text-sm font-bold uppercase leading-snug tracking-wide text-white sm:text-[15px]">
                            {artist.name}
                          </h3>
                        </div>
                      </Motion.article>
                    )
                  })}
                </div>

                {items.length > 1 ? (
                  <div className="mt-4 flex justify-center gap-2 md:hidden">
                    <button
                      type="button"
                      onClick={() => scrollBy(-260)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd7ca] bg-white text-[#171b22]"
                      aria-label="Anterior"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollBy(260)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd7ca] bg-white text-[#171b22]"
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
                  imageUrl={posterImageUrl}
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
