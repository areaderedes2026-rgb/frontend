import { useCallback, useId, useRef, useState } from 'react'
import {
  importNewsImageFromUrl,
  uploadNewsImage,
} from '../../services/newsService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { Toast } from '../ui/Toast.jsx'
import { formErrorClass, inputClass, labelClass } from '../ui/formStyles.js'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

const FIELD_BTN_BASE =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition shadow-sm disabled:cursor-not-allowed disabled:opacity-60'
const FIELD_BTN_PRIMARY = `${FIELD_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`
const FIELD_BTN_NEUTRAL = `${FIELD_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const FIELD_BTN_DANGER = `${FIELD_BTN_BASE} border border-rose-200 bg-white text-rose-700 hover:bg-rose-50`

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
 * Carga de una sola imagen (portadas, fotos de autoridad, etc.) con:
 * - drag & drop + click sobre dropzone para elegir archivo,
 * - importación por URL,
 * - spinner durante upload/import,
 * - toast de éxito/error,
 * - preview con botón de quitar.
 *
 * Mantiene la API existente: { label, helpText, value, onChange, kind, disabled }.
 */
export function SingleImageUploadField({
  label,
  helpText = 'JPEG, PNG, WebP o GIF · máx. 10 MB.',
  value,
  onChange,
  kind = 'cover',
  disabled = false,
}) {
  const inputId = useId()
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [remoteUrl, setRemoteUrl] = useState('')
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])
  const api = isApiConfigured()

  const uploadKind = kind === 'gallery' ? 'gallery' : 'cover'
  const isInteractive = api && !disabled && !busy

  async function handleFile(file) {
    if (!file || !api) return
    setError('')
    setBusy(true)
    try {
      const next = await uploadNewsImage(file, uploadKind)
      onChange(next)
      setToast({ variant: 'success', message: 'Imagen cargada correctamente.' })
    } catch (e) {
      const msg = e.message || 'No se pudo subir la imagen.'
      setError(msg)
      setToast({ variant: 'error', message: msg })
    } finally {
      setBusy(false)
    }
  }

  async function handleImport() {
    const remote = remoteUrl.trim()
    if (!remote || !api) return
    setError('')
    setBusy(true)
    try {
      const next = await importNewsImageFromUrl(remote, uploadKind)
      onChange(next)
      setRemoteUrl('')
      setToast({ variant: 'success', message: 'Imagen importada correctamente.' })
    } catch (e) {
      const msg = e.message || 'No se pudo importar la imagen.'
      setError(msg)
      setToast({ variant: 'error', message: msg })
    } finally {
      setBusy(false)
    }
  }

  function removeImage() {
    if (busy) return
    onChange('')
    setError('')
    setToast({ variant: 'success', message: 'Imagen quitada.' })
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

  const dropzoneClass = [
    'relative flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-5 py-7 text-center transition',
    isInteractive
      ? dragOver
        ? 'border-sky-500 bg-sky-50/80 text-sky-800'
        : 'border-slate-300 bg-slate-50/80 text-slate-700 hover:border-sky-400 hover:bg-sky-50/60'
      : 'border-slate-200 bg-slate-50/60 text-slate-400',
    !isInteractive ? 'cursor-not-allowed' : 'cursor-pointer',
  ].join(' ')

  return (
    <div>
      {toast ? (
        <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} />
      ) : null}

      <label className={labelClass} htmlFor={inputId}>
        {label}
      </label>
      <p className="mb-2 text-xs text-slate-500">{helpText}</p>

      {error ? (
        <p className={`${formErrorClass} mb-2`} role="alert">
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
            <span className="text-xs text-sky-700/80">No cierres esta ventana hasta que termine.</span>
          </>
        ) : (
          <>
            <span
              aria-hidden
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-sky-700 ring-1 ring-slate-200"
            >
              ↑
            </span>
            <span className="text-sm font-semibold">
              {value ? 'Reemplazar imagen' : 'Soltá una imagen acá o tocá para elegir'}
            </span>
            <span id={`${inputId}-help`} className="text-xs text-slate-500">
              También podés importarla desde una URL más abajo.
            </span>
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
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) void handleFile(f)
        }}
      />

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          type="url"
          inputMode="url"
          placeholder="https://ejemplo.com/imagen.jpg"
          className={inputClass}
          value={remoteUrl}
          disabled={!isInteractive}
          onChange={(e) => setRemoteUrl(e.target.value)}
        />
        <button
          type="button"
          disabled={!isInteractive || !remoteUrl.trim()}
          onClick={() => void handleImport()}
          className={FIELD_BTN_PRIMARY}
        >
          {busy ? (
            <>
              <Spinner size="sm" tone="white" />
              Procesando…
            </>
          ) : (
            'Importar URL'
          )}
        </button>
      </div>

      {value ? (
        <div className="mt-4 flex flex-wrap items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <img
              src={resolveMediaUrl(value)}
              alt=""
              className="block max-h-44 max-w-[260px] object-contain"
            />
            {busy ? (
              <div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm">
                <Spinner />
              </div>
            ) : null}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              ✓ Imagen cargada
            </p>
            <p className="break-all text-xs text-slate-500">{value}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openFilePicker}
                disabled={!isInteractive}
                className={FIELD_BTN_NEUTRAL}
              >
                Reemplazar
              </button>
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
      ) : null}

      {!api ? (
        <p className="mt-2 text-xs text-amber-700">
          La carga de imágenes requiere conexión activa con el backend.
        </p>
      ) : null}
    </div>
  )
}
