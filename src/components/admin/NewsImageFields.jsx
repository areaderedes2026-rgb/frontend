import { useCallback, useId, useRef, useState } from 'react'
import {
  importNewsImageFromUrl,
  uploadNewsImage,
} from '../../services/newsService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { Toast } from '../ui/Toast.jsx'
import { inputClass, labelClass } from '../ui/formStyles.js'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_GALLERY = 20

const FIELD_BTN_BASE =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition shadow-sm disabled:cursor-not-allowed disabled:opacity-60'
const FIELD_BTN_PRIMARY = `${FIELD_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`
const FIELD_BTN_NEUTRAL = `${FIELD_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`

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
 * Campos de imagen para noticias (portada + galería).
 * UX: drag & drop, vista previa, spinners, progreso por archivo y toasts.
 */
export function NewsImageFields({
  imageUrl,
  onImageUrlChange,
  galleryUrls,
  onGalleryUrlsChange,
  className = '',
  coverLabel = 'Imagen de portada',
  coverHelp = 'JPEG, PNG, WebP o GIF · máx. 5 MB.',
  galleryLabel = 'Galería de imágenes',
  /** Si se omite, se arma un texto por defecto para noticias usando `maxGallery`. */
  galleryHelpText,
  /** Tope de ítems en galería (noticias: 20; otros flujos pueden pasar menos). */
  maxGallery = MAX_GALLERY,
}) {
  const coverInputId = useId()
  const galleryInputId = useId()
  const coverFileRef = useRef(null)
  const galleryFileRef = useRef(null)

  const [coverBusy, setCoverBusy] = useState(false)
  const [coverDragOver, setCoverDragOver] = useState(false)
  const [coverError, setCoverError] = useState('')
  const [coverRemoteUrl, setCoverRemoteUrl] = useState('')

  const [galleryBusy, setGalleryBusy] = useState(false)
  const [galleryDragOver, setGalleryDragOver] = useState(false)
  const [galleryError, setGalleryError] = useState('')
  const [galleryRemoteUrl, setGalleryRemoteUrl] = useState('')
  const [galleryProgress, setGalleryProgress] = useState({ current: 0, total: 0 })

  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const galleryCap = Math.min(Math.max(1, Number(maxGallery) || MAX_GALLERY), 40)
  const galleryHelp =
    galleryHelpText ??
    `Hasta ${galleryCap} imágenes adicionales. Aparecen debajo del texto en la noticia pública.`

  const api = isApiConfigured()
  const galleryFull = galleryUrls.length >= galleryCap

  async function handleCoverFile(file) {
    if (!file || !api) return
    setCoverError('')
    setCoverBusy(true)
    try {
      const url = await uploadNewsImage(file, 'cover')
      onImageUrlChange(url)
      setToast({ type: 'success', message: 'Portada subida correctamente.' })
    } catch (e) {
      const msg = e.message || 'No se pudo subir la imagen de portada.'
      setCoverError(msg)
      setToast({ type: 'error', message: msg })
    } finally {
      setCoverBusy(false)
    }
  }

  async function handleCoverImportUrl() {
    const remote = coverRemoteUrl.trim()
    if (!remote || !api) return
    setCoverError('')
    setCoverBusy(true)
    try {
      const url = await importNewsImageFromUrl(remote, 'cover')
      onImageUrlChange(url)
      setCoverRemoteUrl('')
      setToast({ type: 'success', message: 'Portada importada correctamente.' })
    } catch (e) {
      const msg = e.message || 'No se pudo importar la imagen de portada.'
      setCoverError(msg)
      setToast({ type: 'error', message: msg })
    } finally {
      setCoverBusy(false)
    }
  }

  function removeCover() {
    onImageUrlChange(null)
    setCoverError('')
    setToast({ type: 'success', message: 'Portada quitada.' })
  }

  async function handleGalleryFiles(fileList) {
    if (!api) return
    const files = [...fileList].filter(Boolean)
    if (files.length === 0) return
    setGalleryError('')
    setGalleryBusy(true)

    let list = [...galleryUrls]
    const remaining = Math.max(0, galleryCap - list.length)
    const usable = files.slice(0, remaining)
    setGalleryProgress({ current: 0, total: usable.length })

    let added = 0
    let failed = 0
    let lastErrorMsg = ''

    for (let i = 0; i < usable.length; i += 1) {
      const f = usable[i]
      try {
        const url = await uploadNewsImage(f, 'gallery')
        list = [...list, url]
        onGalleryUrlsChange(list)
        added += 1
      } catch (e) {
        failed += 1
        lastErrorMsg = e.message || 'No se pudo subir una imagen.'
      }
      setGalleryProgress({ current: i + 1, total: usable.length })
    }

    setGalleryBusy(false)
    setGalleryProgress({ current: 0, total: 0 })

    const skipped = files.length - usable.length

    if (added > 0 && failed === 0) {
      setToast({
        type: 'success',
        message:
          added === 1
            ? 'Imagen añadida a la galería.'
            : `${added} imágenes añadidas a la galería.`,
      })
    } else if (added > 0 && failed > 0) {
      setGalleryError(lastErrorMsg)
      setToast({
        type: 'error',
        message: `Se subieron ${added} de ${usable.length} imágenes; ${failed} fallaron.`,
      })
    } else if (failed > 0) {
      setGalleryError(lastErrorMsg)
      setToast({
        type: 'error',
        message: 'No se pudo subir ninguna imagen seleccionada.',
      })
    }

    if (skipped > 0) {
      setToast({
        type: 'error',
        message: `Se ignoraron ${skipped} imagen(es): se llegó al máximo permitido.`,
      })
    }
  }

  async function handleGalleryImportUrl() {
    const remote = galleryRemoteUrl.trim()
    if (!remote || !api || galleryFull) return
    setGalleryError('')
    setGalleryBusy(true)
    try {
      const url = await importNewsImageFromUrl(remote, 'gallery')
      onGalleryUrlsChange([...galleryUrls, url])
      setGalleryRemoteUrl('')
      setToast({ type: 'success', message: 'Imagen importada a la galería.' })
    } catch (e) {
      const msg = e.message || 'No se pudo importar la imagen.'
      setGalleryError(msg)
      setToast({ type: 'error', message: msg })
    } finally {
      setGalleryBusy(false)
    }
  }

  function removeGalleryAt(index) {
    onGalleryUrlsChange(galleryUrls.filter((_, i) => i !== index))
    setToast({ type: 'success', message: 'Imagen quitada de la galería.' })
  }

  function onCoverDragOver(e) {
    if (!api || coverBusy) return
    e.preventDefault()
    setCoverDragOver(true)
  }
  function onCoverDragLeave(e) {
    e.preventDefault()
    setCoverDragOver(false)
  }
  function onCoverDrop(e) {
    e.preventDefault()
    setCoverDragOver(false)
    if (!api || coverBusy) return
    const f = e.dataTransfer?.files?.[0]
    if (f) void handleCoverFile(f)
  }

  function onGalleryDragOver(e) {
    if (!api || galleryBusy || galleryFull) return
    e.preventDefault()
    setGalleryDragOver(true)
  }
  function onGalleryDragLeave(e) {
    e.preventDefault()
    setGalleryDragOver(false)
  }
  function onGalleryDrop(e) {
    e.preventDefault()
    setGalleryDragOver(false)
    if (!api || galleryBusy || galleryFull) return
    const files = e.dataTransfer?.files
    if (files?.length) void handleGalleryFiles(files)
  }

  const galleryProgressPct =
    galleryProgress.total > 0
      ? Math.round((galleryProgress.current / Math.max(1, galleryProgress.total)) * 100)
      : 0

  return (
    <div className={`space-y-7 ${className}`.trim()}>
      {toast ? (
        <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} />
      ) : null}

      {!api ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No hay conexión activa con el backend para subir imágenes.
        </p>
      ) : null}

      {/* Portada */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className={labelClass}>{coverLabel}</span>
          {imageUrl && !coverBusy ? (
            <button
              type="button"
              onClick={removeCover}
              className="text-xs font-semibold text-red-700 underline-offset-2 hover:text-red-900 hover:underline"
            >
              Quitar portada
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-slate-500">{coverHelp}</p>

        <div
          onDragOver={onCoverDragOver}
          onDragLeave={onCoverDragLeave}
          onDrop={onCoverDrop}
          className={`mt-3 rounded-2xl border-2 border-dashed transition ${
            coverDragOver
              ? 'border-sky-400 bg-sky-50/70'
              : 'border-slate-200 bg-slate-50/60'
          }`}
          aria-busy={coverBusy ? 'true' : 'false'}
        >
          {coverBusy ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center text-sm text-slate-700">
              <Spinner />
              <span className="font-medium">Subiendo imagen de portada…</span>
              <span className="text-xs text-slate-500">No cierres ni recargues la página.</span>
            </div>
          ) : imageUrl ? (
            <div className="p-3 sm:p-4">
              <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                <img
                  src={resolveMediaUrl(imageUrl)}
                  alt=""
                  className="mx-auto max-h-72 w-full object-contain"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <input
                  ref={coverFileRef}
                  id={coverInputId}
                  type="file"
                  accept={ACCEPT}
                  className="sr-only"
                  disabled={!api}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    e.target.value = ''
                    if (f) void handleCoverFile(f)
                  }}
                />
                <button
                  type="button"
                  className={FIELD_BTN_NEUTRAL}
                  disabled={!api}
                  onClick={() => coverFileRef.current?.click()}
                >
                  Cambiar imagen
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-9 text-center sm:py-10">
              <span aria-hidden className="text-3xl">
                📷
              </span>
              <p className="text-sm font-medium text-slate-800">
                Arrastrá la imagen aquí o seleccionala desde tu equipo.
              </p>
              <p className="text-xs text-slate-500">{coverHelp}</p>
              <input
                ref={coverFileRef}
                id={coverInputId}
                type="file"
                accept={ACCEPT}
                className="sr-only"
                disabled={!api}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  if (f) void handleCoverFile(f)
                }}
              />
              <button
                type="button"
                className={`${FIELD_BTN_PRIMARY} mt-2`}
                disabled={!api}
                onClick={() => coverFileRef.current?.click()}
              >
                Elegir archivo
              </button>
            </div>
          )}
        </div>

        {coverError ? (
          <p className="mt-2 text-sm font-medium text-red-700" role="alert">
            {coverError}
          </p>
        ) : null}

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <input
            type="url"
            inputMode="url"
            placeholder="Importar desde una URL · https://..."
            className={inputClass}
            value={coverRemoteUrl}
            disabled={!api || coverBusy}
            onChange={(e) => setCoverRemoteUrl(e.target.value)}
          />
          <button
            type="button"
            className={`${FIELD_BTN_NEUTRAL} sm:w-auto`}
            disabled={!api || coverBusy || !coverRemoteUrl.trim()}
            onClick={() => void handleCoverImportUrl()}
          >
            {coverBusy && coverRemoteUrl ? <Spinner size="sm" /> : null}
            <span>Importar URL</span>
          </button>
        </div>
      </div>

      {/* Galería */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className={labelClass}>{galleryLabel}</span>
          <span className="text-xs font-semibold tabular-nums text-slate-500">
            {galleryUrls.length}/{galleryCap}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">{galleryHelp}</p>

        {galleryUrls.length > 0 ? (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {galleryUrls.map((url, i) => (
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
                  className="absolute right-2 top-2 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-red-700 shadow ring-1 ring-slate-200 transition hover:bg-white"
                  onClick={() => removeGalleryAt(i)}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div
          onDragOver={onGalleryDragOver}
          onDragLeave={onGalleryDragLeave}
          onDrop={onGalleryDrop}
          className={`mt-3 rounded-2xl border-2 border-dashed transition ${
            galleryDragOver
              ? 'border-sky-400 bg-sky-50/70'
              : 'border-slate-200 bg-slate-50/60'
          } ${galleryFull && !galleryBusy ? 'opacity-80' : ''}`}
          aria-busy={galleryBusy ? 'true' : 'false'}
        >
          {galleryBusy ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-9 text-center text-sm text-slate-700">
              <Spinner />
              <span className="font-medium">
                Subiendo {galleryProgress.current}/{galleryProgress.total} imagen
                {galleryProgress.total === 1 ? '' : 'es'}…
              </span>
              {galleryProgress.total > 0 ? (
                <div
                  className="h-1.5 w-44 overflow-hidden rounded-full bg-slate-200"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={galleryProgressPct}
                >
                  <div
                    className="h-full bg-sky-600 transition-all"
                    style={{ width: `${galleryProgressPct}%` }}
                  />
                </div>
              ) : null}
              <span className="text-xs text-slate-500">No cierres ni recargues la página.</span>
            </div>
          ) : galleryFull ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                Llegaste al máximo de imágenes ({galleryCap}).
              </p>
              <p className="text-xs text-slate-500">Quitá alguna para sumar más.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-7 text-center sm:py-8">
              <span aria-hidden className="text-3xl">
                🖼️
              </span>
              <p className="text-sm font-medium text-slate-800">
                Arrastrá varias imágenes o seleccionalas desde tu equipo.
              </p>
              <p className="text-xs text-slate-500">{galleryHelp}</p>
              <input
                ref={galleryFileRef}
                id={galleryInputId}
                type="file"
                accept={ACCEPT}
                multiple
                className="sr-only"
                disabled={!api || galleryFull}
                onChange={(e) => {
                  const files = e.target.files
                  e.target.value = ''
                  if (files?.length) void handleGalleryFiles(files)
                }}
              />
              <button
                type="button"
                className={`${FIELD_BTN_NEUTRAL} mt-1`}
                disabled={!api || galleryFull}
                onClick={() => galleryFileRef.current?.click()}
              >
                Elegir imágenes
              </button>
            </div>
          )}
        </div>

        {galleryError ? (
          <p className="mt-2 text-sm font-medium text-red-700" role="alert">
            {galleryError}
          </p>
        ) : null}

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <input
            type="url"
            inputMode="url"
            placeholder="Importar a la galería · https://..."
            className={inputClass}
            value={galleryRemoteUrl}
            disabled={!api || galleryBusy || galleryFull}
            onChange={(e) => setGalleryRemoteUrl(e.target.value)}
          />
          <button
            type="button"
            className={`${FIELD_BTN_NEUTRAL} sm:w-auto`}
            disabled={
              !api ||
              galleryBusy ||
              !galleryRemoteUrl.trim() ||
              galleryFull
            }
            onClick={() => void handleGalleryImportUrl()}
          >
            Importar URL
          </button>
        </div>
      </div>
    </div>
  )
}
