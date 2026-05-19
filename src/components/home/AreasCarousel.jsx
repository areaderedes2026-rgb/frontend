import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAreas } from '../../hooks/useAreas.js'
import { LinkButton } from '../ui/LinkButton.jsx'

export function AreasCarousel({ showHeader = true }) {
  const { areas } = useAreas()
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const loop = [...areas, ...areas]

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return (
    <div className="relative">
      {showHeader ? (
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Conocé la gestión
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Áreas municipales
          </h2>
        </div>
      ) : null}

      <div
        className="relative overflow-hidden rounded-4xl bg-white/12 py-4 shadow-[0_24px_80px_-54px_rgba(15,23,42,0.75)] backdrop-blur-md sm:py-5"
        role="region"
        aria-label="Áreas municipales en desplazamiento continuo. Se detiene al pasar el cursor o al tocar."
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-r from-white/6 via-white/12 to-white/6"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-linear-to-r from-[#171b22]/35 to-transparent sm:w-24"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-linear-to-l from-[#171b22]/35 to-transparent sm:w-24"
          aria-hidden
        />
        {reducedMotion ? (
          <div className="relative z-1 flex flex-wrap justify-center gap-4 px-3 sm:px-4">
            {areas.map((area) => (
              <AreaCard key={area.slug} area={area} compact />
            ))}
          </div>
        ) : (
          <div
            className="relative z-1 overflow-hidden px-3 sm:px-4"
            style={{
              WebkitMaskImage:
                'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
              maskImage:
                'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
            }}
          >
            <div
              className="flex w-max gap-4 will-change-transform animate-areas-marquee"
              style={{
                animationPlayState: paused ? 'paused' : 'running',
              }}
            >
              {loop.map((area, i) => (
                <AreaCard key={`${area.slug}-${i}`} area={area} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center sm:mt-10">
        <LinkButton to="/areas" variant="secondary">
          Ver todas las áreas
        </LinkButton>
      </div>
    </div>
  )
}

function AreaCard({ area, compact = false }) {
  const src = area.coverImage
  const priority = Number(area.sortOrder) || 0
  return (
    <div
      className={`shrink-0 ${
        compact ? 'w-full max-w-sm' : 'w-[min(85vw,300px)] sm:w-[min(42vw,320px)] lg:w-[300px]'
      }`}
    >
      <Link
        to={`/areas/${area.slug}`}
        className={`group relative flex w-full overflow-hidden rounded-[1.75rem] bg-slate-200 shadow-[0_18px_48px_-28px_rgba(23,27,34,0.65)] ring-1 ring-slate-900/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_64px_-28px_rgba(23,27,34,0.72)] hover:ring-sky-200/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 ${
          compact ? 'min-h-[240px]' : 'min-h-[260px] sm:min-h-[300px]'
        }`}
      >
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/92 via-black/48 to-black/8" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/12 to-transparent" aria-hidden />

        <div
          className={`relative z-1 mt-auto flex w-full flex-col justify-end ${
            compact ? 'p-4' : 'p-5 sm:p-6'
          }`}
        >
          <span
            className={`mb-2 inline-flex w-fit items-center rounded-full border border-white/25 bg-white/15 px-2.5 py-1 font-mono font-bold uppercase tracking-widest text-white backdrop-blur-sm ${
              compact ? 'text-[9px]' : 'text-[10px]'
            }`}
          >
            P.{priority}
          </span>
          <h3
            className={`font-bold tracking-tight text-white drop-shadow-sm ${
              compact ? 'text-lg' : 'text-lg sm:text-xl'
            }`}
          >
            {area.title}
          </h3>
          <span
            className={`mt-3 inline-flex items-center gap-2 font-semibold text-white transition-all duration-300 group-hover:gap-3 ${
              compact ? 'text-sm' : 'text-sm'
            }`}
          >
            Explorar área
            <svg
              className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 sm:h-4 sm:w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </span>
        </div>
      </Link>
    </div>
  )
}
