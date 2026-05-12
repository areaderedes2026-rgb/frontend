import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '../ui/Modal.jsx'
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx'
import { Toast } from '../ui/Toast.jsx'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'
import { AREA_OFFICE_ICON_KEYS } from '../../data/areaOfficeIconKeys.js'
import { AreaOfficeIcon } from '../areas/areaOfficeIcons.jsx'
import {
  createAreaOfficeAdmin,
  deleteAreaOfficeAdmin,
  fetchAreaOfficesAdmin,
  updateAreaOfficeAdmin,
} from '../../services/areaOfficesService.js'

const BTN_NEUTRAL =
  'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
const BTN_PRIMARY =
  'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-sky-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60'
const BTN_DANGER =
  'inline-flex min-h-10 items-center justify-center rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60'

function emptyDraft() {
  return {
    id: null,
    name: '',
    slug: '',
    iconKey: 'building',
    description: '',
    activities: [''],
    sortOrder: 0,
  }
}

function officeToDraft(row) {
  if (!row) return emptyDraft()
  const acts = Array.isArray(row.activities) && row.activities.length ? row.activities : ['']
  return {
    id: row.id,
    name: row.name || '',
    slug: row.slug || '',
    iconKey: AREA_OFFICE_ICON_KEYS.includes(row.iconKey) ? row.iconKey : 'building',
    description: row.description || '',
    activities: acts,
    sortOrder: Number(row.sortOrder) || 0,
  }
}

