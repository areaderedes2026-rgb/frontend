import { useCallback, useEffect, useRef, useState } from 'react'
import { AdminServicesEditorPreview } from '../../components/admin/AdminServicesEditorPreview.jsx'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import {
  DEFAULT_SERVICES_PAGE_CONTENT,
  mergeServicesPageContent,
} from '../../data/servicesPageContent.js'
import {
  createMunicipalService,
  deleteMunicipalService,
  fetchMunicipalServicesAdmin,
  fetchServicesPageContent,
  updateMunicipalService,
  updateServicesPageContent,
} from '../../services/municipalServicesService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'
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
  docsText: '',
  linkHref: ROUTES.atencionCiudadano,
  sortOrder: 0,
  isActive: true,
}

function mapContentToForm(content) {
  return {
    heroEyebrow: content.heroEyebrow || '',
    heroTitle: content.heroTitle || '',
    heroSubtitle: content.heroSubtitle || '',
    heroImageUrl: content.heroImageUrl || '',
    heroPrimaryLabel: content.heroPrimaryLabel || '',
    heroPrimaryHref: content.heroPrimaryHref || '',
    heroSecondaryLabel: content.heroSecondaryLabel || '',
    heroSecondaryHref: content.heroSecondaryHref || '',
    steps: Array.isArray(content.steps) ? [...content.steps] : [],
    scheduleLines: Array.isArray(content.scheduleLines) ? [...content.scheduleLines] : [],
    categories: Array.isArray(content.categories) ? [...content.categories] : [],
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

function serviceToForm(service) {
  if (!service) return { ...EMPTY_SERVICE }
  return {
    title: service.title || '',
    slug: service.slug || '',
    category: service.category || '',
    mode: service.mode || '',
    eta: service.eta || '',
    summary: service.summary || '',
    docsText: Array.isArray(service.docs) ? service.docs.join('\n') : '',
    linkHref: service.linkHref || ROUTES.atencionCiudadano,
    sortOrder: Number(service.sortOrder) || 0,
    isActive: service.isActive !== false,
  }
}

export function AdminServices() {
  const itemsRef = useRef(null)
  const [contentForm, setContentForm] = useState(() => mapContentToForm(DEFAULT_SERVICES_PAGE_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [contentLoading, setContentLoading] = useState(true)
  const [contentSaving, setContentSaving] = useState(false)
  const [contentError, setContentError] = useState('')

  const [services, setServices] = useState([])
  const [itemsLoading, setItemsLoading] = useState(true)
  const [itemsError, setItemsError] = useState('')

  const [toast, setToast] = useState(null)
  const [conflictOpen, setConflictOpen] = useState(false)
  const dismissToast = useCallback(() => setToast(null), [])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE)
  const [serviceSaving, setServiceSaving] = useState(false)
  const [serviceFormError, setServiceFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

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
    if (!isApiConfigured()) {
      setContentLoading(false)
      setItemsLoading(false)
      return
    }
    void loadContent()
    void loadItems()
  }, [loadContent, loadItems])

  const handleSaveContent = useCallback(async () => {
    if (!isApiConfigured()) {
      setToast({ variant: 'error', message: 'No hay conexión con el backend.' })
      return
    }
    setContentSaving(true)
    setContentError('')
    try {
      const saved = await updateServicesPageContent({
        expectedUpdatedAt: contentUpdatedAt,
        ...contentForm,
      })
      const merged = mergeServicesPageContent(DEFAULT_SERVICES_PAGE_CONTENT, saved || {})
      setContentForm(mapContentToForm(merged))
      setContentUpdatedAt(saved?.updatedAt || null)
      setToast({ variant: 'success', message: 'Contenido de servicios guardado.' })
    } catch (e) {
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
      setContentError(e.message || 'No se pudo guardar.')
      setToast({ variant: 'error', message: e.message || 'No se pudo guardar.' })
    } finally {
      setContentSaving(false)
    }
  }, [contentForm, contentUpdatedAt])

  function openCreateService() {
    setEditingService(null)
    setServiceForm({ ...EMPTY_SERVICE, category: contentForm.categories?.[0] || '' })
    setServiceFormError('')
    setModalOpen(true)
  }

  function openEditService(service) {
    setEditingService(service)
    setServiceForm(serviceToForm(service))
    setServiceFormError('')
    setModalOpen(true)
  }

  async function handleSaveService() {
    const title = serviceForm.title.trim()
    const summary = serviceForm.summary.trim()
    if (!title) {
      setServiceFormError('El título es obligatorio.')
      return
    }
    if (!summary) {
      setServiceFormError('La descripción es obligatoria.')
      return
    }
    const payload = {
      title,
      slug: serviceForm.slug.trim(),
      category: serviceForm.category.trim(),
      mode: serviceForm.mode.trim(),
      eta: serviceForm.eta.trim(),
      summary,
      docs: serviceForm.docsText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
      linkHref: serviceForm.linkHref.trim() || ROUTES.atencionCiudadano,
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

  const sortedServices = [...services].sort(
    (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0),
  )

  return (
    <>
      <ConfirmDialog
        open={conflictOpen}
        onClose={() => setConflictOpen(false)}
        title="Contenido desactualizado"
        description="Otro usuario guardó cambios antes que vos. Recargá la última versión y reintentá."
        confirmLabel="Recargar"
        cancelLabel="Cerrar"
        loading={false}
        onConfirm={() => window.location.reload()}
      />
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

      <AdminPageShell
        showBackLink={false}
        eyebrow="Gestión municipal"
        title="Servicios al vecino"
        subtitle="Editá la página pública y el directorio de trámites que ven los vecinos en el portal."
        maxWidthClass="max-w-none"
        variant="plain"
      >
        <h1 className="sr-only">Administración de servicios al vecino</h1>
        {!isApiConfigured() ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend.
          </div>
        ) : null}

        <AdminServicesEditorPreview
          form={contentForm}
          setForm={setContentForm}
          services={services}
          loading={contentLoading}
          saving={contentSaving}
          error={contentError}
          onSubmit={() => void handleSaveContent()}
          apiAvailable={isApiConfigured()}
          onScrollToItems={() => itemsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        />

        <section ref={itemsRef} className="mt-10 scroll-mt-24">
          <div className="flex flex-col gap-4 border-t border-slate-200 pt-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-800">Directorio</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Trámites y servicios</h2>
              <p className="mt-1 text-sm text-slate-600">
                Cada ítem aparece en las tarjetas del directorio. Los inactivos no se muestran al público.
              </p>
            </div>
            <button type="button" onClick={openCreateService} className={ACTION_BTN_PRIMARY} disabled={!isApiConfigured()}>
              Nuevo trámite
            </button>
          </div>

          {itemsError ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{itemsError}</p>
          ) : null}

          {itemsLoading ? (
            <p className="mt-6 text-sm text-slate-600">Cargando trámites…</p>
          ) : sortedServices.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
              Todavía no hay trámites cargados.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Orden</th>
                    <th className="px-4 py-3">Trámite</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedServices.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 tabular-nums text-slate-600">{item.sortOrder}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{item.category || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                              : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                          }`}
                        >
                          {item.isActive ? 'Activo' : 'Oculto'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" className={ACTION_BTN_NEUTRAL} onClick={() => openEditService(item)}>
                            Editar
                          </button>
                          <button
                            type="button"
                            className={`${ACTION_BTN_NEUTRAL} text-red-700 hover:border-red-200 hover:bg-red-50`}
                            onClick={() => setDeleteTarget(item)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </AdminPageShell>

      <Modal
        open={modalOpen}
        onClose={() => !serviceSaving && setModalOpen(false)}
        loading={serviceSaving}
        title={editingService ? 'Editar trámite' : 'Nuevo trámite'}
        description="Completá los datos que verán los vecinos en la tarjeta del directorio."
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
              {(contentForm.categories || []).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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
            Descripción
            <textarea className={`${textareaClass} min-h-24`} value={serviceForm.summary} onChange={(e) => setServiceForm((f) => ({ ...f, summary: e.target.value }))} disabled={serviceSaving} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Documentación (una por línea)
            <textarea className={`${textareaClass} min-h-24`} value={serviceForm.docsText} onChange={(e) => setServiceForm((f) => ({ ...f, docsText: e.target.value }))} disabled={serviceSaving} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Enlace al consultar
            <input className={inputClass} value={serviceForm.linkHref} onChange={(e) => setServiceForm((f) => ({ ...f, linkHref: e.target.value }))} disabled={serviceSaving} placeholder="/atencion-ciudadano" />
          </label>
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
