import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { formErrorClass, inputClass, labelClass } from '../../components/ui/formStyles.js'
import { DEFAULT_HOME_MAP_CONTENT, mergeHomeMapContent } from '../../data/homeMapContent.js'
import { fetchHomeMapContent, updateHomeMapContent } from '../../services/homeMapService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'

function cleanText(value) {
  return String(value || '').trim()
}

function rowIdFrom(point, idx) {
  return `${point.id || 'point'}-${idx}-${Math.random().toString(36).slice(2, 8)}`
}

function withRowIds(content) {
  return {
    ...content,
    points: (content.points || []).map((point, idx) => ({
      ...point,
      _rowId: rowIdFrom(point, idx),
    })),
  }
}

function stripRowIds(points) {
  return points.map((point) => {
    const out = { ...point }
    delete out._rowId
    return out
  })
}

const PAGE_SIZE = 8

export function AdminSettingsHomeMap() {
  const [form, setForm] = useState(() =>
    withRowIds(mergeHomeMapContent(DEFAULT_HOME_MAP_CONTENT, {})),
  )
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [conflictOpen, setConflictOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRowId, setEditingRowId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pointDraft, setPointDraft] = useState({
    _rowId: '',
    id: '',
    title: '',
    subtitle: '',
    address: '',
    lat: '',
    lng: '',
    sortOrder: '',
    isActive: true,
  })

  const dismissToast = useCallback(() => setToast(null), [])
  const isEditing = Boolean(editingRowId)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const remote = await fetchHomeMapContent()
      setForm(withRowIds(mergeHomeMapContent(DEFAULT_HOME_MAP_CONTENT, remote || {})))
      setContentUpdatedAt(remote?.updatedAt || null)
    } catch (e) {
      setError(e.message || 'No se pudo cargar la configuración del mapa.')
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

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isApiConfigured()) {
      setToast({ type: 'error', message: 'No hay conexión disponible con el backend.' })
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        expectedUpdatedAt: contentUpdatedAt,
        center: {
          lat: Number(form.center.lat) || -26.2312,
          lng: Number(form.center.lng) || -65.2818,
        },
        zoom: Math.min(18, Math.max(10, Math.round(Number(form.zoom) || 14))),
        points: stripRowIds(form.points)
          .map((point, idx) => ({
            id: cleanText(point.id) || `punto-${idx + 1}`,
            title: cleanText(point.title),
            subtitle: cleanText(point.subtitle),
            address: cleanText(point.address),
            lat: Number(point.lat),
            lng: Number(point.lng),
            isActive: point.isActive !== false,
            sortOrder: Math.max(0, Math.round(Number(point.sortOrder) || idx * 10)),
          }))
          .filter((point) => point.title || point.address || point.subtitle),
      }
      const saved = await updateHomeMapContent(payload)
      setForm(withRowIds(mergeHomeMapContent(DEFAULT_HOME_MAP_CONTENT, saved || {})))
      setContentUpdatedAt(saved?.updatedAt || null)
      setToast({ type: 'success', message: 'Mapa de Inicio actualizado.' })
    } catch (e) {
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
      const message = e.message || 'No se pudo guardar el mapa de Inicio.'
      setError(message)
      setToast({ type: 'error', message })
    } finally {
      setSaving(false)
    }
  }

  function openCreateModal() {
    setEditingRowId(null)
    setPointDraft({
      _rowId: '',
      id: '',
      title: '',
      subtitle: '',
      address: '',
      lat: String(form.center.lat),
      lng: String(form.center.lng),
      sortOrder: String(form.points.length * 10),
      isActive: true,
    })
    setModalOpen(true)
  }

  function openEditModal(point) {
    setEditingRowId(point._rowId)
    setPointDraft({
      _rowId: point._rowId,
      id: String(point.id || ''),
      title: String(point.title || ''),
      subtitle: String(point.subtitle || ''),
      address: String(point.address || ''),
      lat: String(point.lat || ''),
      lng: String(point.lng || ''),
      sortOrder: String(point.sortOrder || 0),
      isActive: point.isActive !== false,
    })
    setModalOpen(true)
  }

  function savePointFromModal() {
    const next = {
      ...pointDraft,
      id: cleanText(pointDraft.id),
      title: cleanText(pointDraft.title),
      subtitle: cleanText(pointDraft.subtitle),
      address: cleanText(pointDraft.address),
      lat: pointDraft.lat,
      lng: pointDraft.lng,
      sortOrder: pointDraft.sortOrder,
      isActive: pointDraft.isActive !== false,
    }
    if (!next.id || !next.title) {
      setToast({ type: 'error', message: 'Completá al menos ID y título del punto.' })
      return
    }
    if (!Number.isFinite(Number(next.lat)) || !Number.isFinite(Number(next.lng))) {
      setToast({ type: 'error', message: 'Latitud y longitud deben ser valores numéricos válidos.' })
      return
    }

    setForm((prev) => {
      if (isEditing) {
        return {
          ...prev,
          points: prev.points.map((point) =>
            point._rowId === editingRowId ? { ...point, ...next } : point,
          ),
        }
      }
      return {
        ...prev,
        points: [
          ...prev.points,
          {
            ...next,
            _rowId: rowIdFrom(next, prev.points.length),
          },
        ],
      }
    })
    setModalOpen(false)
  }

  function deletePoint(rowId) {
    setForm((prev) => ({
      ...prev,
      points: prev.points.filter((point) => point._rowId !== rowId),
    }))
  }

  const sortedPoints = useMemo(
    () =>
      [...form.points].sort(
        (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0),
      ),
    [form.points],
  )
  const filteredPoints = useMemo(() => {
    const q = cleanText(searchQuery).toLowerCase()
    if (!q) return sortedPoints
    return sortedPoints.filter((point) =>
      `${point.id} ${point.title} ${point.subtitle || ''} ${point.address || ''}`
        .toLowerCase()
        .includes(q),
    )
  }, [sortedPoints, searchQuery])
  const totalPages = Math.max(1, Math.ceil(filteredPoints.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const paginatedPoints = filteredPoints.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

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
        title="¿Eliminar punto del mapa?"
        description={
          deleteTarget ? (
            <>
              Se va a eliminar el punto{' '}
              <span className="font-semibold text-slate-900">
                «{deleteTarget.title || deleteTarget.id}»
              </span>
              . Esta acción no se puede deshacer.
            </>
          ) : null
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={false}
        onConfirm={() => {
          if (!deleteTarget) return
          deletePoint(deleteTarget._rowId)
          setDeleteTarget(null)
          setToast({ type: 'success', message: 'Punto eliminado del formulario.' })
        }}
        variant="danger"
      />
      <Modal
        open={modalOpen}
        onClose={() => {
          if (!saving) setModalOpen(false)
        }}
        loading={false}
        size="wide"
        title={isEditing ? 'Editar punto del mapa' : 'Crear punto del mapa'}
        description="Completá los datos del punto. Diseño en dos columnas para edición cómoda."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            ID
            <input
              className={inputClass}
              value={pointDraft.id}
              onChange={(e) => setPointDraft((prev) => ({ ...prev, id: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Título
            <input
              className={inputClass}
              value={pointDraft.title}
              onChange={(e) => setPointDraft((prev) => ({ ...prev, title: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Subtítulo
            <input
              className={inputClass}
              value={pointDraft.subtitle}
              onChange={(e) => setPointDraft((prev) => ({ ...prev, subtitle: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Dirección
            <input
              className={inputClass}
              value={pointDraft.address}
              onChange={(e) => setPointDraft((prev) => ({ ...prev, address: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Latitud
            <input
              className={inputClass}
              value={pointDraft.lat}
              onChange={(e) => setPointDraft((prev) => ({ ...prev, lat: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Longitud
            <input
              className={inputClass}
              value={pointDraft.lng}
              onChange={(e) => setPointDraft((prev) => ({ ...prev, lng: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Orden
            <input
              className={inputClass}
              value={pointDraft.sortOrder}
              onChange={(e) =>
                setPointDraft((prev) => ({ ...prev, sortOrder: e.target.value }))
              }
            />
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 md:mt-6">
            <input
              type="checkbox"
              checked={pointDraft.isActive !== false}
              onChange={(e) =>
                setPointDraft((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            Activo
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2 border-t border-slate-200/80 pt-4">
          <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={savePointFromModal}>
            {isEditing ? 'Guardar cambios' : 'Crear punto'}
          </Button>
        </div>
      </Modal>
      <AdminPageShell
        showBackLink={false}
        eyebrow="Configuración"
        title="Mapa interactivo de Inicio"
        subtitle="Definí el centro del mapa y los puntos clave de Trancas que se muestran al ciudadano."
        maxWidthClass="max-w-6xl"
        variant="plain"
      >
        {!isApiConfigured() ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend para guardar cambios.
          </div>
        ) : null}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error ? (
            <p className={formErrorClass} role="alert">
              {error}
            </p>
          ) : null}

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Vista general</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className={labelClass}>
                Latitud del centro
                <input
                  className={inputClass}
                  value={form.center.lat}
                  disabled={loading || saving}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, center: { ...prev.center, lat: e.target.value } }))
                  }
                />
              </label>
              <label className={labelClass}>
                Longitud del centro
                <input
                  className={inputClass}
                  value={form.center.lng}
                  disabled={loading || saving}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, center: { ...prev.center, lng: e.target.value } }))
                  }
                />
              </label>
              <label className={labelClass}>
                Zoom inicial (10-18)
                <input
                  className={inputClass}
                  value={form.zoom}
                  disabled={loading || saving}
                  onChange={(e) => setForm((prev) => ({ ...prev, zoom: e.target.value }))}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900">Puntos del mapa</h2>
              <Button
                type="button"
                variant="secondary"
                disabled={loading || saving}
                onClick={openCreateModal}
              >
                + Crear punto
              </Button>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className={`${labelClass} w-full sm:max-w-sm`}>
                Buscar punto
                <input
                  className={inputClass}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ID, título, subtítulo o dirección…"
                  disabled={loading || saving}
                />
              </label>
              <p className="text-sm text-slate-500">
                {filteredPoints.length} resultado{filteredPoints.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/80">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">Título</th>
                    <th className="px-3 py-3">Subtítulo</th>
                    <th className="px-3 py-3">Dirección</th>
                    <th className="px-3 py-3">Coordenadas</th>
                    <th className="px-3 py-3">Orden</th>
                    <th className="px-3 py-3">Estado</th>
                    <th className="px-3 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPoints.map((point) => (
                    <tr key={point._rowId} className="border-t border-slate-100">
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-700">{point.id}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{point.title}</td>
                      <td className="px-3 py-2.5 text-slate-600">{point.subtitle || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-600">{point.address || '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-600">
                        {point.lat}, {point.lng}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700">{point.sortOrder}</td>
                      <td className="px-3 py-2.5 text-slate-700">
                        {point.isActive !== false ? 'Activo' : 'Inactivo'}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            className="px-2.5! py-1.5! text-xs!"
                            onClick={() => openEditModal(point)}
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            className="px-2.5! py-1.5! text-xs!"
                            onClick={() => setDeleteTarget(point)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedPoints.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-sm text-slate-500">
                        No hay puntos que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            {filteredPoints.length > PAGE_SIZE ? (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Página {safePage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3! py-1.5! text-sm!"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3! py-1.5! text-sm!"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            ) : null}
          </section>

          <div className="flex justify-end border-t border-slate-200/80 pt-4">
            <Button type="submit" disabled={loading || saving}>
              {saving ? 'Guardando…' : 'Guardar mapa'}
            </Button>
          </div>
        </form>
      </AdminPageShell>
    </>
  )
}
