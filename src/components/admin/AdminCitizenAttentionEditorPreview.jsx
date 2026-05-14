import { useMemo, useState } from 'react'
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx'
import { Modal } from '../ui/Modal.jsx'
import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'

const ACTION_BTN_BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
const ACTION_BTN_NEUTRAL = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`

const EMPTY_CHANNEL = {
  id: '',
  title: '',
  subtitle: '',
  description: '',
  accent: 'from-sky-600 to-cyan-600',
  icon: 'mail',
}
const EMPTY_FAQ = { id: '', q: '', a: '' }
const EMPTY_TOPIC = { value: '', label: '' }

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

function ChannelIcon({ name, className = 'h-6 w-6' }) {
  const common = { className, fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.65, stroke: 'currentColor' }
  switch (name) {
    case 'building':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      )
    case 'phone':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 5.314 5.893 3.293L21.75 12M7.217 10.093 2.25 7.188m5.393 4.313L2.25 15.75" />
        </svg>
      )
  }
}

function EditChip({ label = 'Editar', onClick, disabled = false, tone = 'neutral' }) {
  const styles =
    tone === 'overlay'
      ? 'border-white/30 bg-white/95 text-[#171b22] backdrop-blur hover:bg-white'
      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${styles}`}
    >
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

export function AdminCitizenAttentionEditorPreview({
  form,
  setForm,
  loading,
  saving,
  error,
  onSubmit,
  apiAvailable,
}) {
  const [editor, setEditor] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null)

  function openEditor(kind, index = null, draft = null) {
    setEditor({ kind, index, draft })
  }

  function closeEditor() {
    if (!saving) setEditor(null)
  }

  function setDraftField(field, value) {
    setEditor((prev) =>
      prev ? { ...prev, draft: { ...(prev.draft || {}), [field]: value } } : prev,
    )
  }

  function upsertListItem(key, index, item) {
    setForm((prev) => {
      const list = Array.isArray(prev[key]) ? [...prev[key]] : []
      if (index === null || index === undefined) list.push(item)
      else list[index] = item
      return { ...prev, [key]: list }
    })
  }

  function removeListItem(key, index) {
    setForm((prev) => {
      const list = Array.isArray(prev[key]) ? [...prev[key]] : []
      list.splice(index, 1)
      return { ...prev, [key]: list }
    })
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
      }))
    }
    if (editor.kind === 'channel') {
      upsertListItem('channels', editor.index, {
        id: String(draft.id || '').trim(),
        title: String(draft.title || '').trim(),
        subtitle: String(draft.subtitle || '').trim(),
        description: String(draft.description || '').trim(),
        accent: String(draft.accent || '').trim(),
        icon: String(draft.icon || 'mail').trim(),
      })
    }
    if (editor.kind === 'faq') {
      upsertListItem('faq', editor.index, {
        id: String(draft.id || '').trim(),
        q: String(draft.q || '').trim(),
        a: String(draft.a || '').trim(),
      })
    }
    if (editor.kind === 'tip') {
      upsertListItem('tips', editor.index, String(draft.value || '').trim())
    }
    if (editor.kind === 'topic') {
      upsertListItem('formTopics', editor.index, {
        value: String(draft.value || '').trim(),
        label: String(draft.label || '').trim(),
      })
    }
    if (editor.kind === 'form') {
      setForm((prev) => ({
        ...prev,
        formIntroText: String(draft.formIntroText || ''),
      }))
    }
    setEditor(null)
  }

  function handleConfirmRemove() {
    if (!confirmRemove) return
    const { kind, index } = confirmRemove
    if (kind === 'channel') removeListItem('channels', index)
    if (kind === 'faq') removeListItem('faq', index)
    if (kind === 'tip') removeListItem('tips', index)
    if (kind === 'topic') removeListItem('formTopics', index)
    setConfirmRemove(null)
  }

  const editorTitle = useMemo(() => {
    if (!editor) return ''
    const labels = {
      hero: 'Editar portada',
      channel: editor.index === null ? 'Nuevo canal de atención' : 'Editar canal de atención',
      faq: editor.index === null ? 'Nueva pregunta frecuente' : 'Editar pregunta frecuente',
      tip: editor.index === null ? 'Nuevo consejo' : 'Editar consejo',
      topic: editor.index === null ? 'Nuevo tema del formulario' : 'Editar tema del formulario',
      form: 'Editar texto del formulario',
    }
    return labels[editor.kind] || 'Editar'
  }, [editor])

  if (!apiAvailable) {
    return (
      <div className="admin-fade-up rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        Esta sección requiere conexión activa con el backend para guardar cambios.
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
          <div className="grid gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const draft = editor?.draft || {}
  const heroUrl = form.heroImageUrl ? resolveMediaUrl(form.heroImageUrl) : ''

  return (
    <>
      <ConfirmDialog
        open={confirmRemove != null}
        onClose={() => {
          if (!saving) setConfirmRemove(null)
        }}
        title={confirmRemove?.title || '¿Quitar elemento?'}
        description={confirmRemove?.description || 'Esta acción quitará el elemento del borrador.'}
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
        size={editor?.kind === 'hero' || editor?.kind === 'channel' || editor?.kind === 'faq' ? 'wide' : 'default'}
        title={editorTitle}
        description="Los cambios quedan pendientes hasta que toques «Guardar cambios»."
      >
        <EditorBody
          editor={editor}
          draft={draft}
          setDraftField={setDraftField}
          saving={saving}
        />
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
        {error ? (
          <p
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <article className="overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
          <header className="relative overflow-hidden">
            {heroUrl ? (
              <img
                src={heroUrl}
                alt=""
                className="h-56 w-full object-cover object-[center_30%] sm:h-64 lg:h-80"
              />
            ) : (
              <div className="flex h-56 w-full items-center justify-center bg-linear-to-br from-slate-700 to-slate-900 text-sm text-slate-300 sm:h-64 lg:h-80">
                Sin imagen de portada
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/88 to-slate-900/25" />
            <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
              <EditChip
                tone="overlay"
                label="Editar portada"
                onClick={() =>
                  openEditor('hero', null, {
                    heroEyebrow: form.heroEyebrow,
                    heroTitle: form.heroTitle,
                    heroSubtitle: form.heroSubtitle,
                    heroImageUrl: form.heroImageUrl,
                  })
                }
                disabled={saving}
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
              {form.heroEyebrow ? (
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-200 sm:text-xs">
                  {form.heroEyebrow}
                </p>
              ) : null}
              <h1 className="mt-2 max-w-3xl font-serif text-3xl font-bold tracking-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
                {form.heroTitle || 'Sin título'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-100/95 sm:text-base">
                {form.heroSubtitle || <span className="italic text-slate-300">(Sin subtítulo)</span>}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#171b22] px-5 text-sm font-semibold text-white shadow-sm">
                  Dejar consulta
                </span>
                <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/45 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm">
                  Ver servicios
                </span>
              </div>
            </div>
          </header>

          <div className="space-y-10 p-5 sm:p-7 lg:p-10">
            <section id="canales-atencion">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    Canales de atención
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Tarjetas que orientan al vecino antes de completar el formulario.
                  </p>
                </div>
                <AddChip
                  label="Agregar canal"
                  onClick={() => openEditor('channel', null, { ...EMPTY_CHANNEL })}
                  disabled={saving}
                />
              </div>
              {(form.channels || []).length === 0 ? (
                <div className="mt-5">
                  <EmptyHint
                    onAdd={() => openEditor('channel', null, { ...EMPTY_CHANNEL })}
                    addLabel="Agregar canal"
                  >
                    Aún no hay canales cargados.
                  </EmptyHint>
                </div>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                  {form.channels.map((ch, idx) => (
                    <article
                      key={`${ch.id || 'canal'}-${idx}`}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm ring-1 ring-[#1a1d24]/5 transition hover:-translate-y-1 hover:border-sky-200/80 sm:p-6"
                    >
                      <div className="absolute right-3 top-3 flex gap-1.5">
                        <EditChip
                          label="Editar"
                          onClick={() => openEditor('channel', idx, { ...ch })}
                          disabled={saving}
                        />
                        <DeleteChip
                          label="Quitar"
                          onClick={() =>
                            setConfirmRemove({
                              kind: 'channel',
                              index: idx,
                              title: '¿Quitar este canal?',
                              description: (
                                <>
                                  Vas a quitar{' '}
                                  <span className="font-semibold">«{ch.title || 'sin título'}»</span>{' '}
                                  del borrador.
                                </>
                              ),
                            })
                          }
                          disabled={saving}
                        />
                      </div>
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#2a313b] bg-[#171b22] text-sky-200 shadow-md">
                        <ChannelIcon name={ch.icon} />
                      </div>
                      <h3 className="pr-20 text-base font-bold text-[#171b22]">
                        {ch.title || 'Sin título'}
                      </h3>
                      <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                        {ch.subtitle || '—'}
                      </p>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#4b505a]">
                        {ch.description || <span className="italic text-slate-400">(Sin descripción)</span>}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section id="faq-atencion" className="grid gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sky-800">
                      Preguntas frecuentes
                    </h2>
                    <p className="mt-2 font-serif text-2xl font-bold text-[#171b22]">
                      Antes de escribirnos
                    </p>
                  </div>
                  <AddChip
                    label="Consejo"
                    onClick={() => openEditor('tip', null, { value: '' })}
                    disabled={saving}
                  />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#4b505a]">
                  Consejos rápidos que aparecen debajo de la introducción de FAQ.
                </p>
                {(form.tips || []).length === 0 ? (
                  <div className="mt-5">
                    <EmptyHint
                      onAdd={() => openEditor('tip', null, { value: '' })}
                      addLabel="Agregar consejo"
                    >
                      Aún no hay consejos cargados.
                    </EmptyHint>
                  </div>
                ) : (
                  <ul className="mt-6 space-y-2 text-sm text-[#4b505a]">
                    {form.tips.map((tip, idx) => (
                      <li key={`tip-${idx}`} className="flex items-start justify-between gap-3 rounded-xl border border-[#ddd7ca] bg-white px-3 py-2">
                        <span className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
                          {tip || <span className="italic text-slate-400">(Consejo vacío)</span>}
                        </span>
                        <span className="flex shrink-0 gap-1.5">
                          <EditChip
                            label="Editar"
                            onClick={() => openEditor('tip', idx, { value: tip || '' })}
                            disabled={saving}
                          />
                          <DeleteChip
                            label="Quitar"
                            onClick={() =>
                              setConfirmRemove({
                                kind: 'tip',
                                index: idx,
                                title: '¿Quitar este consejo?',
                                description: 'Vas a quitar este consejo del borrador.',
                              })
                            }
                            disabled={saving}
                          />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="lg:col-span-7">
                <div className="mb-3 flex justify-end">
                  <AddChip
                    label="Agregar FAQ"
                    onClick={() => openEditor('faq', null, { ...EMPTY_FAQ })}
                    disabled={saving}
                  />
                </div>
                {(form.faq || []).length === 0 ? (
                  <EmptyHint
                    onAdd={() => openEditor('faq', null, { ...EMPTY_FAQ })}
                    addLabel="Agregar FAQ"
                  >
                    Aún no hay preguntas frecuentes cargadas.
                  </EmptyHint>
                ) : (
                  <div className="divide-y divide-[#ddd7ca] rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
                    {form.faq.map((item, idx) => (
                      <article key={`${item.id || 'faq'}-${idx}`} className="px-4 py-4 sm:px-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold text-[#171b22] sm:text-base">
                            {item.q || 'Sin pregunta'}
                          </h3>
                          <span className="flex shrink-0 gap-1.5">
                            <EditChip
                              label="Editar"
                              onClick={() => openEditor('faq', idx, { ...item })}
                              disabled={saving}
                            />
                            <DeleteChip
                              label="Quitar"
                              onClick={() =>
                                setConfirmRemove({
                                  kind: 'faq',
                                  index: idx,
                                  title: '¿Quitar esta FAQ?',
                                  description: (
                                    <>
                                      Vas a quitar{' '}
                                      <span className="font-semibold">«{item.q || 'sin pregunta'}»</span>{' '}
                                      del borrador.
                                    </>
                                  ),
                                })
                              }
                              disabled={saving}
                            />
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-[#4b505a]">
                          {item.a || <span className="italic text-slate-400">(Sin respuesta)</span>}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section id="formulario-atencion" className="rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.18)] sm:p-8 lg:p-10">
              <div className="mx-auto max-w-3xl">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sky-800">
                      Consulta web
                    </h2>
                    <p className="mt-2 font-serif text-2xl font-bold text-[#171b22] sm:text-3xl">
                      Escribinos desde acá
                    </p>
                  </div>
                  <EditChip
                    label="Editar texto"
                    onClick={() => openEditor('form', null, { formIntroText: form.formIntroText || '' })}
                    disabled={saving}
                  />
                </div>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#4b505a] sm:mx-0">
                  {form.formIntroText || <span className="italic text-slate-400">(Sin texto introductorio)</span>}
                </p>
                <div className="mt-6 rounded-2xl border border-[#ddd7ca] bg-[#f8f7f3] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">Temas del formulario</p>
                    <AddChip
                      label="Agregar tema"
                      onClick={() => openEditor('topic', null, { ...EMPTY_TOPIC })}
                      disabled={saving}
                    />
                  </div>
                  {(form.formTopics || []).length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">No hay temas cargados.</p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.formTopics.map((topic, idx) => (
                        <span
                          key={`${topic.value || 'topic'}-${idx}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
                        >
                          {topic.label || topic.value || 'Sin etiqueta'}
                          <button
                            type="button"
                            onClick={() => openEditor('topic', idx, { ...topic })}
                            disabled={saving}
                            className="text-sky-700 hover:text-sky-900"
                            aria-label="Editar tema"
                          >
                            <PencilIcon className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmRemove({
                                kind: 'topic',
                                index: idx,
                                title: '¿Quitar este tema?',
                                description: 'Vas a quitar el tema del selector del formulario.',
                              })
                            }
                            disabled={saving}
                            className="text-red-600 hover:text-red-800"
                            aria-label="Quitar tema"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </article>

        <div className="sticky bottom-3 z-30 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">
            Los cambios no son visibles en el portal hasta que toques «Guardar cambios».
          </p>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || saving}
            className={ACTION_BTN_PRIMARY}
          >
            {saving ? (
              <>
                <Spinner tone="white" />
                Guardando…
              </>
            ) : (
              'Guardar cambios de Atención'
            )}
          </button>
        </div>
      </div>
    </>
  )
}

function EditorBody({ editor, draft, setDraftField, saving }) {
  if (!editor) return null
  switch (editor.kind) {
    case 'hero':
      return <HeroForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'channel':
      return <ChannelForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'faq':
      return <FaqForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'tip':
      return <TipForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'topic':
      return <TopicForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'form':
      return <FormIntroForm draft={draft} setDraftField={setDraftField} saving={saving} />
    default:
      return null
  }
}

function HeroForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        Etiqueta superior
        <input
          className={inputClass}
          value={draft.heroEyebrow || ''}
          onChange={(e) => setDraftField('heroEyebrow', e.target.value)}
          disabled={saving}
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
    </div>
  )
}

function ChannelForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        ID interno
        <input
          className={inputClass}
          value={draft.id || ''}
          onChange={(e) => setDraftField('id', e.target.value)}
          disabled={saving}
          placeholder="presencial"
        />
      </label>
      <label className={labelClass}>
        Icono
        <select
          className="news-select-minimal"
          value={draft.icon || 'mail'}
          onChange={(e) => setDraftField('icon', e.target.value)}
          disabled={saving}
        >
          <option value="building">Edificio</option>
          <option value="phone">Teléfono</option>
          <option value="mail">Correo</option>
          <option value="share">Redes</option>
        </select>
      </label>
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
        Subtítulo
        <input
          className={inputClass}
          value={draft.subtitle || ''}
          onChange={(e) => setDraftField('subtitle', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Descripción
        <textarea
          className={`${textareaClass} min-h-28`}
          value={draft.description || ''}
          onChange={(e) => setDraftField('description', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Gradiente Tailwind (opcional)
        <input
          className={inputClass}
          value={draft.accent || ''}
          onChange={(e) => setDraftField('accent', e.target.value)}
          disabled={saving}
          placeholder="from-sky-600 to-cyan-600"
        />
      </label>
    </div>
  )
}

function FaqForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-4">
      <label className={labelClass}>
        ID interno
        <input
          className={inputClass}
          value={draft.id || ''}
          onChange={(e) => setDraftField('id', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Pregunta
        <input
          className={inputClass}
          value={draft.q || ''}
          onChange={(e) => setDraftField('q', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Respuesta
        <textarea
          className={`${textareaClass} min-h-32`}
          value={draft.a || ''}
          onChange={(e) => setDraftField('a', e.target.value)}
          disabled={saving}
        />
      </label>
    </div>
  )
}

function TipForm({ draft, setDraftField, saving }) {
  return (
    <label className={labelClass}>
      Consejo
      <textarea
        className={`${textareaClass} min-h-28`}
        value={draft.value || ''}
        onChange={(e) => setDraftField('value', e.target.value)}
        disabled={saving}
      />
    </label>
  )
}

function TopicForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        Valor
        <input
          className={inputClass}
          value={draft.value || ''}
          onChange={(e) => setDraftField('value', e.target.value)}
          disabled={saving}
          placeholder="reclamo"
        />
      </label>
      <label className={labelClass}>
        Etiqueta visible
        <input
          className={inputClass}
          value={draft.label || ''}
          onChange={(e) => setDraftField('label', e.target.value)}
          disabled={saving}
          placeholder="Reclamo o inconveniente"
        />
      </label>
    </div>
  )
}

function FormIntroForm({ draft, setDraftField, saving }) {
  return (
    <label className={labelClass}>
      Texto introductorio
      <textarea
        className={`${textareaClass} min-h-32`}
        value={draft.formIntroText || ''}
        onChange={(e) => setDraftField('formIntroText', e.target.value)}
        disabled={saving}
      />
    </label>
  )
}
