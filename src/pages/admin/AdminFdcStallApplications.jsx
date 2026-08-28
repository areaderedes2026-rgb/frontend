import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import {
  deleteFdcStallApplication,
  fetchFdcStallApplicationAdminById,
  fetchFdcStallApplicationsAdmin,
  fetchFdcWhatsappTemplate,
  resendFdcStallApplicationEmail,
  updateFdcStallApplicationStatus,
  updateFdcWhatsappTemplate,
} from '../../services/fdcService.js'
import { isFdcOtherRubro } from '../../data/fdcContent.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'
import { ROUTES } from '../../utils/constants.js'
import {
  DEFAULT_FDC_WHATSAPP_TEMPLATE,
  normalizePhoneForWhatsapp,
  openFdcStallWhatsApp,
} from '../../utils/fdcWhatsapp.js'
import { downloadFdcStallApplicationsPdf } from '../../utils/fdcStallApplicationsPdf.js'
import {
  buildLocalityFilterOptions,
  localityFilterKey,
  localityFilterLabel,
} from '../../utils/fdcStallApplicationFilters.js'

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200]

const ACTION_BTN =
  'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60'
const ACTION_NEUTRAL = `${ACTION_BTN} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`
const ACTION_PRIMARY = `${ACTION_BTN} bg-sky-700 text-white hover:bg-sky-800`
const ACTION_WHATSAPP = `${ACTION_BTN} border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100`
const ACTION_DANGER = `${ACTION_BTN} border border-red-200 bg-white text-red-700 hover:bg-red-50`
const ACTION_GHOST = `${ACTION_BTN} text-slate-600 hover:bg-slate-100`

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'sin_resolver', label: 'Sin resolver' },
  { value: 'leida', label: 'Leídas' },
  { value: 'resuelta', label: 'Resueltas' },
]

