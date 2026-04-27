import { useId, useState } from 'react'
import {
  importNewsImageFromUrl,
  uploadNewsImage,
} from '../../services/newsService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { Button } from '../ui/Button.jsx'
import {
  formErrorClass,
  inputClass,
  labelClass,
} from '../ui/formStyles.js'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_GALLERY = 20

export function NewsImageFields({
  imageUrl,
  onImageUrlChange,
  galleryUrls,
  onGalleryUrlsChange,
  className = '',
  coverLabel = 'Imagen de portada',
  coverHelp = 'Opcional. JPEG, PNG, WebP o GIF (máx. 5 MB).',
  galleryLabel = 'Galería de imágenes',
  /** Si se omite, se arma un texto por defecto para noticias usando `maxGallery`. */
  galleryHelpText,
  /** Tope de ítems en galería (noticias: 20; otros flujos pueden pasar menos). */
  maxGallery = MAX_GALLERY,
}) {
  const coverId = useId()
  const galleryId = useId()
  const [uploadError, setUploadError] = useState('')
  const [busy, setBusy] = useState(false)
  const [coverRemoteUrl, setCoverRemoteUrl] = useState('')
  const [galleryRemoteUrl, setGalleryRemoteUrl] = useState('')

  const galleryCap = Math.min(Math.max(1, Number(maxGallery) || MAX_GALLERY), 40)
  const galleryHelp =
    galleryHelpText ??
    `Hasta ${galleryCap} imágenes adicionales. Se muestran en la noticia pública debajo del texto.`

  const api = isApiConfigured()

  async function handleCoverFile(file) {
    if (!file || !api) return
    setUploadError('')
    setBusy(true)
    try {
      const url = await uploadNewsImage(file, 'cover')
      onImageUrlChange(url)
    } catch (e) {
      setUploadError(e.message || 'Error al subir la imagen.')
    } finally {
      setBusy(false)
    }
  }

  async function handleGalleryFiles(fileList) {
    if (!api) return
    const files = [...fileList]
    if (files.length === 0) return
    setUploadError('')
    setBusy(true)
    try {
      let list = [...galleryUrls]
      for (const f of files) {
        if (list.length >= galleryCap) break
        const url = await uploadNewsImage(f, 'gallery')
        list = [...list, url]
        onGalleryUrlsChange(list)
      }
    } catch (e) {
      setUploadError(e.message || 'Error al subir la imagen.')
    } finally {
      setBusy(false)
    }
  }

  function removeGalleryAt(index) {
    onGalleryUrlsChange(galleryUrls.filter((_, i) => i !== index))
  }

  async function handleCoverImportFromUrl() {
    const remote = coverRemoteUrl.trim()
    if (!remote || !api) return
    setUploadError('')
    setBusy(true)
    try {
      const url = await importNewsImageFromUrl(remote, 'cover')
      onImageUrlChange(url)
      setCoverRemoteUrl('')
    } catch (e) {
      setUploadError(e.message || 'Error al importar la imagen.')
    } finally {
      setBusy(false)
    }
  }

  async function handleGalleryImportFromUrl() {
    const remote = galleryRemoteUrl.trim()
    if (!remote || !api || galleryUrls.length >= galleryCap) return
    setUploadError('')
    setBusy(true)
    try {
      const url = await importNewsImageFromUrl(remote, 'gallery')
      onGalleryUrlsChange([...galleryUrls, url])
      setGalleryRemoteUrl('')
    } catch (e) {
      setUploadError(e.message || 'Error al importar la imagen.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      {!api ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No hay conexión activa con el backend para subir imágenes.
        </p>
      ) : null}

      {uploadError ? (
        <p className={formErrorClass} role="alert">
          {uploadError}
        </p>
      ) : null}

      <div>
        <label className={labelClass} htmlFor={coverId}>
          {coverLabel}
        </label>
        <p className="mb-2 text-xs text-slate-500">{coverHelp}</p>
        <input
          id={coverId}
          type="file"
          accept={ACCEPT}
          className={inputClass}
          disabled={!api || busy}
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) void handleCoverFile(f)
          }}
        />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="url"
            inputMode="url"
            placeholder="https://..."
            className={inputClass}
            value={coverRemoteUrl}
            disabled={!api || busy}
            onChange={(e) => setCoverRemoteUrl(e.target.value)}
          />
          <Button
            disabled={!api || busy || !coverRemoteUrl.trim()}
            onClick={() => void handleCoverImportFromUrl()}
            className="sm:w-auto"
          >
            Importar URL
          </Button>
        </div>
        {imageUrl ? (
          <div className="mt-3 flex flex-wrap items-start gap-3">
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img
                src={resolveMediaUrl(imageUrl)}
                alt=""
                className="max-h-48 max-w-full object-contain"
              />
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-red-700 hover:text-red-900"
              onClick={() => onImageUrlChange(null)}
            >
              Quitar portada
            </button>
          </div>
        ) : null}
      </div>

      <div>
        <label className={labelClass} htmlFor={galleryId}>
          {galleryLabel}
        </label>
        <p className="mb-2 text-xs text-slate-500">{galleryHelp}</p>
        <input
          id={galleryId}
          type="file"
          accept={ACCEPT}
          multiple
          className={inputClass}
          disabled={!api || busy || galleryUrls.length >= galleryCap}
          onChange={(e) => {
            const files = e.target.files
            e.target.value = ''
            if (files?.length) void handleGalleryFiles(files)
          }}
        />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="url"
            inputMode="url"
            placeholder="https://..."
            className={inputClass}
            value={galleryRemoteUrl}
            disabled={!api || busy || galleryUrls.length >= galleryCap}
            onChange={(e) => setGalleryRemoteUrl(e.target.value)}
          />
          <Button
            disabled={
              !api ||
              busy ||
              !galleryRemoteUrl.trim() ||
              galleryUrls.length >= galleryCap
            }
            onClick={() => void handleGalleryImportFromUrl()}
            className="sm:w-auto"
          >
            Importar URL
          </Button>
        </div>
        {galleryUrls.length > 0 ? (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {galleryUrls.map((url, i) => (
              <li
                key={`${url}-${i}`}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
              >
                <img
                  src={resolveMediaUrl(url)}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-red-700 shadow hover:bg-white"
                  onClick={() => removeGalleryAt(i)}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
