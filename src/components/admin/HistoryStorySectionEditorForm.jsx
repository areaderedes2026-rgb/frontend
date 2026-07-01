import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'
import {
  EMPTY_HISTORY_STORY_IMAGE,
  EMPTY_HISTORY_STORY_SECTION,
} from '../../data/historyStorySections.js'

function newStoryImageId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `hist-img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function createEmptyStorySectionDraft(sortOrder = 0) {
  return {
    ...EMPTY_HISTORY_STORY_SECTION,
    id: `story-${Date.now()}`,
    paragraphs: [''],
    sortOrder,
  }
}

export function HistoryStorySectionEditorForm({ draft, setDraftField, saving = false }) {
  const paragraphs = Array.isArray(draft?.paragraphs) && draft.paragraphs.length > 0
    ? draft.paragraphs
    : ['']
  const images = Array.isArray(draft?.images) ? draft.images : []

  function setParagraph(index, value) {
    const next = [...paragraphs]
    next[index] = value
    setDraftField('paragraphs', next)
  }

  function addParagraph() {
    setDraftField('paragraphs', [...paragraphs, ''])
  }

  function removeParagraph(index) {
    if (paragraphs.length <= 1) {
      setDraftField('paragraphs', [''])
      return
    }
    setDraftField(
      'paragraphs',
      paragraphs.filter((_, i) => i !== index),
    )
  }

  function setImage(index, field, value) {
    const next = [...images]
    next[index] = { ...next[index], [field]: value }
    setDraftField('images', next)
  }

  function addImage() {
    setDraftField('images', [
      ...images,
      { ...EMPTY_HISTORY_STORY_IMAGE, id: newStoryImageId() },
    ])
  }

  function removeImage(index) {
    setDraftField(
      'images',
      images.filter((_, i) => i !== index),
    )
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Título de la sección
          <input
            className={inputClass}
            value={draft.title || ''}
            onChange={(e) => setDraftField('title', e.target.value)}
            disabled={saving}
            placeholder="Ej. Los inicios de Trancas"
          />
        </label>
        <label className={labelClass}>
          Orden
          <input
            className={inputClass}
            type="number"
            min={0}
            value={draft.sortOrder ?? ''}
            onChange={(e) => setDraftField('sortOrder', e.target.value)}
            disabled={saving}
          />
        </label>
      </div>

      <label className={labelClass}>
        Subtítulo
        <input
          className={inputClass}
          value={draft.subtitle || ''}
          onChange={(e) => setDraftField('subtitle', e.target.value)}
          disabled={saving}
          placeholder="Ej. Primeras décadas del asentamiento"
        />
      </label>

      <fieldset className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-600">
          Párrafos
        </legend>
        {paragraphs.map((paragraph, index) => (
          <div key={`paragraph-${index}`} className="rounded-xl border border-white bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Párrafo {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeParagraph(index)}
                disabled={saving}
                className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
              >
                Quitar
              </button>
            </div>
            <textarea
              className={`${textareaClass} min-h-28`}
              value={paragraph}
              onChange={(e) => setParagraph(index, e.target.value)}
              disabled={saving}
              placeholder="Contenido del párrafo…"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addParagraph}
          disabled={saving}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800 transition hover:border-sky-300 hover:bg-sky-100 disabled:opacity-60"
        >
          Agregar párrafo
        </button>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-600">
            Imágenes
          </legend>
          <button
            type="button"
            onClick={addImage}
            disabled={saving}
            className="inline-flex min-h-9 items-center justify-center rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 disabled:opacity-60"
          >
            Agregar imagen
          </button>
        </div>

        {images.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white/80 px-4 py-5 text-center text-sm text-slate-600">
            Opcional. Sumá fotos o documentos históricos para acompañar el relato.
          </p>
        ) : (
          images.map((image, index) => (
            <article
              key={image.id || `draft-img-${index}`}
              className="space-y-3 rounded-xl border border-white bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Imagen {index + 1}
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
              <SingleImageUploadField
                label="Archivo"
                value={image.imageUrl || ''}
                onChange={(value) => setImage(index, 'imageUrl', value)}
                kind="gallery"
                disabled={saving}
              />
              <label className={labelClass}>
                Pie de foto (opcional)
                <input
                  className={inputClass}
                  value={image.caption || ''}
                  onChange={(e) => setImage(index, 'caption', e.target.value)}
                  disabled={saving}
                  placeholder="Ej. Estación ferroviaria, década de 1940"
                />
              </label>
            </article>
          ))
        )}
      </fieldset>
    </div>
  )
}
