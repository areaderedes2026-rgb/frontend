import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '../ui/Modal.jsx'
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx'
import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { AdminFloatingSaveBar } from './AdminFloatingSaveBar.jsx'
import { HistoryHeroHeader } from '../history/HistoryHeroHeader.jsx'
import { HistoryDocumentarySection } from '../history/HistoryDocumentarySection.jsx'
import { HistoryStorySections } from '../history/HistoryStorySections.jsx'
import {
  createEmptyStorySectionDraft,
  HistoryStorySectionEditorForm,
} from './HistoryStorySectionEditorForm.jsx'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { ROUTES } from '../../utils/constants.js'
import {
  normalizeHistoryDocumentary,
  normalizeHistorySectionVisibility,
  normalizeHistoryStorySections,
} from '../../data/historyContent.js'

const ACTION_BTN_BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
const ACTION_BTN_NEUTRAL = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`

function Spinner({ tone = 'sky', size = 'sm' }) {
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

function PencilIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487 18.549 2.799a2.121 2.121 0 1 1 3 3L19.862 7.487m-3-3L6.34 14.99a4.5 4.5 0 0 0-1.113 1.81L4.5 19.5l2.7-.727a4.5 4.5 0 0 0 1.81-1.113l10.49-10.49m-3-3L19.5 7.5"
      />
    </svg>
  )
}

function PlusIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function TrashIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  )
}

function EditChip({ label = 'Editar', onClick, disabled = false, tone = 'neutral' }) {
  const base =
    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60'
  const styles =
    tone === 'overlay'
      ? 'border-white/30 bg-white/95 text-[#171b22] backdrop-blur hover:bg-white'
      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900'
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      <PencilIcon />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden sr-only">{label}</span>
    </button>
  )
}

function AddChip({ label = 'Agregar', onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <PlusIcon />
      <span>{label}</span>
    </button>
  )
}

function DeleteChip({ label = 'Quitar', onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <TrashIcon />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden sr-only">{label}</span>
    </button>
  )
}

function SectionVisibilityToggle({ visible, onChange, disabled = false }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
      <input
        type="checkbox"
        checked={visible !== false}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-3.5 w-3.5 rounded border-slate-300 text-sky-700"
      />
      Visible en el portal
    </label>
  )
}

function SectionCard({
  id,
  title,
  description,
  rightSlot,
  children,
  className = '',
  variant = 'card',
  visible = true,
  onToggleVisible,
  saving = false,
}) {
  const base =
    variant === 'plain'
      ? ''
      : 'rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-7'
  return (
    <section
      id={id}
      className={`scroll-mt-32 ${!visible ? 'opacity-75' : ''} ${base} ${className}`.trim()}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {title}
            </h2>
            {!visible ? (
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200">
                Oculta en el portal
              </span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {onToggleVisible ? (
            <SectionVisibilityToggle
              visible={visible}
              onChange={onToggleVisible}
              disabled={saving}
            />
          ) : null}
          {rightSlot ? <div>{rightSlot}</div> : null}
        </div>
      </div>
      {!visible ? (
        <p className="mt-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
          Esta sección no se muestra en el portal público. Podés seguir editándola y volver a activarla cuando quieras.
        </p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function EmptyHint({ children, onAdd, addLabel = 'Agregar' }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
      <p className="text-sm text-slate-600">{children}</p>
      {onAdd ? (
        <div className="mt-4 inline-flex">
          <AddChip label={addLabel} onClick={onAdd} />
        </div>
      ) : null}
    </div>
  )
}

const EMPTY_LEGACY = { title: '', text: '' }
const EMPTY_CHAPTER = { title: '', description: '', driveUrl: '', sortOrder: 0 }

export function AdminHistoryEditorPreview({
  form,
  setForm,
  loading,
  saving,
  error,
  places,
  hasChanges = false,
  onChangeCover,
  onSubmit,
  apiAvailable,
}) {
  const [editor, setEditor] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null)
  const [previewSearch, setPreviewSearch] = useState('')

  const sectionVisibility = normalizeHistorySectionVisibility(form.sectionVisibility)
  const documentary = normalizeHistoryDocumentary(form.documentary)
  const storySections = normalizeHistoryStorySections(form.storySections)

  function setSectionVisible(key, visible) {
    setForm((prev) => ({
      ...prev,
      sectionVisibility: {
        ...normalizeHistorySectionVisibility(prev.sectionVisibility),
        [key]: visible,
      },
    }))
  }

  function openEditor(kind, index = null, draft = null) {
    setEditor({ kind, index, draft })
  }
  function closeEditor() {
    if (saving) return
    setEditor(null)
  }
  function setDraftField(field, value) {
    setEditor((prev) =>
      prev ? { ...prev, draft: { ...(prev.draft || {}), [field]: value } } : prev,
    )
  }

  function applyIdentity(draft) {
    setForm((prev) => ({
      ...prev,
      heroBadge: String(draft.heroBadge || '').trim(),
      heroTitle: String(draft.heroTitle || '').trim(),
      heroSubtitle: String(draft.heroSubtitle || ''),
      heroSearchPlaceholder: String(draft.heroSearchPlaceholder || '').trim(),
      heroImageUrl: String(draft.heroImageUrl || '').trim(),
      ctaPrimaryLabel: String(draft.ctaPrimaryLabel || '').trim(),
      ctaPrimaryHref: String(draft.ctaPrimaryHref || '').trim(),
      ctaSecondaryLabel: String(draft.ctaSecondaryLabel || '').trim(),
      ctaSecondaryHref: String(draft.ctaSecondaryHref || '').trim(),
    }))
  }

  function applyClosing(draft) {
    setForm((prev) => ({
      ...prev,
      closingTitle: String(draft.closingTitle || '').trim(),
      closingText: String(draft.closingText || ''),
    }))
  }

  function upsertStorySection(index, draft) {
    setForm((prev) => {
      const list = Array.isArray(prev.storySections) ? [...prev.storySections] : []
      const paragraphs = (Array.isArray(draft.paragraphs) ? draft.paragraphs : [])
        .map((p) => String(p || '').trim())
        .filter(Boolean)
      const images = (Array.isArray(draft.images) ? draft.images : [])
        .map((image, imageIndex) => {
          const imageUrl = String(image?.imageUrl || '').trim()
          const caption = String(image?.caption || '').trim()
          if (!imageUrl && !caption) return null
          return {
            id: String(image?.id || '').trim() || `hist-img-${Date.now()}-${imageIndex}`,
            imageUrl,
            caption,
            sortOrder: Number.isFinite(Number(image?.sortOrder))
              ? Number(image.sortOrder)
              : (imageIndex + 1) * 10,
          }
        })
        .filter(Boolean)
      const item = {
        id: String(draft.id || '').trim() || `story-${Date.now()}`,
        title: String(draft.title || '').trim(),
        subtitle: String(draft.subtitle || '').trim(),
        paragraphs: paragraphs.length > 0 ? paragraphs : [],
        images,
        sortOrder: Number.isFinite(Number(draft.sortOrder))
          ? Number(draft.sortOrder)
          : (list.length + 1) * 10,
      }
      if (index === null || index === undefined) list.push(item)
      else list[index] = item
      list.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
      return { ...prev, storySections: list }
    })
  }

  function removeStorySection(index) {
    setForm((prev) => {
      const list = Array.isArray(prev.storySections) ? [...prev.storySections] : []
      list.splice(index, 1)
      return { ...prev, storySections: list }
    })
  }

  function nextStorySectionSortOrder() {
    const list = Array.isArray(form.storySections) ? form.storySections : []
    const max = list.reduce((acc, item) => Math.max(acc, Number(item?.sortOrder) || 0), 0)
    return max + 10
  }

  function upsertLegacy(index, draft) {
    setForm((prev) => {
      const list = Array.isArray(prev.legacyItems) ? [...prev.legacyItems] : []
      const item = {
        title: String(draft.title || '').trim(),
        text: String(draft.text || '').trim(),
      }
      if (index === null || index === undefined) list.push(item)
      else list[index] = item
      return { ...prev, legacyItems: list }
    })
  }

  function removeLegacy(index) {
    setForm((prev) => {
      const list = Array.isArray(prev.legacyItems) ? [...prev.legacyItems] : []
      list.splice(index, 1)
      return { ...prev, legacyItems: list }
    })
  }

  function applyDocumentaryMeta(draft) {
    setForm((prev) => ({
      ...prev,
      documentary: {
        ...(prev.documentary || {}),
        title: String(draft.title || '').trim(),
        description: String(draft.description || '').trim(),
        chapters: Array.isArray(prev.documentary?.chapters) ? prev.documentary.chapters : [],
      },
    }))
  }

  function upsertChapter(index, draft) {
    setForm((prev) => {
      const list = Array.isArray(prev.documentary?.chapters) ? [...prev.documentary.chapters] : []
      const item = {
        id: String(draft.id || '').trim() || `doc-ch-${Date.now()}`,
        title: String(draft.title || '').trim(),
        description: String(draft.description || '').trim(),
        driveUrl: String(draft.driveUrl || '').trim(),
        sortOrder: Number.isFinite(Number(draft.sortOrder)) ? Number(draft.sortOrder) : (list.length + 1) * 10,
      }
      if (index === null || index === undefined) list.push(item)
      else list[index] = item
      list.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
      return {
        ...prev,
        documentary: {
          ...(prev.documentary || {}),
          title: prev.documentary?.title || '',
          description: prev.documentary?.description || '',
          chapters: list,
        },
      }
    })
  }

  function removeChapter(index) {
    setForm((prev) => {
      const list = Array.isArray(prev.documentary?.chapters) ? [...prev.documentary.chapters] : []
      list.splice(index, 1)
      return {
        ...prev,
        documentary: {
          ...(prev.documentary || {}),
          title: prev.documentary?.title || '',
          description: prev.documentary?.description || '',
          chapters: list,
        },
      }
    })
  }

  function handleSaveEditor() {
    if (!editor) return
    const draft = editor.draft || {}
    switch (editor.kind) {
      case 'identity':
        applyIdentity(draft)
        break
      case 'storySection':
        upsertStorySection(editor.index, draft)
        break
      case 'legacy':
        upsertLegacy(editor.index, draft)
        break
      case 'closing':
        applyClosing(draft)
        break
      case 'documentaryMeta':
        applyDocumentaryMeta(draft)
        break
      case 'documentaryChapter':
        upsertChapter(editor.index, draft)
        break
      default:
        break
    }
    setEditor(null)
  }

  function handleConfirmRemove() {
    if (!confirmRemove) return
    if (confirmRemove.kind === 'legacy') removeLegacy(confirmRemove.index)
    if (confirmRemove.kind === 'storySection') removeStorySection(confirmRemove.index)
    if (confirmRemove.kind === 'documentaryChapter') removeChapter(confirmRemove.index)
    setConfirmRemove(null)
  }

  const editorTitle = useMemo(() => {
    if (!editor) return ''
    const labels = {
      identity: 'Editar portada y CTAs',
      storySection: editor.index === null ? 'Nueva sección narrativa' : 'Editar sección narrativa',
      legacy: editor.index === null ? 'Nueva tarjeta' : 'Editar tarjeta',
      closing: 'Editar bloque de cierre',
      documentaryMeta: 'Editar documental',
      documentaryChapter: editor.index === null ? 'Nuevo capítulo' : 'Editar capítulo',
    }
    return labels[editor.kind] || 'Editar'
  }, [editor])

  if (!apiAvailable) {
    return (
      <div className="admin-fade-up rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        Esta sección requiere conexión activa con el backend para guardar cambios.
        Configurá <code className="font-mono">VITE_API_URL</code> en el frontend para continuar.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin-fade-up overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="h-56 animate-pulse bg-slate-100 sm:h-64" />
        <div className="space-y-4 p-6">
          <div className="h-5 w-1/3 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
          <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const draft = editor?.draft || {}
  const previewPlaces = (places || []).slice(0, 8)
  const showFloatingSave = hasChanges && editor == null

  return (
    <>
      <ConfirmDialog
        open={confirmRemove != null}
        onClose={() => {
          if (!saving) setConfirmRemove(null)
        }}
        title={confirmRemove?.title || '¿Quitar elemento?'}
        description={confirmRemove?.description || 'Esta acción no se puede deshacer.'}
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        loading={false}
        onConfirm={handleConfirmRemove}
        variant="danger"
      />

      <Modal
        open={editor != null}
        onClose={closeEditor}
        loading={saving}
        size={
          editor?.kind === 'identity' ||
          editor?.kind === 'storySection' ||
          editor?.kind === 'documentaryMeta'
            ? 'wide'
            : 'default'
        }
        title={editorTitle}
        description="Los cambios quedarán pendientes hasta que toques «Guardar cambios» en el pie de la página."
      >
        <EditorBody
          editor={editor}
          draft={draft}
          setDraftField={setDraftField}
          saving={saving}
        />
        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeEditor}
            disabled={saving}
            className={ACTION_BTN_NEUTRAL}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveEditor}
            disabled={saving}
            className={ACTION_BTN_PRIMARY}
          >
            Aplicar al borrador
          </button>
        </div>
      </Modal>

      <div className="admin-fade-up space-y-5">
        {/* Toolbar superior */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">
            Tocá el lápiz de cada sección para editar.{' '}
            <span className="hidden sm:inline">
              Los cambios quedan en borrador hasta guardarlos.
            </span>
          </p>
          <button
            type="button"
            onClick={onChangeCover}
            disabled={saving}
            className={ACTION_BTN_NEUTRAL}
          >
            Cambiar portada
          </button>
        </div>

        {error ? (
          <p
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {/* Preview */}
        <article className="overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
          <div className="relative">
            <HistoryHeroHeader
              badge={form.heroBadge || ''}
              title={form.heroTitle || 'Sin título'}
              subtitle={form.heroSubtitle || ''}
              imageUrl={form.heroImageUrl || ''}
              searchPlaceholder={form.heroSearchPlaceholder || '¿Qué querés conocer de Trancas?'}
              searchQuery={previewSearch}
              onSearchChange={setPreviewSearch}
              primaryCta={
                form.ctaPrimaryLabel
                  ? { label: form.ctaPrimaryLabel, href: form.ctaPrimaryHref }
                  : null
              }
              secondaryCta={
                form.ctaSecondaryLabel
                  ? { label: form.ctaSecondaryLabel, href: form.ctaSecondaryHref }
                  : null
              }
              previewMode
            />
            <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
              <EditChip
                tone="overlay"
                label="Editar portada"
                onClick={() =>
                  openEditor('identity', null, {
                    heroBadge: form.heroBadge || '',
                    heroTitle: form.heroTitle || '',
                    heroSubtitle: form.heroSubtitle || '',
                    heroSearchPlaceholder: form.heroSearchPlaceholder || '',
                    heroImageUrl: form.heroImageUrl || '',
                    ctaPrimaryLabel: form.ctaPrimaryLabel || '',
                    ctaPrimaryHref: form.ctaPrimaryHref || '',
                    ctaSecondaryLabel: form.ctaSecondaryLabel || '',
                    ctaSecondaryHref: form.ctaSecondaryHref || '',
                  })
                }
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-10 p-5 sm:p-7 lg:p-10">
            {/* Secciones narrativas */}
            <SectionCard
              id="secciones-historia"
              title="Secciones de la historia"
              description="Capítulos ordenables con título, subtítulo, párrafos e imágenes (ej. inicios, ferrocarril, instituciones)."
              variant="plain"
              visible={sectionVisibility.storySections}
              onToggleVisible={(visible) => setSectionVisible('storySections', visible)}
              saving={saving}
              rightSlot={
                <AddChip
                  label="Agregar sección"
                  onClick={() =>
                    openEditor(
                      'storySection',
                      null,
                      createEmptyStorySectionDraft(nextStorySectionSortOrder()),
                    )
                  }
                  disabled={saving}
                />
              }
            >
              {storySections.length === 0 ? (
                <EmptyHint
                  onAdd={() =>
                    openEditor(
                      'storySection',
                      null,
                      createEmptyStorySectionDraft(nextStorySectionSortOrder()),
                    )
                  }
                  addLabel="Agregar sección"
                >
                  Todavía no hay secciones narrativas. Creá la primera para contar la historia por etapas.
                </EmptyHint>
              ) : (
                <>
                  <HistoryStorySections sections={storySections} previewMode />
                  <ul className="mt-6 space-y-2 border-t border-[#ddd7ca] pt-5">
                    {storySections.map((section, idx) => (
                      <li
                        key={section.id || `story-admin-${idx}`}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {section.title}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            Orden {section.sortOrder} · {section.paragraphs?.length || 0} párrafo(s)
                            · {section.images?.length || 0} imagen(es)
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <EditChip
                            label="Editar"
                            onClick={() => {
                              const formSection = (form.storySections || [])[idx] || section
                              openEditor('storySection', idx, {
                                ...formSection,
                                paragraphs:
                                  formSection.paragraphs?.length > 0
                                    ? [...formSection.paragraphs]
                                    : [''],
                                images: (formSection.images || []).map((image) => ({ ...image })),
                              })
                            }}
                            disabled={saving}
                          />
                          <DeleteChip
                            label="Quitar"
                            onClick={() =>
                              setConfirmRemove({
                                kind: 'storySection',
                                index: idx,
                                title: '¿Quitar esta sección?',
                                description: (
                                  <>
                                    Vas a quitar{' '}
                                    <span className="font-semibold">
                                      «{section.title || 'sin título'}»
                                    </span>{' '}
                                    del borrador.
                                  </>
                                ),
                              })
                            }
                            disabled={saving}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </SectionCard>

            {/* Tarjetas introductorias */}
            <SectionCard
              id="tarjetas-historia"
              title="Tarjetas introductorias"
              description="Tres bloques cortos que resumen valores o pilares de la historia local."
              variant="plain"
              visible={sectionVisibility.legacyCards}
              onToggleVisible={(visible) => setSectionVisible('legacyCards', visible)}
              saving={saving}
              rightSlot={
                <AddChip
                  label="Agregar tarjeta"
                  onClick={() => openEditor('legacy', null, { ...EMPTY_LEGACY })}
                  disabled={saving}
                />
              }
            >
              {(form.legacyItems || []).length === 0 ? (
                <EmptyHint
                  onAdd={() => openEditor('legacy', null, { ...EMPTY_LEGACY })}
                  addLabel="Agregar tarjeta"
                >
                  Aún no hay tarjetas cargadas. Sumá la primera para que aparezca debajo del resumen.
                </EmptyHint>
              ) : (
                <ul className="grid gap-5 lg:grid-cols-3">
                  {form.legacyItems.map((item, idx) => (
                    <li key={`legacy-${idx}`}>
                      <article className="relative h-full rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200/80">
                        <div className="absolute right-3 top-3 flex gap-1.5">
                          <EditChip
                            label="Editar"
                            onClick={() => openEditor('legacy', idx, { ...item })}
                            disabled={saving}
                          />
                          <DeleteChip
                            label="Quitar"
                            onClick={() =>
                              setConfirmRemove({
                                kind: 'legacy',
                                index: idx,
                                title: '¿Quitar esta tarjeta?',
                                description: (
                                  <>
                                    Vas a quitar{' '}
                                    <span className="font-semibold">
                                      «{item.title || 'sin título'}»
                                    </span>{' '}
                                    del borrador.
                                  </>
                                ),
                              })
                            }
                            disabled={saving}
                          />
                        </div>
                        <h3 className="pr-24 text-lg font-bold tracking-tight text-[#171b22]">
                          {item.title || 'Sin título'}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#4b505a]">
                          {item.text || (
                            <span className="italic text-slate-400">(Sin texto)</span>
                          )}
                        </p>
                      </article>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              id="documental-historia-admin"
              title="Documental"
              description="Nombre del documental, descripción general y capítulos con enlace a Google Drive."
              variant="plain"
              visible={sectionVisibility.documentary}
              onToggleVisible={(visible) => setSectionVisible('documentary', visible)}
              saving={saving}
              rightSlot={
                <div className="flex flex-wrap gap-2">
                  <EditChip
                    label="Editar documental"
                    onClick={() =>
                      openEditor('documentaryMeta', null, {
                        title: form.documentary?.title || '',
                        description: form.documentary?.description || '',
                      })
                    }
                    disabled={saving}
                  />
                  <AddChip
                    label="Agregar capítulo"
                    onClick={() => openEditor('documentaryChapter', null, { ...EMPTY_CHAPTER })}
                    disabled={saving}
                  />
                </div>
              }
            >
              <div className="relative rounded-3xl border border-[#ddd7ca] bg-[#f8f7f3] p-5 sm:p-7">
                {documentary.chapters.length > 0 ? (
                  <>
                    <HistoryDocumentarySection documentary={documentary} previewMode />
                    <ul className="mt-6 space-y-2 border-t border-[#ddd7ca] pt-5">
                      {documentary.chapters.map((chapter, idx) => (
                        <li
                          key={chapter.id || `admin-ch-${idx}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {chapter.title}
                            </p>
                            {chapter.driveUrl ? (
                              <p className="truncate text-xs text-sky-800">{chapter.driveUrl}</p>
                            ) : (
                              <p className="text-xs italic text-slate-500">Sin enlace a Drive</p>
                            )}
                          </div>
                          <div className="flex shrink-0 gap-1.5">
                            <EditChip
                              label="Editar"
                              onClick={() => openEditor('documentaryChapter', idx, { ...chapter })}
                              disabled={saving}
                            />
                            <DeleteChip
                              label="Quitar"
                              onClick={() =>
                                setConfirmRemove({
                                  kind: 'documentaryChapter',
                                  index: idx,
                                  title: '¿Quitar este capítulo?',
                                  description: (
                                    <>
                                      Vas a quitar{' '}
                                      <span className="font-semibold">
                                        «{chapter.title || 'sin título'}»
                                      </span>{' '}
                                      del borrador.
                                    </>
                                  ),
                                })
                              }
                              disabled={saving}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    {documentary.title || documentary.description ? (
                      <header className="mb-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-800">
                          Documental
                        </p>
                        {documentary.title ? (
                          <h3 className="mt-2 font-serif text-xl font-bold text-[#171b22]">
                            {documentary.title}
                          </h3>
                        ) : null}
                        {documentary.description ? (
                          <p className="mt-2 text-sm leading-relaxed text-[#4b505a]">
                            {documentary.description}
                          </p>
                        ) : null}
                      </header>
                    ) : null}
                    <EmptyHint
                      onAdd={() => openEditor('documentaryChapter', null, { ...EMPTY_CHAPTER })}
                      addLabel="Agregar capítulo"
                    >
                      Todavía no hay capítulos. Sumá el primero con título, descripción y enlace al video en Drive.
                    </EmptyHint>
                  </>
                )}
              </div>
            </SectionCard>

            {/* Turismo histórico (link a otra sección admin) */}
            <SectionCard
              id="turismo-historia"
              title="Turismo histórico"
              description="Los lugares se administran en una sección dedicada con tarjetas y modales propios."
              rightSlot={
                <Link
                  to={ROUTES.adminTourismPlaces}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-100"
                >
                  Administrar lugares
                  <span aria-hidden>→</span>
                </Link>
              }
            >
              {previewPlaces.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center text-sm text-slate-600">
                  Todavía no hay lugares cargados.{' '}
                  <Link
                    to={ROUTES.adminTourismPlaces}
                    className="font-semibold text-sky-800 hover:text-sky-900"
                  >
                    Cargar el primero
                  </Link>
                  .
                </div>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {previewPlaces.map((place) => (
                    <li
                      key={place.id}
                      className="overflow-hidden rounded-2xl border border-[#ddd7ca] bg-white shadow-sm"
                    >
                      <div className="aspect-16/10 w-full overflow-hidden bg-slate-100">
                        {place.imageUrl ? (
                          <img
                            src={resolveMediaUrl(place.imageUrl)}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-700 to-sky-900 text-xs font-semibold uppercase tracking-wide text-white/60">
                            Sin imagen
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="truncate font-semibold text-slate-900">
                          {place.name || 'Sin nombre'}
                        </p>
                        {place.category ? (
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {place.category}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-slate-500">
                {(places || []).length > 0
                  ? `${(places || []).length} lugares cargados en total.`
                  : null}
              </p>
            </SectionCard>

            {/* Cierre */}
            <SectionCard
              id="cierre-historia"
              title="Bloque de cierre"
              description="Mensaje final con un título y un texto descriptivo."
              variant="plain"
              visible={sectionVisibility.closing}
              onToggleVisible={(visible) => setSectionVisible('closing', visible)}
              saving={saving}
              rightSlot={
                <EditChip
                  label="Editar"
                  onClick={() =>
                    openEditor('closing', null, {
                      closingTitle: form.closingTitle || '',
                      closingText: form.closingText || '',
                    })
                  }
                  disabled={saving}
                />
              }
            >
              <div className="rounded-3xl border border-[#ddd7ca] bg-[#f8f7f3] p-6 sm:p-7">
                <h3 className="text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                  {form.closingTitle || (
                    <span className="italic text-slate-400">(Sin título de cierre)</span>
                  )}
                </h3>
                <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-[#4b505a] sm:text-base">
                  {form.closingText || (
                    <span className="italic text-slate-400">(Sin texto de cierre)</span>
                  )}
                </p>
              </div>
            </SectionCard>
          </div>
        </article>

        <AdminFloatingSaveBar
          open={showFloatingSave}
          saving={saving}
          disabled={loading}
          saveLabel="Guardar cambios de Historia"
          savingContent={
            <>
              <Spinner tone="white" size="sm" />
              Guardando…
            </>
          }
          onSave={onSubmit}
        />
      </div>
    </>
  )
}

function EditorBody({ editor, draft, setDraftField, saving }) {
  if (!editor) return null
  switch (editor.kind) {
    case 'identity':
      return <IdentityForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'storySection':
      return (
        <HistoryStorySectionEditorForm
          draft={draft}
          setDraftField={setDraftField}
          saving={saving}
        />
      )
    case 'legacy':
      return <LegacyForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'closing':
      return <ClosingForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'documentaryMeta':
      return <DocumentaryMetaForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'documentaryChapter':
      return <DocumentaryChapterForm draft={draft} setDraftField={setDraftField} saving={saving} />
    default:
      return null
  }
}

function IdentityForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        Etiqueta superior (eyebrow)
        <input
          className={inputClass}
          value={draft.heroBadge || ''}
          onChange={(e) => setDraftField('heroBadge', e.target.value)}
          disabled={saving}
          placeholder="Ej. Identidad tucumana"
        />
      </label>
      <label className={labelClass}>
        Título principal
        <input
          className={inputClass}
          value={draft.heroTitle || ''}
          onChange={(e) => setDraftField('heroTitle', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Subtítulo
        <textarea
          className={`${textareaClass} min-h-24`}
          value={draft.heroSubtitle || ''}
          onChange={(e) => setDraftField('heroSubtitle', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Placeholder del buscador
        <input
          className={inputClass}
          value={draft.heroSearchPlaceholder || ''}
          onChange={(e) => setDraftField('heroSearchPlaceholder', e.target.value)}
          disabled={saving}
          placeholder="¿Qué querés conocer de Trancas?"
        />
      </label>
      <div className="sm:col-span-2">
        <SingleImageUploadField
          label="Imagen de portada"
          helpText="Se usa como fondo del hero principal."
          value={draft.heroImageUrl || ''}
          onChange={(value) => setDraftField('heroImageUrl', value)}
          kind="cover"
          disabled={saving}
        />
      </div>
      <fieldset className="sm:col-span-2 grid gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 sm:grid-cols-2">
        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-600">
          Botón principal
        </legend>
        <label className={labelClass}>
          Texto
          <input
            className={inputClass}
            value={draft.ctaPrimaryLabel || ''}
            onChange={(e) => setDraftField('ctaPrimaryLabel', e.target.value)}
            disabled={saving}
            placeholder="Ej. Leer la historia"
          />
        </label>
        <label className={labelClass}>
          Enlace
          <input
            className={inputClass}
            value={draft.ctaPrimaryHref || ''}
            onChange={(e) => setDraftField('ctaPrimaryHref', e.target.value)}
            disabled={saving}
            placeholder="#historia-secciones"
          />
        </label>
      </fieldset>
      <fieldset className="sm:col-span-2 grid gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 sm:grid-cols-2">
        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-600">
          Botón secundario
        </legend>
        <label className={labelClass}>
          Texto
          <input
            className={inputClass}
            value={draft.ctaSecondaryLabel || ''}
            onChange={(e) => setDraftField('ctaSecondaryLabel', e.target.value)}
            disabled={saving}
            placeholder="Ej. Puntos turísticos"
          />
        </label>
        <label className={labelClass}>
          Enlace
          <input
            className={inputClass}
            value={draft.ctaSecondaryHref || ''}
            onChange={(e) => setDraftField('ctaSecondaryHref', e.target.value)}
            disabled={saving}
            placeholder="/turismo"
          />
        </label>
      </fieldset>
    </div>
  )
}

function LegacyForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-3">
      <label className={labelClass}>
        Título
        <input
          className={inputClass}
          value={draft.title || ''}
          onChange={(e) => setDraftField('title', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Texto
        <textarea
          className={`${textareaClass} min-h-28`}
          value={draft.text || ''}
          onChange={(e) => setDraftField('text', e.target.value)}
          disabled={saving}
        />
      </label>
    </div>
  )
}

function ClosingForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-3">
      <label className={labelClass}>
        Título de cierre
        <input
          className={inputClass}
          value={draft.closingTitle || ''}
          onChange={(e) => setDraftField('closingTitle', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Texto de cierre
        <textarea
          className={`${textareaClass} min-h-32`}
          value={draft.closingText || ''}
          onChange={(e) => setDraftField('closingText', e.target.value)}
          disabled={saving}
        />
      </label>
    </div>
  )
}

function DocumentaryMetaForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-3">
      <label className={labelClass}>
        Nombre del documental
        <input
          className={inputClass}
          value={draft.title || ''}
          onChange={(e) => setDraftField('title', e.target.value)}
          disabled={saving}
          placeholder="Ej. Documental: Memoria de Trancas"
        />
      </label>
      <label className={labelClass}>
        Descripción del documental
        <textarea
          className={`${textareaClass} min-h-32`}
          value={draft.description || ''}
          onChange={(e) => setDraftField('description', e.target.value)}
          disabled={saving}
          placeholder="Breve presentación de la serie audiovisual."
        />
      </label>
    </div>
  )
}

function DocumentaryChapterForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-3">
      <label className={labelClass}>
        Título del capítulo
        <input
          className={inputClass}
          value={draft.title || ''}
          onChange={(e) => setDraftField('title', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Descripción breve
        <textarea
          className={`${textareaClass} min-h-28`}
          value={draft.description || ''}
          onChange={(e) => setDraftField('description', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Enlace a Google Drive
        <input
          className={inputClass}
          type="url"
          value={draft.driveUrl || ''}
          onChange={(e) => setDraftField('driveUrl', e.target.value)}
          disabled={saving}
          placeholder="https://drive.google.com/..."
        />
        <span className="mt-1 text-xs text-slate-500">
          URL pública del video. Se abrirá en una pestaña nueva.
        </span>
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
  )
}
