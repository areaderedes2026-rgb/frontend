import { useCallback, useEffect, useMemo, useState } from 'react'
import { HomeHeroBanner } from '../../components/home/HomeHeroBanner.jsx'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { SingleImageUploadField } from '../../components/admin/SingleImageUploadField.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { formErrorClass, inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import { DEFAULT_HOME_HERO_CONTENT, mergeHomeHeroContent } from '../../data/homeHeroContent.js'
import { fetchHomeHeroContent, updateHomeHeroContent } from '../../services/homeHeroService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { ROUTES } from '../../utils/constants.js'

const EMPTY_SLIDE = {
  id: '',
  eyebrow: '',
  title: '',
  subtitle: '',
  imageUrl: '',
  mobileImageUrl: '',
  imageAlt: '',
  overlayOpacity: 65,
  showEyebrow: true,
  showTitle: true,
  showSubtitle: true,
  showPrimaryButton: true,
  primaryLabel: 'Realizar consulta',
  primaryHref: ROUTES.atencionCiudadano,
  showSecondaryButton: true,
  secondaryLabel: 'Ver servicios',
  secondaryHref: ROUTES.services,
  textAlign: 'left',
  isActive: true,
  sortOrder: 0,
}

function cleanText(value) {
  return String(value || '').trim()
}

function makeRowId(slide, idx) {
  return `${slide.id || 'banner'}-${idx}-${Math.random().toString(36).slice(2, 8)}`
}

function slugFromText(value, fallback = 'banner') {
  const slug = cleanText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return slug || fallback
}

function withRowIds(content) {
  return {
    ...content,
    slides: (content.slides || []).map((slide, idx) => ({
      ...slide,
      _rowId: makeRowId(slide, idx),
    })),
  }
}

function stripRowIds(slides) {
  return slides.map((slide) => {
    const out = { ...slide }
    delete out._rowId
    return out
  })
}

function normalizeSlideForSave(slide, index) {
  const title = cleanText(slide.title)
  const fallbackId = slugFromText(title || slide.eyebrow || `banner-${index + 1}`, `banner-${index + 1}`)

  return {
    ...slide,
    id: slugFromText(slide.id || fallbackId, fallbackId),
    eyebrow: cleanText(slide.eyebrow),
    title,
    subtitle: String(slide.subtitle || '').trim(),
    imageUrl: cleanText(slide.imageUrl),
    mobileImageUrl: cleanText(slide.mobileImageUrl),
    imageAlt: cleanText(slide.imageAlt),
    overlayOpacity: Math.min(90, Math.max(0, Math.round(Number(slide.overlayOpacity) || 0))),
    primaryLabel: cleanText(slide.primaryLabel),
    primaryHref: cleanText(slide.primaryHref),
    secondaryLabel: cleanText(slide.secondaryLabel),
    secondaryHref: cleanText(slide.secondaryHref),
    textAlign: ['left', 'center', 'right'].includes(slide.textAlign) ? slide.textAlign : 'left',
    sortOrder: Math.max(0, Math.round(Number(slide.sortOrder) || index * 10)),
    isActive: slide.isActive !== false,
    showEyebrow: slide.showEyebrow !== false,
    showTitle: slide.showTitle !== false,
    showSubtitle: slide.showSubtitle !== false,
    showPrimaryButton: slide.showPrimaryButton !== false,
    showSecondaryButton: slide.showSecondaryButton !== false,
  }
}

function buildPayload(form, expectedUpdatedAt = null) {
  const slides = stripRowIds(form.slides || []).map((slide, idx) => normalizeSlideForSave(slide, idx))
  const activeSlideId = slides.some((slide) => slide.id === form.activeSlideId)
    ? form.activeSlideId
    : slides[0]?.id || ''

  return {
    expectedUpdatedAt,
    displayMode: form.displayMode === 'carousel' ? 'carousel' : 'single',
    activeSlideId,
    autoplayEnabled: form.autoplayEnabled !== false,
    autoplaySeconds: Math.min(30, Math.max(3, Math.round(Number(form.autoplaySeconds) || 6))),
    slides,
  }
}

function snapshotFromForm(form) {
  const content = buildPayload(form, null)
  delete content.expectedUpdatedAt
  return JSON.stringify(content)
}

function Toggle({ label, checked, onChange, disabled = false }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-sky-700"
      />
      {label}
    </label>
  )
}

