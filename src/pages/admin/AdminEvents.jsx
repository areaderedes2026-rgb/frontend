import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { HeroImageModal } from '../../components/admin/HeroImageModal.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { SingleImageUploadField } from '../../components/admin/SingleImageUploadField.jsx'
import {
  inputClass,
  labelClass,
  textareaClass,
} from '../../components/ui/formStyles.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import {
  createEvent,
  deleteEvent,
  fetchAdminEvents,
  updateEvent,
} from '../../services/eventsService.js'
import {
  fetchSitePageBanner,
  updateSitePageBanner,
} from '../../services/sitePageBannerService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'

const PAGE_SIZE = 20

const ACTION_BTN_BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
const ACTION_BTN_NEUTRAL = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`

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

function formatEventDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const date = d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const time = d.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${date} · ${time}`
}

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function FlyerThumb({ src, size = 'md' }) {
  const dim = size === 'sm' ? 'h-12 w-9' : 'h-16 w-12'
  if (!src) {
    return (
      <div
        className={`${dim} shrink-0 rounded-md bg-slate-100 ring-1 ring-inset ring-slate-200/80`}
        aria-hidden
      />
    )
  }
  return (
    <img
      src={src}
      alt=""
      className={`${dim} shrink-0 rounded-md object-cover ring-1 ring-inset ring-slate-200/80`}
      loading="lazy"
      decoding="async"
    />
  )
}

function paginationModel(page, totalPages) {
  if (totalPages <= 1) return { items: [{ type: 'page', n: 1 }], totalPages: 1 }
  if (totalPages <= 7) {
    return {
      totalPages,
      items: Array.from({ length: totalPages }, (_, i) => ({ type: 'page', n: i + 1 })),
    }
  }
  const set = new Set(
    [1, totalPages, page, page - 1, page + 1].filter((n) => n >= 1 && n <= totalPages),
  )
  const sorted = [...set].sort((a, b) => a - b)
  const out = []
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push({ type: 'gap' })
    out.push({ type: 'page', n: sorted[i] })
  }
  return { items: out, totalPages }
}

