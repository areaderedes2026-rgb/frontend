import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAreas } from '../../hooks/useAreas.js'
import { LinkButton } from '../ui/LinkButton.jsx'
import { ROUTES } from '../../utils/constants.js'

const TONE_SURFACE = {
  light: '#f7f7f5',
  accent: '#171b22',
}

function excerptWords(text, maxWords = 14) {
  const value = String(text || '').trim()
  if (!value) return ''
  const words = value.split(/\s+/)
  if (words.length <= maxWords) return value
  return `${words.slice(0, maxWords).join(' ')}...`
}

function EdgeFade({ side, surfaceColor }) {
  const position = side === 'left' ? 'left-0' : 'right-0'
  const gradient =
    side === 'left'
      ? `linear-gradient(to right, ${surfaceColor} 0%, ${surfaceColor}ee 35%, transparent 100%)`
      : `linear-gradient(to left, ${surfaceColor} 0%, ${surfaceColor}ee 35%, transparent 100%)`

  return (
    <div
      className={`pointer-events-none absolute inset-y-0 ${position} z-20 w-16 sm:w-24 lg:w-32`}
      style={{ background: gradient }}
      aria-hidden
    />
  )
}

function AreaCardSkeleton({ tone = 'light' }) {
  const isAccent = tone === 'accent'
  return (
    <div
      className={`w-[min(85vw,280px)] shrink-0 overflow-hidden rounded-3xl border sm:w-[min(42vw,300px)] lg:w-[292px] ${
        isAccent
          ? 'border-white/12 bg-white/6'
          : 'border-[#e8e5dd] bg-white shadow-sm'
      }`}
    >
      <div className={`aspect-16/10 animate-pulse ${isAccent ? 'bg-white/10' : 'bg-slate-100'}`} />
      <div className="space-y-3 p-5">
        <div className={`h-5 w-3/4 animate-pulse rounded ${isAccent ? 'bg-white/10' : 'bg-slate-100'}`} />
        <div className={`h-3 w-full animate-pulse rounded ${isAccent ? 'bg-white/10' : 'bg-slate-100'}`} />
        <div className={`h-3 w-5/6 animate-pulse rounded ${isAccent ? 'bg-white/10' : 'bg-slate-100'}`} />
      </div>
    </div>
  )
}

function AreaCard({ area, tone = 'light' }) {
  const isAccent = tone === 'accent'
  const description = excerptWords(area.description, 16)

  return (
    <div className="w-[min(85vw,280px)] shrink-0 sm:w-[min(42vw,300px)] lg:w-[292px]">
      <Link
        to={ROUTES.area(area.slug)}
        className={`group flex h-full flex-col overflow-hidden rounded-3xl border transition-all duration-500 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
          isAccent
            ? 'border-white/14 bg-[#fcfcfa] shadow-[0_22px_60px_-34px_rgba(0,0,0,0.55)] hover:border-sky-200/70 hover:shadow-[0_28px_70px_-32px_rgba(56,189,248,0.35)]'
            : 'border-[#ddd7ca] bg-[#fcfcfa] shadow-[0_16px_50px_-34px_rgba(23,27,34,0.2)] ring-1 ring-[#1a1d24]/5 hover:border-sky-200/80 hover:shadow-[0_24px_64px_-34px_rgba(2,132,199,0.22)]'
        }`}
      >
        <div className="relative shrink-0 overflow-hidden">
          {area.coverImage ? (
            <img
              src={area.coverImage}
              alt=""
              loading="lazy"
              decoding="async"
              className="aspect-16/10 w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex aspect-16/10 w-full items-center justify-center bg-linear-to-br from-slate-700 to-slate-900 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Sin imagen
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/55 via-slate-950/10 to-transparent"
            aria-hidden
          />
          <span className="absolute left-3 top-3 inline-flex rounded-full border border-white/25 bg-slate-950/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            Área municipal
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 font-serif text-lg font-bold leading-snug tracking-tight text-[#171b22] transition-colors group-hover:text-[#0f1319] sm:text-xl">
            {area.title}
          </h3>
          {description ? (
            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[#4b505a]">
              {description}
            </p>
          ) : (
            <span className="flex-1" />
          )}
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-800 transition-all group-hover:gap-2 group-hover:text-[#0f1319]">
            Explorar área
            <span className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden>
              →
            </span>
          </span>
        </div>
      </Link>
    </div>
  )
}

export function AreasCarousel({ showHeader = true, tone = 'light' }) {
  const { areas, loading } = useAreas()
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const isAccent = tone === 'accent'
  const surfaceColor = TONE_SURFACE[tone] ?? TONE_SURFACE.light

  const loop = useMemo(() => [...areas, ...areas], [areas])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  if (!loading && areas.length === 0) return null

  const pauseHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onTouchStart: () => setPaused(true),
    onTouchEnd: () => setPaused(false),
    onFocusCapture: () => setPaused(true),
    onBlurCapture: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
    },
  }

  return (
    <div className="relative">
      {showHeader ? (
        <div className="mb-6">
          <p
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${
              isAccent ? 'text-sky-200/90' : 'text-slate-500'
            }`}
          >
            Conocé la gestión
          </p>
          <h2
            className={`mt-1 text-2xl font-bold tracking-tight sm:text-3xl ${
              isAccent ? 'text-white' : 'text-slate-900'
            }`}
          >
            Áreas municipales
          </h2>
        </div>
      ) : null}

      {!loading && areas.length > 0 ? (
        <p
          className={`mb-5 text-sm ${isAccent ? 'text-slate-300' : 'text-[#4b505a]'}`}
        >
          {areas.length} área{areas.length === 1 ? '' : 's'} disponible{areas.length === 1 ? '' : 's'} ·
          deslizá o pasá el cursor para explorar
        </p>
      ) : null}

      <div
        className="relative"
        role="region"
        aria-label="Áreas municipales en desplazamiento continuo. Se detiene al pasar el cursor o al tocar."
        {...pauseHandlers}
      >
        <EdgeFade side="left" surfaceColor={surfaceColor} />
        <EdgeFade side="right" surfaceColor={surfaceColor} />

        {loading ? (
          <div className="flex gap-4 overflow-hidden px-1 py-1">
            {[1, 2, 3, 4].map((i) => (
              <AreaCardSkeleton key={i} tone={tone} />
            ))}
          </div>
        ) : reducedMotion ? (
          <div className="relative z-10 flex flex-wrap justify-center gap-4 px-1 py-1">
            {areas.map((area) => (
              <AreaCard key={area.slug} area={area} tone={tone} />
            ))}
          </div>
        ) : (
          <div className="relative z-10 overflow-hidden px-1 py-1">
            <div
              className="flex w-max gap-4 will-change-transform animate-areas-marquee"
              style={{ animationPlayState: paused ? 'paused' : 'running' }}
            >
              {loop.map((area, i) => (
                <AreaCard key={`${area.slug}-${i}`} area={area} tone={tone} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-8 flex justify-center sm:mt-10">
        <LinkButton to={ROUTES.areas} variant={isAccent ? 'primary' : 'secondary'}>
          Ver todas las áreas
        </LinkButton>
      </div>
    </div>
  )
}
