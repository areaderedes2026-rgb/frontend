import { useCallback, useEffect, useState } from 'react'
import { AdminServicesEditorPreview } from '../../components/admin/AdminServicesEditorPreview.jsx'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { HeroImageModal } from '../../components/admin/HeroImageModal.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import {
  DEFAULT_SERVICES_PAGE_CONTENT,
  linesToList,
  listToLines,
  mergeServicesPageContent,
  normalizeMunicipalService,
} from '../../data/servicesPageContent.js'
import {
  normalizeServiceCategories,
  resolveServiceCategoryId,
} from '../../data/serviceCategoriesContent.js'
import {
  createMunicipalService,
  deleteMunicipalService,
  fetchMunicipalServicesAdmin,
  fetchServicesPageContent,
  updateMunicipalService,
  updateServicesPageContent,
} from '../../services/municipalServicesService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import { ROUTES } from '../../utils/constants.js'

const ACTION_BTN_BASE =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60'
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`
const ACTION_BTN_NEUTRAL = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`

const EMPTY_SERVICE = {
  title: '',
  slug: '',
  category: '',
  mode: '',
  eta: '',
  summary: '',
  description: '',
  requirementsText: '',
  docsText: '',
  linkUrl: '',
  linkLabel: '',
  sortOrder: 0,
  isActive: true,
}

function serviceToForm(service, categories = []) {
  if (!service) return { ...EMPTY_SERVICE }
  const normalized = normalizeMunicipalService(service, 0, categories)
  return {
    title: normalized.title || '',
    slug: normalized.slug || '',
    category: normalized.category || '',
    mode: normalized.mode || '',
    eta: normalized.eta || '',
    summary: normalized.summary || '',
    description: normalized.description || '',
    requirementsText: listToLines(normalized.requirements),
    docsText: listToLines(normalized.docs),
    linkUrl: normalized.linkUrl || '',
    linkLabel: normalized.linkLabel || '',
    sortOrder: Number(normalized.sortOrder) || 0,
    isActive: normalized.isActive !== false,
  }
}

function mapContentToForm(content) {
  const categories = normalizeServiceCategories(content.categories).map((item) => ({ ...item }))
  return {
    heroEyebrow: content.heroEyebrow || '',
    heroTitle: content.heroTitle || '',
    heroSubtitle: content.heroSubtitle || '',
    heroSearchPlaceholder: content.heroSearchPlaceholder || '',
    heroImageUrl: content.heroImageUrl || '',
    heroPrimaryLabel: content.heroPrimaryLabel || '',
    heroPrimaryHref: content.heroPrimaryHref || '',
    heroSecondaryLabel: content.heroSecondaryLabel || '',
    heroSecondaryHref: content.heroSecondaryHref || '',
    steps: Array.isArray(content.steps) ? [...content.steps] : [],
    scheduleLines: Array.isArray(content.scheduleLines) ? [...content.scheduleLines] : [],
    categories,
    proceduresEyebrow: content.proceduresEyebrow || '',
    proceduresTitle: content.proceduresTitle || '',
    faq: Array.isArray(content.faq)
      ? content.faq.map((x) => ({ id: x?.id || '', q: x?.q || '', a: x?.a || '' }))
      : [],
    finalCtaTitle: content.finalCtaTitle || '',
    finalCtaText: content.finalCtaText || '',
    finalPrimaryLabel: content.finalPrimaryLabel || '',
    finalPrimaryHref: content.finalPrimaryHref || '',
    finalSecondaryLabel: content.finalSecondaryLabel || '',
    finalSecondaryHref: content.finalSecondaryHref || '',
  }
}