export function AdminEvents() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(emptyDraft())
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const [bannerOpen, setBannerOpen] = useState(false)
  const [bannerSaving, setBannerSaving] = useState(false)
  const [bannerImageUrl, setBannerImageUrl] = useState('')
  const [bannerUpdatedAt, setBannerUpdatedAt] = useState(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [periodFilter, setPeriodFilter] = useState('Todos')
  const [page, setPage] = useState(1)

  const [flash, setFlash] = useState('')
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const loadFromServer = useCallback(async () => {
    const data = await fetchAdminEvents()
    const nextItems = Array.isArray(data) ? data : []
    setItems(nextItems)
    if (editing?.id) {
      const fresh = nextItems.find((item) => item.id === editing.id)
      if (fresh) {
        setEditing(fresh)
        setDraft({
          ...emptyDraft(),
          ...fresh,
          eventDate: fresh.eventDate
            ? new Date(fresh.eventDate).toISOString().slice(0, 16)
            : '',
        })
      }
    }
  }, [editing?.id])

  const loadBannerFromServer = useCallback(async () => {
    const content = await fetchSitePageBanner('events')
    setBannerImageUrl(String(content?.heroImageUrl || ''))
    setBannerUpdatedAt(content?.updatedAt || null)
  }, [])

  const persistEvent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const payload = {
        title: draft.title.trim(),
        place: draft.place.trim(),
        eventDate: new Date(draft.eventDate).toISOString(),
        summary: draft.summary.trim(),
        flyerUrl: draft.flyerUrl.trim(),
        sortOrder: Number(draft.sortOrder) || 0,
        isActive: draft.isActive !== false,
        forceOverwrite,
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
      setFlash(editing ? 'Evento actualizado correctamente.' : 'Evento creado correctamente.')
      setToast({
        type: 'success',
        message: editing ? 'Evento actualizado.' : 'Evento creado.',
      })
      await loadFromServer()
    },
    [draft, editing, loadFromServer],
  )

  const persistBanner = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const saved = await updateSitePageBanner('events', {
        heroImageUrl: bannerImageUrl.trim(),
        expectedUpdatedAt: bannerUpdatedAt,
        forceOverwrite,
      })
      setBannerImageUrl(String(saved?.heroImageUrl || ''))
      setBannerUpdatedAt(saved?.updatedAt || null)
      setBannerOpen(false)
      setFlash('Se actualizó la portada de Eventos.')
      setToast({ type: 'success', message: 'Portada actualizada.' })
    },
    [bannerImageUrl, bannerUpdatedAt],
  )

  const { conflictDialog: eventConflictDialog, handleConflict: handleEventConflict } =
    useContentEditorConcurrencyConflict({
      reloadFromServer: loadFromServer,
      persistContent: persistEvent,
      entityLabel: 'este evento',
      onReloadSuccess: () =>
        setToast({
          type: 'success',
          message: 'Se cargó la última versión del servidor.',
        }),
      onReloadError: (e) =>
        setToast({
          type: 'error',
          message: e.message || 'No se pudo recargar los eventos.',
        }),
      onForceSaveError: (e) => {
        const msg = e.message || 'No se pudo guardar el evento.'
        setFormError(msg)
        setToast({ type: 'error', message: msg })
      },
    })

  const { conflictDialog: bannerConflictDialog, handleConflict: handleBannerConflict } =
    useContentEditorConcurrencyConflict({
      reloadFromServer: loadBannerFromServer,
      persistContent: persistBanner,
      entityLabel: 'la portada de Eventos',
      onReloadSuccess: () =>
        setToast({
          type: 'success',
          message: 'Se cargó la última versión de la portada.',
        }),
      onReloadError: (e) =>
        setToast({
          type: 'error',
          message: e.message || 'No se pudo recargar la portada.',
        }),
      onForceSaveError: (e) =>
        setToast({
          type: 'error',
          message: e.message || 'No se pudo guardar la portada de Eventos.',
        }),
    })

  const load = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    void load()
  }, [load])

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

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, periodFilter])

  const filtered = useMemo(() => {
    let list = [...items]
    const q = normalize(search.trim())
    if (q) {
      list = list.filter((n) =>
        normalize(`${n.title} ${n.place || ''} ${n.summary || ''}`).includes(q),
      )
    }
    if (statusFilter === 'Publicados') {
      list = list.filter((n) => n.isActive !== false)
    } else if (statusFilter === 'Borradores') {
      list = list.filter((n) => n.isActive === false)
    }
    const today = startOfToday()
    if (periodFilter === 'Próximos') {
      list = list.filter((n) => new Date(n.eventDate).getTime() >= today)
    } else if (periodFilter === 'Pasados') {
      list = list.filter((n) => new Date(n.eventDate).getTime() < today)
    }

    if (periodFilter === 'Próximos') {
      list.sort(
        (a, b) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime() ||
          (a.sortOrder || 0) - (b.sortOrder || 0),
      )
    } else {
      list.sort(
        (a, b) =>
          new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime() ||
          (a.sortOrder || 0) - (b.sortOrder || 0),
      )
    }
    return list
  }, [items, search, statusFilter, periodFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages))
  }, [totalPages])

  const safePage = Math.min(Math.max(1, page), totalPages)
  const rangeStart = (safePage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(rangeStart, rangeStart + PAGE_SIZE)
  const rangeEnd =
    filtered.length === 0 ? 0 : Math.min(rangeStart + pageItems.length, filtered.length)
  const pagModel = paginationModel(safePage, totalPages)

  const filtersActive =
    search.trim() !== '' || statusFilter !== 'Todos' || periodFilter !== 'Todos'

  function clearFilters() {
    setSearch('')
    setStatusFilter('Todos')
    setPeriodFilter('Todos')
  }

  function openCreate() {
    setEditing(null)
    setDraft(emptyDraft())
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditing(item)
    setDraft({
      ...emptyDraft(),
      ...item,
      eventDate: item.eventDate
        ? new Date(item.eventDate).toISOString().slice(0, 16)
        : '',
    })
    setFormError('')
    setModalOpen(true)
  }

  function closeModal() {
    if (saving) return
    setModalOpen(false)
    setFormError('')
  }

  async function handleSave() {
    setFormError('')
    if (
      !draft.title.trim() ||
      !draft.place.trim() ||
      !draft.eventDate ||
      !draft.flyerUrl.trim()
    ) {
      setFormError('Completá título, fecha, lugar y flyer del evento.')
      return
    }
    setSaving(true)
    setToast({
      type: 'success',
      message: editing ? 'Guardando cambios…' : 'Creando evento…',
    })
    try {
      await persistEvent()
    } catch (e) {
      if (handleEventConflict(e)) return
      const msg = e.message || 'No se pudo guardar el evento.'
      setFormError(msg)
      setToast({ type: 'error', message: msg })
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeletingId(deleteTarget.id)
    try {
      await deleteEvent(deleteTarget.id)
      setDeleteTarget(null)
      setFlash('Evento eliminado.')
      setToast({ type: 'success', message: 'Evento eliminado.' })
      await load()
    } catch (e) {
      const msg = e.message || 'No se pudo eliminar el evento.'
      setError(msg)
      setToast({ type: 'error', message: msg })
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSaveBanner() {
    if (!isApiConfigured()) {
      setToast({ type: 'error', message: 'No hay conexión disponible con el backend.' })
      return
    }
    setBannerSaving(true)
    try {
      await persistBanner()
    } catch (e) {
      if (handleBannerConflict(e)) return
      const msg = e.message || 'No se pudo guardar la portada de Eventos.'
      setToast({ type: 'error', message: msg })
    } finally {
      setBannerSaving(false)
    }
  }

  const deleteLoading =
    deleteTarget != null && deletingId != null && deletingId === deleteTarget.id

  return (
    <>
      {toast ? (
        <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} />
      ) : null}

      {eventConflictDialog}
      {bannerConflictDialog}
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
        onClose={() => {
          if (!deleteLoading) setDeleteTarget(null)
        }}
        title="¿Eliminar este evento?"
        description={
          deleteTarget ? (
            <>
              Vas a eliminar{' '}
              <span className="font-semibold text-slate-800">
                «{deleteTarget.title || 'Sin título'}»
              </span>
              . Esta acción no se puede deshacer.
            </>
          ) : null
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        variant="danger"
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        loading={saving}
        size="wide"
        title={editing ? 'Editar evento' : 'Nuevo evento'}
        description="Publicá flyers de eventos y controlá su visibilidad."
      >
        {formError ? (
          <p
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {formError}
          </p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            Título
            <input
              className={inputClass}
              value={draft.title}
              disabled={saving}
              placeholder="Ej. Festival aniversario de Trancas"
              onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Fecha y hora
            <input
              type="datetime-local"
              className={inputClass}
              value={draft.eventDate}
              disabled={saving}
              onChange={(e) => setDraft((p) => ({ ...p, eventDate: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Lugar
            <input
              className={inputClass}
              value={draft.place}
              disabled={saving}
              placeholder="Ej. Plaza San Martín"
              onChange={(e) => setDraft((p) => ({ ...p, place: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            Orden
            <input
              type="number"
              inputMode="numeric"
              className={inputClass}
              value={draft.sortOrder}
              disabled={saving}
              onChange={(e) => setDraft((p) => ({ ...p, sortOrder: e.target.value }))}
            />
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
            <textarea
              className={`${textareaClass} min-h-24`}
              value={draft.summary}
              disabled={saving}
              placeholder="Texto breve opcional para acompañar el flyer."
              onChange={(e) => setDraft((p) => ({ ...p, summary: e.target.value }))}
            />
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={draft.isActive !== false}
              disabled={saving}
              onChange={(e) =>
                setDraft((p) => ({ ...p, isActive: e.target.checked }))
              }
            />
            Publicado
          </label>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeModal}
            disabled={saving}
            className={ACTION_BTN_NEUTRAL}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className={ACTION_BTN_PRIMARY}
          >
            {saving ? (
              <>
                <Spinner tone="white" />
                {editing ? 'Guardando…' : 'Creando…'}
              </>
            ) : editing ? (
              'Guardar cambios'
            ) : (
              'Crear evento'
            )}
          </button>
        </div>
      </Modal>

      <AdminPageShell
        showBackLink={false}
        eyebrow=""
        maxWidthClass="max-w-none"
        variant="plain"
        actions={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={() => setBannerOpen(true)}
              className={ACTION_BTN_NEUTRAL}
            >
              Cambiar portada
            </button>
            <button type="button" onClick={openCreate} className={ACTION_BTN_PRIMARY}>
              + Nuevo evento
            </button>
          </div>
        }
      >
        <h1 className="sr-only">Eventos</h1>

        {!isApiConfigured() ? (
          <div
            className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="status"
          >
            No se detectó conexión con el backend para administrar eventos.
          </div>
        ) : null}

        {flash ? (
          <div
            className="flex flex-col gap-3 rounded-2xl border border-emerald-200/90 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between"
            role="status"
          >
            <p className="font-medium">{flash}</p>
            <button
              type="button"
              onClick={() => setFlash('')}
              className="shrink-0 text-xs font-semibold text-emerald-800 underline-offset-2 hover:underline"
            >
              Cerrar
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="admin-fade-up rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-12">
              <div className="h-10 animate-pulse rounded-xl bg-slate-100 sm:col-span-6" />
              <div className="h-10 animate-pulse rounded-xl bg-slate-100 sm:col-span-3" />
              <div className="h-10 animate-pulse rounded-xl bg-slate-100 sm:col-span-3" />
            </div>
            <div className="mt-5 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div
            className="admin-fade-up rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 shadow-sm"
            role="alert"
          >
            <p className="font-semibold">No se pudieron cargar los eventos.</p>
            <p className="mt-1 text-red-700/90">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50"
            >
              <span aria-hidden>↻</span>
              Reintentar
            </button>
          </div>
        ) : (
          <div className="admin-fade-up space-y-5">
            {items.length > 0 ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
                  <label className={`${labelClass} sm:col-span-6`}>
                    Buscar
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Título, lugar o resumen…"
                      className={inputClass}
                      autoComplete="off"
                    />
                  </label>
                  <label className={`${labelClass} sm:col-span-3`}>
                    Estado
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={inputClass}
                    >
                      <option value="Todos">Todos</option>
                      <option value="Publicados">Publicados</option>
                      <option value="Borradores">Borradores</option>
                    </select>
                  </label>
                  <label className={`${labelClass} sm:col-span-3`}>
                    Periodo
                    <select
                      value={periodFilter}
                      onChange={(e) => setPeriodFilter(e.target.value)}
                      className={inputClass}
                    >
                      <option value="Todos">Todos</option>
                      <option value="Próximos">Próximos</option>
                      <option value="Pasados">Pasados</option>
                    </select>
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <p className="tabular-nums">
                    {filtersActive ? (
                      <>
                        <span className="font-semibold text-slate-900">
                          {filtered.length}
                        </span>{' '}
                        de{' '}
                        <span className="font-semibold text-slate-900">
                          {items.length}
                        </span>{' '}
                        eventos coinciden con los filtros.
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-slate-900">
                          {items.length}
                        </span>{' '}
                        eventos cargados en total.
                      </>
                    )}
                  </p>
                  {filtersActive ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Limpiar filtros
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
                <p className="text-base font-medium text-slate-800">
                  Todavía no hay eventos cargados.
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                  Creá el primero para que aparezca en la agenda pública y en el inicio del portal.
                </p>
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
                >
                  Nuevo evento
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-200/90 bg-amber-50/50 px-6 py-12 text-center">
                <p className="text-base font-medium text-slate-800">
                  No hay eventos que coincidan con los filtros.
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                  Probá otra búsqueda o limpiá los filtros para ver toda la agenda.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-sky-200 hover:bg-sky-50"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <th className="w-16 px-4 py-3.5" scope="col">
                          <span className="sr-only">Flyer</span>
                        </th>
                        <th className="min-w-0 px-3 py-3.5">Título</th>
                        <th className="w-48 whitespace-nowrap px-4 py-3.5">Fecha y hora</th>
                        <th className="w-44 px-4 py-3.5">Lugar</th>
                        <th className="w-32 px-4 py-3.5">Estado</th>
                        <th className="w-44 px-4 py-3.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((item) => {
                        const isUpcoming =
                          new Date(item.eventDate).getTime() >= startOfToday()
                        return (
                          <tr
                            key={item.id}
                            className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/90"
                          >
                            <td className="px-4 py-3 align-middle">
                              <FlyerThumb src={item.flyerUrl} />
                            </td>
                            <td className="min-w-0 px-3 py-3 align-middle">
                              <button
                                type="button"
                                onClick={() => openEdit(item)}
                                className="line-clamp-2 text-left font-semibold text-slate-900 transition hover:text-sky-800"
                              >
                                {item.title || 'Sin título'}
                              </button>
                              {item.summary ? (
                                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                  {item.summary}
                                </p>
                              ) : null}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 align-middle tabular-nums text-slate-600">
                              <div className="flex flex-col">
                                <span>{formatEventDateTime(item.eventDate)}</span>
                                <span
                                  className={`mt-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                                    isUpcoming ? 'text-emerald-700' : 'text-slate-400'
                                  }`}
                                >
                                  {isUpcoming ? 'Próximo' : 'Pasado'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 align-middle text-slate-700">
                              {item.place || '—'}
                            </td>
                            <td className="px-4 py-3 align-middle">
                              {item.isActive !== false ? (
                                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-100">
                                  Publicado
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                                  Borrador
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right align-middle">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEdit(item)}
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(item)}
                                  disabled={deletingId === item.id}
                                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {deletingId === item.id ? (
                                    <Spinner tone="white" size="sm" />
                                  ) : null}
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <ul className="space-y-3 lg:hidden">
                  {pageItems.map((item) => {
                    const isUpcoming =
                      new Date(item.eventDate).getTime() >= startOfToday()
                    return (
                      <li
                        key={item.id}
                        className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                      >
                        <div className="shrink-0 pt-0.5">
                          <FlyerThumb src={item.flyerUrl} size="sm" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="line-clamp-2 text-left text-base font-semibold text-slate-900 hover:text-sky-800"
                          >
                            {item.title || 'Sin título'}
                          </button>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {item.isActive !== false ? (
                              <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-900 ring-1 ring-emerald-100">
                                Publicado
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-700 ring-1 ring-slate-200">
                                Borrador
                              </span>
                            )}
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wide ${
                                isUpcoming ? 'text-emerald-700' : 'text-slate-400'
                              }`}
                            >
                              {isUpcoming ? 'Próximo' : 'Pasado'}
                            </span>
                          </div>
                          <div className="mt-1.5 text-xs text-slate-600">
                            {formatEventDateTime(item.eventDate)}
                          </div>
                          {item.place ? (
                            <div className="text-xs text-slate-500">{item.place}</div>
                          ) : null}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-sky-200 hover:bg-sky-50/50 hover:text-sky-900 sm:flex-none"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              disabled={deletingId === item.id}
                              className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                            >
                              {deletingId === item.id ? (
                                <Spinner tone="white" size="sm" />
                              ) : null}
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <nav
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  aria-label="Paginación de eventos"
                >
                  <p className="text-center text-sm leading-relaxed text-slate-600 sm:text-left">
                    Mostrando{' '}
                    <span className="font-semibold tabular-nums text-slate-900">
                      {rangeStart + 1}
                    </span>
                    –
                    <span className="font-semibold tabular-nums text-slate-900">
                      {rangeEnd}
                    </span>{' '}
                    de{' '}
                    <span className="font-semibold tabular-nums text-slate-900">
                      {filtered.length}
                    </span>
                    {totalPages > 1 ? (
                      <>
                        <span className="text-slate-400" aria-hidden>
                          {' '}
                          ·{' '}
                        </span>
                        <span className="tabular-nums text-slate-600">
                          página {safePage} de {totalPages}
                        </span>
                      </>
                    ) : null}
                  </p>
                  {totalPages > 1 ? (
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                      <button
                        type="button"
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <div className="hidden items-center gap-1 sm:flex">
                        {pagModel.items.map((entry, idx) =>
                          entry.type === 'gap' ? (
                            <span
                              key={`gap-${idx}`}
                              className="px-1 text-slate-400"
                              aria-hidden
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={entry.n}
                              type="button"
                              onClick={() => setPage(entry.n)}
                              className={`min-h-10 min-w-10 rounded-lg text-sm font-semibold transition ${
                                entry.n === safePage
                                  ? 'bg-sky-700 text-white shadow-sm'
                                  : 'text-slate-700 hover:bg-white hover:ring-1 hover:ring-slate-200'
                              }`}
                            >
                              {entry.n}
                            </button>
                          ),
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={safePage >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  ) : null}
                </nav>
              </>
            )}
          </div>
        )}
      </AdminPageShell>
    </>
  )
}