export function AdminAreaOfficesPanel({ areaSlug, areaTitle, disabled }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState(() => emptyDraft())
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  const publicBase = `/areas/${encodeURIComponent(areaSlug)}`

  const load = useCallback(async () => {
    if (!areaSlug) return
    setError('')
    setLoading(true)
    try {
      const list = await fetchAreaOfficesAdmin(areaSlug)
      setItems([...list].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.id - b.id))
    } catch (e) {
      setItems([])
      setError(e.message || 'No se pudieron cargar las oficinas.')
    } finally {
      setLoading(false)
    }
  }, [areaSlug])

  useEffect(() => {
    void load()
  }, [load])

  const dismissToast = useCallback(() => setToast(null), [])

  const openNew = () => {
    setDraft(emptyDraft())
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setDraft(officeToDraft(row))
    setModalOpen(true)
  }

  const setActivity = (index, value) => {
    setDraft((prev) => {
      const next = [...(prev.activities || [])]
      next[index] = value
      return { ...prev, activities: next }
    })
  }

  const addActivityRow = () => {
    setDraft((prev) => ({ ...prev, activities: [...(prev.activities || []), ''] }))
  }

  const removeActivityRow = (index) => {
    setDraft((prev) => {
      const next = (prev.activities || []).filter((_, i) => i !== index)
      return { ...prev, activities: next.length ? next : [''] }
    })
  }

  const cleanActivities = (list) =>
    (Array.isArray(list) ? list : []).map((x) => String(x || '').trim()).filter(Boolean)

  async function handleSaveModal() {
    const name = String(draft.name || '').trim()
    if (!name) {
      setToast({ type: 'error', message: 'El nombre de la oficina es obligatorio.' })
      return
    }
    setSaving(true)
    try {
      const activities = cleanActivities(draft.activities)
      const payload = {
        name,
        iconKey: draft.iconKey,
        description: String(draft.description || '').trim(),
        activities,
        sortOrder: Number(draft.sortOrder) || 0,
      }
      const slugOpt = String(draft.slug || '').trim()
      if (slugOpt) payload.slug = slugOpt

      if (draft.id) {
        await updateAreaOfficeAdmin(areaSlug, draft.id, payload)
        setToast({ type: 'success', message: 'Oficina actualizada.' })
      } else {
        await createAreaOfficeAdmin(areaSlug, payload)
        setToast({ type: 'success', message: 'Oficina creada.' })
      }
      setModalOpen(false)
      await load()
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'No se pudo guardar.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteAreaOfficeAdmin(areaSlug, deleteTarget.id)
      setToast({ type: 'success', message: 'Oficina eliminada.' })
      setDeleteTarget(null)
      await load()
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'No se pudo eliminar.' })
    } finally {
      setDeleting(false)
    }
  }

  const previewUrl = useMemo(() => {
    if (!items[0]?.slug) return `${publicBase}#oficinas-area`
    return `${publicBase}/oficinas/${encodeURIComponent(items[0].slug)}`
  }, [items, publicBase])

  if (disabled) {
    return (
      <p className="text-sm text-slate-500">
        Conectá el backend para administrar oficinas publicadas en el portal.
      </p>
    )
  }

  return (
    <>
      {toast ? (
        <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} />
      ) : null}
      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        title="¿Eliminar esta oficina?"
        description={
          deleteTarget ? (
            <>
              Se quitará <span className="font-semibold">«{deleteTarget.name}»</span> del área{' '}
              <span className="font-semibold">{areaTitle || areaSlug}</span>. El contenido dejará
              de mostrarse en el sitio público.
            </>
          ) : null
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        variant="danger"
      />

      <Modal
        open={modalOpen}
        onClose={() => {
          if (!saving) setModalOpen(false)
        }}
        loading={saving}
        size="wide"
        title={draft.id ? 'Editar oficina' : 'Nueva oficina'}
        description="Los cambios se guardan al instante en el servidor (no dependen del botón «Guardar cambios» del perfil del área)."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>
            Nombre
            <input
              className={inputClass}
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              disabled={saving}
              maxLength={200}
            />
          </label>
          <label className={labelClass}>
            Slug URL (opcional)
            <input
              className={inputClass}
              value={draft.slug}
              onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value }))}
              disabled={saving}
              placeholder="se genera desde el nombre si lo dejás vacío"
            />
          </label>
          <label className={labelClass}>
            Orden
            <input
              type="number"
              min={0}
              className={inputClass}
              value={draft.sortOrder}
              onChange={(e) =>
                setDraft((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))
              }
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Icono
            <select
              className={inputClass}
              value={draft.iconKey}
              onChange={(e) => setDraft((p) => ({ ...p, iconKey: e.target.value }))}
              disabled={saving}
            >
              {AREA_OFFICE_ICON_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end pb-1">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-800">
              <AreaOfficeIcon iconKey={draft.iconKey} className="h-6 w-6" title="" />
            </span>
          </div>
          <label className={`${labelClass} sm:col-span-2`}>
            Descripción
            <textarea
              className={`${textareaClass} min-h-28`}
              value={draft.description}
              onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
              disabled={saving}
            />
          </label>
        </div>
        <div className="mt-6 border-t border-slate-200/80 pt-4">
          <p className="text-sm font-semibold text-slate-800">Actividades</p>
          <p className="mt-1 text-xs text-slate-500">
            Una línea por actividad; se muestran como lista numerada en el portal.
          </p>
          <ul className="mt-3 space-y-2">
            {(draft.activities || ['']).map((line, idx) => (
              <li key={idx} className="flex gap-2">
                <input
                  className={inputClass}
                  value={line}
                  onChange={(e) => setActivity(idx, e.target.value)}
                  disabled={saving}
                  placeholder={`Actividad ${idx + 1}`}
                />
                <button
                  type="button"
                  className={BTN_NEUTRAL}
                  onClick={() => removeActivityRow(idx)}
                  disabled={saving || (draft.activities || []).length <= 1}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className={`${BTN_NEUTRAL} mt-2`} onClick={addActivityRow} disabled={saving}>
            + Línea
          </button>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-4 sm:flex-row sm:justify-end">
          <button type="button" className={BTN_NEUTRAL} onClick={() => setModalOpen(false)} disabled={saving}>
            Cancelar
          </button>
          <button type="button" className={BTN_PRIMARY} onClick={() => void handleSaveModal()} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar oficina'}
          </button>
        </div>
      </Modal>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-xl text-sm text-slate-600">
          Gestioná las oficinas que se listan en el detalle del área (debajo de Dirección). Cada
          ítem abre una página con descripción y actividades.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`${publicBase}#oficinas-area`}
            target="_blank"
            rel="noopener noreferrer"
            className={BTN_NEUTRAL}
          >
            Ver en el sitio
          </Link>
          <button type="button" className={BTN_PRIMARY} onClick={openNew} disabled={loading}>
            + Nueva oficina
          </button>
        </div>
      </div>

      {error ? (
        <div
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-4 space-y-2">
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600">
          No hay oficinas cargadas. Creá la primera para que aparezca la sección «Oficinas» en la
          página pública del área.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#ddd7ca] bg-white">
          <table className="w-full min-w-lg text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3">Icono</th>
                <th className="px-3 py-3">Nombre</th>
                <th className="px-3 py-3">Slug</th>
                <th className="px-3 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 align-middle">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sky-100 bg-sky-50">
                      <AreaOfficeIcon iconKey={row.iconKey} className="h-4 w-4" title="" />
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle font-semibold text-slate-900">{row.name}</td>
                  <td className="px-3 py-2 align-middle">
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{row.slug}</code>
                  </td>
                  <td className="px-3 py-2 align-middle text-right">
                    <div className="inline-flex flex-wrap justify-end gap-1.5">
                      <Link
                        to={`${publicBase}/oficinas/${encodeURIComponent(row.slug)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={BTN_NEUTRAL}
                      >
                        Ver
                      </Link>
                      <button type="button" className={BTN_NEUTRAL} onClick={() => openEdit(row)}>
                        Editar
                      </button>
                      <button type="button" className={BTN_DANGER} onClick={() => setDeleteTarget(row)}>
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

      {!loading && items.length > 0 ? (
        <p className="mt-3 text-xs text-slate-500">
          Ejemplo de URL pública:{' '}
          <Link to={previewUrl} className="font-semibold text-sky-800 underline-offset-2 hover:underline">
            {previewUrl}
          </Link>
        </p>
      ) : null}
    </>
  )
}
