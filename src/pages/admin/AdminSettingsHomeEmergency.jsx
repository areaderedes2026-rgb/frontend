import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { SingleImageUploadField } from '../../components/admin/SingleImageUploadField.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { formErrorClass, inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import {
  DEFAULT_HOME_EMERGENCY_CONTENT,
  mergeHomeEmergencyContent,
} from '../../data/homeEmergencyContent.js'
import { normalizeHeroToggle } from '../../data/servicesPageContent.js'
import {
  fetchHomeEmergencyContent,
  updateHomeEmergencyContent,
} from '../../services/homeEmergencyService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import {
  heroOverlayGradientStyle,
  normalizeHeroOverlayOpacity,
} from '../../utils/heroOverlay.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'

function cleanText(value) {
  return String(value || '').trim()
}

function rowIdFrom(item, idx) {
  return `${item.id || 'emergency'}-${idx}-${Math.random().toString(36).slice(2, 8)}`
}

function withRowIds(content) {
  return {
    ...content,
    numbers: (content.numbers || []).map((item, idx) => ({
      ...item,
      _rowId: rowIdFrom(item, idx),
    })),
  }
}

function stripRowIds(numbers) {
  return numbers.map((item) => {
    const out = { ...item }
    delete out._rowId
    return out
  })
}

const PAGE_SIZE = 8

const EMPTY_NUMBER = {
  _rowId: '',
  id: '',
  label: '',
  phone: '',
  description: '',
  sortOrder: '',
  isActive: true,
}

