import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { textareaClass } from '../../components/ui/formStyles.js'
import {
  deleteFdcStallApplication,
  fetchFdcStallApplicationAdminById,
  fetchFdcStallApplicationsAdmin,
  fetchFdcWhatsappTemplate,
  resendFdcStallApplicationEmail,
  updateFdcStallApplicationStatus,
  updateFdcWhatsappTemplate,
} from '../../services/fdcService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'
import { ROUTES } from '../../utils/constants.js'
import {
  DEFAULT_FDC_WHATSAPP_TEMPLATE,
  normalizePhoneForWhatsapp,
  openFdcStallWhatsApp,
} from '../../utils/fdcWhatsapp.js'

const PAGE_SIZE = 12

const ACTION_BTN =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60'
const ACTION_NEUTRAL = `${ACTION_BTN} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`
const ACTION_PRIMARY = `${ACTION_BTN} bg-sky-700 text-white hover:bg-sky-800`
const ACTION_WHATSAPP = `${ACTION_BTN} border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100`

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'sin_resolver', label: 'Sin resolver' },
  { value: 'leida', label: 'Leídas' },
  { value: 'resuelta', label: 'Resueltas' },
]

const STATUS_META = {
  sin_resolver: { label: 'Sin resolver', className: 'border-amber-200 bg-amber-50 text-amber-900' },
  leida: { label: 'Leída', className: 'border-sky-200 bg-sky-50 text-sky-900' },
  resuelta: { label: 'Resuelta', className: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
}

function formatDateTime(value) {
  if (!value) return 'Sin fecha'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.sin_resolver
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  )
}

function rubroLabel(app) {
  if (!app) return '—'
  if (app.rubro === 'Otro' && app.rubroOther) return `Otro: ${app.rubroOther}`
  return app.rubro || '—'
}

export function AdminFdcStallApplications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState(null)
  const [selected, setSelected] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
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
      setItems(list)
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((app) =>
      [app.fullName, app.dni, app.email, app.phone, app.rubro, app.rubroOther, app.locality]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [items, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const pageItems = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE)

  const stats = useMemo(() => {
    const all = items
    return {
      total: all.length,
      sin: all.filter((x) => x.status === 'sin_resolver').length,
      leida: all.filter((x) => x.status === 'leida').length,
      resuelta: all.filter((x) => x.status === 'resuelta').length,
    }
  }, [items])

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
    if (!selected) return
    setBusy(true)
    try {
      await deleteFdcStallApplication(selected.id)
      setConfirmDelete(false)
      setDetailOpen(false)
      setSelected(null)
      await load()
      setToast({ variant: 'success', message: 'Solicitud eliminada.' })
    } catch (e) {
      setToast({ variant: 'error', message: e.message || 'No se pudo eliminar.' })
    } finally {
      setBusy(false)
    }
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

  return (
    <>
      {toast ? <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} /> : null}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="¿Eliminar esta solicitud?"
        description="Se borrará de forma permanente de la bandeja FDC."
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
                ['Constancia email', selected.emailSentAt ? formatDateTime(selected.emailSentAt) : 'No enviada'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">{value || '—'}</dd>
                </div>
              ))}
            </dl>
            {selected.emailError ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                Error de correo: {selected.emailError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button type="button" className={ACTION_NEUTRAL} disabled={busy} onClick={() => void setStatus('sin_resolver')}>
                Marcar pendiente
              </button>
              <button type="button" className={ACTION_NEUTRAL} disabled={busy} onClick={() => void setStatus('leida')}>
                Marcar leída
              </button>
              <button type="button" className={ACTION_PRIMARY} disabled={busy} onClick={() => void setStatus('resuelta')}>
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
              <button type="button" className={ACTION_NEUTRAL} disabled={busy} onClick={() => void handleResendEmail()}>
                Reenviar email
              </button>
              <button
                type="button"
                className={`${ACTION_BTN} border border-red-200 bg-white text-red-700 hover:bg-red-50`}
                disabled={busy}
                onClick={() => setConfirmDelete(true)}
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
        subtitle="Bandeja de preinscripciones comerciales. Respondé por WhatsApp o reenviá la constancia por correo."
        maxWidthClass="max-w-6xl"
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
          </div>
        }
      >
        {!isApiConfigured() ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Configurá el backend para gestionar solicitudes.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ['Total', stats.total, 'slate'],
                ['Sin resolver', stats.sin, 'amber'],
                ['Leídas', stats.leida, 'sky'],
                ['Resueltas', stats.resuelta, 'emerald'],
              ].map(([label, value, tone]) => (
                <article
                  key={label}
                  className={`rounded-2xl border p-4 shadow-sm ${
                    tone === 'amber'
                      ? 'border-amber-200 bg-amber-50'
                      : tone === 'sky'
                        ? 'border-sky-200 bg-sky-50'
                        : tone === 'emerald'
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-slate-200 bg-white'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-1 text-2xl font-black tabular-nums">{value}</p>
                </article>
              ))}
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(f.value)
                      setPage(1)
                    }}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                      statusFilter === f.value
                        ? 'bg-[#171b22] text-white'
                        : 'border border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <input
                type="search"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm lg:max-w-xs"
                placeholder="Buscar por nombre, DNI, email…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            {loading ? (
              <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
            ) : pageItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-600">
                No hay solicitudes para mostrar.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <ul className="divide-y divide-slate-100">
                  {pageItems.map((app) => (
                    <li key={app.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">
                            #{app.id} · {app.fullName}
                          </p>
                          <StatusPill status={app.status} />
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          {rubroLabel(app)} · {app.phone} · {app.email}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(app.createdAt)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className={ACTION_NEUTRAL} onClick={() => void openDetail(app.id)}>
                          Ver
                        </button>
                        <button
                          type="button"
                          className={ACTION_WHATSAPP}
                          disabled={!normalizePhoneForWhatsapp(app.phone)}
                          onClick={() => handleWhatsapp(app)}
                        >
                          WhatsApp
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {totalPages > 1 ? (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  className={ACTION_NEUTRAL}
                  disabled={pageSafe <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </button>
                <span className="text-sm text-slate-600">
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
            ) : null}
          </div>
        )}
      </AdminPageShell>
    </>
  )
}
