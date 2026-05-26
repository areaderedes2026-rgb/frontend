import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { inputClass, labelClass } from '../ui/formStyles.js'
import {
  EMPTY_SERVICE_GALLERY_IMAGE,
  EMPTY_SERVICE_GALLERY_SECTION,
  normalizeServiceGallerySection,
} from '../../utils/serviceGallery.js'

function newGalleryImageId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `gal-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function ServiceGalleryEditor({ gallerySection, onChange, saving = false, className = '' }) {
  const section = normalizeServiceGallerySection(gallerySection)

  function updateSection(patch) {
    onChange({ ...section, ...patch })
  }

  function updateImage(index, field, value) {
    const images = [...section.images]
    images[index] = { ...images[index], [field]: value }
    updateSection({ images })
  }

  function addImage() {
    updateSection({
      images: [
        ...section.images,
        { ...EMPTY_SERVICE_GALLERY_IMAGE, id: newGalleryImageId() },
      ],
    })
  }

  function removeImage(index) {
    updateSection({ images: section.images.filter((_, i) => i !== index) })
  }

  return (
    <div
      className={`space-y-4 rounded-2xl border border-violet-100 bg-violet-50/50 p-4 sm:col-span-2 ${className}`.trim()}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Galería de fotos</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Opcional. Imágenes adicionales del servicio en la página de detalle.
          </p>
        </div>
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm font-semibold text-violet-900 shadow-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            checked={section.enabled}
            onChange={(e) => updateSection({ enabled: e.target.checked })}
            disabled={saving}
          />
          Mostrar en el portal
        </label>
      </div>

      {section.enabled ? (
        <>
          <label className={labelClass}>
            Título de la sección
            <input
              className={inputClass}
              value={section.title}
              onChange={(e) => updateSection({ title: e.target.value })}
              disabled={saving}
              maxLength={80}
              placeholder="Ej. Galería, Imágenes del servicio"
            />
          </label>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-800">
              Fotos
            </p>
            <button
              type="button"
              onClick={addImage}
              disabled={saving}
              className="inline-flex min-h-9 items-center justify-center rounded-xl border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-800 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Agregar foto
            </button>
          </div>

          {section.images.length ? (
            <div className="space-y-4">
              {section.images.map((image, index) => (
                <article
                  key={image.id || `gal-${index}`}
                  className="rounded-2xl border border-white bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      Foto {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={saving}
                      className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    <SingleImageUploadField
                      label="Imagen"
                      value={image.imageUrl || ''}
                      onChange={(value) => updateImage(index, 'imageUrl', value)}
                      kind="gallery"
                      disabled={saving}
                    />
                    <label className={labelClass}>
                      Pie de foto (opcional)
                      <input
                        className={inputClass}
                        value={image.caption || ''}
                        onChange={(e) => updateImage(index, 'caption', e.target.value)}
                        disabled={saving}
                        maxLength={160}
                        placeholder="Ej. Entrega de kits escolares 2025"
                      />
                    </label>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-violet-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-600">
              Agregá al menos una imagen para publicar la galería.
            </p>
          )}
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-violet-200 bg-white/70 px-4 py-5 text-sm text-slate-600">
          Activá la opción para cargar fotos del servicio en el portal.
        </p>
      )}
    </div>
  )
}

export { EMPTY_SERVICE_GALLERY_SECTION }