export function AdminSettingsHomeEmergency() {
  const [form, setForm] = useState(() =>
    withRowIds(mergeHomeEmergencyContent(DEFAULT_HOME_EMERGENCY_CONTENT, {})),
  )
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRowId, setEditingRowId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [numberDraft, setNumberDraft] = useState(EMPTY_NUMBER)

  const dismissToast = useCallback(() => setToast(null), [])
  const isEditing = Boolean(editingRowId)

  const loadFromServer = useCallback(async () => {
    const remote = await fetchHomeEmergencyContent()
    setForm(withRowIds(mergeHomeEmergencyContent(DEFAULT_HOME_EMERGENCY_CONTENT, remote || {})))
    setContentUpdatedAt(remote?.updatedAt || null)
    setError('')
  }, [])

  const buildPayload = useCallback(
    (forceOverwrite = false) => ({
      expectedUpdatedAt: contentUpdatedAt,
      forceOverwrite,
      eyebrow: cleanText(form.eyebrow),
      title: cleanText(form.title),
      subtitle: cleanText(form.subtitle),
      imageUrl: cleanText(form.imageUrl),
      overlayOpacity: normalizeHeroOverlayOpacity(form.overlayOpacity, 65),
      showEyebrow: normalizeHeroToggle(form.showEyebrow, true),
      showTitle: normalizeHeroToggle(form.showTitle, true),
      showSubtitle: normalizeHeroToggle(form.showSubtitle, true),
      numbers: stripRowIds(form.numbers)
        .map((item, idx) => ({
          id: cleanText(item.id) || `emergencia-${idx + 1}`,
          label: cleanText(item.label),
          phone: cleanText(item.phone),
          description: cleanText(item.description),
          isActive: item.isActive !== false,
          sortOrder: Math.max(0, Math.round(Number(item.sortOrder) || idx * 10)),
        }))
        .filter((item) => item.label || item.phone),
    }),
    [contentUpdatedAt, form],
  )

  const persistContent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const saved = await updateHomeEmergencyContent(buildPayload(forceOverwrite))
      setForm(withRowIds(mergeHomeEmergencyContent(DEFAULT_HOME_EMERGENCY_CONTENT, saved || {})))
      setContentUpdatedAt(saved?.updatedAt || null)
      setError('')
      setToast({ type: 'success', message: 'Números de emergencia actualizados.' })
    },
    [buildPayload],
  )

  const { conflictDialog, handleConflict } = useContentEditorConcurrencyConflict({
    reloadFromServer: loadFromServer,
    persistContent,
    entityLabel: 'los números de emergencia',
    onReloadSuccess: () =>
      setToast({
        type: 'success',
        message: 'Se cargó la última versión del servidor.',
      }),
    onReloadError: (e) =>
      setToast({
        type: 'error',
        message: e.message || 'No se pudo recargar el contenido.',
      }),
    onForceSaveError: (e) => {
      const message = e.message || 'No se pudo guardar los números de emergencia.'
      setError(message)
      setToast({ type: 'error', message })
    },
  })

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        await loadFromServer()
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'No se pudo cargar la sección de emergencias.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [loadFromServer])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isApiConfigured()) {
      setToast({ type: 'error', message: 'No hay conexión disponible con el backend.' })
      return
    }
    setSaving(true)
    setError('')
    try {
      await persistContent()
    } catch (e) {
      if (handleConflict(e)) return
      const message = e.message || 'No se pudo guardar los números de emergencia.'
      setError(message)
      setToast({ type: 'error', message })
    } finally {
      setSaving(false)
    }
  }

  function openCreateModal() {
    setEditingRowId(null)
    setNumberDraft({
      ...EMPTY_NUMBER,
      sortOrder: String(form.numbers.length * 10),
    })
    setModalOpen(true)
  }

  function openEditModal(item) {
    setEditingRowId(item._rowId)
    setNumberDraft({
      _rowId: item._rowId,
      id: String(item.id || ''),
      label: String(item.label || ''),
      phone: String(item.phone || ''),
      description: String(item.description || ''),
      sortOrder: String(item.sortOrder || 0),
      isActive: item.isActive !== false,
    })
    setModalOpen(true)
  }

  function saveNumberFromModal() {
    const next = {
      ...numberDraft,
      id: cleanText(numberDraft.id),
      label: cleanText(numberDraft.label),
      phone: cleanText(numberDraft.phone),
      description: cleanText(numberDraft.description),
      sortOrder: numberDraft.sortOrder,
      isActive: numberDraft.isActive !== false,
    }
    if (!next.label || !next.phone) {
      setToast({ type: 'error', message: 'Completá al menos el nombre y el teléfono.' })
      return
    }

    setForm((prev) => {
      if (isEditing) {
        return {
          ...prev,
          numbers: prev.numbers.map((item) =>
            item._rowId === editingRowId ? { ...item, ...next } : item,
          ),
        }
      }
      return {
        ...prev,
        numbers: [
          ...prev.numbers,
          {
            ...next,
            id: next.id || `emergencia-${prev.numbers.length + 1}`,
            _rowId: rowIdFrom(next, prev.numbers.length),
          },
        ],
      }
    })
    setModalOpen(false)
  }

  function deleteNumber(rowId) {
    setForm((prev) => ({
      ...prev,
      numbers: prev.numbers.filter((item) => item._rowId !== rowId),
    }))
  }

  const sortedNumbers = useMemo(
    () =>
      [...form.numbers].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)),
    [form.numbers],
  )
  const filteredNumbers = useMemo(() => {
    const q = cleanText(searchQuery).toLowerCase()
    if (!q) return sortedNumbers
    return sortedNumbers.filter((item) =>
      `${item.id} ${item.label} ${item.phone} ${item.description || ''}`
        .toLowerCase()
        .includes(q),
    )
  }, [sortedNumbers, searchQuery])
  const totalPages = Math.max(1, Math.ceil(filteredNumbers.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const paginatedNumbers = filteredNumbers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const previewImage =
    resolveMediaUrl(form.imageUrl?.trim() || DEFAULT_HOME_EMERGENCY_CONTENT.imageUrl) ||
    DEFAULT_HOME_EMERGENCY_CONTENT.imageUrl

  return (
    <>
      {toast ? <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} /> : null}
      {conflictDialog}
      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => {
          if (!saving) setDeleteTarget(null)
        }}
        title="¿Eliminar número de emergencia?"
        description={
          deleteTarget ? (
            <>
              Se va a eliminar{' '}
              <span className="font-semibold text-slate-900">
                «{deleteTarget.label || deleteTarget.phone}»
              </span>
              . Esta acción no se puede deshacer hasta que guardes.
            </>
          ) : null
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={false}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteNumber(deleteTarget._rowId)
          setDeleteTarget(null)
          setToast({ type: 'success', message: 'Número eliminado del borrador.' })
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
        title={isEditing ? 'Editar número de emergencia' : 'Agregar número de emergencia'}
        description="Los cambios quedan en el borrador hasta que toques «Guardar sección»."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            ID interno
            <input
              className={inputClass}
              value={numberDraft.id}
              onChange={(e) => setNumberDraft((prev) => ({ ...prev, id: e.target.value }))}
              placeholder="policia"
            />
          </label>
          <label className={labelClass}>
            Nombre / servicio
            <input
              className={inputClass}
              value={numberDraft.label}
              onChange={(e) => setNumberDraft((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Policía"
            />
          </label>
          <label className={labelClass}>
            Teléfono
            <input
              className={inputClass}
              value={numberDraft.phone}
              onChange={(e) => setNumberDraft((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="911"
            />
          </label>
          <label className={labelClass}>
            Orden
            <input
              className={inputClass}
              value={numberDraft.sortOrder}
              onChange={(e) =>
                setNumberDraft((prev) => ({ ...prev, sortOrder: e.target.value }))
              }
            />
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Descripción breve
            <textarea
              className={`${textareaClass} min-h-24`}
              value={numberDraft.description}
              onChange={(e) =>
                setNumberDraft((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Emergencias policiales"
            />
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={numberDraft.isActive !== false}
              onChange={(e) =>
                setNumberDraft((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            Visible en el inicio
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2 border-t border-slate-200/80 pt-4">
          <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={saveNumberFromModal}>
            {isEditing ? 'Aplicar cambios' : 'Agregar número'}
          </Button>
        </div>
      </Modal>

      <AdminPageShell
        showBackLink={false}
        eyebrow="Configuración"
        title="Números de emergencia"
        subtitle="Imagen de fondo, overlay, textos y contactos prioritarios que se muestran en el inicio."
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
            <h2 className="text-base font-semibold text-slate-900">Portada de la sección</h2>
            <p className="mt-1 text-sm text-slate-500">
              La imagen se usa como fondo completo. El overlay controla el contraste de los textos.
            </p>
            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              <div className="space-y-4">
                <SingleImageUploadField
                  label="Imagen de fondo"
                  helpText="Recomendado: foto horizontal de buena calidad. Se recorta al centro."
                  value={form.imageUrl}
                  onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
                  kind="cover"
                  disabled={loading || saving}
                />
                <label className={labelClass}>
                  Opacidad del overlay: {normalizeHeroOverlayOpacity(form.overlayOpacity, 65)}%
                  <input
                    type="range"
                    min={0}
                    max={90}
                    step={5}
                    className="mt-2 w-full accent-sky-700"
                    value={normalizeHeroOverlayOpacity(form.overlayOpacity, 65)}
                    disabled={loading || saving}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        overlayOpacity: Number(e.target.value),
                      }))
                    }
                  />
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Subila si necesitás más contraste; bajala si la imagen ya se lee bien.
                  </span>
                </label>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
                <div className="relative min-h-56">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}
                  <div
                    className="absolute inset-0"
                    style={heroOverlayGradientStyle(form.overlayOpacity, 65)}
                    aria-hidden
                  />
                  <div className="relative z-10 flex min-h-56 flex-col items-center justify-center px-6 py-8 text-center text-white">
                    {form.showEyebrow !== false && form.eyebrow ? (
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-100">
                        {form.eyebrow}
                      </p>
                    ) : null}
                    {form.showTitle !== false ? (
                      <p className="mt-2 font-serif text-2xl font-bold">
                        {form.title || 'Sin título'}
                      </p>
                    ) : null}
                    {form.showSubtitle !== false && form.subtitle ? (
                      <p className="mt-2 max-w-sm text-sm text-slate-100/90">{form.subtitle}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Textos de la sección</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Etiqueta superior
                <input
                  className={inputClass}
                  value={form.eyebrow}
                  disabled={loading || saving}
                  onChange={(e) => setForm((prev) => ({ ...prev, eyebrow: e.target.value }))}
                />
              </label>
              <label className={labelClass}>
                Título
                <input
                  className={inputClass}
                  value={form.title}
                  disabled={loading || saving}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Subtítulo
                <textarea
                  className={`${textareaClass} min-h-24`}
                  value={form.subtitle}
                  disabled={loading || saving}
                  onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                ['showEyebrow', 'Mostrar etiqueta'],
                ['showTitle', 'Mostrar título'],
                ['showSubtitle', 'Mostrar subtítulo'],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={form[key] !== false}
                    disabled={loading || saving}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Números de emergencia</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Cada tarjeta se puede llamar desde el celular con un toque.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                disabled={loading || saving}
                onClick={openCreateModal}
              >
                + Agregar número
              </Button>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className={`${labelClass} w-full sm:max-w-sm`}>
                Buscar
                <input
                  className={inputClass}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nombre, teléfono o descripción…"
                  disabled={loading || saving}
                />
              </label>
              <p className="text-sm text-slate-500">
                {filteredNumbers.length} resultado{filteredNumbers.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/80">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">Nombre</th>
                    <th className="px-3 py-3">Teléfono</th>
                    <th className="px-3 py-3">Descripción</th>
                    <th className="px-3 py-3">Orden</th>
                    <th className="px-3 py-3">Estado</th>
                    <th className="px-3 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedNumbers.map((item) => (
                    <tr key={item._rowId} className="border-t border-slate-100">
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-700">{item.id}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{item.label}</td>
                      <td className="px-3 py-2.5 font-semibold tabular-nums text-sky-800">
                        {item.phone}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{item.description || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-700">{item.sortOrder}</td>
                      <td className="px-3 py-2.5 text-slate-700">
                        {item.isActive !== false ? 'Visible' : 'Oculto'}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            className="px-2.5! py-1.5! text-xs!"
                            onClick={() => openEditModal(item)}
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            className="px-2.5! py-1.5! text-xs!"
                            onClick={() => setDeleteTarget(item)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedNumbers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500">
                        No hay números que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {filteredNumbers.length > PAGE_SIZE ? (
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
              {saving ? 'Guardando…' : 'Guardar sección'}
            </Button>
          </div>
        </form>
      </AdminPageShell>
    </>
  )
}
