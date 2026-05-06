import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { SingleImageUploadField } from '../../components/admin/SingleImageUploadField.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  formErrorClass,
  inputClass,
  labelClass,
  textareaClass,
} from '../../components/ui/formStyles.js'
import {
  DEFAULT_OFERTA_ACADEMICA_CONTENT,
  mergeOfertaAcademicaContent,
} from '../../data/ofertaAcademicaContent.js'
import {
  fetchOfertaAcademicaContent,
  updateOfertaAcademicaContent,
} from '../../services/ofertaAcademicaService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'
import { ROUTES } from '../../utils/constants.js'

function cloneContent(c) {
  return JSON.parse(JSON.stringify(c))
}

function firstRealCategory(categories) {
  const found = (categories || []).find((x) => x && x !== 'Todos')
  return found || 'Cursos y talleres'
}

const EMPTY_OFFER_DRAFT = (categories) => ({
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

export function AdminOfertaAcademica() {
  const [form, setForm] = useState(() => cloneContent(DEFAULT_OFERTA_ACADEMICA_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [conflictOpen, setConflictOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const [offerDialog, setOfferDialog] = useState(null)
  const [offerDraft, setOfferDraft] = useState(() => EMPTY_OFFER_DRAFT(DEFAULT_OFERTA_ACADEMICA_CONTENT.categories))
  const [offerFormError, setOfferFormError] = useState('')
  const [removeOfferIndex, setRemoveOfferIndex] = useState(null)

  const categoryOptions = useMemo(() => (form.categories || []).filter((c) => c && c !== 'Todos'), [form.categories])

  useEffect(() => {
    let cancelled = false
    async function loadContent() {
      setError('')
      setLoading(true)
      if (!isApiConfigured()) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const remote = await fetchOfertaAcademicaContent()
        const merged = mergeOfertaAcademicaContent(DEFAULT_OFERTA_ACADEMICA_CONTENT, remote || {})
        if (!cancelled) {
          setForm(cloneContent(merged))
          setContentUpdatedAt(remote?.updatedAt || null)
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'No se pudo cargar Oferta académica.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadContent()
    return () => {
      cancelled = true
    }
  }, [])

  function closeOfferModal() {
    setOfferDialog(null)
    setOfferFormError('')
  }

  function openNewOffer() {
    const realCats = (form.categories || []).filter((c) => c && c !== 'Todos')
    if (!realCats.length) {
      setToast({
        type: 'error',
        message: 'Primero agregá al menos una categoría distinta de «Todos».',
      })
      return
    }
    setOfferDraft(EMPTY_OFFER_DRAFT(form.categories))
    setOfferFormError('')
    setOfferDialog('new')
  }

  function openEditOffer(index) {
    const row = form.offers[index]
    if (!row) return
    setOfferDraft(offerToDraft(row))
    setOfferFormError('')
    setOfferDialog(index)
  }

  function handleSaveOffer() {
    const built = draftToOffer(offerDraft)
    if (!built.title && !built.summary) {
      setOfferFormError('Completá al menos el título o el resumen de la oferta.')
      return
    }
    if (offerDialog === 'new') {
      setForm((prev) => ({
        ...prev,
        offers: [...(prev.offers || []), built],
      }))
    } else if (typeof offerDialog === 'number') {
      setForm((prev) => {
        const next = [...(prev.offers || [])]
        next[offerDialog] = built
        return { ...prev, offers: next }
      })
    }
    closeOfferModal()
  }

  function addCategory() {
    setForm((prev) => ({
      ...prev,
      categories: [...(prev.categories || []), 'Nueva categoría'],
    }))
  }

  function setCategoryAt(index, value) {
    if (index === 0) return
    setForm((prev) => {
      const cats = [...(prev.categories || [])]
      cats[index] = value
      return { ...prev, categories: cats }
    })
  }

  function removeCategory(index) {
    if (index === 0) return
    setForm((prev) => {
      const cats = (prev.categories || []).filter((_, i) => i !== index)
      const nextCats = cats[0] === 'Todos' ? cats : ['Todos', ...cats.filter((c) => c !== 'Todos')]
      const removed = prev.categories[index]
      const offers = (prev.offers || []).map((o) =>
        o.category === removed ? { ...o, category: firstRealCategory(nextCats) } : o,
      )
      return { ...prev, categories: nextCats, offers }
    })
  }

  function addParagraph() {
    setForm((prev) => ({
      ...prev,
      introParagraphs: [...(prev.introParagraphs || []), ''],
    }))
  }

  function setParagraph(i, value) {
    setForm((prev) => {
      const ps = [...(prev.introParagraphs || [])]
      ps[i] = value
      return { ...prev, introParagraphs: ps }
    })
  }

  function removeParagraph(i) {
    setForm((prev) => ({
      ...prev,
      introParagraphs: (prev.introParagraphs || []).filter((_, j) => j !== i),
    }))
  }

  function setHighlight(i, key, value) {
    setForm((prev) => {
      const hs = [...(prev.highlights || [])]
      const row = { ...(hs[i] || { label: '', value: '' }), [key]: value }
      hs[i] = row
      return { ...prev, highlights: hs }
    })
  }

  function addHighlight() {
    setForm((prev) => {
      if ((prev.highlights || []).length >= 6) return prev
      return { ...prev, highlights: [...(prev.highlights || []), { label: '', value: '' }] }
    })
  }

  function removeHighlight(i) {
    setForm((prev) => ({
      ...prev,
      highlights: (prev.highlights || []).filter((_, j) => j !== i),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!isApiConfigured()) {
      setToast({ type: 'error', message: 'No hay conexión disponible con el backend.' })
      return
    }
    setSaving(true)
    try {
      const realCats = (form.categories || []).filter((c) => c && c !== 'Todos')
      if (!realCats.length) {
        setToast({
          type: 'error',
          message: 'Agregá al menos una categoría además de «Todos».',
        })
        setSaving(false)
        return
      }
      const payload = {
        expectedUpdatedAt: contentUpdatedAt,
        heroEyebrow: form.heroEyebrow.trim(),
        heroTitle: form.heroTitle.trim(),
        heroSubtitle: form.heroSubtitle,
        heroImageUrl: form.heroImageUrl.trim(),
        introTitle: form.introTitle.trim(),
        introParagraphs: (form.introParagraphs || []).map((p) => String(p || '').trim()).filter(Boolean),
        highlights: (form.highlights || [])
          .map((h) => ({
            label: String(h?.label || '').trim(),
            value: String(h?.value || '').trim(),
          }))
          .filter((h) => h.label || h.value),
        categories: (form.categories || []).map((c) => String(c || '').trim()).filter(Boolean),
        offers: form.offers || [],
        ctaTitle: form.ctaTitle.trim(),
        ctaBody: form.ctaBody,
      }
      const saved = await updateOfertaAcademicaContent(payload)
      const merged = mergeOfertaAcademicaContent(DEFAULT_OFERTA_ACADEMICA_CONTENT, saved || {})
      setForm(cloneContent(merged))
      setContentUpdatedAt(saved?.updatedAt || null)
      setToast({ type: 'success', message: 'Se guardó la Oferta académica.' })
    } catch (e) {
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
      setError(e.message || 'No se pudo guardar.')
      setToast({ type: 'error', message: e.message || 'No se pudo guardar.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <ConfirmDialog
        open={conflictOpen}
        onClose={() => setConflictOpen(false)}
        title="Cambios desactualizados"
        description="Otro usuario guardó cambios antes que vos. Recargá la última versión y reintentá."
        confirmLabel="Recargar última versión y reintentar"
        cancelLabel="Cerrar"
        loading={false}
        onConfirm={() => window.location.reload()}
      />
      {toast ? <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} /> : null}
      <ConfirmDialog
        open={removeOfferIndex !== null}
        onClose={() => {
          if (!saving) setRemoveOfferIndex(null)
        }}
        title="¿Quitar esta oferta?"
        description="Se eliminará de la lista. Guardá el formulario para persistir los cambios en el servidor."
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        loading={false}
        onConfirm={() => {
          if (removeOfferIndex !== null) {
            setForm((prev) => ({
              ...prev,
              offers: (prev.offers || []).filter((_, i) => i !== removeOfferIndex),
            }))
          }
          setRemoveOfferIndex(null)
        }}
        variant="danger"
      />

      <Modal
        open={offerDialog !== null}
        onClose={() => !saving && closeOfferModal()}
        title={offerDialog === 'new' ? 'Nueva oferta' : 'Editar oferta'}
        description="Completá la ficha. Los requisitos y detalles: una línea por ítem. Etiquetas separadas por comas."
        size="wide"
        loading={saving}
      >
        <div className="grid max-h-[min(70dvh,560px)] gap-4 overflow-y-auto px-1 pb-1 sm:grid-cols-2">
          {offerFormError ? (
            <p className={`${formErrorClass} sm:col-span-2`} role="alert">
              {offerFormError}
            </p>
          ) : null}
          <label className={labelClass}>
            ID interno (opcional)
            <input
              className={inputClass}
              value={offerDraft.id}
              onChange={(e) => setOfferDraft((d) => ({ ...d, id: e.target.value }))}
              disabled={saving}
              placeholder="ej. cursos-2026"
            />
          </label>
          <label className={labelClass}>
            Categoría
            <select
              className={inputClass}
              value={categoryOptions.includes(offerDraft.category) ? offerDraft.category : categoryOptions[0] || ''}
              onChange={(e) => setOfferDraft((d) => ({ ...d, category: e.target.value }))}
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
              value={offerDraft.title}
              onChange={(e) => setOfferDraft((d) => ({ ...d, title: e.target.value }))}
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Institución / responsable
            <input
              className={inputClass}
              value={offerDraft.provider}
              onChange={(e) => setOfferDraft((d) => ({ ...d, provider: e.target.value }))}
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Modalidad
            <input
              className={inputClass}
              value={offerDraft.modality}
              onChange={(e) => setOfferDraft((d) => ({ ...d, modality: e.target.value }))}
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Duración
            <input
              className={inputClass}
              value={offerDraft.duration}
              onChange={(e) => setOfferDraft((d) => ({ ...d, duration: e.target.value }))}
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Lugar
            <input
              className={inputClass}
              value={offerDraft.location}
              onChange={(e) => setOfferDraft((d) => ({ ...d, location: e.target.value }))}
              disabled={saving}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Resumen
            <textarea
              className={`${textareaClass} min-h-20`}
              value={offerDraft.summary}
              onChange={(e) => setOfferDraft((d) => ({ ...d, summary: e.target.value }))}
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Detalles (uno por línea)
            <textarea
              className={`${textareaClass} min-h-24`}
              value={offerDraft.detailsText}
              onChange={(e) => setOfferDraft((d) => ({ ...d, detailsText: e.target.value }))}
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Requisitos (uno por línea)
            <textarea
              className={`${textareaClass} min-h-24`}
              value={offerDraft.requirementsText}
              onChange={(e) => setOfferDraft((d) => ({ ...d, requirementsText: e.target.value }))}
              disabled={saving}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Inscripción
            <textarea
              className={`${textareaClass} min-h-20`}
              value={offerDraft.inscription}
              onChange={(e) => setOfferDraft((d) => ({ ...d, inscription: e.target.value }))}
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Etiquetas (separadas por coma)
            <input
              className={inputClass}
              value={offerDraft.tagsText}
              onChange={(e) => setOfferDraft((d) => ({ ...d, tagsText: e.target.value }))}
              disabled={saving}
              placeholder="ej. Gratuito, Presencial"
            />
          </label>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Enlace externo (opcional)</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                Texto del botón
                <input
                  className={inputClass}
                  value={offerDraft.linkLabel}
                  onChange={(e) => setOfferDraft((d) => ({ ...d, linkLabel: e.target.value }))}
                  disabled={saving}
                />
              </label>
              <label className={labelClass}>
                URL (https…)
                <input
                  className={inputClass}
                  value={offerDraft.linkHref}
                  onChange={(e) => setOfferDraft((d) => ({ ...d, linkHref: e.target.value }))}
                  disabled={saving}
                />
              </label>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={closeOfferModal} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSaveOffer} disabled={saving}>
            Guardar oferta
          </Button>
        </div>
      </Modal>

      <AdminPageShell
        backTo={ROUTES.adminSettings}
        backLabel="Volver a configuración"
        eyebrow="Gobierno"
        title="Oferta académica"
        subtitle="Editá textos, categorías, métricas destacadas y fichas de propuestas que ve el ciudadano en el portal."
        maxWidthClass="max-w-5xl"
        variant="plain"
      >
        {!isApiConfigured() ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend para guardar cambios.
          </div>
        ) : null}
        {error ? (
          <p className={formErrorClass} role="alert">
            {error}
          </p>
        ) : null}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Portada</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Etiqueta
                <input
                  className={inputClass}
                  value={form.heroEyebrow}
                  onChange={(e) => setForm((p) => ({ ...p, heroEyebrow: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Título
                <input
                  className={inputClass}
                  value={form.heroTitle}
                  onChange={(e) => setForm((p) => ({ ...p, heroTitle: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Subtítulo
                <textarea
                  className={`${textareaClass} min-h-24`}
                  value={form.heroSubtitle}
                  onChange={(e) => setForm((p) => ({ ...p, heroSubtitle: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <div className="sm:col-span-2">
                <SingleImageUploadField
                  label="Imagen de portada"
                  helpText="Imagen principal del encabezado o URL."
                  value={form.heroImageUrl}
                  onChange={(value) => setForm((p) => ({ ...p, heroImageUrl: value }))}
                  kind="cover"
                  disabled={loading || saving}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Introducción</h2>
            <div className="mt-4 space-y-4">
              <label className={labelClass}>
                Título de la sección
                <input
                  className={inputClass}
                  value={form.introTitle}
                  onChange={(e) => setForm((p) => ({ ...p, introTitle: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-700">Párrafos</span>
                  <Button type="button" variant="secondary" disabled={loading || saving} onClick={addParagraph}>
                    Añadir párrafo
                  </Button>
                </div>
                <ul className="mt-3 space-y-3">
                  {(form.introParagraphs || []).map((p, i) => (
                    <li key={`p-${i}`} className="flex gap-2">
                      <textarea
                        className={`${textareaClass} min-h-20 flex-1`}
                        value={p}
                        onChange={(e) => setParagraph(i, e.target.value)}
                        disabled={loading || saving}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={loading || saving}
                        onClick={() => removeParagraph(i)}
                      >
                        Quitar
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">Cifras destacadas</h2>
              <Button
                type="button"
                variant="secondary"
                disabled={loading || saving || (form.highlights || []).length >= 6}
                onClick={addHighlight}
              >
                Añadir tarjeta
              </Button>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(form.highlights || []).map((h, i) => (
                <li key={`h-${i}`} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-xs font-semibold text-rose-700 hover:underline"
                      disabled={loading || saving}
                      onClick={() => removeHighlight(i)}
                    >
                      Quitar
                    </button>
                  </div>
                  <label className={`${labelClass} mt-1`}>
                    Etiqueta
                    <input
                      className={inputClass}
                      value={h.label}
                      onChange={(e) => setHighlight(i, 'label', e.target.value)}
                      disabled={loading || saving}
                    />
                  </label>
                  <label className={labelClass}>
                    Valor
                    <input
                      className={inputClass}
                      value={h.value}
                      onChange={(e) => setHighlight(i, 'value', e.target.value)}
                      disabled={loading || saving}
                    />
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">Categorías del filtro</h2>
              <Button type="button" variant="secondary" disabled={loading || saving} onClick={addCategory}>
                Añadir categoría
              </Button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              La primera categoría debe ser «Todos» (filtro completo). El resto define los chips del explorador.
            </p>
            <ul className="mt-4 space-y-2">
              {(form.categories || []).map((c, i) => (
                <li key={`cat-${i}`} className="flex flex-wrap items-center gap-2">
                  <input
                    className={`${inputClass} max-w-md flex-1`}
                    value={c}
                    onChange={(e) => setCategoryAt(i, e.target.value)}
                    disabled={loading || saving || i === 0}
                    aria-label={i === 0 ? 'Categoría Todos (fija)' : `Categoría ${i + 1}`}
                  />
                  {i > 0 ? (
                    <Button type="button" variant="secondary" disabled={loading || saving} onClick={() => removeCategory(i)}>
                      Quitar
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-500">Fija</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">Ofertas</h2>
              <Button type="button" variant="secondary" disabled={loading || saving} onClick={openNewOffer}>
                Nueva oferta
              </Button>
            </div>
            <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">
              {(form.offers || []).length === 0 ? (
                <li className="px-4 py-6 text-sm text-slate-600">No hay ofertas. Agregá al menos una ficha.</li>
              ) : (
                (form.offers || []).map((o, idx) => (
                  <li key={o.id || idx} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{o.title || '(sin título)'}</p>
                      <p className="text-xs text-slate-600">
                        {o.category} · {o.provider || '—'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" disabled={loading || saving} onClick={() => openEditOffer(idx)}>
                        Editar
                      </Button>
                      <Button type="button" variant="secondary" disabled={loading || saving} onClick={() => setRemoveOfferIndex(idx)}>
                        Quitar
                      </Button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Cierre (CTA)</h2>
            <div className="mt-4 grid gap-4">
              <label className={labelClass}>
                Título
                <input
                  className={inputClass}
                  value={form.ctaTitle}
                  onChange={(e) => setForm((p) => ({ ...p, ctaTitle: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Texto
                <textarea
                  className={`${textareaClass} min-h-28`}
                  value={form.ctaBody}
                  onChange={(e) => setForm((p) => ({ ...p, ctaBody: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={loading || saving}>
              {saving ? 'Guardando…' : 'Guardar todo'}
            </Button>
          </div>
        </form>
      </AdminPageShell>
    </>
  )
}
