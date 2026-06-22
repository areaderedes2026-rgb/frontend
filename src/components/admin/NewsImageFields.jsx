import { useCallback, useRef } from 'react'
import {
  GalleryImageUploadField,
} from './GalleryImageUploadField.jsx'
import { SingleImageUploadField } from './SingleImageUploadField.jsx'

const MAX_GALLERY = 20

/**
 * Campos de imagen para noticias y otros formularios (portada + galería).
 * Usa los mismos componentes probados en modales de admin.
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
  galleryHelpText,
  maxGallery = MAX_GALLERY,
  disabled = false,
  /** Propaga toasts al padre (p. ej. modal de lugares turísticos). */
  onNotify,
  /** `true` mientras sube o importa (portada o galería). */
  onBusyChange,
}) {
  const galleryCap = Math.min(Math.max(1, Number(maxGallery) || MAX_GALLERY), 40)
  const galleryHelp =
    galleryHelpText ??
    `Hasta ${galleryCap} imágenes adicionales. Aparecen debajo del texto en la noticia pública.`

  const busyRef = useRef({ cover: false, gallery: false })

  const syncBusy = useCallback(() => {
    onBusyChange?.(busyRef.current.cover || busyRef.current.gallery)
  }, [onBusyChange])

  const handleCoverBusy = useCallback(
    (busy) => {
      busyRef.current.cover = busy
      syncBusy()
    },
    [syncBusy],
  )

  const handleGalleryBusy = useCallback(
    (busy) => {
      busyRef.current.gallery = busy
      syncBusy()
    },
    [syncBusy],
  )

  return (
    <div className={`space-y-7 ${className}`.trim()}>
      <SingleImageUploadField
        label={coverLabel}
        helpText={coverHelp}
        value={imageUrl || ''}
        onChange={(url) => onImageUrlChange(url ? url : null)}
        kind="cover"
        disabled={disabled}
        onNotify={onNotify}
        onBusyChange={handleCoverBusy}
      />
      <GalleryImageUploadField
        label={galleryLabel}
        helpText={galleryHelp}
        urls={Array.isArray(galleryUrls) ? galleryUrls : []}
        onChange={onGalleryUrlsChange}
        maxItems={galleryCap}
        disabled={disabled}
        onNotify={onNotify}
        onBusyChange={handleGalleryBusy}
      />
    </div>
  )
}