const STATUS_META = {
  sin_resolver: { label: 'Sin resolver', className: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80' },
  leida: { label: 'Leída', className: 'bg-sky-50 text-sky-900 ring-1 ring-sky-200/80' },
  resuelta: { label: 'Resuelta', className: 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80' },
}

const selectClass = `${inputClass} appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9`
const selectChevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")"

function formatDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

function formatDateShort(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short' }).format(d)
}

function toYmdLocal(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.sin_resolver
  return (
    <span className={`inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  )
}

/** Texto visible en tabla/detalle (incluye especificación de «Otro»). */
function rubroLabel(app) {
  if (!app) return '—'
  if (isFdcOtherRubro(app.rubro) && app.rubroOther) return `Otro: ${app.rubroOther}`
  if (isFdcOtherRubro(app.rubro)) return 'Otro'
  return app.rubro || '—'
}

/**
 * Clave de filtro: todos los «Otro» (con cualquier especificación) agrupan en uno solo.
 * Así el select no lista «Otro: panadería», «Otro: kiosco», etc. por separado.
 */
function rubroFilterKey(app) {
  const base = String(app?.rubro || '').trim()
  if (!base) return ''
  if (isFdcOtherRubro(base)) return 'otro'
  return base.toLowerCase()
}

function rubroFilterLabel(key, sampleApp) {
  if (key === 'otro') return 'Otro'
  return rubroLabel(sampleApp) || key
}

export function AdminFdcStallApplications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [rubroFilter, setRubroFilter] = useState('all')
  const [localityFilter, setLocalityFilter] = useState('all')
  const [participatedFilter, setParticipatedFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateUntil, setDateUntil] = useState('')
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState(null)
  const [selected, setSelected] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [whatsappTemplate, setWhatsappTemplate] = useState('')
  const [whatsappUpdatedAt, setWhatsappUpdatedAt] = useState(null)
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false)
  const [whatsappDraft, setWhatsappDraft] = useState('')
  const [whatsappSaving, setWhatsappSaving] = useState(false)

  const dismissToast = useCallback(() => setToast(null), [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchFdcStallApplicationsAdmin(
        statusFilter === 'all' ? '' : statusFilter,
      )
      setItems(Array.isArray(list) ? list : [])
    } catch (e) {
      setToast({ variant: 'error', message: e.message || 'No se pudieron cargar las solicitudes.' })
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoading(false)
      return
    }
    void load()
  }, [load])

  useEffect(() => {
    if (!isApiConfigured()) return
    fetchFdcWhatsappTemplate()
      .then((data) => {
        setWhatsappTemplate(data.message || '')
        setWhatsappUpdatedAt(data.updatedAt || null)
      })
      .catch(() => {})
  }, [])

  const rubroOptions = useMemo(() => {
    const map = new Map()
    for (const app of items) {
      const key = rubroFilterKey(app)
      if (!key) continue
      if (!map.has(key)) map.set(key, rubroFilterLabel(key, app))
    }
    return [...map.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => {
        // «Otro» siempre al final del listado de rubros.
        if (a.value === 'otro') return 1
        if (b.value === 'otro') return -1
        return a.label.localeCompare(b.label, 'es')
      })
  }, [items])

  const localityOptions = useMemo(() => buildLocalityFilterOptions(items), [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((app) => {
      if (rubroFilter !== 'all' && rubroFilterKey(app) !== rubroFilter) return false
      if (localityFilter !== 'all' && localityFilterKey(app.locality) !== localityFilter) {
        return false
      }
      if (participatedFilter === 'yes' && !app.participatedBefore) return false
      if (participatedFilter === 'no' && app.participatedBefore) return false
      if (dateFrom) {
        const ymd = toYmdLocal(app.createdAt)
        if (!ymd || ymd < dateFrom) return false
      }
      if (dateUntil) {
        const ymd = toYmdLocal(app.createdAt)
        if (!ymd || ymd > dateUntil) return false
      }
      if (!q) return true
      return [app.fullName, app.dni, app.email, app.phone, app.rubro, app.rubroOther, app.locality, app.address, String(app.id)]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [
    items,
    search,
    rubroFilter,
    localityFilter,
    participatedFilter,
    dateFrom,
    dateUntil,
  ])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize) || 1)
  const pageSafe = Math.min(page, totalPages)
  const pageItems = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize)

  useEffect(() => {
    setPage(1)
  }, [statusFilter, rubroFilter, localityFilter, participatedFilter, dateFrom, dateUntil, search, pageSize])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const stats = useMemo(() => {
    const all = items
    return {
      total: all.length,
      sin: all.filter((x) => x.status === 'sin_resolver').length,
      leida: all.filter((x) => x.status === 'leida').length,
      resuelta: all.filter((x) => x.status === 'resuelta').length,
      filtered: filtered.length,
    }
  }, [items, filtered])

  const filterSummary = useMemo(() => {
    const parts = []
    const statusLabel = STATUS_FILTERS.find((f) => f.value === statusFilter)?.label
    if (statusFilter !== 'all' && statusLabel) parts.push(`Estado: ${statusLabel}`)
    if (rubroFilter !== 'all') {
      const rubro = rubroOptions.find((r) => r.value === rubroFilter)?.label || rubroFilter
      parts.push(`Rubro: ${rubro}`)
    }
    if (localityFilter !== 'all') {
      const loc = localityFilterLabel(localityFilter, localityOptions) || localityFilter
      parts.push(`Localidad: ${loc}`)
    }
    if (participatedFilter === 'yes') parts.push('Participó antes: Sí')
    if (participatedFilter === 'no') parts.push('Participó antes: No')
    if (dateFrom) parts.push(`Desde: ${dateFrom}`)
    if (dateUntil) parts.push(`Hasta: ${dateUntil}`)
    if (search.trim()) parts.push(`Búsqueda: “${search.trim()}”`)
    return parts.length ? parts.join(' · ') : 'Sin filtros adicionales'
  }, [
    statusFilter,
    rubroFilter,
    localityFilter,
    participatedFilter,
    dateFrom,
    dateUntil,
    search,
    rubroOptions,
  ])

  const hasExtraFilters =
    rubroFilter !== 'all' ||
    localityFilter !== 'all' ||
    participatedFilter !== 'all' ||
    Boolean(dateFrom) ||
    Boolean(dateUntil) ||
    Boolean(search.trim())

  function clearExtraFilters() {
    setRubroFilter('all')
    setLocalityFilter('all')
    setParticipatedFilter('all')
    setDateFrom('')
    setDateUntil('')
    setSearch('')
  }

  async function openDetail(id) {
    setBusy(true)
    try {
      const app = await fetchFdcStallApplicationAdminById(id)
      setSelected(app)
      setDetailOpen(true)
    } catch (e) {
      setToast({ variant: 'error', message: e.message || 'No se pudo abrir la solicitud.' })
    } finally {
      setBusy(false)
    }
  }

  async function setStatus(nextStatus) {
    if (!selected) return
    setBusy(true)
    try {
      const updated = await updateFdcStallApplicationStatus(selected.id, {
        status: nextStatus,
        expectedUpdatedAt: selected.updatedAt,
      })
      setSelected(updated)
      await load()
      setToast({ variant: 'success', message: 'Estado actualizado.' })
    } catch (e) {
      if (isConcurrencyConflictError(e)) {
        setToast({
          variant: 'error',
          message: 'Otro usuario modificó esta solicitud. Recargá el detalle.',
        })
      } else {
        setToast({ variant: 'error', message: e.message || 'No se pudo actualizar.' })
      }
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    const target = pendingDelete || selected
    if (!target?.id) return
    setBusy(true)
    try {
      await deleteFdcStallApplication(target.id)
      setConfirmDelete(false)
      setPendingDelete(null)
      if (selected?.id === target.id) {
        setDetailOpen(false)
        setSelected(null)
      }
      await load()
      setToast({
        variant: 'success',
        message: `Solicitud #${target.id} eliminada. Ese correo/teléfono y el N° correlativo quedan libres para una nueva preinscripción.`,
      })
    } catch (e) {
      setToast({ variant: 'error', message: e.message || 'No se pudo eliminar.' })
    } finally {
      setBusy(false)
    }
  }

  function askDelete(app) {
    if (!app?.id) return
    setPendingDelete(app)
    setConfirmDelete(true)
  }

  async function handleResendEmail() {
    if (!selected) return
    setBusy(true)
    try {
      const updated = await resendFdcStallApplicationEmail(selected.id)
      setSelected(updated)
      await load()
      setToast({ variant: 'success', message: 'Constancia reenviada por correo.' })
    } catch (e) {
      setToast({ variant: 'error', message: e.message || 'No se pudo reenviar el correo.' })
    } finally {
      setBusy(false)
    }
  }

  function handleWhatsapp(app = selected) {
    try {
      openFdcStallWhatsApp(app, whatsappTemplate || '')
    } catch (e) {
      setToast({ variant: 'error', message: e.message || 'No se pudo abrir WhatsApp.' })
    }
  }

  async function saveWhatsappTemplate() {
    setWhatsappSaving(true)
    try {
      const saved = await updateFdcWhatsappTemplate({
        message: whatsappDraft,
        expectedUpdatedAt: whatsappUpdatedAt,
      })
      setWhatsappTemplate(saved.message || '')
      setWhatsappUpdatedAt(saved.updatedAt || null)
      setWhatsappModalOpen(false)
      setToast({ variant: 'success', message: 'Plantilla de WhatsApp guardada.' })
    } catch (e) {
      setToast({ variant: 'error', message: e.message || 'No se pudo guardar la plantilla.' })
    } finally {
      setWhatsappSaving(false)
    }
  }

  function handleExportPdf() {
    setPdfBusy(true)
    try {
      downloadFdcStallApplicationsPdf(filtered, { filterSummary })
      setToast({
        variant: 'success',
        message: `PDF generado con ${filtered.length} solicitud${filtered.length === 1 ? '' : 'es'}.`,
      })
    } catch (e) {
      setToast({ variant: 'error', message: e.message || 'No se pudo generar el PDF.' })
    } finally {
      setPdfBusy(false)
    }
  }

  const fromRow = filtered.length === 0 ? 0 : (pageSafe - 1) * pageSize + 1
  const toRow = Math.min(pageSafe * pageSize, filtered.length)

  return (
    <>
      {toast ? <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} /> : null}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => {
          if (busy) return
          setConfirmDelete(false)
          setPendingDelete(null)
        }}
        title={
          pendingDelete?.id
            ? `¿Eliminar la solicitud #${pendingDelete.id}?`
            : '¿Eliminar esta solicitud?'
        }
        description="Se borra de forma permanente. Ese correo y teléfono podrán volver a usarse, y el número correlativo se libera para la próxima preinscripción (si era la última)."
        confirmLabel="Eliminar"
        onConfirm={() => void handleDelete()}
        loading={busy}
        variant="danger"
      />

      <Modal
        open={whatsappModalOpen}
        onClose={() => !whatsappSaving && setWhatsappModalOpen(false)}
        title="Plantilla de WhatsApp FDC"
        description="Placeholders: {{nombre}} {{id}} {{rubro}} {{dni}} {{telefono}}"
        loading={whatsappSaving}
      >
        <textarea
          className={`${textareaClass} min-h-44`}
          value={whatsappDraft}
          onChange={(e) => setWhatsappDraft(e.target.value)}
          disabled={whatsappSaving}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className={ACTION_NEUTRAL}
            disabled={whatsappSaving}
            onClick={() => setWhatsappModalOpen(false)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={ACTION_PRIMARY}
            disabled={whatsappSaving}
            onClick={() => void saveWhatsappTemplate()}
          >
            Guardar plantilla
          </button>
        </div>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={() => !busy && setDetailOpen(false)}
        title={selected ? `Solicitud #${selected.id}` : 'Solicitud'}
        size="wide"
        loading={busy}
      >
        {selected ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={selected.status} />
              <span className="text-xs text-slate-500">{formatDateTime(selected.createdAt)}</span>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ['Nombre', selected.fullName],
                ['DNI', selected.dni],
                ['Teléfono', selected.phone],
                ['Email', selected.email],
                ['Domicilio', selected.address],
                ['Localidad', selected.locality],
                ['Rubro', rubroLabel(selected)],
                [
                  'Participó antes',
                  selected.participatedBefore
                    ? `Sí (${selected.participationYears || 'sin años'})`
                    : 'No',
                ],
                [
                  'Constancia email',
                  selected.emailSentAt ? formatDateTime(selected.emailSentAt) : 'No enviada',
                ],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{value || '—'}</dd>
                </div>
              ))}
            </dl>
            {selected.emailError ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                Error de correo: {selected.emailError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={ACTION_NEUTRAL}
                disabled={busy}
                onClick={() => void setStatus('sin_resolver')}
              >
                Marcar pendiente
              </button>
              <button
                type="button"
                className={ACTION_NEUTRAL}
                disabled={busy}
                onClick={() => void setStatus('leida')}
              >
                Marcar leída
              </button>
              <button
                type="button"
                className={ACTION_PRIMARY}
                disabled={busy}
                onClick={() => void setStatus('resuelta')}
              >
                Marcar resuelta
              </button>
              <button
                type="button"
                className={ACTION_WHATSAPP}
                disabled={busy || !normalizePhoneForWhatsapp(selected.phone)}
                onClick={() => handleWhatsapp(selected)}
              >
                WhatsApp
              </button>
              <button
                type="button"
                className={ACTION_NEUTRAL}
                disabled={busy}
                onClick={() => void handleResendEmail()}
              >
                Reenviar email
              </button>
              <button
                type="button"
                className={ACTION_DANGER}
                disabled={busy}
                onClick={() => askDelete(selected)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <AdminPageShell
        showBackLink={false}
        eyebrow="Fiesta del Caballo"
        title="Solicitudes de puestos"
        subtitle="Bandeja de preinscripciones. Filtrá, exportá a PDF y gestioná cada solicitud."
        maxWidthClass="max-w-7xl"
        variant="plain"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to={ROUTES.adminFdc} className={ACTION_NEUTRAL}>
              Editar página FDC
            </Link>
            <button
              type="button"
              className={ACTION_NEUTRAL}
              onClick={() => {
                setWhatsappDraft(whatsappTemplate.trim() || DEFAULT_FDC_WHATSAPP_TEMPLATE)
                setWhatsappModalOpen(true)
              }}
            >
              Plantilla WhatsApp
            </button>
            <button
              type="button"
              className={ACTION_PRIMARY}
              disabled={pdfBusy || loading || filtered.length === 0}
              onClick={handleExportPdf}
            >
              {pdfBusy ? 'Generando…' : 'Descargar PDF'}
            </button>
          </div>
        }
      >
        {!isApiConfigured() ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Configurá el backend para gestionar solicitudes.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['Total', stats.total],
                ['Sin resolver', stats.sin],
                ['Leídas', stats.leida],
                ['Resueltas', stats.resuelta],
              ].map(([label, value]) => (
                <article
                  key={label}
                  className="rounded-xl border border-slate-200/90 bg-white px-3.5 py-3"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">{value}</p>
                </article>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4">
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setStatusFilter(f.value)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      statusFilter === f.value
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                <label className={labelClass}>
                  Buscar
                  <input
                    type="search"
                    className={inputClass}
                    placeholder="Nombre, DNI, email, teléfono…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <label className={labelClass}>
                  Rubro
                  <select
                    className={selectClass}
                    style={{ backgroundImage: selectChevron }}
                    value={rubroFilter}
                    onChange={(e) => setRubroFilter(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    {rubroOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  Localidad
                  <select
                    className={selectClass}
                    style={{ backgroundImage: selectChevron }}
                    value={localityFilter}
                    onChange={(e) => setLocalityFilter(e.target.value)}
                  >
                    <option value="all">Todas</option>
                    {localityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  Participó antes
                  <select
                    className={selectClass}
                    style={{ backgroundImage: selectChevron }}
                    value={participatedFilter}
                    onChange={(e) => setParticipatedFilter(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="yes">Sí</option>
                    <option value="no">No</option>
                  </select>
                </label>
                <label className={labelClass}>
                  Desde
                  <input
                    type="date"
                    className={inputClass}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </label>
                <label className={labelClass}>
                  Hasta
                  <input
                    type="date"
                    className={inputClass}
                    value={dateUntil}
                    onChange={(e) => setDateUntil(e.target.value)}
                  />
                </label>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{stats.filtered}</span> resultado
                  {stats.filtered === 1 ? '' : 's'}
                  {hasExtraFilters || statusFilter !== 'all' ? (
                    <span className="text-slate-500"> · {filterSummary}</span>
                  ) : null}
                </p>
                <div className="flex flex-wrap gap-2">
                  {hasExtraFilters ? (
                    <button type="button" className={ACTION_GHOST} onClick={clearExtraFilters}>
                      Limpiar filtros
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={ACTION_NEUTRAL}
                    disabled={loading || busy}
                    onClick={() => void load()}
                  >
                    Actualizar
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-sm text-slate-600">
                No hay solicitudes para mostrar con los filtros actuales.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        <th className="whitespace-nowrap px-3 py-2.5 font-semibold">N°</th>
                        <th className="whitespace-nowrap px-3 py-2.5 font-semibold">Nombre</th>
                        <th className="whitespace-nowrap px-3 py-2.5 font-semibold">DNI</th>
                        <th className="whitespace-nowrap px-3 py-2.5 font-semibold">Contacto</th>
                        <th className="whitespace-nowrap px-3 py-2.5 font-semibold">Localidad</th>
                        <th className="whitespace-nowrap px-3 py-2.5 font-semibold">Rubro</th>
                        <th className="whitespace-nowrap px-3 py-2.5 font-semibold">Estado</th>
                        <th className="whitespace-nowrap px-3 py-2.5 font-semibold">Fecha</th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-right font-semibold">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((app) => (
                        <tr
                          key={app.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                        >
                          <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-500">
                            #{app.id}
                          </td>
                          <td className="max-w-[12rem] px-3 py-2.5 font-medium text-slate-900">
                            <span className="line-clamp-2">{app.fullName || '—'}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-700">
                            {app.dni || '—'}
                          </td>
                          <td className="max-w-[14rem] px-3 py-2.5 text-slate-600">
                            <p className="truncate">{app.phone || '—'}</p>
                            <p className="truncate text-xs text-slate-500">{app.email || '—'}</p>
                          </td>
                          <td className="max-w-[9rem] px-3 py-2.5 text-slate-700">
                            <span className="line-clamp-2">{app.locality || '—'}</span>
                          </td>
                          <td className="max-w-[10rem] px-3 py-2.5 text-slate-700">
                            <span className="line-clamp-2">{rubroLabel(app)}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5">
                            <StatusPill status={app.status} />
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
                            {formatDateShort(app.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-right">
                            <div className="inline-flex flex-wrap justify-end gap-1">
                              <button
                                type="button"
                                className={ACTION_GHOST}
                                onClick={() => void openDetail(app.id)}
                              >
                                Ver
                              </button>
                              <button
                                type="button"
                                className={ACTION_GHOST}
                                disabled={!normalizePhoneForWhatsapp(app.phone)}
                                onClick={() => handleWhatsapp(app)}
                              >
                                WA
                              </button>
                              <button
                                type="button"
                                className={ACTION_GHOST}
                                disabled={busy}
                                onClick={() => askDelete(app)}
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

                <div className="flex flex-col gap-3 border-t border-slate-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span>
                      {fromRow}–{toRow} de {filtered.length}
                    </span>
                    <label className="inline-flex items-center gap-2">
                      <span className="text-slate-500">Por página</span>
                      <select
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800"
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value) || 20)}
                      >
                        {PAGE_SIZE_OPTIONS.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={ACTION_NEUTRAL}
                      disabled={pageSafe <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </button>
                    <span className="min-w-[4.5rem] text-center text-sm tabular-nums text-slate-600">
                      {pageSafe} / {totalPages}
                    </span>
                    <button
                      type="button"
                      className={ACTION_NEUTRAL}
                      disabled={pageSafe >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </AdminPageShell>
    </>
  )
}
