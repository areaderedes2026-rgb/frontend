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

/**
 * Modal público de detalle de servicio (área): diseño alineado al detalle (#fcfcfa, bordes cálidos).
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
  const hasMetaBlock = Boolean(mode || personInCharge || generalObjective)
  const modalKey = service?.id || title

  return createPortal(
    <AnimatePresence mode="wait">
      {open && service ? (
        <motion.div
          key={modalKey}
          className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
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
            className="relative flex max-h-[min(90dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)]"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration, ease: easeOut }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 shrink-0 bg-linear-to-r from-sky-500 to-sky-600" />
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e8e4dc] px-5 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5">
              <h2
                id={titleId}
                className="min-w-0 text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
              >
                {title}
              </h2>
              <button
                type="button"
                className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-[#f0ede6] hover:text-slate-800"
                aria-label="Cerrar ventana"
                onClick={onClose}
              >
                <span className="block text-xl leading-none" aria-hidden>
                  ×
                </span>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
              {img ? (
                <div className="mb-5 overflow-hidden rounded-xl border border-[#e5e2da] bg-[#f4f2ec]">
                  <img
                    src={img}
                    alt=""
                    className="aspect-video w-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              ) : null}

              {mode ? (
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">{mode}</p>
              ) : null}

              {personInCharge ? (
                <div className={mode ? 'mt-5' : 'mt-0'}>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-800">
                    A cargo
                  </p>
                  <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-900 sm:text-base">
                    {personInCharge}
                  </p>
                </div>
              ) : null}

              {generalObjective ? (
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-800">
                    Objetivo general
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#4b505a] sm:text-base">
                    {generalObjective}
                  </p>
                </div>
              ) : null}

              {description ? (
                <p
                  className={`text-sm leading-relaxed text-[#4b505a] sm:text-base ${
                    hasMetaBlock || img ? 'mt-5 border-t border-[#e5e2da] pt-5' : 'mt-1'
                  }`}
                >
                  {description}
                </p>
              ) : null}

              {!description && !generalObjective && !personInCharge && !mode && !img ? (
                <p className="text-sm text-slate-500">
                  No hay más información cargada para este servicio.
                </p>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