export function AdminServices() {
  const [contentForm, setContentForm] = useState(() => mapContentToForm(DEFAULT_SERVICES_PAGE_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [contentLoading, setContentLoading] = useState(true)
  const [contentSaving, setContentSaving] = useState(false)
  const [contentError, setContentError] = useState('')

  const [services, setServices] = useState([])
  const [itemsLoading, setItemsLoading] = useState(true)
  const [itemsError, setItemsError] = useState('')

  const [toast, setToast] = useState(null)
  const [heroImageOpen, setHeroImageOpen] = useState(false)
  const dismissToast = useCallback(() => setToast(null), [])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE)
  const [serviceSaving, setServiceSaving] = useState(false)
  const [serviceFormError, setServiceFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const apiAvailable = isApiConfigured()

  const loadContent = useCallback(async () => {
    setContentLoading(true)
    setContentError('')
    try {
      const remote = await fetchServicesPageContent()
      const merged = mergeServicesPageContent(DEFAULT_SERVICES_PAGE_CONTENT, remote || {})
      setContentForm(mapContentToForm(merged))
      setContentUpdatedAt(remote?.updatedAt || null)
    } catch (e) {
      setContentError(e.message || 'No se pudo cargar el contenido de servicios.')
    } finally {
      setContentLoading(false)
    }
  }, [])

  const loadItems = useCallback(async () => {
    setItemsLoading(true)
    setItemsError('')
    try {
      const list = await fetchMunicipalServicesAdmin()
      setServices(Array.isArray(list) ? list : [])
    } catch (e) {
      setItemsError(e.message || 'No se pudieron cargar los trámites.')
    } finally {
      setItemsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!apiAvailable) {
      setContentLoading(false)
      setItemsLoading(false)
      return
    }
    void loadContent()
    void loadItems()
  }, [apiAvailable, loadContent, loadItems])

  const buildPayload = useCallback(
    (forceOverwrite = false) => ({
      expectedUpdatedAt: contentUpdatedAt,
      forceOverwrite,
      ...contentForm,
    }),
    [contentForm, contentUpdatedAt],
  )

  const persistContent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const saved = await updateServicesPageContent(buildPayload(forceOverwrite))
      const merged = mergeServicesPageContent(DEFAULT_SERVICES_PAGE_CONTENT, saved || {})
      setContentForm(mapContentToForm(merged))
      setContentUpdatedAt(saved?.updatedAt || null)
      setContentError('')
      setToast({ variant: 'success', message: 'Contenido de servicios guardado.' })
    },
    [buildPayload],
  )

  const { conflictDialog, handleConflict } = useContentEditorConcurrencyConflict({
    reloadFromServer: loadContent,
    persistContent,
    entityLabel: 'Servicios al vecino',
    onReloadSuccess: () =>
      setToast({ variant: 'success', message: 'Se cargó la última versión del servidor.' }),
    onReloadError: (e) =>
      setToast({ variant: 'error', message: e.message || 'No se pudo recargar el contenido.' }),
    onForceSaveError: (e) => {
      setContentError(e.message || 'No se pudo guardar.')
      setToast({ variant: 'error', message: e.message || 'No se pudo guardar.' })
    },
  })

  const handleSaveContent = useCallback(async () => {
    if (!apiAvailable) {
      setToast({ variant: 'error', message: 'No hay conexión con el backend.' })
      return
    }
    setContentSaving(true)
    setContentError('')
    try {
      await persistContent()
    } catch (e) {
      if (handleConflict(e)) return
      setContentError(e.message || 'No se pudo guardar.')
      setToast({ variant: 'error', message: e.message || 'No se pudo guardar.' })
    } finally {
      setContentSaving(false)
    }
  }, [apiAvailable, handleConflict, persistContent])

  function openCreateService() {
    const cats = normalizeServiceCategories(contentForm.categories)
    setEditingService(null)
    setServiceForm({ ...EMPTY_SERVICE, category: cats[0]?.id || '' })
    setServiceFormError('')
    setModalOpen(true)
  }

  function openEditService(service) {
    setEditingService(service)
    setServiceForm(serviceToForm(service, contentForm.categories))
    setServiceFormError('')
    setModalOpen(true)
  }

  async function handleSaveService() {
    const title = serviceForm.title.trim()
    const summary = serviceForm.summary.trim()
    const description = serviceForm.description.trim()
    if (!title) {
      setServiceFormError('El título es obligatorio.')
      return
    }
    if (!summary && !description) {
      setServiceFormError('Completá al menos el resumen de tarjeta o la descripción detallada.')
      return
    }
    const payload = {
      title,
      slug: serviceForm.slug.trim(),
      category: serviceForm.category.trim(),
      mode: serviceForm.mode.trim(),
      eta: serviceForm.eta.trim(),
      summary,
      description,
      requirements: linesToList(serviceForm.requirementsText),
      docs: linesToList(serviceForm.docsText),
      linkUrl: serviceForm.linkUrl.trim(),
      linkLabel: serviceForm.linkLabel.trim(),
      sortOrder: Number(serviceForm.sortOrder) || 0,
      isActive: serviceForm.isActive !== false,
    }
    setServiceSaving(true)
    setServiceFormError('')
    try {
      if (editingService?.id) {
        await updateMunicipalService(editingService.id, payload)
        setToast({ variant: 'success', message: 'Trámite actualizado.' })
      } else {
        await createMunicipalService(payload)
        setToast({ variant: 'success', message: 'Trámite creado.' })
      }
      setModalOpen(false)
      await loadItems()
    } catch (e) {
      setServiceFormError(e.message || 'No se pudo guardar el trámite.')
    } finally {
      setServiceSaving(false)
    }
  }

  async function handleDeleteService() {
    if (!deleteTarget?.id) return
    setDeleting(true)
    try {
      await deleteMunicipalService(deleteTarget.id)
      setToast({ variant: 'success', message: 'Trámite eliminado.' })
      setDeleteTarget(null)
      await loadItems()
    } catch (e) {
      setToast({ variant: 'error', message: e.message || 'No se pudo eliminar.' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {conflictDialog}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Eliminar trámite"
        description={`¿Eliminar "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={deleting}
        variant="danger"
        onConfirm={() => void handleDeleteService()}
      />
      {toast ? <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} /> : null}

      <HeroImageModal
        open={heroImageOpen}
        title="Portada de Servicios al vecino"
        value={contentForm.heroImageUrl}
        onChange={(value) => setContentForm((prev) => ({ ...prev, heroImageUrl: value }))}
        onClose={() => setHeroImageOpen(false)}
        onSave={() => {
          setHeroImageOpen(false)
          setToast({
            variant: 'success',
            message: 'Portada actualizada en el borrador. Guardá los cambios para publicarla.',
          })
        }}
        saving={contentSaving}
        disabled={contentLoading || contentSaving}
        saveLabel="Aplicar al borrador"
      />

      <AdminPageShell
        showBackLink={false}
        eyebrow="Gestión municipal"
        title="Servicios al vecino"
        subtitle="Editá la página pública igual que la ven los vecinos: cada bloque tiene sus acciones de editar, agregar y quitar."
        maxWidthClass="max-w-none"
        variant="plain"
      >
        <h1 className="sr-only">Administración de servicios al vecino</h1>
        {!apiAvailable ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend.
          </div>
        ) : null}

        <AdminServicesEditorPreview
          form={contentForm}
          setForm={setContentForm}
          services={services}
          servicesLoading={itemsLoading}
          servicesError={itemsError}
          loading={contentLoading}
          saving={contentSaving}
          error={contentError}
          onSubmit={() => void handleSaveContent()}
          onChangeCover={() => setHeroImageOpen(true)}
          apiAvailable={apiAvailable}
          onAddService={openCreateService}
          onEditService={openEditService}
          onDeleteService={setDeleteTarget}
        />
      </AdminPageShell>

      <Modal
        open={modalOpen}
        onClose={() => !serviceSaving && setModalOpen(false)}
        loading={serviceSaving}
        size="wide"
        title={editingService ? 'Editar trámite' : 'Nuevo trámite'}
        description="Completá el detalle que verán los vecinos al tocar «Ver más». Los cambios del trámite se guardan al confirmar."
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" disabled={serviceSaving} onClick={() => setModalOpen(false)} className={ACTION_BTN_NEUTRAL}>
              Cancelar
            </button>
            <button type="button" disabled={serviceSaving} onClick={() => void handleSaveService()} className={ACTION_BTN_PRIMARY}>
              {serviceSaving ? 'Guardando…' : 'Guardar trámite'}
            </button>
          </div>
        }
      >
        {serviceFormError ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{serviceFormError}</p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>
            Título
            <input className={inputClass} value={serviceForm.title} onChange={(e) => setServiceForm((f) => ({ ...f, title: e.target.value }))} disabled={serviceSaving} />
          </label>
          <label className={labelClass}>
            Slug (opcional)
            <input className={inputClass} value={serviceForm.slug} onChange={(e) => setServiceForm((f) => ({ ...f, slug: e.target.value }))} disabled={serviceSaving} />
          </label>
          <label className={labelClass}>
            Categoría
            <select
              className={inputClass}
              value={serviceForm.category}
              onChange={(e) => setServiceForm((f) => ({ ...f, category: e.target.value }))}
              disabled={serviceSaving}
            >
              <option value="">Sin categoría</option>
              {normalizeServiceCategories(contentForm.categories).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Modalidad
            <input className={inputClass} value={serviceForm.mode} onChange={(e) => setServiceForm((f) => ({ ...f, mode: e.target.value }))} disabled={serviceSaving} />
          </label>
          <label className={labelClass}>
            Tiempo estimado
            <input className={inputClass} value={serviceForm.eta} onChange={(e) => setServiceForm((f) => ({ ...f, eta: e.target.value }))} disabled={serviceSaving} />
          </label>
          <label className={labelClass}>
            Orden
            <input type="number" min={0} className={inputClass} value={serviceForm.sortOrder} onChange={(e) => setServiceForm((f) => ({ ...f, sortOrder: e.target.value }))} disabled={serviceSaving} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Resumen en tarjeta
            <textarea
              className={`${textareaClass} min-h-20`}
              value={serviceForm.summary}
              onChange={(e) => setServiceForm((f) => ({ ...f, summary: e.target.value }))}
              disabled={serviceSaving}
              placeholder="Texto breve visible en la tarjeta del directorio (2–3 líneas)."
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Descripción detallada
            <textarea
              className={`${textareaClass} min-h-28`}
              value={serviceForm.description}
              onChange={(e) => setServiceForm((f) => ({ ...f, description: e.target.value }))}
              disabled={serviceSaving}
              placeholder="Información completa que se muestra en el modal al tocar «Ver más»."
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Requisitos (uno por línea)
            <textarea
              className={`${textareaClass} min-h-24`}
              value={serviceForm.requirementsText}
              onChange={(e) => setServiceForm((f) => ({ ...f, requirementsText: e.target.value }))}
              disabled={serviceSaving}
              placeholder="Condiciones previas para iniciar el trámite."
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Documentación requerida (una por línea)
            <textarea
              className={`${textareaClass} min-h-24`}
              value={serviceForm.docsText}
              onChange={(e) => setServiceForm((f) => ({ ...f, docsText: e.target.value }))}
              disabled={serviceSaving}
            />
          </label>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:col-span-2">
            <p className="text-sm font-semibold text-slate-900">Enlace de interés (opcional)</p>
            <p className="mt-1 text-xs text-slate-500">
              WhatsApp, formulario externo u otro recurso. Se muestra como botón dentro del modal.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                URL del enlace
                <input
                  className={inputClass}
                  value={serviceForm.linkUrl}
                  onChange={(e) => setServiceForm((f) => ({ ...f, linkUrl: e.target.value }))}
                  disabled={serviceSaving}
                  placeholder="https://wa.me/549381..."
                />
              </label>
              <label className={labelClass}>
                Texto del botón
                <input
                  className={inputClass}
                  value={serviceForm.linkLabel}
                  onChange={(e) => setServiceForm((f) => ({ ...f, linkLabel: e.target.value }))}
                  disabled={serviceSaving}
                  placeholder="Consultar por WhatsApp"
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={serviceSaving}
                onClick={() =>
                  setServiceForm((f) => ({
                    ...f,
                    linkUrl: f.linkUrl || 'https://wa.me/',
                    linkLabel: f.linkLabel || 'Consultar por WhatsApp',
                  }))
                }
                className={ACTION_BTN_NEUTRAL}
              >
                Plantilla WhatsApp
              </button>
              <button
                type="button"
                disabled={serviceSaving}
                onClick={() =>
                  setServiceForm((f) => ({
                    ...f,
                    linkUrl: ROUTES.atencionCiudadano,
                    linkLabel: f.linkLabel || 'Ir al formulario web',
                  }))
                }
                className={ACTION_BTN_NEUTRAL}
              >
                Formulario web
              </button>
              {(serviceForm.linkUrl || serviceForm.linkLabel) && (
                <button
                  type="button"
                  disabled={serviceSaving}
                  onClick={() => setServiceForm((f) => ({ ...f, linkUrl: '', linkLabel: '' }))}
                  className={ACTION_BTN_NEUTRAL}
                >
                  Quitar enlace
                </button>
              )}
            </div>
          </div>
          <label className={`${labelClass} flex items-center gap-2 sm:col-span-2`}>
            <input
              type="checkbox"
              checked={serviceForm.isActive}
              onChange={(e) => setServiceForm((f) => ({ ...f, isActive: e.target.checked }))}
              disabled={serviceSaving}
              className="h-4 w-4 rounded border-slate-300 text-sky-700"
            />
            Visible en el portal
          </label>
        </div>
      </Modal>
    </>
  )
}
