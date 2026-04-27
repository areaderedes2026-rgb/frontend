import { useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * Aviso flotante (éxito / error) con cierre automático y botón manual.
 */
export function Toast({ variant = 'success', message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(), 5200)
    return () => clearTimeout(t)
  }, [message, onDismiss])

  const isError = variant === 'error'
  const bar = isError ? 'bg-red-500' : 'bg-emerald-500'
  const box = isError
    ? 'border-red-200 bg-red-50 text-red-900'
    : 'border-emerald-200 bg-emerald-50 text-emerald-950'

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex justify-center px-4 sm:justify-end sm:pr-6">
      <div
        role="alert"
        className={`pointer-events-auto flex w-full max-w-md flex-col overflow-hidden rounded-xl border shadow-lg transition duration-300 ease-out ${box}`}
      >
        <div className={`h-1 ${bar}`} />
        <div className="flex items-start gap-3 px-4 py-3 sm:px-5">
          <p className="min-w-0 flex-1 text-sm font-medium leading-relaxed">{message}</p>
          <button
            type="button"
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold opacity-80 transition hover:bg-black/5 hover:opacity-100"
            onClick={onDismiss}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
