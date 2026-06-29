import { useMemo, useState } from 'react'
import { Modal } from '../ui/Modal.jsx'
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx'
import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import {
  MunicipalServiceCard,
  MunicipalServiceDetailModal,
} from '../services/MunicipalServiceDirectory.jsx'
import { normalizeMunicipalService } from '../../data/servicesPageContent.js'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { ROUTES } from '../../utils/constants.js'

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
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487 18.549 2.799a2.121 2.121 0 1 1 3 3L19.862 7.487m-3-3L6.34 14.99a4.5 4.5 0 0 0-1.113 1.81L4.5 19.5l2.7-.727a4.5 4.5 0 0 0 1.81-1.113l10.49-10.49m-3-3L19.5 7.5" />
    </svg>
  )
}

function PlusIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function TrashIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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

function SectionCard({ id, title, description, rightSlot, children, variant = 'plain' }) {
  const base =
    variant === 'card'
      ? 'rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-7'
      : ''
  return (
    <section id={id} className={`scroll-mt-32 ${base}`.trim()}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
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

function ServiceBadge({ children }) {
  return (
    <span className="inline-flex rounded-full border border-[#d8d5cd] bg-[#f8f7f3] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#3e434d]">
      {children}
    </span>
  )
}

export function AdminServicesEditorPreview({
  form,
  setForm,
  services = [],
  servicesLoading = false,
  servicesError = '',
  loading,
  saving,
  error,
  onSubmit,
  onChangeCover,
  apiAvailable,
  onAddService,
  onEditService,
  onDeleteService,
}) {
  const [editor, setEditor] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null)
  const [previewService, setPreviewService] = useState(null)

  const heroUrl = (form.heroImageUrl || '').trim()
    ? resolveMediaUrl(form.heroImageUrl) || form.heroImageUrl
    : ''

  const sortedServices = useMemo(
    () =>
      [...services]
        .map((item, index) => normalizeMunicipalService(item, index + 1))
        .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)),
    [services],
  )

  const categoryOptions = useMemo(
    () => (form.categories || []).filter((c) => String(c || '').trim()),
    [form.categories],
  )

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

  function handleSaveEditor() {
    if (!editor) return
    const { kind, index, draft } = editor
    switch (kind) {
      case 'identity':
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
        break
      case 'step': {
        const text = String(draft.text || '').trim()
        if (!text) break
        setForm((prev) => {
          const list = [...(prev.steps || [])]
          if (index === null || index === undefined) list.push(text)
          else list[index] = text
          return { ...prev, steps: list }
        })
        break
      }
      case 'scheduleLine': {
        const text = String(draft.text || '').trim()
        if (!text) break
        setForm((prev) => {
          const list = [...(prev.scheduleLines || [])]
          if (index === null || index === undefined) list.push(text)
          else list[index] = text
          return { ...prev, scheduleLines: list }
        })
        break
      }
      case 'proceduresMeta':
        setForm((prev) => ({
          ...prev,
          proceduresEyebrow: String(draft.proceduresEyebrow || '').trim(),
          proceduresTitle: String(draft.proceduresTitle || '').trim(),
        }))
        break
      case 'category': {
        const value = String(draft.name || '').trim()
        if (!value) break
        setForm((prev) => {
          const list = [...(prev.categories || [])]
          if (index === null || index === undefined) {
            if (!list.includes(value)) list.push(value)
          } else {
            list[index] = value
            return {
              ...prev,
              categories: list,
            }
          }
          return { ...prev, categories: list }
        })
        break
      }
      case 'faq': {
        const item = {
          id: String(draft.id || '').trim() || `faq-${Date.now()}`,
          q: String(draft.q || '').trim(),
          a: String(draft.a || '').trim(),
        }
        if (!item.q && !item.a) break
        setForm((prev) => {
          const list = [...(prev.faq || [])]
          if (index === null || index === undefined) list.push(item)
          else list[index] = item
          return { ...prev, faq: list }
        })
        break
      }
      case 'cta':
        setForm((prev) => ({
          ...prev,
          finalCtaTitle: String(draft.finalCtaTitle || '').trim(),
          finalCtaText: String(draft.finalCtaText || ''),
          finalPrimaryLabel: String(draft.finalPrimaryLabel || '').trim(),
          finalPrimaryHref: String(draft.finalPrimaryHref || '').trim(),
          finalSecondaryLabel: String(draft.finalSecondaryLabel || '').trim(),
          finalSecondaryHref: String(draft.finalSecondaryHref || '').trim(),
        }))
        break
      default:
        break
    }
    closeEditor()
  }

  function handleConfirmRemove() {
    if (!confirmRemove) return
    const { kind, index } = confirmRemove
    setForm((prev) => {
      switch (kind) {
        case 'step':
          return { ...prev, steps: (prev.steps || []).filter((_, i) => i !== index) }
        case 'scheduleLine':
          return {
            ...prev,
            scheduleLines: (prev.scheduleLines || []).filter((_, i) => i !== index),
          }
        case 'category':
          return {
            ...prev,
            categories: (prev.categories || []).filter((_, i) => i !== index),
          }
        case 'faq':
          return { ...prev, faq: (prev.faq || []).filter((_, i) => i !== index) }
        default:
          return prev
      }
    })
    setConfirmRemove(null)
  }

  const editorTitle = useMemo(() => {
    if (!editor) return ''
    switch (editor.kind) {
      case 'identity':
        return 'Editar portada'
      case 'step':
        return editor.index == null ? 'Agregar paso' : 'Editar paso'
      case 'scheduleLine':
        return editor.index == null ? 'Agregar horario o canal' : 'Editar horario o canal'
      case 'proceduresMeta':
        return 'Editar títulos del directorio'
      case 'category':
        return editor.index == null ? 'Nueva categoría' : 'Editar categoría'
      case 'faq':
        return editor.index == null ? 'Nueva pregunta frecuente' : 'Editar pregunta'
      case 'cta':
        return 'Editar bloque de cierre'
      default:
        return 'Editar'
    }
  }, [editor])

  const draft = editor?.draft || null

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 rounded-2xl border border-slate-200/70 bg-white shadow-sm" />
        <div className="h-72 rounded-3xl border border-[#ddd7ca] bg-slate-100" />
        <div className="h-48 rounded-3xl border border-[#ddd7ca] bg-slate-100" />
      </div>
    )
  }

  return (
    <>
      <MunicipalServiceDetailModal
        open={Boolean(previewService)}
        service={previewService}
        onClose={() => setPreviewService(null)}
      />
      <ConfirmDialog
        open={confirmRemove != null}
        onClose={() => setConfirmRemove(null)}
        title={confirmRemove?.title || '¿Quitar este elemento?'}
        description={confirmRemove?.description}
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        loading={false}
        variant="danger"
        onConfirm={handleConfirmRemove}
      />

      <Modal
        open={editor != null}
        onClose={closeEditor}
        loading={saving}
        size={editor?.kind === 'identity' ? 'wide' : 'default'}
        title={editorTitle}
        description="Los cambios quedan en borrador hasta que toques «Guardar cambios» en la barra superior."
      >
        {editor?.kind === 'identity' ? (
          <div className="grid gap-4">
            <label className={labelClass}>
              Antetítulo
              <input className={inputClass} value={draft?.heroEyebrow || ''} onChange={(e) => setDraftField('heroEyebrow', e.target.value)} disabled={saving} />
            </label>
            <label className={labelClass}>
              Título
              <input className={inputClass} value={draft?.heroTitle || ''} onChange={(e) => setDraftField('heroTitle', e.target.value)} disabled={saving} />
            </label>
            <label className={labelClass}>
              Subtítulo
              <textarea className={`${textareaClass} min-h-24`} value={draft?.heroSubtitle || ''} onChange={(e) => setDraftField('heroSubtitle', e.target.value)} disabled={saving} />
            </label>
            <SingleImageUploadField label="Imagen de portada" value={draft?.heroImageUrl || ''} onChange={(url) => setDraftField('heroImageUrl', url)} disabled={saving} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Botón principal (texto)
                <input className={inputClass} value={draft?.heroPrimaryLabel || ''} onChange={(e) => setDraftField('heroPrimaryLabel', e.target.value)} disabled={saving} />
              </label>
              <label className={labelClass}>
                Botón principal (enlace)
                <input className={inputClass} value={draft?.heroPrimaryHref || ''} onChange={(e) => setDraftField('heroPrimaryHref', e.target.value)} disabled={saving} placeholder="#tramites-disponibles" />
              </label>
              <label className={labelClass}>
                Botón secundario (texto)
                <input className={inputClass} value={draft?.heroSecondaryLabel || ''} onChange={(e) => setDraftField('heroSecondaryLabel', e.target.value)} disabled={saving} />
              </label>
              <label className={labelClass}>
                Botón secundario (ruta)
                <input className={inputClass} value={draft?.heroSecondaryHref || ''} onChange={(e) => setDraftField('heroSecondaryHref', e.target.value)} disabled={saving} placeholder={ROUTES.atencionCiudadano} />
              </label>
            </div>
          </div>
        ) : null}
        {editor?.kind === 'step' || editor?.kind === 'scheduleLine' ? (
          <label className={labelClass}>
            {editor.kind === 'step' ? 'Texto del paso' : 'Línea de horario o canal'}
            <textarea className={`${textareaClass} min-h-24`} value={draft?.text || ''} onChange={(e) => setDraftField('text', e.target.value)} disabled={saving} />
          </label>
        ) : null}
        {editor?.kind === 'proceduresMeta' ? (
          <div className="grid gap-4">
            <label className={labelClass}>
              Antetítulo
              <input className={inputClass} value={draft?.proceduresEyebrow || ''} onChange={(e) => setDraftField('proceduresEyebrow', e.target.value)} disabled={saving} />
            </label>
            <label className={labelClass}>
              Título
              <input className={inputClass} value={draft?.proceduresTitle || ''} onChange={(e) => setDraftField('proceduresTitle', e.target.value)} disabled={saving} />
            </label>
          </div>
        ) : null}
        {editor?.kind === 'category' ? (
          <label className={labelClass}>
            Nombre de la categoría
            <input className={inputClass} value={draft?.name || ''} onChange={(e) => setDraftField('name', e.target.value)} disabled={saving} />
          </label>
        ) : null}
        {editor?.kind === 'faq' ? (
          <div className="grid gap-4">
            <label className={labelClass}>
              ID interno
              <input className={inputClass} value={draft?.id || ''} onChange={(e) => setDraftField('id', e.target.value)} disabled={saving} />
            </label>
            <label className={labelClass}>
              Pregunta
              <input className={inputClass} value={draft?.q || ''} onChange={(e) => setDraftField('q', e.target.value)} disabled={saving} />
            </label>
            <label className={labelClass}>
              Respuesta
              <textarea className={`${textareaClass} min-h-28`} value={draft?.a || ''} onChange={(e) => setDraftField('a', e.target.value)} disabled={saving} />
            </label>
          </div>
        ) : null}
        {editor?.kind === 'cta' ? (
          <div className="grid gap-4">
            <label className={labelClass}>
              Título
              <input className={inputClass} value={draft?.finalCtaTitle || ''} onChange={(e) => setDraftField('finalCtaTitle', e.target.value)} disabled={saving} />
            </label>
            <label className={labelClass}>
              Texto
              <textarea className={`${textareaClass} min-h-24`} value={draft?.finalCtaText || ''} onChange={(e) => setDraftField('finalCtaText', e.target.value)} disabled={saving} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Botón principal (texto)
                <input className={inputClass} value={draft?.finalPrimaryLabel || ''} onChange={(e) => setDraftField('finalPrimaryLabel', e.target.value)} disabled={saving} />
              </label>
              <label className={labelClass}>
                Botón principal (ruta)
                <input className={inputClass} value={draft?.finalPrimaryHref || ''} onChange={(e) => setDraftField('finalPrimaryHref', e.target.value)} disabled={saving} />
              </label>
              <label className={labelClass}>
                Botón secundario (texto)
                <input className={inputClass} value={draft?.finalSecondaryLabel || ''} onChange={(e) => setDraftField('finalSecondaryLabel', e.target.value)} disabled={saving} />
              </label>
              <label className={labelClass}>
                Botón secundario (ruta)
                <input className={inputClass} value={draft?.finalSecondaryHref || ''} onChange={(e) => setDraftField('finalSecondaryHref', e.target.value)} disabled={saving} />
              </label>
            </div>
          </div>
        ) : null}
        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={closeEditor} disabled={saving} className={ACTION_BTN_NEUTRAL}>
            Cancelar
          </button>
          <button type="button" onClick={handleSaveEditor} disabled={saving} className={ACTION_BTN_PRIMARY}>
            Aplicar al borrador
          </button>
        </div>
      </Modal>

      <div className="admin-fade-up space-y-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">
            Tocá el lápiz de cada bloque para editarlo. Los trámites se guardan al instante; el resto con{' '}
            <strong>Guardar cambios</strong>.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onChangeCover} disabled={saving || !apiAvailable} className={ACTION_BTN_NEUTRAL}>
              Cambiar portada
            </button>
            <button type="button" onClick={onSubmit} disabled={saving || !apiAvailable} className={ACTION_BTN_PRIMARY}>
              {saving ? (
                <>
                  <Spinner tone="white" size="sm" />
                  Guardando…
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}

        <article className="overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
          {/* Portada */}
          <header className="relative overflow-hidden border-b border-white/10 bg-[#171b22]">
            {heroUrl ? (
              <img src={heroUrl} alt="" className="h-56 w-full object-cover object-center sm:h-64 lg:h-72" />
            ) : (
              <div className="flex h-56 w-full items-center justify-center bg-linear-to-br from-slate-700 to-slate-900 text-sm text-slate-300 sm:h-64 lg:h-72">
                Sin imagen de portada
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/75 to-slate-900/35" />
            <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
              <EditChip
                tone="overlay"
                label="Editar portada"
                onClick={() =>
                  openEditor('identity', null, {
                    heroEyebrow: form.heroEyebrow,
                    heroTitle: form.heroTitle,
                    heroSubtitle: form.heroSubtitle,
                    heroImageUrl: form.heroImageUrl,
                    heroPrimaryLabel: form.heroPrimaryLabel,
                    heroPrimaryHref: form.heroPrimaryHref,
                    heroSecondaryLabel: form.heroSecondaryLabel,
                    heroSecondaryHref: form.heroSecondaryHref,
                  })
                }
                disabled={saving}
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-8">
              {form.heroEyebrow ? (
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-200">{form.heroEyebrow}</p>
              ) : null}
              <h1 className="mt-2 max-w-4xl font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {form.heroTitle || 'Servicios al vecino'}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-100 sm:text-base">
                {form.heroSubtitle || <span className="italic text-slate-400">(Sin subtítulo)</span>}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="inline-flex min-h-11 items-center rounded-xl bg-[#171b22] px-5 text-sm font-semibold text-white">
                  {form.heroPrimaryLabel || 'Ver trámites'}
                </span>
                <span className="inline-flex min-h-11 items-center rounded-xl border border-white/40 bg-white/10 px-5 text-sm font-semibold text-white">
                  {form.heroSecondaryLabel || 'Atención al ciudadano'}
                </span>
              </div>
            </div>
          </header>

          <div className="space-y-10 p-5 sm:p-7 lg:p-10">
            {/* Proceso y horarios */}
            <SectionCard
              id="proceso-gestion"
              title="Cómo iniciar tu gestión"
              description="Pasos y horarios que ven los vecinos antes del directorio de trámites."
            >
              <article className="overflow-hidden rounded-2xl border border-[#ddd7ca] bg-white shadow-sm">
                <div className="grid gap-0 lg:grid-cols-12">
                  <div className="border-b border-[#ddd7ca] p-5 lg:col-span-8 lg:border-b-0 lg:border-r sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-slate-900">Pasos del proceso</h3>
                      <AddChip
                        label="Agregar paso"
                        disabled={saving}
                        onClick={() => openEditor('step', null, { text: '' })}
                      />
                    </div>
                    {(form.steps || []).length === 0 ? (
                      <EmptyHint onAdd={() => openEditor('step', null, { text: '' })} addLabel="Agregar paso">
                        Todavía no hay pasos cargados.
                      </EmptyHint>
                    ) : (
                      <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                        {(form.steps || []).map((step, idx) => (
                          <li
                            key={`step-${idx}`}
                            className="group relative rounded-xl border border-[#ddd7ca] bg-[#f8f7f3] p-4 pr-20"
                          >
                            <div className="absolute right-2 top-2 flex gap-1">
                              <button
                                type="button"
                                title="Editar paso"
                                disabled={saving}
                                onClick={() => openEditor('step', idx, { text: step })}
                                className="rounded-md p-1 text-sky-800 hover:bg-sky-100 disabled:opacity-60"
                              >
                                <PencilIcon />
                              </button>
                              <button
                                type="button"
                                title="Quitar paso"
                                disabled={saving}
                                onClick={() =>
                                  setConfirmRemove({
                                    kind: 'step',
                                    index: idx,
                                    title: '¿Quitar este paso?',
                                    description: `Se eliminará el paso ${idx + 1} del borrador.`,
                                  })
                                }
                                className="rounded-md p-1 text-red-700 hover:bg-red-100 disabled:opacity-60"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Paso {idx + 1}</p>
                            <p className="mt-1 text-sm leading-relaxed text-[#3e434d]">{step}</p>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                  <aside className="p-5 sm:p-6 lg:col-span-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-sky-800">
                        Horarios y canales
                      </h3>
                      <AddChip
                        label="Agregar"
                        disabled={saving}
                        onClick={() => openEditor('scheduleLine', null, { text: '' })}
                      />
                    </div>
                    {(form.scheduleLines || []).length === 0 ? (
                      <EmptyHint
                        onAdd={() => openEditor('scheduleLine', null, { text: '' })}
                        addLabel="Agregar línea"
                      >
                        Sin horarios cargados.
                      </EmptyHint>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {(form.scheduleLines || []).map((line, idx) => (
                          <li
                            key={`sched-${idx}`}
                            className="group flex items-start justify-between gap-2 rounded-lg border border-[#ddd7ca] bg-[#f8f7f3] px-3 py-2"
                          >
                            <span className="text-sm text-[#3e434d]">{line}</span>
                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                title="Editar"
                                disabled={saving}
                                onClick={() => openEditor('scheduleLine', idx, { text: line })}
                                className="rounded-md p-1 text-sky-800 hover:bg-sky-100"
                              >
                                <PencilIcon className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                title="Quitar"
                                disabled={saving}
                                onClick={() =>
                                  setConfirmRemove({
                                    kind: 'scheduleLine',
                                    index: idx,
                                    title: '¿Quitar esta línea?',
                                    description: `Se eliminará «${line}» del borrador.`,
                                  })
                                }
                                className="rounded-md p-1 text-red-700 hover:bg-red-100"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </aside>
                </div>
              </article>
            </SectionCard>

            {/* Directorio — títulos y categorías */}
            <SectionCard
              id="directorio-servicios"
              title="Directorio de servicios"
              description="Títulos de la sección y categorías del filtro (sin «Todos», que se agrega solo en el portal)."
              rightSlot={
                <EditChip
                  label="Editar títulos"
                  disabled={saving}
                  onClick={() =>
                    openEditor('proceduresMeta', null, {
                      proceduresEyebrow: form.proceduresEyebrow,
                      proceduresTitle: form.proceduresTitle,
                    })
                  }
                />
              }
            >
              <div className="rounded-2xl border border-[#ddd7ca] bg-white p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-800">
                  {form.proceduresEyebrow || 'Trámites disponibles'}
                </p>
                <h3 className="mt-2 font-serif text-2xl font-bold text-[#171b22]">
                  {form.proceduresTitle || 'Directorio de servicios'}
                </h3>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#171b22] px-4 py-2 text-sm font-semibold text-white">Todos</span>
                  {categoryOptions.map((cat, idx) => (
                    <span
                      key={`cat-${idx}-${cat}`}
                      className="group inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-900"
                    >
                      {cat}
                      <button
                        type="button"
                        title={`Editar ${cat}`}
                        disabled={saving}
                        onClick={() => openEditor('category', idx, { name: cat })}
                        className="rounded-md px-1 hover:bg-sky-100"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        title={`Quitar ${cat}`}
                        disabled={saving}
                        onClick={() =>
                          setConfirmRemove({
                            kind: 'category',
                            index: idx,
                            title: '¿Quitar categoría?',
                            description: `Se eliminará «${cat}» del filtro.`,
                          })
                        }
                        className="rounded-md px-1 text-red-700 hover:bg-red-100"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <AddChip
                    label="Categoría"
                    disabled={saving}
                    onClick={() => openEditor('category', null, { name: '' })}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Trámites */}
            <SectionCard
              id="tramites-disponibles"
              title="Trámites del directorio"
              description="Las tarjetas se ven igual que en el portal. «Ver más» abre el detalle; «Editar» modifica el trámite."
              rightSlot={
                <AddChip
                  label="Nuevo trámite"
                  disabled={saving || !apiAvailable || !categoryOptions.length}
                  onClick={onAddService}
                />
              }
            >
              {servicesError ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{servicesError}</p>
              ) : null}
              {servicesLoading ? (
                <p className="text-sm text-slate-600">Cargando trámites…</p>
              ) : !categoryOptions.length ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                  Agregá al menos una categoría arriba para poder cargar trámites.
                </div>
              ) : sortedServices.length === 0 ? (
                <EmptyHint onAdd={onAddService} addLabel="Nuevo trámite">
                  Todavía no hay trámites. Creá el primero para el directorio público.
                </EmptyHint>
              ) : (
                <ul className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {sortedServices.map((item) => (
                    <li key={item.id || item.slug} className="h-full">
                      <div
                        className={`relative h-full ${
                          item.isActive === false ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="absolute right-3 top-3 z-10 flex gap-1.5">
                          <EditChip label="Editar" disabled={saving} onClick={() => onEditService(item)} />
                          <DeleteChip label="Quitar" disabled={saving} onClick={() => onDeleteService(item)} />
                        </div>
                        {item.isActive === false ? (
                          <span className="absolute left-3 top-3 z-10 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                            Oculto
                          </span>
                        ) : null}
                        <MunicipalServiceCard
                          service={item}
                          onVerMas={setPreviewService}
                          className="h-full bg-white pr-2 pt-10"
                        />
                        <p className="mt-2 px-1 text-xs text-slate-500">Orden: {item.sortOrder ?? 0}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            {/* FAQ */}
            <SectionCard
              id="faq-servicios"
              title="Preguntas frecuentes"
              description="Respuestas que orientan al vecino antes de iniciar un trámite."
              rightSlot={
                <AddChip
                  label="Agregar pregunta"
                  disabled={saving}
                  onClick={() => openEditor('faq', null, { id: '', q: '', a: '' })}
                />
              }
            >
              {(form.faq || []).length === 0 ? (
                <EmptyHint onAdd={() => openEditor('faq', null, { id: '', q: '', a: '' })} addLabel="Agregar pregunta">
                  Todavía no hay preguntas frecuentes.
                </EmptyHint>
              ) : (
                <ul className="divide-y divide-[#ddd7ca] rounded-2xl border border-[#ddd7ca] bg-white">
                  {(form.faq || []).map((item, idx) => (
                    <li key={item.id || `faq-${idx}`} className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#171b22]">{item.q || 'Sin pregunta'}</p>
                        <p className="mt-1 text-sm leading-relaxed text-[#4b505a]">{item.a || '—'}</p>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <EditChip
                          label="Editar"
                          disabled={saving}
                          onClick={() => openEditor('faq', idx, { ...item })}
                        />
                        <DeleteChip
                          label="Quitar"
                          disabled={saving}
                          onClick={() =>
                            setConfirmRemove({
                              kind: 'faq',
                              index: idx,
                              title: '¿Quitar esta pregunta?',
                              description: `Se eliminará «${item.q || 'pregunta'}» del borrador.`,
                            })
                          }
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            {/* CTA final */}
            <SectionCard
              id="cta-servicios"
              title="Bloque de cierre"
              description="Invitación final con enlaces a atención ciudadana y novedades."
              rightSlot={
                <EditChip
                  label="Editar"
                  disabled={saving}
                  onClick={() =>
                    openEditor('cta', null, {
                      finalCtaTitle: form.finalCtaTitle,
                      finalCtaText: form.finalCtaText,
                      finalPrimaryLabel: form.finalPrimaryLabel,
                      finalPrimaryHref: form.finalPrimaryHref,
                      finalSecondaryLabel: form.finalSecondaryLabel,
                      finalSecondaryHref: form.finalSecondaryHref,
                    })
                  }
                />
              }
            >
              <div className="rounded-3xl border border-slate-200/80 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-center sm:p-10">
                <p className="font-serif text-xl font-bold text-white sm:text-2xl">
                  {form.finalCtaTitle || <span className="italic text-slate-400">(Sin título)</span>}
                </p>
                <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
                  {form.finalCtaText || <span className="italic text-slate-500">(Sin texto)</span>}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <span className="inline-flex min-h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold text-slate-900">
                    {form.finalPrimaryLabel || 'Ir a Atención'}
                  </span>
                  <span className="inline-flex min-h-11 items-center rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white">
                    {form.finalSecondaryLabel || 'Ver novedades'}
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>
        </article>
      </div>
    </>
  )
}
