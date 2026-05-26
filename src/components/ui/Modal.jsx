import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

const SIZE_PANEL_CLASS = {
  /** Panel estándar (formularios cortos). */
  default: 'max-h-[min(90dvh,720px)] w-full max-w-lg',
  /** Formularios con rejilla ancha (p. ej. lugares turísticos). */
  wide: 'max-h-[min(92dvh,900px)] w-full max-w-5xl xl:max-w-6xl',
  /** Máximo ancho útil en pantallas grandes. */
  xlarge: 'max-h-[min(94dvh,920px)] w-full max-w-[min(95vw,80rem)]',
}

const LAYER_CLASS = {
  base: 'z-[110]',
  stacked: 'z-[120]',
}

/**
 * Modal centrado (admin): overlay, Escape, scroll bloqueado, foco inicial en cerrar.
 *
 * @param {'default'|'wide'|'xlarge'} [props.size] — ancho máximo del panel.
 * @param {'base'|'stacked'} [props.layer] — capa z-index (stacked para modales anidados).
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  loading = false,
  size = 'default',
  layer = 'base',
  /** Clases extra en el cuerpo (p. ej. overflow-hidden para layout con pie fijo). */
  bodyClassName = '',
  /** Pie fijo debajo del cuerpo con scroll (botones de acción). */
  footer,
}) {
  const titleId = useId()
  const descId = useId()
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape' && !loading) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, loading, onClose])

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
    const id = requestAnimationFrame(() => closeRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  if (!open) return null

  const layerClass = LAYER_CLASS[layer] ?? LAYER_CLASS.base

  return createPortal(
    <div className={`fixed inset-0 ${layerClass} flex items-center justify-center p-3 sm:p-5`}>
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] transition-opacity"
        aria-label="Cerrar"
        disabled={loading}
        onClick={() => !loading && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={`relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl ${SIZE_PANEL_CLASS[size] ?? SIZE_PANEL_CLASS.default}`}
      >
        <div className="h-1 shrink-0 bg-linear-to-r from-sky-500 to-sky-600" />
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-lg font-semibold tracking-tight text-slate-900"
            >
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-1 text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            disabled={loading}
            className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
            aria-label="Cerrar ventana"
            onClick={() => !loading && onClose()}
          >
            <span className="block text-xl leading-none" aria-hidden>
              ×
            </span>
          </button>
        </div>
        <div
          className={`min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 ${bodyClassName}`.trim()}
        >
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-5 py-3 sm:px-6 sm:py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
