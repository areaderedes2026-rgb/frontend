import { useCallback, useId, useRef, useState } from 'react'
import {
  importMediaImageFromUrl,
  uploadMediaImage,
} from '../../services/mediaUploadService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { Toast } from '../ui/Toast.jsx'
import { formErrorClass, inputClass, labelClass } from '../ui/formStyles.js'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

const FIELD_BTN_BASE =
  'inline-flex min-h-9 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10 sm:px-4 sm:text-sm'
const FIELD_BTN_PRIMARY = `${FIELD_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`
const FIELD_BTN_NEUTRAL = `${FIELD_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const FIELD_BTN_DANGER = `${FIELD_BTN_BASE} border border-rose-200 bg-white text-rose-700 hover:bg-rose-50`

function shortImageLabel(url) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  try {
    const parsed = new URL(raw)
    const segment = parsed.pathname.split('/').filter(Boolean).pop()
    if (segment) return decodeURIComponent(segment)
    return parsed.hostname
  } catch {
    return raw.length > 48 ? `${raw.slice(0, 45)}…` : raw
  }
}

function Spinner({ size = 'md', tone = 'sky', className = '' }) {
  const dim = size === 'sm' ? 'h-4 w-4 border-2' : 'h-5 w-5 border-2'
  const color =
    tone === 'white'
      ? 'border-white/40 border-t-white'
      : 'border-slate-300 border-t-sky-700'
  return (
    <span
      className={`inline-block animate-spin rounded-full ${color} ${dim} ${className}`.trim()}
      aria-hidden
    />
  )
}

/**
 * Carga de una sola imagen (portadas, fotos de autoridad, etc.).
 */
export function SingleImageUploadField({
  label,
  helpText = 'JPEG, PNG, WebP o GIF · máx. 10 MB.',
  value,
  onChange,
  kind = 'cover',
  disabled = false,
  /** Notifica al padre (toast global fuera del campo). */
  onNotify,
  /** `true` mientras sube o importa. */
  onBusyChange,
  /** Menos padding y sin URL completa (columnas estrechas). */
  compact = false,
}) {
  const inputId = useId()
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [remoteUrl, setRemoteUrl] = useState('')
  const [toast, setToast] = useState(null)
  const [showUrl, setShowUrl] = useState(false)
  const dismissToast = useCallback(() => setToast(null), [])
  const api = isApiConfigured()

  const uploadKind = kind === 'gallery' ? 'gallery' : 'cover'
  const isInteractive = api && !disabled && !busy

  function notify(variant, message) {
    setToast({ variant, message })
    onNotify?.({ variant, message })
  }

  function setBusyState(next) {
    setBusy(next)
    onBusyChange?.(next)
  }

  async function handleFile(file) {
    if (!file) return
    if (!api) {
      const msg = 'No hay conexión con el backend para subir imágenes.'
      setError(msg)
      notify('error', msg)
      return
    }
    setError('')
    setBusyState(true)
    try {
      const next = await uploadMediaImage(file, uploadKind)
      onChange(next)
      notify('success', 'Imagen cargada correctamente.')
    } catch (e) {
      const msg = e.message || 'No se pudo subir la imagen.'
      setError(msg)
      notify('error', msg)
    } finally {
      setBusyState(false)
    }
  }

  async function handleImport() {
    const remote = remoteUrl.trim()
    if (!remote) return
    if (!api) {
      const msg = 'No hay conexión con el backend para importar imágenes.'
      setError(msg)
      notify('error', msg)
      return
    }
    setError('')
    setBusyState(true)
    try {
      const next = await importMediaImageFromUrl(remote, uploadKind)
      onChange(next)
      setRemoteUrl('')
      notify('success', 'Imagen importada correctamente.')
    } catch (e) {
      const msg = e.message || 'No se pudo importar la imagen.'
      setError(msg)
      notify('error', msg)
    } finally {
      setBusyState(false)
    }
  }

  function removeImage() {
    if (busy) return
    onChange('')
    setError('')
    setShowUrl(false)
    notify('success', 'Imagen quitada.')
  }

  function openFilePicker() {
    if (!isInteractive) return
    fileRef.current?.click()
  }

  function onDragOver(e) {
    if (!isInteractive) return
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  function onDragLeave(e) {
    if (!isInteractive) return
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  function onDrop(e) {
    if (!isInteractive) return
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) void handleFile(file)
  }

  async function copyUrl() {
    if (!value || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(value)
      setToast({ variant: 'success', message: 'Enlace copiado.' })
    } catch {
      setToast({ variant: 'error', message: 'No se pudo copiar el enlace.' })
    }
  }

  const dropzoneClass = [
    'relative flex w-full max-w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center transition',
    compact ? 'px-3 py-5' : 'px-5 py-7',
    isInteractive
      ? dragOver
        ? 'border-sky-500 bg-sky-50/80 text-sky-800'
        : 'border-slate-300 bg-slate-50/80 text-slate-700 hover:border-sky-400 hover:bg-sky-50/60'
      : 'border-slate-200 bg-slate-50/60 text-slate-400',
    !isInteractive ? 'cursor-not-allowed' : 'cursor-pointer',
  ].join(' ')

  return (
    <div className="min-w-0 max-w-full">
      {toast ? (
        <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} />
      ) : null}

      {label ? (
        <label className={labelClass} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      {helpText ? (
        <p className={`text-xs text-slate-500 ${label ? 'mb-2' : 'mb-2'}`}>{helpText}</p>
      ) : null}

      {error ? (
        <p className={`${formErrorClass} mb-2 break-words`} role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={openFilePicker}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        disabled={!isInteractive}
        className={dropzoneClass}
        aria-busy={busy}
        aria-describedby={`${inputId}-help`}
      >
        {busy ? (
          <>
            <Spinner />
            <span className="text-sm font-semibold text-sky-800">Subiendo imagen…</span>
          </>
        ) : (
          <>
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-sky-700 ring-1 ring-slate-200"
            >
              ↑
            </span>
            <span className="max-w-full px-2 text-sm font-semibold">
              {value ? 'Reemplazar imagen' : 'Soltá una imagen o tocá para elegir'}
            </span>
            {!compact ? (
              <span id={`${inputId}-help`} className="max-w-full px-2 text-xs text-slate-500">
                También podés importarla desde una URL.
              </span>
            ) : null}
          </>
        )}
      </button>

      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={!isInteractive}
        onChange={(e) => {
          const picked = e.target.files?.[0] ?? null
          e.target.value = ''
          if (picked) void handleFile(picked)
        }}
      />

      <div className="mt-3 grid min-w-0 max-w-full gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          type="url"
          inputMode="url"
          placeholder="https://ejemplo.com/imagen.jpg"
          className={`${inputClass} min-w-0`}
          value={remoteUrl}
          disabled={!isInteractive}
          onChange={(e) => setRemoteUrl(e.target.value)}
        />
        <button
          type="button"
          disabled={!isInteractive || !remoteUrl.trim()}
          onClick={() => void handleImport()}
          className={`${FIELD_BTN_PRIMARY} w-full sm:w-auto`}
        >
          {busy ? (
            <>
              <Spinner size="sm" tone="white" />
              …
            </>
          ) : (
            'Importar'
          )}
        </button>
      </div>

      {value ? (
        <div className="mt-4 min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img
                src={resolveMediaUrl(value)}
                alt=""
                className="mx-auto block max-h-40 w-full object-contain"
              />
              {busy ? (
                <div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm">
                  <Spinner />
                </div>
              ) : null}
            </div>

            <div className="min-w-0 max-w-full space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                ✓ Imagen cargada
              </p>
              <p className="truncate text-sm font-medium text-slate-800" title={shortImageLabel(value)}>
                {shortImageLabel(value)}
              </p>

              {!compact ? (
                <div className="min-w-0 max-w-full">
                  <button
                    type="button"
                    onClick={() => setShowUrl((v) => !v)}
                    className="text-xs font-semibold text-sky-700 hover:text-sky-900"
                  >
                    {showUrl ? 'Ocultar enlace' : 'Ver enlace completo'}
                  </button>
                  {showUrl ? (
                    <div className="mt-1.5 max-w-full overflow-x-auto rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5">
                      <p className="break-all text-[11px] leading-snug text-slate-600">{value}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="flex min-w-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={!isInteractive}
                  className={FIELD_BTN_NEUTRAL}
                >
                  Reemplazar
                </button>
                {value && navigator.clipboard ? (
                  <button type="button" onClick={() => void copyUrl()} className={FIELD_BTN_NEUTRAL}>
                    Copiar enlace
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={!api || disabled || busy}
                  className={FIELD_BTN_DANGER}
                >
                  Quitar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!api ? (
        <p className="mt-2 break-words text-xs text-amber-700">
          La carga de imágenes requiere conexión activa con el backend.
        </p>
      ) : null}
    </div>
  )
}
