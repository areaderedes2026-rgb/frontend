import { useMemo, useState } from 'react'
import { Modal } from '../ui/Modal.jsx'
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx'
import { PageListHeroHeader } from '../shared/PageListHeroHeader.jsx'
import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'
import {
  GASTRONOMIC_VENUE_DESCRIPTION_MAX,
  gastronomyHeroToHeaderProps,
} from '../../data/gastronomicCatalogContent.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'

const ACTION_BTN_BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`

const MAX_HIGHLIGHTS = 6

function Spinner({ tone = 'sky', size = 'sm' }) {
  const dim = size === 'sm' ? 'h-4 w-4 border-2' : 'h-5 w-5 border-2'
  const color =
    tone === 'white' ? 'border-white/40 border-t-white' : 'border-slate-300 border-t-sky-700'
  return (
    <span className={`inline-block animate-spin rounded-full ${color} ${dim}`} aria-hidden />
  )
}

function PencilIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487 18.549 2.799a2.121 2.121 0 1 1 3 3L19.862 7.487m-3-3L6.34 14.99a4.5 4.5 0 0 0-1.113 1.81L4.5 19.5l2.7-.727a4.5 4.5 0 0 0 1.81-1.113l10.49-10.49m-3-3L19.5 7.5"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  )
}

function EditChip({ label = 'Editar', onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <PencilIcon />
      <span className="hidden sm:inline">{label}</span>
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

function SectionCard({ id, title, description, rightSlot, children, className = '' }) {
  return (
    <section id={id} className={`scroll-mt-32 ${className}`.trim()}>
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

function firstRealCategory(categories) {
  const found = (categories || []).find((x) => x && x !== 'Todos')
  return found || 'Otros'
}

function emptyVenue(categories) {
  return {
    id: `local-${Date.now()}`,
    category: firstRealCategory(categories),
    name: '',
    location: '',
    phone: '',
    description: '',
    imageUrl: '',
    hours: '',
    mapsUrl: '',
    instagram: '',
    whatsapp: '',
    isActive: true,
    sortOrder: 0,
  }
}

function editorTitle(kind) {
  if (kind === 'introTitle') return 'Editar título de contexto'
  if (kind === 'paragraph') return 'Editar párrafo'
  if (kind === 'highlight') return 'Editar destacado'
  if (kind === 'category') return 'Editar categoría'
  if (kind === 'venue') return 'Editar local'
  if (kind === 'cta') return 'Editar cierre'
  return 'Editar'
}

export function AdminGastronomicCatalogEditorPreview({
  form,
  setForm,
  loading,
  saving,
  error,
  onChangeCover,
  onSubmit,
  apiAvailable,
}) {
  const [editor, setEditor] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null)

  const categoryOptions = useMemo(
    () => (form.categories || []).filter((c) => c && c !== 'Todos'),
    [form.categories],
  )

  const heroProps = gastronomyHeroToHeaderProps(form)

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

  function applyEditor() {
    if (!editor) return
    const { kind, index, draft } = editor
    if (kind === 'introTitle') {
      setForm((prev) => ({ ...prev, introTitle: String(draft?.introTitle || '').trim() }))
    } else if (kind === 'paragraph') {
      const text = String(draft?.text || '').trim()
      setForm((prev) => {
        const next = [...(prev.introParagraphs || [])]
        if (index == null) next.push(text)
        else next[index] = text
        return { ...prev, introParagraphs: next.filter(Boolean) }
      })
    } else if (kind === 'highlight') {
      const item = {
        label: String(draft?.label || '').trim(),
        value: String(draft?.value || '').trim(),
      }
      if (!item.label && !item.value) return
      setForm((prev) => {
        const next = [...(prev.highlights || [])]
        if (index == null) next.push(item)
        else next[index] = item
        return { ...prev, highlights: next.slice(0, MAX_HIGHLIGHTS) }
      })
    } else if (kind === 'category') {
      const name = String(draft?.name || '').trim()
      if (!name || name === 'Todos') return
      setForm((prev) => {
        const next = [...(prev.categories || [])]
        const oldName = index != null ? next[index] : null
        if (index == null) {
          if (!next.includes(name)) next.push(name)
        } else {
          next[index] = name
        }
        const venues = (prev.venues || []).map((v) =>
          oldName && v.category === oldName ? { ...v, category: name } : v,
        )
        return { ...prev, categories: next, venues }
      })
    } else if (kind === 'venue') {
      const venue = {
        id: String(draft?.id || '').trim() || `local-${Date.now()}`,
        category: String(draft?.category || '').trim() || firstRealCategory(form.categories),
        name: String(draft?.name || '').trim(),
        location: String(draft?.location || '').trim(),
        phone: String(draft?.phone || '').trim(),
        description: String(draft?.description || '').trim().slice(0, GASTRONOMIC_VENUE_DESCRIPTION_MAX),
        imageUrl: String(draft?.imageUrl || '').trim(),
        hours: String(draft?.hours || '').trim(),
        mapsUrl: String(draft?.mapsUrl || '').trim(),
        instagram: String(draft?.instagram || '').trim(),
        whatsapp: String(draft?.whatsapp || '').trim(),
        isActive: draft?.isActive !== false,
        sortOrder: Number.isFinite(Number(draft?.sortOrder)) ? Number(draft.sortOrder) : 0,
      }
      if (!venue.name) return
      setForm((prev) => {
        const next = [...(prev.venues || [])]
        if (index == null) next.push(venue)
        else next[index] = venue
        return { ...prev, venues: next }
      })
    } else if (kind === 'cta') {
      setForm((prev) => ({
        ...prev,
        ctaTitle: String(draft?.ctaTitle || '').trim(),
        ctaBody: String(draft?.ctaBody || ''),
      }))
    }
    setEditor(null)
  }

  function removeConfirmed() {
    if (!confirmRemove) return
    const { kind, index } = confirmRemove
    if (kind === 'paragraph') {
      setForm((prev) => ({
        ...prev,
        introParagraphs: (prev.introParagraphs || []).filter((_, i) => i !== index),
      }))
    } else if (kind === 'highlight') {
      setForm((prev) => ({
        ...prev,
        highlights: (prev.highlights || []).filter((_, i) => i !== index),
      }))
    } else if (kind === 'category') {
      setForm((prev) => {
        const removed = prev.categories?.[index]
        const categories = (prev.categories || []).filter((_, i) => i !== index)
        const fallback = firstRealCategory(categories)
        const venues = (prev.venues || []).map((v) =>
          v.category === removed ? { ...v, category: fallback } : v,
        )
        return { ...prev, categories, venues }
      })
    } else if (kind === 'venue') {
      setForm((prev) => ({
        ...prev,
        venues: (prev.venues || []).filter((_, i) => i !== index),
      }))
    }
    setConfirmRemove(null)
  }

  return (
    <>
      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}

      <div className="space-y-8">
        <div className="overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#171b22]">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200">Portada pública</p>
            <button
              type="button"
              onClick={onChangeCover}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-[#171b22] backdrop-blur hover:bg-white disabled:opacity-60"
            >
              <PencilIcon />
              Cambiar portada
            </button>
          </div>
          <PageListHeroHeader {...heroProps} previewMode contentReady />
        </div>

        <article className="overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
          <div className="space-y-10 p-5 sm:p-7 lg:p-10">
            <SectionCard
              id="contexto"
              title="Contexto"
              description="Título, párrafos y destacados de la introducción."
              rightSlot={
                <EditChip
                  label="Título"
                  onClick={() => openEditor('introTitle', null, { introTitle: form.introTitle || '' })}
                  disabled={saving}
                />
              }
            >
              <h3 className="font-serif text-2xl font-bold tracking-tight text-[#171b22]">
                {form.introTitle || <span className="italic text-slate-400">(Sin título)</span>}
              </h3>
              <div className="mt-4 space-y-3">
                {(form.introParagraphs || []).map((paragraph, idx) => (
                  <div key={`${idx}-${paragraph.slice(0, 24)}`} className="flex items-start justify-between gap-3">
                    <p className="text-sm leading-relaxed text-[#4b505a] sm:text-base">{paragraph}</p>
                    <div className="flex shrink-0 gap-1">
                      <EditChip
                        label="Editar"
                        onClick={() => openEditor('paragraph', idx, { text: paragraph })}
                        disabled={saving}
                      />
                      <button
                        type="button"
                        className="inline-flex items-center rounded-lg border border-red-200 bg-white px-2 py-1.5 text-red-700 hover:bg-red-50"
                        onClick={() =>
                          setConfirmRemove({
                            kind: 'paragraph',
                            index: idx,
                            title: '¿Quitar este párrafo?',
                            description: 'Se eliminará del borrador hasta que guardes.',
                          })
                        }
                        disabled={saving}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
                <AddChip
                  label="Agregar párrafo"
                  onClick={() => openEditor('paragraph', null, { text: '' })}
                  disabled={saving}
                />
              </div>
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">Destacados</p>
                  <AddChip
                    label="Agregar"
                    onClick={() => openEditor('highlight', null, { label: '', value: '' })}
                    disabled={saving || (form.highlights || []).length >= MAX_HIGHLIGHTS}
                  />
                </div>
                {(form.highlights || []).length === 0 ? (
                  <EmptyHint>Todavía no hay destacados.</EmptyHint>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-3">
                    {(form.highlights || []).map((item, idx) => (
                      <li key={`${item.label}-${idx}`} className="rounded-2xl border border-[#ddd7ca] bg-white px-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wide text-sky-800">
                              {item.label || '(Etiqueta)'}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[#171b22]">{item.value || '—'}</p>
                          </div>
                          <div className="flex gap-1">
                            <EditChip
                              onClick={() => openEditor('highlight', idx, { ...item })}
                              disabled={saving}
                            />
                            <button
                              type="button"
                              className="rounded-lg border border-red-200 px-2 py-1 text-red-700 hover:bg-red-50"
                              onClick={() =>
                                setConfirmRemove({
                                  kind: 'highlight',
                                  index: idx,
                                  title: '¿Quitar este destacado?',
                                  description: 'Se quitará del bloque de introducción.',
                                })
                              }
                              disabled={saving}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </SectionCard>

            <SectionCard
              id="categorias"
              title="Categorías"
              description="La primera («Todos») es fija. El resto se usa para filtrar locales."
              rightSlot={
                <AddChip
                  label="Nueva categoría"
                  onClick={() => openEditor('category', null, { name: '' })}
                  disabled={saving}
                />
              }
            >
              <ul className="flex flex-wrap gap-2">
                {(form.categories || []).map((c, idx) => {
                  const isFixed = idx === 0
                  return (
                    <li
                      key={`${c}-${idx}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[#ddd7ca] bg-white px-3 py-1.5 text-sm font-semibold text-[#171b22]"
                    >
                      <span>{c || (idx === 0 ? 'Todos' : '(Sin nombre)')}</span>
                      {isFixed ? (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Fija</span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditor('category', idx, { name: c })}
                            disabled={saving}
                            className="text-sky-800"
                            aria-label={`Editar ${c}`}
                          >
                            <PencilIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmRemove({
                                kind: 'category',
                                index: idx,
                                title: '¿Quitar esta categoría?',
                                description: (
                                  <>
                                    Vas a eliminar <span className="font-semibold">«{c}»</span>. Los locales se
                                    reasignarán a la primera categoría disponible.
                                  </>
                                ),
                              })
                            }
                            disabled={saving}
                            className="text-red-700"
                            aria-label={`Quitar ${c}`}
                          >
                            <TrashIcon />
                          </button>
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
            </SectionCard>

            <SectionCard
              id="locales"
              title="Locales gastronómicos"
              description="Nombre, ubicación, teléfono, descripción, foto y datos de contacto de cada propuesta."
              rightSlot={
                <AddChip
                  label="Nuevo local"
                  onClick={() => {
                    if (!categoryOptions.length) return
                    openEditor('venue', null, emptyVenue(form.categories))
                  }}
                  disabled={saving || !categoryOptions.length}
                />
              }
            >
              {!categoryOptions.length ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                  Primero agregá al menos una categoría distinta de «Todos».
                </div>
              ) : (form.venues || []).length === 0 ? (
                <EmptyHint
                  onAdd={() => openEditor('venue', null, emptyVenue(form.categories))}
                  addLabel="Nuevo local"
                >
                  Todavía no hay locales. Sumá el primero con nombre, ubicación, teléfono y descripción.
                </EmptyHint>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {(form.venues || []).map((venue, idx) => (
                    <li
                      key={venue.id || idx}
                      className="overflow-hidden rounded-2xl border border-[#ddd7ca] bg-white shadow-sm"
                    >
                      <div className="aspect-16/10 bg-slate-100">
                        {venue.imageUrl ? (
                          <img
                            src={resolveMediaUrl(venue.imageUrl)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Sin imagen
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-sky-800">
                          {venue.category}
                          {venue.isActive === false ? ' · Oculto' : ''}
                        </p>
                        <h3 className="mt-1 font-serif text-lg font-bold text-[#171b22]">
                          {venue.name || '(Sin nombre)'}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-[#4b505a]">
                          {venue.location || venue.phone || venue.description || 'Sin datos de contacto'}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <EditChip
                            label="Editar"
                            onClick={() => openEditor('venue', idx, { ...emptyVenue(form.categories), ...venue })}
                            disabled={saving}
                          />
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                            onClick={() =>
                              setConfirmRemove({
                                kind: 'venue',
                                index: idx,
                                title: '¿Quitar este local?',
                                description: (
                                  <>
                                    Vas a eliminar{' '}
                                    <span className="font-semibold">«{venue.name || 'este local'}»</span> del
                                    catálogo.
                                  </>
                                ),
                              })
                            }
                            disabled={saving}
                          >
                            <TrashIcon />
                            Quitar
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              id="cta"
              title="Bloque de cierre"
              description="Mensaje final para invitar a sumar un local o consultar."
              rightSlot={
                <EditChip
                  label="Editar"
                  onClick={() =>
                    openEditor('cta', null, {
                      ctaTitle: form.ctaTitle || '',
                      ctaBody: form.ctaBody || '',
                    })
                  }
                  disabled={saving}
                />
              }
            >
              <div className="rounded-3xl border border-[#ddd7ca] bg-linear-to-br from-sky-50/90 via-white to-[#f8f7f3] p-6 sm:p-8">
                <h2 className="text-lg font-bold tracking-tight text-[#171b22] sm:text-xl">
                  {form.ctaTitle || <span className="italic text-slate-400">(Sin título)</span>}
                </h2>
                <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-[#4b505a]">
                  {form.ctaBody || <span className="italic text-slate-400">(Sin texto)</span>}
                </p>
              </div>
            </SectionCard>
          </div>
        </article>

        <div className="sticky bottom-3 z-30 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">
            Los cambios no son visibles en el portal hasta que toques «Guardar cambios».
          </p>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || saving || !apiAvailable}
            className={ACTION_BTN_PRIMARY}
          >
            {saving ? (
              <>
                <Spinner tone="white" size="sm" />
                Guardando…
              </>
            ) : (
              'Guardar cambios del catálogo'
            )}
          </button>
        </div>
      </div>

      <Modal
        open={Boolean(editor)}
        onClose={closeEditor}
        title={editorTitle(editor?.kind)}
        size={editor?.kind === 'venue' ? 'wide' : 'default'}
      >
        {editor ? (
          <div className="space-y-4">
            {editor.kind === 'introTitle' ? (
              <label className={labelClass}>
                Título
                <input
                  className={inputClass}
                  value={editor.draft?.introTitle || ''}
                  onChange={(e) => setDraftField('introTitle', e.target.value)}
                  disabled={saving}
                />
              </label>
            ) : null}
            {editor.kind === 'paragraph' ? (
              <label className={labelClass}>
                Párrafo
                <textarea
                  className={textareaClass}
                  value={editor.draft?.text || ''}
                  onChange={(e) => setDraftField('text', e.target.value)}
                  disabled={saving}
                />
              </label>
            ) : null}
            {editor.kind === 'highlight' ? (
              <>
                <label className={labelClass}>
                  Etiqueta
                  <input
                    className={inputClass}
                    value={editor.draft?.label || ''}
                    onChange={(e) => setDraftField('label', e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Valor
                  <input
                    className={inputClass}
                    value={editor.draft?.value || ''}
                    onChange={(e) => setDraftField('value', e.target.value)}
                    disabled={saving}
                  />
                </label>
              </>
            ) : null}
            {editor.kind === 'category' ? (
              <label className={labelClass}>
                Nombre de la categoría
                <input
                  className={inputClass}
                  value={editor.draft?.name || ''}
                  onChange={(e) => setDraftField('name', e.target.value)}
                  disabled={saving}
                />
              </label>
            ) : null}
            {editor.kind === 'cta' ? (
              <>
                <label className={labelClass}>
                  Título
                  <input
                    className={inputClass}
                    value={editor.draft?.ctaTitle || ''}
                    onChange={(e) => setDraftField('ctaTitle', e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Texto
                  <textarea
                    className={textareaClass}
                    value={editor.draft?.ctaBody || ''}
                    onChange={(e) => setDraftField('ctaBody', e.target.value)}
                    disabled={saving}
                  />
                </label>
              </>
            ) : null}
            {editor.kind === 'venue' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={`${labelClass} sm:col-span-2`}>
                  Nombre del local
                  <input
                    className={inputClass}
                    value={editor.draft?.name || ''}
                    onChange={(e) => setDraftField('name', e.target.value)}
                    disabled={saving}
                    required
                  />
                </label>
                <label className={labelClass}>
                  Categoría
                  <select
                    className={inputClass}
                    value={editor.draft?.category || ''}
                    onChange={(e) => setDraftField('category', e.target.value)}
                    disabled={saving}
                  >
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  Orden
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={editor.draft?.sortOrder ?? 0}
                    onChange={(e) => setDraftField('sortOrder', e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Ubicación
                  <input
                    className={inputClass}
                    value={editor.draft?.location || ''}
                    onChange={(e) => setDraftField('location', e.target.value)}
                    disabled={saving}
                    placeholder="Dirección o referencia"
                  />
                </label>
                <label className={labelClass}>
                  Teléfono
                  <input
                    className={inputClass}
                    value={editor.draft?.phone || ''}
                    onChange={(e) => setDraftField('phone', e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  WhatsApp
                  <input
                    className={inputClass}
                    value={editor.draft?.whatsapp || ''}
                    onChange={(e) => setDraftField('whatsapp', e.target.value)}
                    disabled={saving}
                    placeholder="Opcional (si es distinto al teléfono)"
                  />
                </label>
                <label className={labelClass}>
                  Horario
                  <input
                    className={inputClass}
                    value={editor.draft?.hours || ''}
                    onChange={(e) => setDraftField('hours', e.target.value)}
                    disabled={saving}
                    placeholder="Ej. Lun a sáb 8 a 22"
                  />
                </label>
                <label className={labelClass}>
                  Instagram
                  <input
                    className={inputClass}
                    value={editor.draft?.instagram || ''}
                    onChange={(e) => setDraftField('instagram', e.target.value)}
                    disabled={saving}
                    placeholder="@usuario o URL"
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Cómo llegar (Google Maps)
                  <input
                    className={inputClass}
                    value={editor.draft?.mapsUrl || ''}
                    onChange={(e) => setDraftField('mapsUrl', e.target.value)}
                    disabled={saving}
                    placeholder="https://maps.google.com/..."
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Descripción
                  <textarea
                    className={textareaClass}
                    value={editor.draft?.description || ''}
                    onChange={(e) =>
                      setDraftField(
                        'description',
                        e.target.value.slice(0, GASTRONOMIC_VENUE_DESCRIPTION_MAX),
                      )
                    }
                    disabled={saving}
                    maxLength={GASTRONOMIC_VENUE_DESCRIPTION_MAX}
                  />
                </label>
                <div className="sm:col-span-2">
                  <SingleImageUploadField
                    label="Foto del local"
                    value={editor.draft?.imageUrl || ''}
                    onChange={(url) => setDraftField('imageUrl', url || '')}
                    disabled={saving}
                    helpText="JPEG, PNG o WebP. Si no hay foto, se muestra un placeholder."
                  />
                </div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={editor.draft?.isActive !== false}
                    onChange={(e) => setDraftField('isActive', e.target.checked)}
                    disabled={saving}
                  />
                  Visible en el catálogo público
                </label>
              </div>
            ) : null}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={applyEditor}
                className={ACTION_BTN_PRIMARY}
                disabled={saving}
              >
                Aplicar al borrador
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmRemove)}
        onClose={() => setConfirmRemove(null)}
        title={confirmRemove?.title || '¿Quitar?'}
        description={confirmRemove?.description || ''}
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        onConfirm={removeConfirmed}
        variant="danger"
      />
    </>
  )
}
