import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../components/ui/Button.jsx'
import {
  concurrencyConflictMessage,
  isConcurrencyConflictError,
} from '../utils/concurrencyConflict.js'

function ConcurrencyConflictDialog({
  open,
  onClose,
  entityLabel,
  busy,
  onReload,
  onForceSave,
}) {
  const titleId = useId()
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="Cerrar diálogo"
        disabled={Boolean(busy)}
        onClick={() => !busy && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl"
      >
        <div className="h-1 bg-amber-500" />
        <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight text-slate-900">
            Cambios desactualizados
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {concurrencyConflictMessage(entityLabel)}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button
              type="button"
              variant="primary"
              disabled={Boolean(busy)}
              onClick={() => void onForceSave()}
            >
              {busy === 'force' ? 'Guardando…' : 'Guardar mis cambios de todos modos'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={Boolean(busy)}
              onClick={() => void onReload()}
            >
              {busy === 'reload' ? 'Cargando…' : 'Recargar última versión del servidor'}
            </Button>
            <Button
              ref={closeRef}
              type="button"
              variant="outline"
              disabled={Boolean(busy)}
              onClick={onClose}
            >
              Cerrar sin guardar
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/**
 * Diálogo de conflicto de edición concurrente: recargar servidor o forzar guardado.
 */
export function useContentEditorConcurrencyConflict({
  reloadFromServer,
  persistContent,
  entityLabel = 'este contenido',
  onReloadSuccess,
  onReloadError,
  onForceSaveSuccess,
  onForceSaveError,
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(null)

  const handleConflict = useCallback((error) => {
    if (!isConcurrencyConflictError(error)) return false
    setOpen(true)
    return true
  }, [])

  const closeConflict = useCallback(() => {
    if (busy) return
    setOpen(false)
  }, [busy])

  const handleReload = useCallback(async () => {
    setBusy('reload')
    try {
      await reloadFromServer()
      setOpen(false)
      onReloadSuccess?.()
    } catch (e) {
      onReloadError?.(e)
    } finally {
      setBusy(null)
    }
  }, [onReloadError, onReloadSuccess, reloadFromServer])

  const handleForceSave = useCallback(async () => {
    setBusy('force')
    try {
      await persistContent({ forceOverwrite: true })
      setOpen(false)
      onForceSaveSuccess?.()
    } catch (e) {
      if (handleConflict(e)) return
      onForceSaveError?.(e)
    } finally {
      setBusy(null)
    }
  }, [handleConflict, onForceSaveError, onForceSaveSuccess, persistContent])

  const conflictDialog = (
    <ConcurrencyConflictDialog
      open={open}
      onClose={closeConflict}
      entityLabel={entityLabel}
      busy={busy}
      onReload={handleReload}
      onForceSave={handleForceSave}
    />
  )

  return { conflictDialog, handleConflict, closeConflict }
}
