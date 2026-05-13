import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { AreaServiceDetailModal } from './AreaServiceDetailModal.jsx'

function usePerPage() {
  const [perPage, setPerPage] = useState(2)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const apply = () => setPerPage(mq.matches ? 2 : 1)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return perPage
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduce(mq.matches)
    const fn = () => setReduce(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return reduce
}

function ChevronLeft({ className = 'h-5 w-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
    </svg>
  )
}

function ChevronRight({ className = 'h-5 w-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  )
}

const easeOut = [0.22, 1, 0.36, 1]

/**
 * Carrusel de servicios del área: 1 tarjeta en móvil, 2 desde `sm`, navegación por páginas.
 */
export function AreaServicesSection({ services, areaSlug }) {
  const list = Array.isArray(services) ? services : []
  const perPage = usePerPage()
  const reduceMotion = usePrefersReducedMotion()
  const [page, setPage] = useState(0)
  const [detail, setDetail] = useState(null)

  const totalPages = Math.max(1, Math.ceil(list.length / perPage))
  const maxPage = totalPages - 1

  useEffect(() => {
    setPage((p) => Math.min(p, maxPage))
  }, [maxPage, list.length])

  const visible = useMemo(() => {
    const start = page * perPage
    return list.slice(start, start + perPage)
  }, [list, page, perPage])

  const goPrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), [])
  const goNext = useCallback(() => setPage((p) => Math.min(maxPage, p + 1)), [maxPage])

  const pageDuration = reduceMotion ? 0.01 : 0.45

  if (!list.length) return null

  return (
    <>
      <section
        id="servicios-area"
        className="scroll-mt-32"
        aria-roledescription="carrusel"
        aria-label="Servicios y prestaciones del área"
      >
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Servicios y prestaciones
        </h2>

        <div
          className="mt-4"
          role="group"
          aria-label={`Página ${page + 1} de ${totalPages}`}
        >
          {reduceMotion ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {visible.map((service, i) => (
                <ServiceCard
                  key={service.id || `${areaSlug}-srv-${page * perPage + i}`}
                  service={service}
                  onOpen={() => setDetail(service)}
                />
              ))}
            </ul>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={`${page}-${perPage}`}
                className="grid gap-4 sm:grid-cols-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: pageDuration, ease: easeOut }}
              >
                {visible.map((service, i) => (
                  <ServiceCard
                    key={service.id || `${areaSlug}-srv-${page * perPage + i}`}
                    service={service}
                    onOpen={() => setDetail(service)}
                  />
                ))}
              </motion.ul>
            </AnimatePresence>
          )}
        </div>

        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={goPrev}
              disabled={page <= 0}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ddd7ca] bg-white text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900 disabled:pointer-events-none disabled:opacity-35"
              aria-label="Ver página anterior de servicios"
            >
              <ChevronLeft />
            </button>
            <span className="min-w-18 text-center text-xs font-semibold tabular-nums text-[#4b505a]">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={page >= maxPage}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ddd7ca] bg-white text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900 disabled:pointer-events-none disabled:opacity-35"
              aria-label="Ver página siguiente de servicios"
            >
              <ChevronRight />
            </button>
          </div>
        ) : null}
      </section>

      <AreaServiceDetailModal
        service={detail}
        open={detail != null}
        onClose={() => setDetail(null)}
      />
    </>
  )
}

function ServiceCard({ service, onOpen }) {
  const img = service?.imageUrl ? resolveMediaUrl(service.imageUrl) : ''
  const title = String(service?.title || '').trim() || 'Servicio'
  const mode = String(service?.mode || '').trim()
  const description = String(service?.description || '').trim()

  return (
    <li className="min-w-0 list-none">
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-lg hover:shadow-sky-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      >
        <div className="relative aspect-16/10 w-full overflow-hidden bg-[#ece8df]">
          {img ? (
            <img
              src={img}
              alt=""
              className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-200/90 to-sky-100/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sin imagen
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/25 via-transparent to-transparent opacity-80 transition group-hover:opacity-100" />
        </div>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          {mode ? (
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-700">{mode}</p>
          ) : null}
          <h3
            className={`font-bold tracking-tight text-slate-900 ${mode ? 'mt-1.5' : ''} text-base sm:text-lg`}
          >
            {title}
          </h3>
          {description ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#4b505a]">{description}</p>
          ) : (
            <p className="mt-2 text-sm italic text-slate-400">Tocá para ver el detalle</p>
          )}
          <span className="mt-3 text-xs font-semibold text-sky-800 opacity-80 transition group-hover:opacity-100">
            Ver detalle →
          </span>
        </div>
      </button>
    </li>
  )
}
