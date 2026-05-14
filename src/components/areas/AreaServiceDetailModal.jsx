import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { resolveMediaUrl } from '../../utils/imageUrl.js'

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

const easeOut = [0.22, 1, 0.36, 1]

function MetaCard({ label, children, className = '' }) {
  if (!children) return null
  return (
    <div
      className={`rounded-xl border border-[#e5e2da] bg-white/80 p-4 shadow-sm sm:p-5 ${className}`.trim()}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-800">{label}</p>
      <div className="mt-2 text-sm leading-relaxed text-[#2f3440] sm:text-[15px]">{children}</div>
    </div>
  )
}

function DescriptionBlock({ description }) {
  if (description) {
    return (
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[#e5e2da] bg-linear-to-b from-white to-[#faf9f6] p-5 shadow-sm sm:p-6 lg:p-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">Descripción</p>
        <p className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-[#3d424c] sm:text-[15px] sm:leading-[1.65]">
          {description}
        </p>
      </div>
    )
  }
  return (
    <div className="flex min-h-[100px] flex-1 items-center justify-center rounded-2xl border border-dashed border-[#e0dcd4] bg-[#faf9f6]/90 p-6 text-center text-sm text-slate-500">
      Sin descripción cargada.
    </div>
  )
}

/**
 * Modal público de detalle de servicio: panel muy ancho (7xl / 88rem), 2 columnas en `lg`, 3 zonas en `xl`.
 */
export function AreaServiceDetailModal({ service, open, onClose }) {
  const titleId = useId()
  const reduceMotion = usePrefersReducedMotion()
  const duration = reduceMotion ? 0.01 : 0.5

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const img = service?.imageUrl ? resolveMediaUrl(service.imageUrl) : ''
  const title = String(service?.title || '').trim() || 'Servicio'
  const mode = String(service?.mode || '').trim()
  const description = String(service?.description || '').trim()
  const personInCharge = String(service?.personInCharge || '').trim()
  const generalObjective = String(service?.generalObjective || '').trim()
  const hasMeta = Boolean(personInCharge || generalObjective)
  const hasAnyContent =
    Boolean(img) || Boolean(mode) || hasMeta || Boolean(description)
  const modalKey = service?.id || title

  return createPortal(
    <AnimatePresence mode="wait">
      {open && service ? (
        <motion.div
          key={modalKey}
          className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-5 lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration * 0.85, ease: easeOut }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex max-h-[min(94dvh,1020px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-[0_28px_80px_-24px_rgba(15,23,42,0.45)] xl:max-w-7xl 2xl:max-w-[min(88rem,calc(100vw-3rem))]"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration, ease: easeOut }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 shrink-0 bg-linear-to-r from-sky-500 to-sky-600" />

            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e8e4dc] px-4 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6">
              <div className="min-w-0 flex-1">
                {mode ? (
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700 sm:text-xs">
                    {mode}
                  </p>
                ) : null}
                <h2
                  id={titleId}
                  className={`font-bold tracking-tight text-slate-900 ${mode ? 'mt-1.5' : ''} text-xl leading-tight sm:text-2xl lg:text-3xl`}
                >
                  {title}
                </h2>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-xl border border-transparent p-2 text-slate-500 transition hover:border-[#e5e2da] hover:bg-[#f4f1ea] hover:text-slate-800"
                aria-label="Cerrar ventana"
                onClick={onClose}
              >
                <span className="block text-2xl leading-none sm:text-3xl" aria-hidden>
                  ×
                </span>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
              {!hasAnyContent ? (
                <p className="px-4 py-10 text-center text-sm text-slate-500 sm:px-8 lg:px-10">
                  No hay más información cargada para este servicio.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-6 px-4 py-6 sm:gap-8 sm:px-8 sm:py-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:py-8 xl:gap-10">
                  {/* Columna imagen */}
                  <div className="lg:col-span-5 xl:col-span-4">
                    {img ? (
                      <div className="overflow-hidden rounded-2xl border border-[#e5e2da] bg-[#f0ece4] shadow-inner">
                        <img
                          src={img}
                          alt=""
                          className="aspect-video w-full object-cover sm:aspect-16/10 lg:max-h-[min(50vh,480px)] lg:object-cover"
                          loading="eager"
                          decoding="async"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video min-h-[140px] items-center justify-center rounded-2xl border border-dashed border-[#ddd7ca] bg-[#f4f2ec] text-sm font-medium text-slate-500 sm:aspect-16/10 lg:min-h-[200px]">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  {/* Derecha: en lg una columna (meta + texto); en xl dos columnas internas = 3 zonas visuales */}
                  <div
                    className={`flex min-h-0 flex-col gap-6 lg:col-span-7 xl:col-span-8 xl:gap-8 ${hasMeta ? 'xl:grid xl:min-h-[min(52vh,520px)] xl:grid-cols-2' : ''}`}
                  >
                    {hasMeta ? (
                      <div className="flex flex-col gap-4 sm:gap-5">
                        {personInCharge ? (
                          <MetaCard label="A cargo">
                            <p className="font-semibold text-slate-900">{personInCharge}</p>
                          </MetaCard>
                        ) : null}
                        {generalObjective ? (
                          <MetaCard label="Objetivo general">
                            <p className="text-[#4b505a]">{generalObjective}</p>
                          </MetaCard>
                        ) : null}
                      </div>
                    ) : null}

                    <div
                      className={`flex min-h-0 min-w-0 flex-col ${hasMeta ? 'xl:max-h-[min(70vh,640px)]' : 'xl:col-span-2'}`}
                    >
                      <DescriptionBlock description={description} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
