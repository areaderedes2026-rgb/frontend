import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button.jsx'

/**
 * Diálogo modal de confirmación (admin): overlay, foco inicial en Cancelar, Escape y scroll bloqueado.
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  loading = false,
  variant = 'danger',
}) {
  const titleId = useId()
  const cancelRef = useRef(null)

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
    const id = requestAnimationFrame(() => cancelRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open])

  if (!open) return null

  const accent = variant === 'danger' ? 'bg-red-500' : 'bg-sky-600'

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] transition-opacity"
        aria-label="Cerrar diálogo"
        disabled={loading}
        onClick={() => !loading && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl"
      >
        <div className={`h-1 ${accent}`} />
        <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          <div className="mt-2 text-sm leading-relaxed text-slate-600">{description}</div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              ref={cancelRef}
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={onClose}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={variant === 'danger' ? 'danger' : 'primary'}
              disabled={loading}
              onClick={() => onConfirm?.()}
            >
              {loading ? 'Procesando…' : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
