import { useEffect, useMemo, useState } from 'react'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { HeroImageModal } from '../../components/admin/HeroImageModal.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { SingleImageUploadField } from '../../components/admin/SingleImageUploadField.jsx'
import { formErrorClass, inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import { createEvent, deleteEvent, fetchAdminEvents, updateEvent } from '../../services/eventsService.js'
import {
  fetchSitePageBanner,
  updateSitePageBanner,
} from '../../services/sitePageBannerService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'
import { ROUTES } from '../../utils/constants.js'

function emptyDraft() {
  return {
    id: '',
    title: '',
    eventDate: '',
    place: '',
    summary: '',
    flyerUrl: '',
    sortOrder: 0,
    isActive: true,
  }
}

export function AdminEvents() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [conflictOpen, setConflictOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(emptyDraft())
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [bannerOpen, setBannerOpen] = useState(false)
  const [bannerSaving, setBannerSaving] = useState(false)
  const [bannerImageUrl, setBannerImageUrl] = useState('')
  const [bannerUpdatedAt, setBannerUpdatedAt] = useState(null)
  const [bannerConflictOpen, setBannerConflictOpen] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAdminEvents()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los eventos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!isApiConfigured()) return () => {}
    fetchSitePageBanner('events')
      .then((content) => {
        if (cancelled) return
        setBannerImageUrl(String(content?.heroImageUrl || ''))
        setBannerUpdatedAt(content?.updatedAt || null)
      })
      .catch(() => {
        if (!cancelled) {
          setBannerImageUrl('')
          setBannerUpdatedAt(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime() || a.sortOrder - b.sortOrder,
      ),
    [items],
  )

  function openCreate() {
    setEditing(null)
    setDraft(emptyDraft())
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditing(item)
    setDraft({
      ...item,
      eventDate: item.eventDate ? new Date(item.eventDate).toISOString().slice(0, 16) : '',
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!draft.title.trim() || !draft.place.trim() || !draft.eventDate || !draft.flyerUrl.trim()) {
      setError('Completá título, fecha, lugar y flyer del evento.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: draft.title.trim(),
        place: draft.place.trim(),
        eventDate: new Date(draft.eventDate).toISOString(),
        summary: draft.summary.trim(),
        flyerUrl: draft.flyerUrl.trim(),
        sortOrder: Number(draft.sortOrder) || 0,
        isActive: draft.isActive !== false,
      }
      if (editing) {
        await updateEvent(editing.id, {
          ...payload,
          expectedUpdatedAt: editing.updatedAt || null,
        })
      } else {
        await createEvent(payload)
      }
      setModalOpen(false)
      await load()
    } catch (e) {
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
      setError(e.message || 'No se pudo guardar el evento.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveBanner() {
    if (!isApiConfigured()) {
      setError('No hay conexión disponible con el backend.')
      return
    }
    setBannerSaving(true)
    setError('')
    try {
      const saved = await updateSitePageBanner('events', {
        heroImageUrl: bannerImageUrl.trim(),
        expectedUpdatedAt: bannerUpdatedAt,
      })
      setBannerImageUrl(String(saved?.heroImageUrl || ''))
      setBannerUpdatedAt(saved?.updatedAt || null)
      setBannerOpen(false)
    } catch (e) {
      if (isConcurrencyConflictError(e)) setBannerConflictOpen(true)
      setError(e.message || 'No se pudo guardar la portada de Eventos.')
    } finally {
      setBannerSaving(false)
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
      <ConfirmDialog
        open={bannerConflictOpen}
        onClose={() => setBannerConflictOpen(false)}
        title="Cambios desactualizados"
        description="Otro usuario guardó cambios antes que vos. Recargá la última versión y reintentá."
        confirmLabel="Recargar última versión y reintentar"
        cancelLabel="Cerrar"
        loading={false}
        onConfirm={() => window.location.reload()}
      />
      <HeroImageModal
        open={bannerOpen}
        title="Portada de Eventos"
        value={bannerImageUrl}
        onChange={setBannerImageUrl}
        onClose={() => setBannerOpen(false)}
        onSave={handleSaveBanner}
        saving={bannerSaving}
        disabled={!isApiConfigured()}
      />
      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        title="¿Eliminar evento?"
        description={deleteTarget ? `Se eliminará «${deleteTarget.title}». Esta acción no se puede deshacer.` : ''}
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (!deleteTarget) return
          await deleteEvent(deleteTarget.id)
          setDeleteTarget(null)
          await load()
        }}
        variant="danger"
      />
      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        loading={saving}
        size="wide"
        title={editing ? 'Editar evento' : 'Nuevo evento'}
        description="Publicá flyers de eventos y controlá su visibilidad."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            Título
            <input className={inputClass} value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
          </label>
          <label className={labelClass}>
            Fecha y hora
            <input type="datetime-local" className={inputClass} value={draft.eventDate} onChange={(e) => setDraft((p) => ({ ...p, eventDate: e.target.value }))} />
          </label>
          <label className={labelClass}>
            Lugar
            <input className={inputClass} value={draft.place} onChange={(e) => setDraft((p) => ({ ...p, place: e.target.value }))} />
          </label>
          <label className={labelClass}>
            Orden
            <input className={inputClass} value={draft.sortOrder} onChange={(e) => setDraft((p) => ({ ...p, sortOrder: e.target.value }))} />
          </label>
          <div className="md:col-span-2">
            <SingleImageUploadField
              label="Flyer del evento"
              helpText="Subí el flyer desde archivo o importá por URL."
              value={draft.flyerUrl}
              onChange={(value) => setDraft((p) => ({ ...p, flyerUrl: value }))}
              kind="cover"
              disabled={saving}
            />
          </div>
          <label className={`${labelClass} md:col-span-2`}>
            Resumen
            <textarea className={`${textareaClass} min-h-24`} value={draft.summary} onChange={(e) => setDraft((p) => ({ ...p, summary: e.target.value }))} />
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={draft.isActive !== false} onChange={(e) => setDraft((p) => ({ ...p, isActive: e.target.checked }))} />
            Publicado
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2 border-t border-slate-200/80 pt-4">
          <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button type="button" onClick={() => void handleSave()}>{editing ? 'Guardar cambios' : 'Crear evento'}</Button>
        </div>
      </Modal>
      <AdminPageShell
        showBackLink={false}
        eyebrow="Contenido"
        title="Eventos"
        subtitle="Gestioná la agenda pública de flyers y actividades."
        maxWidthClass="max-w-6xl"
        variant="plain"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => setBannerOpen(true)}>
              Cambiar portada
            </Button>
            <Button type="button" onClick={openCreate}>
              + Nuevo evento
            </Button>
          </div>
        }
      >
        {error ? <p className={formErrorClass}>{error}</p> : null}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Cargando eventos…</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3">Flyer</th>
                  <th className="px-3 py-3">Título</th>
                  <th className="px-3 py-3">Fecha</th>
                  <th className="px-3 py-3">Lugar</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-3 py-2.5">
                      <img src={item.flyerUrl} alt="" className="h-16 w-12 rounded-md object-cover ring-1 ring-slate-200" />
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">{item.title}</td>
                    <td className="px-3 py-2.5 text-slate-600">{new Date(item.eventDate).toLocaleString('es-AR')}</td>
                    <td className="px-3 py-2.5 text-slate-600">{item.place}</td>
                    <td className="px-3 py-2.5 text-slate-700">{item.isActive ? 'Publicado' : 'Borrador'}</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="inline-flex gap-2">
                        <Button type="button" variant="secondary" className="px-2.5! py-1.5! text-xs!" onClick={() => openEdit(item)}>
                          Editar
                        </Button>
                        <Button type="button" variant="danger" className="px-2.5! py-1.5! text-xs!" onClick={() => setDeleteTarget(item)}>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPageShell>
    </>
  )
}
