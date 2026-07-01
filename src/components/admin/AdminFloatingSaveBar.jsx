import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Barra de guardado fija al viewport (portal en body).
 * Evita que ancestros con transform (p. ej. admin-fade-up) rompan position: fixed.
 */
export function AdminFloatingSaveBar({
  open = false,
  title = 'Borrador sin guardar',
  message = 'Tenés cambios sin guardar — recordá publicarlos antes de salir',
  saving = false,
  disabled = false,
  saveLabel = 'Guardar cambios',
  savingContent = null,
  onSave,
  actionClassName = '',
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.paddingBottom
    document.body.style.paddingBottom = 'max(5.5rem, calc(5.5rem + env(safe-area-inset-bottom)))'
    return () => {
      document.body.style.paddingBottom = previous
    }
  }, [open])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]"
      role="region"
      aria-label="Guardar cambios pendientes"
      aria-live="polite"
    >
      <div className="admin-floating-save-bar pointer-events-auto flex w-full max-w-[min(96vw,88rem)] items-center gap-3 rounded-2xl border border-amber-300/90 bg-amber-50/95 px-4 py-3 shadow-[0_8px_40px_-6px_rgba(15,23,42,0.38)] ring-2 ring-amber-400/35 backdrop-blur-md sm:gap-4 sm:px-5 sm:py-3.5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="text-xs font-semibold text-amber-900">{message}</p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || disabled}
          className={
            actionClassName ||
            'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60'
          }
        >
          {saving ? savingContent ?? 'Guardando…' : saveLabel}
        </button>
      </div>
    </div>,
    document.body,
  )
}
