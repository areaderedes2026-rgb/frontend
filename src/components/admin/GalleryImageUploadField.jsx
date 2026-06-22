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
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition shadow-sm disabled:cursor-not-allowed disabled:opacity-60'
const FIELD_BTN_NEUTRAL = `${FIELD_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`

function Spinner({ size = 'md', tone = 'sky' }) {
  const dim = size === 'sm' ? 'h-4 w-4 border-2' : 'h-5 w-5 border-2'
  const color =
    tone === 'white'
      ? 'border-white/40 border-t-white'
      : 'border-slate-300 border-t-sky-700'
  return (
    <span
      className={`inline-block animate-spin rounded-full ${color} ${dim}`}
      aria-hidden
    />
  )
}

/**
 * Galería de imágenes (múltiples archivos) con subida, importación por URL y feedback visual.
 */
export function GalleryImageUploadField({
  label = 'Galería de imágenes',
  helpText = 'Hasta 18 imágenes. JPEG, PNG, WebP o GIF.',
  urls = [],
  onChange,
  maxItems = 18,
  disabled = false,
  /** Notifica al padre (p. ej. toast global del modal de turismo). */
  onNotify,
  /** `true` mientras sube o importa. */
  onBusyChange,
}) {
  const inputId = useId()
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [remoteUrl, setRemoteUrl] = useState('')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const api = isApiConfigured()
  const cap = Math.min(Math.max(1, Number(maxItems) || 18), 40)
  const list = Array.isArray(urls) ? urls : []
  const isFull = list.length >= cap
  const isInteractive = api && !disabled && !busy

  function notify(variant, message) {
    setToast({ variant, message })
    onNotify?.({ variant, message })
  }

  function setBusyState(next) {
    setBusy(next)
    onBusyChange?.(next)
  }

  function openFilePicker() {
    if (!isInteractive || isFull) return
    fileRef.current?.click()
  }

  async function uploadFiles(fileList) {
    if (!api) {
      const msg = 'No hay conexión con el backend para subir imágenes.'
      setError(msg)
      notify('error', msg)
      return
    }
    const files = [...fileList].filter(Boolean)
    if (!files.length) return

    setError('')
    setBusyState(true)

    const remaining = Math.max(0, cap - list.length)
    const usable = files.slice(0, remaining)
    setProgress({ current: 0, total: usable.length })

    let nextList = [...list]
    let added = 0
    let failed = 0
    let lastError = ''

    try {
      for (let i = 0; i < usable.length; i += 1) {
        const file = usable[i]
        try {
          const url = await uploadMediaImage(file, 'gallery')
          nextList = [...nextList, url]
          onChange?.(nextList)
          added += 1
        } catch (e) {
          failed += 1
          lastError = e.message || 'No se pudo subir la imagen.'
        }
        setProgress({ current: i + 1, total: usable.length })
      }

      const skipped = files.length - usable.length

      if (added > 0 && failed === 0) {
        notify(
          'success',
          added === 1
            ? 'Imagen añadida a la galería.'
            : `${added} imágenes añadidas a la galería.`,
        )
      } else if (added > 0 && failed > 0) {
        setError(lastError)
        notify('error', `Se subieron ${added} de ${usable.length}; ${failed} fallaron.`)
      } else if (failed > 0) {
        setError(lastError)
        notify('error', lastError || 'No se pudo subir ninguna imagen.')
      }

      if (skipped > 0) {
        notify('error', `Se ignoraron ${skipped} archivo(s): máximo ${cap} imágenes.`)
      }
    } finally {
      setBusyState(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  async function handleImportUrl() {
    const remote = remoteUrl.trim()
    if (!remote || !api || isFull) return
    setError('')
    setBusyState(true)
    try {
      const url = await importMediaImageFromUrl(remote, 'gallery')
      onChange?.([...list, url])
      setRemoteUrl('')
      notify('success', 'Imagen importada a la galería.')
    } catch (e) {
      const msg = e.message || 'No se pudo importar la imagen.'
      setError(msg)
      notify('error', msg)
    } finally {
      setBusyState(false)
    }
  }

  function removeAt(index) {
    if (busy) return
    onChange?.(list.filter((_, i) => i !== index))
    notify('success', 'Imagen quitada de la galería.')
  }

  function onDragOver(e) {
    if (!isInteractive || isFull) return
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  function onDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  function onDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    if (!isInteractive || isFull) return
    const files = e.dataTransfer?.files
    if (files?.length) void uploadFiles(files)
  }

  const progressPct =
    progress.total > 0
      ? Math.round((progress.current / Math.max(1, progress.total)) * 100)
      : 0

  return (
    <div className="min-w-0 max-w-full space-y-3">
      {toast ? (
        <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} />
      ) : null}

      {!api ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No hay conexión activa con el backend para subir imágenes.
        </p>
      ) : null}

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className={labelClass}>{label}</span>
        <span className="text-xs font-semibold tabular-nums text-slate-500">
          {list.length}/{cap}
        </span>
      </div>
      {helpText ? <p className="text-xs text-slate-500">{helpText}</p> : null}

      {error ? (
        <p className={formErrorClass} role="alert">
          {error}
        </p>
      ) : null}

      {list.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {list.map((url, i) => (
            <li
              key={`${url}-${i}`}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              <img
                src={resolveMediaUrl(url)}
                alt=""
                className="aspect-video w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <button
                type="button"
                className="absolute right-2 top-2 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-red-700 shadow ring-1 ring-slate-200 transition hover:bg-white disabled:opacity-60"
                onClick={() => removeAt(i)}
                disabled={busy || disabled}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed transition ${
          dragOver
            ? 'border-sky-400 bg-sky-50/70'
            : 'border-slate-200 bg-slate-50/60'
        } ${isFull && !busy ? 'opacity-80' : ''}`}
        aria-busy={busy ? 'true' : 'false'}
      >
        {busy ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-9 text-center text-sm text-slate-700">
            <Spinner />
            <span className="font-medium">
              Subiendo {progress.current}/{progress.total || 1} imagen
              {(progress.total || 1) === 1 ? '' : 'es'}…
            </span>
            {progress.total > 0 ? (
              <div
                className="h-1.5 w-44 overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPct}
              >
                <div
                  className="h-full bg-sky-600 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            ) : null}
            <span className="text-xs text-slate-500">No cierres esta ventana.</span>
          </div>
        ) : isFull ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              Llegaste al máximo ({cap} imágenes).
            </p>
            <p className="text-xs text-slate-500">Quitá alguna para sumar más.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-7 text-center">
            <span aria-hidden className="text-3xl">
              🖼️
            </span>
            <p className="text-sm font-medium text-slate-800">
              Arrastrá imágenes aquí o elegilas desde tu equipo.
            </p>
            <input
              ref={fileRef}
              id={inputId}
              type="file"
              accept={ACCEPT}
              multiple
              className="sr-only"
              disabled={!isInteractive || isFull}
              onChange={(e) => {
                const picked = e.target.files ? Array.from(e.target.files) : []
                e.target.value = ''
                if (picked.length) void uploadFiles(picked)
              }}
            />
            <label
              htmlFor={inputId}
              className={`${FIELD_BTN_NEUTRAL} mt-1 ${!isInteractive || isFull ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
            >
              Elegir imágenes
            </label>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          type="url"
          inputMode="url"
          placeholder="Importar a la galería · https://..."
          className={inputClass}
          value={remoteUrl}
          disabled={!api || busy || disabled || isFull}
          onChange={(e) => setRemoteUrl(e.target.value)}
        />
        <button
          type="button"
          className={`${FIELD_BTN_NEUTRAL} sm:w-auto`}
          disabled={!api || busy || disabled || !remoteUrl.trim() || isFull}
          onClick={() => void handleImportUrl()}
        >
          {busy && remoteUrl ? <Spinner size="sm" /> : null}
          Importar URL
        </button>
      </div>
    </div>
  )
}
