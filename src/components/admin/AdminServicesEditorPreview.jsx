import { useMemo, useState } from 'react'
import { ServicesPublicView } from '../services/ServicesPublicView.jsx'
import { Modal } from '../ui/Modal.jsx'
import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'
import {
  DEFAULT_SERVICES_PAGE_CONTENT,
  mergeServicesPageContent,
} from '../../data/servicesPageContent.js'

const ACTION_BTN_BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`

function PencilIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487 18.549 2.799a2.121 2.121 0 1 1 3 3L19.862 7.487m-3-3L6.34 14.99a4.5 4.5 0 0 0-1.113 1.81L4.5 19.5l2.7-.727a4.5 4.5 0 0 0 1.81-1.113l10.49-10.49m-3-3L19.5 7.5" />
    </svg>
  )
}

function EditChip({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-[#171b22] shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-60"
    >
      <PencilIcon />
      {label}
    </button>
  )
}

function linesToText(lines) {
  return (Array.isArray(lines) ? lines : []).join('\n')
}

function textToLines(text) {
  return String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

export function AdminServicesEditorPreview({
  form,
  setForm,
  services,
  loading,
  saving,
  error,
  onSubmit,
  apiAvailable,
  onScrollToItems,
}) {
  const [editor, setEditor] = useState(null)
  const previewContent = useMemo(
    () => mergeServicesPageContent(DEFAULT_SERVICES_PAGE_CONTENT, form),
    [form],
  )

  const activeServices = useMemo(
    () => [...services].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)),
    [services],
  )

  function closeEditor() {
    if (!saving) setEditor(null)
  }

  function setDraftField(field, value) {
    setEditor((prev) =>
      prev ? { ...prev, draft: { ...(prev.draft || {}), [field]: value } } : prev,
    )
  }

  function handleSaveEditor() {
    if (!editor) return
    const draft = editor.draft || {}
    if (editor.kind === 'hero') {
      setForm((prev) => ({
        ...prev,
        heroEyebrow: String(draft.heroEyebrow || '').trim(),
        heroTitle: String(draft.heroTitle || '').trim(),
        heroSubtitle: String(draft.heroSubtitle || ''),
        heroImageUrl: String(draft.heroImageUrl || '').trim(),
        heroPrimaryLabel: String(draft.heroPrimaryLabel || '').trim(),
        heroPrimaryHref: String(draft.heroPrimaryHref || '').trim(),
        heroSecondaryLabel: String(draft.heroSecondaryLabel || '').trim(),
        heroSecondaryHref: String(draft.heroSecondaryHref || '').trim(),
      }))
    }
    if (editor.kind === 'process') {
      setForm((prev) => ({
        ...prev,
        steps: textToLines(draft.stepsText),
        scheduleLines: textToLines(draft.scheduleText),
      }))
    }
    if (editor.kind === 'procedures') {
      setForm((prev) => ({
        ...prev,
        proceduresEyebrow: String(draft.proceduresEyebrow || '').trim(),
        proceduresTitle: String(draft.proceduresTitle || '').trim(),
        categories: textToLines(draft.categoriesText),
      }))
    }
    if (editor.kind === 'faq') {
      setForm((prev) => {
        const list = Array.isArray(prev.faq) ? [...prev.faq] : []
        const item = {
          id: String(draft.id || '').trim() || `faq-${Date.now()}`,
          q: String(draft.q || '').trim(),
          a: String(draft.a || '').trim(),
        }
        if (editor.index === null || editor.index === undefined) list.push(item)
        else list[editor.index] = item
        return { ...prev, faq: list }
      })
    }
    if (editor.kind === 'cta') {
      setForm((prev) => ({
        ...prev,
        finalCtaTitle: String(draft.finalCtaTitle || '').trim(),
        finalCtaText: String(draft.finalCtaText || ''),
        finalPrimaryLabel: String(draft.finalPrimaryLabel || '').trim(),
        finalPrimaryHref: String(draft.finalPrimaryHref || '').trim(),
        finalSecondaryLabel: String(draft.finalSecondaryLabel || '').trim(),
        finalSecondaryHref: String(draft.finalSecondaryHref || '').trim(),
      }))
    }
    closeEditor()
  }

  function removeFaq(index) {
    setForm((prev) => {
      const list = Array.isArray(prev.faq) ? [...prev.faq] : []
      list.splice(index, 1)
      return { ...prev, faq: list }
    })
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
        Cargando vista previa...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm text-slate-600">
          Vista previa del portal. Usá <strong>Editar</strong> en cada bloque o gestioná trámites abajo.
        </p>
        <div className="flex flex-wrap gap-2">
          <EditChip
            label="Editar portada"
            disabled={saving}
            onClick={() =>
              setEditor({
                kind: 'hero',
                draft: {
                  heroEyebrow: form.heroEyebrow,
                  heroTitle: form.heroTitle,
                  heroSubtitle: form.heroSubtitle,
                  heroImageUrl: form.heroImageUrl,
                  heroPrimaryLabel: form.heroPrimaryLabel,
                  heroPrimaryHref: form.heroPrimaryHref,
                  heroSecondaryLabel: form.heroSecondaryLabel,
                  heroSecondaryHref: form.heroSecondaryHref,
                },
              })
            }
          />
          <button
            type="button"
            onClick={onScrollToItems}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-800 transition hover:bg-sky-100"
          >
            Gestionar trámites
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/80">
        <div className="absolute right-3 top-3 z-20 flex flex-wrap justify-end gap-2 sm:right-4 sm:top-4">
          <EditChip
            label="Proceso y horarios"
            disabled={saving}
            onClick={() =>
              setEditor({
                kind: 'process',
                draft: {
                  stepsText: linesToText(form.steps),
                  scheduleText: linesToText(form.scheduleLines),
                },
              })
            }
          />
        </div>
        <ServicesPublicView content={previewContent} services={activeServices} previewMode />
        <div className="pointer-events-none absolute inset-x-0 bottom-[42%] z-20 flex justify-center px-4">
          <div className="pointer-events-auto flex flex-wrap justify-center gap-2">
            <EditChip
              label="Directorio"
              disabled={saving}
              onClick={() =>
                setEditor({
                  kind: 'procedures',
                  draft: {
                    proceduresEyebrow: form.proceduresEyebrow,
                    proceduresTitle: form.proceduresTitle,
                    categoriesText: linesToText(form.categories),
                  },
                })
              }
            />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-end px-4">
          <div className="pointer-events-auto flex gap-2">
            <EditChip
              label="Preguntas frecuentes"
              disabled={saving}
              onClick={() =>
                setEditor({
                  kind: 'faq',
                  index: null,
                  draft: { id: '', q: '', a: '' },
                })
              }
            />
            <EditChip
              label="Cierre"
              disabled={saving}
              onClick={() =>
                setEditor({
                  kind: 'cta',
                  draft: {
                    finalCtaTitle: form.finalCtaTitle,
                    finalCtaText: form.finalCtaText,
                    finalPrimaryLabel: form.finalPrimaryLabel,
                    finalPrimaryHref: form.finalPrimaryHref,
                    finalSecondaryLabel: form.finalSecondaryLabel,
                    finalSecondaryHref: form.finalSecondaryHref,
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      {Array.isArray(form.faq) && form.faq.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">FAQ (edición rápida)</p>
          <ul className="mt-3 space-y-2">
            {form.faq.map((item, index) => (
              <li
                key={item.id || index}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-800">{item.q || 'Sin pregunta'}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs font-semibold text-sky-700 hover:text-sky-900"
                    onClick={() => setEditor({ kind: 'faq', index, draft: { ...item } })}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold text-red-700 hover:text-red-900"
                    onClick={() => removeFaq(index)}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="sticky bottom-0 z-30 -mx-1 border-t border-slate-200/90 bg-white/95 px-1 py-3 backdrop-blur-md sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            disabled={!apiAvailable || saving}
            onClick={onSubmit}
            className={ACTION_BTN_PRIMARY}
          >
            {saving ? 'Guardando contenido…' : 'Guardar contenido de la página'}
          </button>
        </div>
      </div>

      <Modal
        open={Boolean(editor)}
        onClose={closeEditor}
        loading={saving}
        title={
          editor?.kind === 'hero'
            ? 'Portada'
            : editor?.kind === 'process'
              ? 'Proceso y horarios'
              : editor?.kind === 'procedures'
                ? 'Directorio de trámites'
                : editor?.kind === 'faq'
                  ? editor.index == null
                    ? 'Nueva pregunta frecuente'
                    : 'Editar pregunta'
                  : editor?.kind === 'cta'
                    ? 'Bloque final'
                    : 'Editar'
        }
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={closeEditor}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveEditor}
              className="rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
            >
              Aplicar
            </button>
          </div>
        }
      >
        {editor?.kind === 'hero' ? (
          <div className="grid gap-4">
            <label className={labelClass}>
              Antetítulo
              <input className={inputClass} value={editor.draft.heroEyebrow || ''} onChange={(e) => setDraftField('heroEyebrow', e.target.value)} disabled={saving} />
            </label>
            <label className={labelClass}>
              Título
              <input className={inputClass} value={editor.draft.heroTitle || ''} onChange={(e) => setDraftField('heroTitle', e.target.value)} disabled={saving} />
            </label>
            <label className={labelClass}>
              Subtítulo
              <textarea className={`${textareaClass} min-h-24`} value={editor.draft.heroSubtitle || ''} onChange={(e) => setDraftField('heroSubtitle', e.target.value)} disabled={saving} />
            </label>
            <SingleImageUploadField label="Imagen de portada" value={editor.draft.heroImageUrl || ''} onChange={(url) => setDraftField('heroImageUrl', url)} disabled={saving} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Botón principal (texto)
                <input className={inputClass} value={editor.draft.heroPrimaryLabel || ''} onChange={(e) => setDraftField('heroPrimaryLabel', e.target.value)} disabled={saving} />
              </label>
              <label className={labelClass}>
                Botón principal (enlace)
                <input className={inputClass} value={editor.draft.heroPrimaryHref || ''} onChange={(e) => setDraftField('heroPrimaryHref', e.target.value)} disabled={saving} placeholder="#tramites-disponibles" />
              </label>
              <label className={labelClass}>
                Botón secundario (texto)
                <input className={inputClass} value={editor.draft.heroSecondaryLabel || ''} onChange={(e) => setDraftField('heroSecondaryLabel', e.target.value)} disabled={saving} />
              </label>
              <label className={labelClass}>
                Botón secundario (ruta)
                <input className={inputClass} value={editor.draft.heroSecondaryHref || ''} onChange={(e) => setDraftField('heroSecondaryHref', e.target.value)} disabled={saving} placeholder="/atencion-ciudadano" />
              </label>
            </div>
          </div>
        ) : null}
        {editor?.kind === 'process' ? (
          <div className="grid gap-4">
            <label className={labelClass}>
              Pasos (uno por línea)
              <textarea className={`${textareaClass} min-h-32`} value={editor.draft.stepsText || ''} onChange={(e) => setDraftField('stepsText', e.target.value)} disabled={saving} />
            </label>
            <label className={labelClass}>
              Horarios y canales (uno por línea)
              <textarea className={`${textareaClass} min-h-24`} value={editor.draft.scheduleText || ''} onChange={(e) => setDraftField('scheduleText', e.target.value)} disabled={saving} />
            </label>
          </div>
        ) : null}
        {editor?.kind === 'procedures' ? (
          <div className="grid gap-4">
            <label className={labelClass}>
              Antetítulo del directorio
              <input className={inputClass} value={editor.draft.proceduresEyebrow || ''} onChange={(e) => setDraftField('proceduresEyebrow', e.target.value)} disabled={saving} />
            </label>
            <label className={labelClass}>
              Título del directorio
              <input className={inputClass} value={editor.draft.proceduresTitle || ''} onChange={(e) => setDraftField('proceduresTitle', e.target.value)} disabled={saving} />
            </label>
            <label className={labelClass}>
              Categorías de filtro (una por línea, sin &quot;Todos&quot;)
              <textarea className={`${textareaClass} min-h-24`} value={editor.draft.categoriesText || ''} onChange={(e) => setDraftField('categoriesText', e.target.value)} disabled={saving} />
            </label>
          </div>
        ) : null}
        {editor?.kind === 'faq' ? (
          <div className="grid gap-4">
            <label className={labelClass}>
              ID
              <input className={inputClass} value={editor.draft.id || ''} onChange={(e) => setDraftField('id', e.target.value)} disabled={saving} />
            </label>
            <label className={labelClass}>
              Pregunta
              <input className={inputClass} value={editor.draft.q || ''} onChange={(e) => setDraftField('q', e.target.value)} disabled={saving} />
            </label>
            <label className={labelClass}>
              Respuesta
              <textarea className={`${textareaClass} min-h-28`} value={editor.draft.a || ''} onChange={(e) => setDraftField('a', e.target.value)} disabled={saving} />
            </label>
          </div>
        ) : null}
        {editor?.kind === 'cta' ? (
          <div className="grid gap-4">
            <label className={labelClass}>
              Título
              <input className={inputClass} value={editor.draft.finalCtaTitle || ''} onChange={(e) => setDraftField('finalCtaTitle', e.target.value)} disabled={saving} />
            </label>
            <label className={labelClass}>
              Texto
              <textarea className={`${textareaClass} min-h-24`} value={editor.draft.finalCtaText || ''} onChange={(e) => setDraftField('finalCtaText', e.target.value)} disabled={saving} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Botón principal (texto)
                <input className={inputClass} value={editor.draft.finalPrimaryLabel || ''} onChange={(e) => setDraftField('finalPrimaryLabel', e.target.value)} disabled={saving} />
              </label>
              <label className={labelClass}>
                Botón principal (ruta)
                <input className={inputClass} value={editor.draft.finalPrimaryHref || ''} onChange={(e) => setDraftField('finalPrimaryHref', e.target.value)} disabled={saving} />
              </label>
              <label className={labelClass}>
                Botón secundario (texto)
                <input className={inputClass} value={editor.draft.finalSecondaryLabel || ''} onChange={(e) => setDraftField('finalSecondaryLabel', e.target.value)} disabled={saving} />
              </label>
              <label className={labelClass}>
                Botón secundario (ruta)
                <input className={inputClass} value={editor.draft.finalSecondaryHref || ''} onChange={(e) => setDraftField('finalSecondaryHref', e.target.value)} disabled={saving} />
              </label>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