export function AdminSettingsHomeBanners() {
  const initialForm = useMemo(() => withRowIds(mergeHomeHeroContent(DEFAULT_HOME_HERO_CONTENT, {})), [])
  const [form, setForm] = useState(initialForm)
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshotFromForm(initialForm))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [conflictOpen, setConflictOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRowId, setEditingRowId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [slideDraft, setSlideDraft] = useState({ ...EMPTY_SLIDE })
  const dismissToast = useCallback(() => setToast(null), [])
  const isEditing = Boolean(editingRowId)

  const sortedSlides = useMemo(
    () => [...(form.slides || [])].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)),
    [form.slides],
  )
  const activeSlides = useMemo(() => sortedSlides.filter((slide) => slide.isActive !== false), [sortedSlides])
  const hasUnsavedChanges = useMemo(
    () => snapshotFromForm(form) !== savedSnapshot,
    [form, savedSnapshot],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const remote = await fetchHomeHeroContent()
      const merged = mergeHomeHeroContent(DEFAULT_HOME_HERO_CONTENT, remote || {})
      const nextForm = withRowIds(merged)
      setForm(nextForm)
      setSavedSnapshot(snapshotFromForm(nextForm))
      setContentUpdatedAt(remote?.updatedAt || null)
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los banners de Inicio.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoading(false)
      return
    }
    void load()
  }, [load])

  function openCreateModal() {
    setEditingRowId(null)
    setSlideDraft({
      ...EMPTY_SLIDE,
      id: `banner-${(form.slides || []).length + 1}`,
      sortOrder: (form.slides || []).length * 10,
    })
    setModalOpen(true)
  }

  function openEditModal(slide) {
    setEditingRowId(slide._rowId)
    setSlideDraft({
      ...EMPTY_SLIDE,
      ...slide,
      sortOrder: String(slide.sortOrder ?? 0),
    })
    setModalOpen(true)
  }

  function updateDraft(field, value) {
    setSlideDraft((prev) => ({ ...prev, [field]: value }))
  }

  function saveSlideFromModal() {
    const next = normalizeSlideForSave(slideDraft, form.slides.length)
    if (!next.title && !next.imageUrl && !next.mobileImageUrl) {
      setToast({ type: 'error', message: 'Completá al menos un título o una imagen para el banner.' })
      return
    }

    const duplicated = form.slides.some((slide) => slide.id === next.id && slide._rowId !== editingRowId)
    if (duplicated) {
      setToast({ type: 'error', message: 'Ya existe otro banner con ese ID interno.' })
      return
    }

    setForm((prev) => {
      if (isEditing) {
        return {
          ...prev,
          activeSlideId: prev.activeSlideId === slideDraft.id ? next.id : prev.activeSlideId,
          slides: prev.slides.map((slide) =>
            slide._rowId === editingRowId ? { ...next, _rowId: slide._rowId } : slide,
          ),
        }
      }
      return {
        ...prev,
        activeSlideId: prev.activeSlideId || next.id,
        slides: [...prev.slides, { ...next, _rowId: makeRowId(next, prev.slides.length) }],
      }
    })
    setModalOpen(false)
  }

  function deleteSlide(rowId) {
    setForm((prev) => {
      const nextSlides = prev.slides.filter((slide) => slide._rowId !== rowId)
      const activeStillExists = nextSlides.some((slide) => slide.id === prev.activeSlideId)
      return {
        ...prev,
        activeSlideId: activeStillExists ? prev.activeSlideId : nextSlides[0]?.id || '',
        slides: nextSlides,
      }
    })
  }

  async function handleSubmit(event) {
    event?.preventDefault?.()
    if (!isApiConfigured()) {
      setToast({ type: 'error', message: 'No hay conexión disponible con el backend.' })
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = buildPayload(form, contentUpdatedAt)
      const saved = await updateHomeHeroContent(payload)
      const merged = mergeHomeHeroContent(DEFAULT_HOME_HERO_CONTENT, saved || {})
      const nextForm = withRowIds(merged)
      setForm(nextForm)
      setSavedSnapshot(snapshotFromForm(nextForm))
      setContentUpdatedAt(saved?.updatedAt || null)
      setToast({ type: 'success', message: 'Banners de Inicio actualizados.' })
    } catch (e) {
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
      const message = e.message || 'No se pudieron guardar los banners de Inicio.'
      setError(message)
      setToast({ type: 'error', message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {toast ? <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} /> : null}
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
      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => {
          if (!saving) setDeleteTarget(null)
        }}
        title="¿Quitar banner?"
        description={
          deleteTarget ? (
            <>
              Se va a quitar{' '}
              <span className="font-semibold text-slate-900">«{deleteTarget.title || deleteTarget.id}»</span>{' '}
              del borrador. Guardá los cambios para publicarlo.
            </>
          ) : null
        }
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        loading={false}
        variant="danger"
        onConfirm={() => {
          if (!deleteTarget) return
          deleteSlide(deleteTarget._rowId)
          setDeleteTarget(null)
          setToast({ type: 'success', message: 'Banner quitado del borrador.' })
        }}
      />
      <Modal
        open={modalOpen}
        onClose={() => {
          if (!saving) setModalOpen(false)
        }}
        loading={false}
        size="wide"
        title={isEditing ? 'Editar banner' : 'Crear banner'}
        description="Cada banner puede tener imagen, textos, botones y reglas de visibilidad propias."
      >
        <div className="grid gap-5">
          <SingleImageUploadField
            label="Imagen desktop del banner"
            helpText="Imagen horizontal para pantallas grandes. Recomendado: formato banner ancho."
            value={slideDraft.imageUrl}
            onChange={(url) => updateDraft('imageUrl', url)}
            disabled={saving}
          />
          <SingleImageUploadField
            label="Imagen para celular (opcional)"
            helpText="Usala cuando el recorte del banner horizontal no funcione bien en móvil. Si queda vacía, se usa la imagen desktop."
            value={slideDraft.mobileImageUrl}
            onChange={(url) => updateDraft('mobileImageUrl', url)}
            disabled={saving}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              ID interno
              <input
                className={inputClass}
                value={slideDraft.id}
                disabled={saving}
                onChange={(e) => updateDraft('id', e.target.value)}
                placeholder="banner-institucional"
              />
            </label>
            <label className={labelClass}>
              Orden
              <input
                type="number"
                min={0}
                className={inputClass}
                value={slideDraft.sortOrder}
                disabled={saving}
                onChange={(e) => updateDraft('sortOrder', e.target.value)}
              />
            </label>
            <label className={labelClass}>
              Antetítulo
              <input
                className={inputClass}
                value={slideDraft.eyebrow}
                disabled={saving}
                onChange={(e) => updateDraft('eyebrow', e.target.value)}
              />
            </label>
            <label className={labelClass}>
              Título
              <input
                className={inputClass}
                value={slideDraft.title}
                disabled={saving}
                onChange={(e) => updateDraft('title', e.target.value)}
              />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Subtítulo
              <textarea
                className={`${textareaClass} min-h-24`}
                value={slideDraft.subtitle}
                disabled={saving}
                onChange={(e) => updateDraft('subtitle', e.target.value)}
              />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Texto alternativo de imagen
              <input
                className={inputClass}
                value={slideDraft.imageAlt}
                disabled={saving}
                onChange={(e) => updateDraft('imageAlt', e.target.value)}
                placeholder="Descripción breve de la imagen para administración"
              />
            </label>
            <label className={labelClass}>
              Alineación del texto
              <select
                className={inputClass}
                value={slideDraft.textAlign}
                disabled={saving}
                onChange={(e) => updateDraft('textAlign', e.target.value)}
              >
                <option value="left">Izquierda</option>
                <option value="center">Centro</option>
                <option value="right">Derecha</option>
              </select>
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Opacidad del overlay: {Math.min(90, Math.max(0, Number(slideDraft.overlayOpacity) || 0))}%
              <input
                type="range"
                min={0}
                max={90}
                step={5}
                className="mt-2 w-full accent-sky-700"
                value={slideDraft.overlayOpacity}
                disabled={saving}
                onChange={(e) => updateDraft('overlayOpacity', e.target.value)}
              />
              <span className="mt-1 text-xs font-normal text-slate-500">
                Subila si necesitás más contraste en los textos; bajala si la imagen ya tiene buen contraste.
              </span>
            </label>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Visibilidad del contenido</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <Toggle label="Banner activo" checked={slideDraft.isActive !== false} onChange={(v) => updateDraft('isActive', v)} disabled={saving} />
              <Toggle label="Mostrar antetítulo" checked={slideDraft.showEyebrow !== false} onChange={(v) => updateDraft('showEyebrow', v)} disabled={saving} />
              <Toggle label="Mostrar título" checked={slideDraft.showTitle !== false} onChange={(v) => updateDraft('showTitle', v)} disabled={saving} />
              <Toggle label="Mostrar subtítulo" checked={slideDraft.showSubtitle !== false} onChange={(v) => updateDraft('showSubtitle', v)} disabled={saving} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Botones del banner</h3>
              <div className="flex flex-wrap gap-2">
                <Toggle label="Botón principal" checked={slideDraft.showPrimaryButton !== false} onChange={(v) => updateDraft('showPrimaryButton', v)} disabled={saving} />
                <Toggle label="Botón secundario" checked={slideDraft.showSecondaryButton !== false} onChange={(v) => updateDraft('showSecondaryButton', v)} disabled={saving} />
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                Texto botón principal
                <input
                  className={inputClass}
                  value={slideDraft.primaryLabel}
                  disabled={saving}
                  onChange={(e) => updateDraft('primaryLabel', e.target.value)}
                />
              </label>
              <label className={labelClass}>
                Enlace botón principal
                <input
                  className={inputClass}
                  value={slideDraft.primaryHref}
                  disabled={saving}
                  onChange={(e) => updateDraft('primaryHref', e.target.value)}
                  placeholder="/atencion-ciudadano, #seccion o https://..."
                />
              </label>
              <label className={labelClass}>
                Texto botón secundario
                <input
                  className={inputClass}
                  value={slideDraft.secondaryLabel}
                  disabled={saving}
                  onChange={(e) => updateDraft('secondaryLabel', e.target.value)}
                />
              </label>
              <label className={labelClass}>
                Enlace botón secundario
                <input
                  className={inputClass}
                  value={slideDraft.secondaryHref}
                  disabled={saving}
                  onChange={(e) => updateDraft('secondaryHref', e.target.value)}
                  placeholder="/services, #seccion o https://..."
                />
              </label>
            </div>
          </section>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={saveSlideFromModal} disabled={saving}>
            {isEditing ? 'Aplicar cambios' : 'Crear banner'}
          </Button>
        </div>
      </Modal>

      {hasUnsavedChanges ? (
        <div className="fixed inset-x-0 bottom-4 z-40 px-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-sky-200 bg-white/95 p-3 shadow-2xl shadow-slate-900/20 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Hay cambios sin guardar</p>
              <p className="text-xs text-slate-600">
                Guardalos para que se publiquen en la portada del sitio.
              </p>
            </div>
            <Button
              type="button"
              disabled={loading || saving || !isApiConfigured()}
              onClick={() => void handleSubmit()}
              className="shrink-0"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      ) : null}

      <AdminPageShell
        showBackLink={false}
        eyebrow="Configuración"
        title="Banners principales de Inicio"
        subtitle="Gestioná el hero de la portada: uno o varios banners, textos, botones, imágenes y rotación automática."
        maxWidthClass="max-w-7xl"
        variant="plain"
      >
        {!isApiConfigured() ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend para guardar cambios.
          </div>
        ) : null}

        <form className={`space-y-6 ${hasUnsavedChanges ? 'pb-28' : ''}`} onSubmit={handleSubmit}>
          {error ? (
            <p className={formErrorClass} role="alert">
              {error}
            </p>
          ) : null}

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Comportamiento</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Elegí si se muestra un solo banner o una secuencia automática.
                </p>
              </div>
              <Button type="submit" disabled={loading || saving || !hasUnsavedChanges}>
                {saving ? 'Guardando…' : hasUnsavedChanges ? 'Guardar banners' : 'Sin cambios'}
              </Button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <label className={labelClass}>
                Modo de visualización
                <select
                  className={inputClass}
                  value={form.displayMode}
                  disabled={loading || saving}
                  onChange={(e) => setForm((prev) => ({ ...prev, displayMode: e.target.value }))}
                >
                  <option value="single">Mostrar uno solo</option>
                  <option value="carousel">Mostrar varios</option>
                </select>
              </label>
              <label className={labelClass}>
                Banner fijo
                <select
                  className={inputClass}
                  value={form.activeSlideId || sortedSlides[0]?.id || ''}
                  disabled={loading || saving || sortedSlides.length === 0}
                  onChange={(e) => setForm((prev) => ({ ...prev, activeSlideId: e.target.value }))}
                >
                  {sortedSlides.map((slide) => (
                    <option key={slide._rowId} value={slide.id}>
                      {slide.title || slide.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Segundos por banner
                <input
                  type="number"
                  min={3}
                  max={30}
                  className={inputClass}
                  value={form.autoplaySeconds}
                  disabled={loading || saving || form.displayMode !== 'carousel'}
                  onChange={(e) => setForm((prev) => ({ ...prev, autoplaySeconds: e.target.value }))}
                />
              </label>
              <div className="flex items-end">
                <Toggle
                  label="Rotación automática"
                  checked={form.autoplayEnabled !== false}
                  disabled={loading || saving || form.displayMode !== 'carousel'}
                  onChange={(value) => setForm((prev) => ({ ...prev, autoplayEnabled: value }))}
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              En modo carrusel se publican los banners activos ordenados. Si el vecino tiene reducción de movimiento activada, no se reproducen solos.
            </p>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-200/80 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">Vista previa</h2>
              <p className="mt-1 text-sm text-slate-600">
                Es la misma pieza visual que se muestra en la portada, en altura reducida para administración.
              </p>
            </div>
            <HomeHeroBanner content={{ ...form, slides: stripRowIds(form.slides) }} preview />
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Banners cargados</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {activeSlides.length} activo{activeSlides.length === 1 ? '' : 's'} de {sortedSlides.length} banner{sortedSlides.length === 1 ? '' : 's'}.
                </p>
              </div>
              <Button type="button" variant="secondary" disabled={loading || saving} onClick={openCreateModal}>
                + Agregar banner
              </Button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {sortedSlides.map((slide) => {
                const imageSource = slide.imageUrl || slide.mobileImageUrl
                const image = imageSource ? resolveMediaUrl(imageSource) || imageSource : ''
                const overlay = Math.min(90, Math.max(0, Number(slide.overlayOpacity ?? 65))) / 100
                return (
                  <article
                    key={slide._rowId}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 shadow-sm"
                  >
                    <div className="relative aspect-16/7 bg-slate-900">
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full object-cover object-center"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-sm text-slate-400">
                          Sin imagen
                        </div>
                      )}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(to top, rgba(0,0,0,${Math.min(0.92, overlay + 0.18)}), rgba(0,0,0,${overlay}), rgba(0,0,0,${Math.max(0, overlay - 0.25)}))`,
                        }}
                      />
                      <div className="absolute left-4 right-4 bottom-4">
                        {slide.showEyebrow !== false && slide.eyebrow ? (
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-100">{slide.eyebrow}</p>
                        ) : null}
                        {slide.showTitle !== false && slide.title ? (
                          <h3 className="mt-1 line-clamp-2 font-serif text-2xl font-bold text-white">{slide.title}</h3>
                        ) : null}
                      </div>
                      <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        slide.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {slide.isActive !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">ID: {slide.id}</span>
                        <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">Orden: {slide.sortOrder}</span>
                        <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">Texto: {slide.textAlign}</span>
                        <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                          Overlay: {Math.round(overlay * 100)}%
                        </span>
                        {slide.mobileImageUrl ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800 ring-1 ring-emerald-100">
                            Imagen móvil
                          </span>
                        ) : null}
                        {form.activeSlideId === slide.id ? (
                          <span className="rounded-full bg-sky-50 px-2.5 py-1 font-semibold text-sky-800 ring-1 ring-sky-100">
                            Banner fijo
                          </span>
                        ) : null}
                      </div>
                      {slide.subtitle ? (
                        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{slide.subtitle}</p>
                      ) : null}
                      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="px-3! py-1.5! text-xs!"
                          disabled={loading || saving}
                          onClick={() => openEditModal(slide)}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          className="px-3! py-1.5! text-xs!"
                          disabled={loading || saving}
                          onClick={() => setDeleteTarget(slide)}
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  </article>
                )
              })}
              {sortedSlides.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                  <p className="text-sm text-slate-600">Todavía no hay banners cargados.</p>
                  <Button type="button" className="mt-4" onClick={openCreateModal}>
                    Crear primer banner
                  </Button>
                </div>
              ) : null}
            </div>
          </section>
        </form>
      </AdminPageShell>
    </>
  )
}
