import { useMemo, useState } from 'react'
import { Modal } from '../ui/Modal.jsx'
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx'
import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'

const ACTION_BTN_BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
const ACTION_BTN_NEUTRAL = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`

const MAX_HIGHLIGHTS = 6

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

function SectionCard({ id, title, description, rightSlot, children, className = '', variant = 'card' }) {
  const base =
    variant === 'plain'
      ? ''
      : 'rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-7'
  return (
    <section id={id} className={`scroll-mt-32 ${base} ${className}`.trim()}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          ) : null}
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

const EMPTY_HIGHLIGHT = { label: '', value: '' }
const EMPTY_OFFER = (categories) => ({
  id: `oferta-${Date.now()}`,
  category: firstRealCategory(categories),
  title: '',
  provider: '',
  modality: '',
  duration: '',
  location: '',
  summary: '',
  detailsText: '',
  requirementsText: '',
  inscription: '',
  tagsText: '',
  linkLabel: '',
  linkHref: '',
})

function firstRealCategory(categories) {
  const found = (categories || []).find((x) => x && x !== 'Todos')
  return found || 'Cursos y talleres'
}

function offerToDraft(offer) {
  return {
    id: String(offer?.id || ''),
    category: String(offer?.category || ''),
    title: String(offer?.title || ''),
    provider: String(offer?.provider || ''),
    modality: String(offer?.modality || ''),
    duration: String(offer?.duration || ''),
    location: String(offer?.location || ''),
    summary: String(offer?.summary || ''),
    detailsText: Array.isArray(offer?.details) ? offer.details.join('\n') : '',
    requirementsText: Array.isArray(offer?.requirements) ? offer.requirements.join('\n') : '',
    inscription: String(offer?.inscription || ''),
    tagsText: Array.isArray(offer?.tags) ? offer.tags.join(', ') : '',
    linkLabel: offer?.link?.label ? String(offer.link.label) : '',
    linkHref: offer?.link?.href ? String(offer.link.href) : '',
  }
}

function draftToOffer(draft) {
  const details = String(draft.detailsText || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const requirements = String(draft.requirementsText || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const tags = String(draft.tagsText || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  let link = null
  const href = String(draft.linkHref || '').trim()
  if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
    link = {
      label: String(draft.linkLabel || '').trim() || 'Más información',
      href,
    }
  }
  return {
    id: String(draft.id || '').trim() || `oferta-${Date.now()}`,
    category: String(draft.category || '').trim() || firstRealCategory([]),
    title: String(draft.title || '').trim(),
    provider: String(draft.provider || '').trim(),
    modality: String(draft.modality || '').trim(),
    duration: String(draft.duration || '').trim(),
    location: String(draft.location || '').trim(),
    summary: String(draft.summary || '').trim(),
    details,
    requirements,
    inscription: String(draft.inscription || '').trim(),
    tags,
    link,
  }
}

export function AdminOfertaAcademicaEditorPreview({
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

  const heroUrl = (form.heroImageUrl || '').trim()

  const categoryOptions = useMemo(
    () => (form.categories || []).filter((c) => c && c !== 'Todos'),
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

  function applyIdentity(draft) {
    setForm((prev) => ({
      ...prev,
      heroEyebrow: String(draft.heroEyebrow || '').trim(),
      heroTitle: String(draft.heroTitle || '').trim(),
      heroSubtitle: String(draft.heroSubtitle || ''),
      heroImageUrl: String(draft.heroImageUrl || '').trim(),
    }))
  }

  function applyIntroTitle(draft) {
    setForm((prev) => ({
      ...prev,
      introTitle: String(draft.introTitle || '').trim(),
    }))
  }

  function applyParagraph(draft, index) {
    const value = String(draft.text || '').trim()
    setForm((prev) => {
      const list = [...(prev.introParagraphs || [])]
      if (index === null || index === undefined) {
        list.push(value)
      } else {
        list[index] = value
      }
      return { ...prev, introParagraphs: list.filter((p, i) => p || i === index) }
    })
  }

  function applyHighlight(draft, index) {
    const row = {
      label: String(draft.label || '').trim(),
      value: String(draft.value || '').trim(),
    }
    setForm((prev) => {
      const list = [...(prev.highlights || [])]
      if (index === null || index === undefined) {
        if (list.length >= MAX_HIGHLIGHTS) return prev
        list.push(row)
      } else {
        list[index] = row
      }
      return { ...prev, highlights: list }
    })
  }

  function applyCategory(draft, index) {
    const value = String(draft.name || '').trim()
    if (!value) return
    setForm((prev) => {
      const list = [...(prev.categories || [])]
      if (index === null || index === undefined) {
        if (!list.includes(value)) list.push(value)
      } else if (index > 0) {
        const previousValue = list[index]
        list[index] = value
        const offers = (prev.offers || []).map((o) =>
          o.category === previousValue ? { ...o, category: value } : o,
        )
        return { ...prev, categories: list, offers }
      }
      return { ...prev, categories: list }
    })
  }

  function applyOffer(draft, index) {
    const built = draftToOffer(draft)
    if (!built.title && !built.summary) return
    setForm((prev) => {
      const list = [...(prev.offers || [])]
      if (index === null || index === undefined) {
        list.push(built)
      } else {
        list[index] = built
      }
      return { ...prev, offers: list }
    })
  }

  function applyCta(draft) {
    setForm((prev) => ({
      ...prev,
      ctaTitle: String(draft.ctaTitle || '').trim(),
      ctaBody: String(draft.ctaBody || ''),
    }))
  }

  function handleSaveEditor() {
    if (!editor) return
    const { kind, index, draft } = editor
    switch (kind) {
      case 'identity':
        applyIdentity(draft)
        break
      case 'introTitle':
        applyIntroTitle(draft)
        break
      case 'paragraph':
        applyParagraph(draft, index)
        break
      case 'highlight':
        applyHighlight(draft, index)
        break
      case 'category':
        applyCategory(draft, index)
        break
      case 'offer':
        applyOffer(draft, index)
        break
      case 'cta':
        applyCta(draft)
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
        case 'paragraph':
          return {
            ...prev,
            introParagraphs: (prev.introParagraphs || []).filter((_, i) => i !== index),
          }
        case 'highlight':
          return {
            ...prev,
            highlights: (prev.highlights || []).filter((_, i) => i !== index),
          }
        case 'category': {
          const list = [...(prev.categories || [])]
          if (index === 0) return prev
          const removed = list[index]
          const next = list.filter((_, i) => i !== index)
          const offers = (prev.offers || []).map((o) =>
            o.category === removed
              ? { ...o, category: firstRealCategory(next) }
              : o,
          )
          return { ...prev, categories: next, offers }
        }
        case 'offer':
          return {
            ...prev,
            offers: (prev.offers || []).filter((_, i) => i !== index),
          }
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
      case 'introTitle':
        return 'Editar título de la introducción'
      case 'paragraph':
        return editor.index === null ? 'Agregar párrafo' : 'Editar párrafo'
      case 'highlight':
        return editor.index === null ? 'Nueva cifra destacada' : 'Editar cifra destacada'
      case 'category':
        return editor.index === null ? 'Nueva categoría' : 'Editar categoría'
      case 'offer':
        return editor.index === null ? 'Nueva oferta académica' : 'Editar oferta académica'
      case 'cta':
        return 'Editar bloque de cierre (CTA)'
      default:
        return ''
    }
  }, [editor])

  const draft = editor?.draft || null

  return (
    <>
      <ConfirmDialog
        open={confirmRemove != null}
        onClose={() => setConfirmRemove(null)}
        title={confirmRemove?.title || '¿Quitar este elemento?'}
        description={confirmRemove?.description}
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
        size={editor?.kind === 'identity' || editor?.kind === 'offer' ? 'wide' : 'default'}
        title={editorTitle}
        description="Los cambios quedan en borrador hasta que toques «Guardar cambios» en el pie de la página."
      >
        <EditorBody
          editor={editor}
          draft={draft}
          setDraftField={setDraftField}
          saving={saving}
          categoryOptions={categoryOptions}
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
            Tocá el lápiz de cada sección para editarla.{' '}
            <span className="hidden sm:inline">
              Los cambios quedan en borrador hasta «Guardar cambios».
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onChangeCover}
              disabled={saving || !apiAvailable}
              className={ACTION_BTN_NEUTRAL}
            >
              Cambiar portada
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving || loading || !apiAvailable}
              className={ACTION_BTN_PRIMARY}
            >
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
          <p
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {/* Preview */}
        <article className="overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
          {/* Hero */}
          <header className="relative overflow-hidden">
            {heroUrl ? (
              <img
                src={heroUrl}
                alt=""
                className="h-56 w-full object-cover object-[center_35%] sm:h-64 lg:h-80"
              />
            ) : (
              <div className="flex h-56 w-full items-center justify-center bg-linear-to-br from-slate-700 to-slate-900 text-sm text-slate-300 sm:h-64 lg:h-80">
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
              <h1 className="mt-2 max-w-3xl font-serif text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-4xl lg:text-[2.75rem]">
                {form.heroTitle || 'Sin título'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-100 sm:text-base">
                {form.heroSubtitle || (
                  <span className="italic text-slate-300">(Sin subtítulo)</span>
                )}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[#171b22] shadow-sm">
                  Ver ofertas
                </span>
                <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/45 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm">
                  Áreas municipales
                </span>
              </div>
            </div>
          </header>

          <div className="space-y-10 p-5 sm:p-7 lg:p-10">
            {/* Introducción */}
            <SectionCard
              id="intro-oferta"
              title="Introducción"
              description="Texto de bienvenida que se muestra al inicio de la página pública."
              variant="plain"
              rightSlot={
                <div className="flex flex-wrap gap-2">
                  <EditChip
                    label="Editar título"
                    onClick={() =>
                      openEditor('introTitle', null, {
                        introTitle: form.introTitle || '',
                      })
                    }
                    disabled={saving}
                  />
                  <AddChip
                    label="Agregar párrafo"
                    onClick={() => openEditor('paragraph', null, { text: '' })}
                    disabled={saving}
                  />
                </div>
              }
            >
              <div className="rounded-3xl border border-[#ddd7ca] bg-[#f8f7f3] p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
                  Contexto
                </p>
                <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                  {form.introTitle || (
                    <span className="italic text-slate-400">(Sin título)</span>
                  )}
                </h2>
                {(form.introParagraphs || []).length === 0 ? (
                  <div className="mt-4">
                    <EmptyHint
                      onAdd={() => openEditor('paragraph', null, { text: '' })}
                      addLabel="Agregar párrafo"
                    >
                      Aún no hay párrafos. Sumá el primero para describir la oferta.
                    </EmptyHint>
                  </div>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {form.introParagraphs.map((p, idx) => (
                      <li
                        key={`p-${idx}`}
                        className="group relative rounded-2xl border border-transparent bg-white/60 p-3 transition hover:border-slate-200"
                      >
                        <div className="absolute right-2 top-2 flex gap-1.5">
                          <EditChip
                            label="Editar"
                            onClick={() => openEditor('paragraph', idx, { text: p })}
                            disabled={saving}
                          />
                          <DeleteChip
                            label="Quitar"
                            onClick={() =>
                              setConfirmRemove({
                                kind: 'paragraph',
                                index: idx,
                                title: '¿Quitar este párrafo?',
                                description: 'Vas a eliminar el párrafo del borrador.',
                              })
                            }
                            disabled={saving}
                          />
                        </div>
                        <p className="pr-24 text-sm leading-relaxed text-[#3e434d] sm:text-base">
                          {p || (
                            <span className="italic text-slate-400">(Párrafo vacío)</span>
                          )}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </SectionCard>

            {/* Cifras destacadas */}
            <SectionCard
              id="cifras-oferta"
              title="Cifras destacadas"
              description={`Hasta ${MAX_HIGHLIGHTS} tarjetas resumen con valor y etiqueta.`}
              variant="plain"
              rightSlot={
                <AddChip
                  label="Agregar tarjeta"
                  onClick={() => openEditor('highlight', null, { ...EMPTY_HIGHLIGHT })}
                  disabled={saving || (form.highlights || []).length >= MAX_HIGHLIGHTS}
                />
              }
            >
              {(form.highlights || []).length === 0 ? (
                <EmptyHint
                  onAdd={() => openEditor('highlight', null, { ...EMPTY_HIGHLIGHT })}
                  addLabel="Agregar tarjeta"
                >
                  No hay cifras cargadas. Sumá la primera para destacarla en la página.
                </EmptyHint>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {form.highlights.map((h, idx) => (
                    <li
                      key={`h-${idx}`}
                      className="relative rounded-2xl border border-[#ddd7ca] bg-white px-4 py-5 text-center shadow-sm"
                    >
                      <div className="absolute right-2 top-2 flex gap-1.5">
                        <EditChip
                          label="Editar"
                          onClick={() => openEditor('highlight', idx, { ...h })}
                          disabled={saving}
                        />
                        <DeleteChip
                          label="Quitar"
                          onClick={() =>
                            setConfirmRemove({
                              kind: 'highlight',
                              index: idx,
                              title: '¿Quitar esta cifra?',
                              description: (
                                <>
                                  Vas a eliminar{' '}
                                  <span className="font-semibold">
                                    «{h.label || h.value || 'cifra'}»
                                  </span>{' '}
                                  del borrador.
                                </>
                              ),
                            })
                          }
                          disabled={saving}
                        />
                      </div>
                      <p className="text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                        {h.value || (
                          <span className="italic text-slate-400">—</span>
                        )}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-sky-800">
                        {h.label || (
                          <span className="italic text-slate-400">(Sin etiqueta)</span>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            {/* Categorías del filtro */}
            <SectionCard
              id="categorias-oferta"
              title="Categorías del filtro"
              description="«Todos» es el filtro completo y siempre va al inicio. El resto define los chips del explorador."
              variant="plain"
              rightSlot={
                <AddChip
                  label="Agregar categoría"
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
                      key={`cat-${idx}-${c}`}
                      className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                        isFixed
                          ? 'border-slate-300 bg-slate-100 text-slate-600'
                          : 'border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-300'
                      }`}
                    >
                      <span>{c || (idx === 0 ? 'Todos' : '(Sin nombre)')}</span>
                      {isFixed ? (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          Fija
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditor('category', idx, { name: c })}
                            disabled={saving}
                            className="rounded-md px-1 text-sky-800 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                            title="Editar nombre"
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
                                    Vas a eliminar{' '}
                                    <span className="font-semibold">«{c}»</span>. Las ofertas que la usan se reasignarán a la primera categoría disponible.
                                  </>
                                ),
                              })
                            }
                            disabled={saving}
                            className="rounded-md px-1 text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            title="Quitar"
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

            {/* Ofertas */}
            <SectionCard
              id="lista-ofertas"
              title="Ofertas académicas"
              description="Cada ficha aparece en el explorador público. Podés editar cualquier dato o eliminarla."
              variant="plain"
              rightSlot={
                <AddChip
                  label="Nueva oferta"
                  onClick={() => {
                    if (!categoryOptions.length) return
                    openEditor('offer', null, EMPTY_OFFER(form.categories))
                  }}
                  disabled={saving || !categoryOptions.length}
                />
              }
            >
              {!categoryOptions.length ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                  Primero agregá al menos una categoría distinta de «Todos» para poder cargar ofertas.
                </div>
              ) : (form.offers || []).length === 0 ? (
                <EmptyHint
                  onAdd={() => openEditor('offer', null, EMPTY_OFFER(form.categories))}
                  addLabel="Nueva oferta"
                >
                  Todavía no hay ofertas. Sumá la primera para que aparezca en el portal.
                </EmptyHint>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {form.offers.map((o, idx) => (
                    <li key={o.id || `offer-${idx}`}>
                      <article className="relative h-full rounded-2xl border border-[#ddd7ca] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200/80">
                        <div className="absolute right-3 top-3 flex gap-1.5">
                          <EditChip
                            label="Editar"
                            onClick={() => openEditor('offer', idx, offerToDraft(o))}
                            disabled={saving}
                          />
                          <DeleteChip
                            label="Quitar"
                            onClick={() =>
                              setConfirmRemove({
                                kind: 'offer',
                                index: idx,
                                title: '¿Quitar esta oferta?',
                                description: (
                                  <>
                                    Vas a eliminar{' '}
                                    <span className="font-semibold">
                                      «{o.title || 'sin título'}»
                                    </span>{' '}
                                    del borrador.
                                  </>
                                ),
                              })
                            }
                            disabled={saving}
                          />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                          {o.category || '—'}
                        </p>
                        <h3 className="mt-1 pr-24 text-lg font-bold tracking-tight text-[#171b22]">
                          {o.title || 'Sin título'}
                        </h3>
                        {o.provider ? (
                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {o.provider}
                          </p>
                        ) : null}
                        {o.summary ? (
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#4b505a]">
                            {o.summary}
                          </p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                          {o.modality ? (
                            <span className="rounded-full bg-slate-100 px-2 py-1">
                              {o.modality}
                            </span>
                          ) : null}
                          {o.duration ? (
                            <span className="rounded-full bg-slate-100 px-2 py-1">
                              {o.duration}
                            </span>
                          ) : null}
                          {o.location ? (
                            <span className="rounded-full bg-slate-100 px-2 py-1">
                              {o.location}
                            </span>
                          ) : null}
                        </div>
                        {Array.isArray(o.tags) && o.tags.length ? (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {o.tags.slice(0, 4).map((t, i) => (
                              <span
                                key={`tag-${idx}-${i}`}
                                className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            {/* CTA */}
            <SectionCard
              id="cta-oferta"
              title="Bloque de cierre (CTA)"
              description="Mensaje final con un título y un texto que invitan a continuar."
              variant="plain"
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
                  {form.ctaTitle || (
                    <span className="italic text-slate-400">(Sin título)</span>
                  )}
                </h2>
                <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-[#4b505a] sm:text-base">
                  {form.ctaBody || (
                    <span className="italic text-slate-400">(Sin texto)</span>
                  )}
                </p>
              </div>
            </SectionCard>
          </div>
        </article>

        {/* Footer pegajoso */}
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
              'Guardar cambios de Oferta académica'
            )}
          </button>
        </div>
      </div>
    </>
  )
}

function EditorBody({ editor, draft, setDraftField, saving, categoryOptions }) {
  if (!editor) return null
  switch (editor.kind) {
    case 'identity':
      return <IdentityForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'introTitle':
      return <IntroTitleForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'paragraph':
      return <ParagraphForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'highlight':
      return <HighlightForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'category':
      return <CategoryForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'offer':
      return (
        <OfferForm
          draft={draft}
          setDraftField={setDraftField}
          saving={saving}
          categoryOptions={categoryOptions}
        />
      )
    case 'cta':
      return <CtaForm draft={draft} setDraftField={setDraftField} saving={saving} />
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
          value={draft.heroEyebrow || ''}
          onChange={(e) => setDraftField('heroEyebrow', e.target.value)}
          disabled={saving}
          placeholder="Ej. Educación pública"
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
          helpText="Se usa como fondo del hero principal de Oferta académica."
          value={draft.heroImageUrl || ''}
          onChange={(value) => setDraftField('heroImageUrl', value)}
          kind="cover"
          disabled={saving}
        />
      </div>
    </div>
  )
}

function IntroTitleForm({ draft, setDraftField, saving }) {
  return (
    <label className={labelClass}>
      Título de la introducción
      <input
        className={inputClass}
        value={draft.introTitle || ''}
        onChange={(e) => setDraftField('introTitle', e.target.value)}
        disabled={saving}
      />
    </label>
  )
}

function ParagraphForm({ draft, setDraftField, saving }) {
  return (
    <label className={labelClass}>
      Texto del párrafo
      <textarea
        className={`${textareaClass} min-h-32`}
        value={draft.text || ''}
        onChange={(e) => setDraftField('text', e.target.value)}
        disabled={saving}
      />
      <span className="mt-1 text-xs text-slate-500">
        Escribí un solo párrafo. Para sumar más, agregá otra entrada.
      </span>
    </label>
  )
}

function HighlightForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className={labelClass}>
        Valor (número o texto corto)
        <input
          className={inputClass}
          value={draft.value || ''}
          onChange={(e) => setDraftField('value', e.target.value)}
          disabled={saving}
          placeholder="Ej. +20"
        />
      </label>
      <label className={labelClass}>
        Etiqueta
        <input
          className={inputClass}
          value={draft.label || ''}
          onChange={(e) => setDraftField('label', e.target.value)}
          disabled={saving}
          placeholder="Ej. Cursos disponibles"
        />
      </label>
    </div>
  )
}

function CategoryForm({ draft, setDraftField, saving }) {
  return (
    <label className={labelClass}>
      Nombre de la categoría
      <input
        className={inputClass}
        value={draft.name || ''}
        onChange={(e) => setDraftField('name', e.target.value)}
        disabled={saving}
        placeholder="Ej. Cursos y talleres"
      />
      <span className="mt-1 text-xs text-slate-500">
        Aparece como chip en el filtro del explorador público.
      </span>
    </label>
  )
}

function OfferForm({ draft, setDraftField, saving, categoryOptions }) {
  const safeCategory = categoryOptions.includes(draft.category)
    ? draft.category
    : categoryOptions[0] || ''
  return (
    <div className="grid max-h-[min(70dvh,560px)] gap-4 overflow-y-auto px-1 pb-1 sm:grid-cols-2">
      <label className={labelClass}>
        ID interno (opcional)
        <input
          className={inputClass}
          value={draft.id || ''}
          onChange={(e) => setDraftField('id', e.target.value)}
          disabled={saving}
          placeholder="ej. cursos-2026"
        />
      </label>
      <label className={labelClass}>
        Categoría
        <select
          className={inputClass}
          value={safeCategory}
          onChange={(e) => setDraftField('category', e.target.value)}
          disabled={saving || !categoryOptions.length}
        >
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Título
        <input
          className={inputClass}
          value={draft.title || ''}
          onChange={(e) => setDraftField('title', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Institución / responsable
        <input
          className={inputClass}
          value={draft.provider || ''}
          onChange={(e) => setDraftField('provider', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Modalidad
        <input
          className={inputClass}
          value={draft.modality || ''}
          onChange={(e) => setDraftField('modality', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Duración
        <input
          className={inputClass}
          value={draft.duration || ''}
          onChange={(e) => setDraftField('duration', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Lugar
        <input
          className={inputClass}
          value={draft.location || ''}
          onChange={(e) => setDraftField('location', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Resumen
        <textarea
          className={`${textareaClass} min-h-20`}
          value={draft.summary || ''}
          onChange={(e) => setDraftField('summary', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Detalles (uno por línea)
        <textarea
          className={`${textareaClass} min-h-24`}
          value={draft.detailsText || ''}
          onChange={(e) => setDraftField('detailsText', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Requisitos (uno por línea)
        <textarea
          className={`${textareaClass} min-h-24`}
          value={draft.requirementsText || ''}
          onChange={(e) => setDraftField('requirementsText', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Inscripción
        <textarea
          className={`${textareaClass} min-h-20`}
          value={draft.inscription || ''}
          onChange={(e) => setDraftField('inscription', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Etiquetas (separadas por coma)
        <input
          className={inputClass}
          value={draft.tagsText || ''}
          onChange={(e) => setDraftField('tagsText', e.target.value)}
          disabled={saving}
          placeholder="Ej. Gratuito, Presencial"
        />
      </label>
      <fieldset className="sm:col-span-2 grid gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 sm:grid-cols-2">
        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-600">
          Enlace externo (opcional)
        </legend>
        <label className={labelClass}>
          Texto del botón
          <input
            className={inputClass}
            value={draft.linkLabel || ''}
            onChange={(e) => setDraftField('linkLabel', e.target.value)}
            disabled={saving}
            placeholder="Ej. Más información"
          />
        </label>
        <label className={labelClass}>
          URL (https…)
          <input
            className={inputClass}
            value={draft.linkHref || ''}
            onChange={(e) => setDraftField('linkHref', e.target.value)}
            disabled={saving}
            placeholder="https://…"
          />
        </label>
      </fieldset>
    </div>
  )
}

function CtaForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-3">
      <label className={labelClass}>
        Título de cierre
        <input
          className={inputClass}
          value={draft.ctaTitle || ''}
          onChange={(e) => setDraftField('ctaTitle', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Texto de cierre
        <textarea
          className={`${textareaClass} min-h-32`}
          value={draft.ctaBody || ''}
          onChange={(e) => setDraftField('ctaBody', e.target.value)}
          disabled={saving}
        />
      </label>
    </div>
  )
}
