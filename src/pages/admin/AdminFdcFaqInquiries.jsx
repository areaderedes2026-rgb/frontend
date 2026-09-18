import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { InquiryDetailPanel, InquiryStatusPill } from '../../components/admin/InquiryDetailPanel.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import {
  deleteFdcFaqInquiry,
  fetchFdcFaqInquiryAdminById,
  fetchFdcFaqInquiriesAdmin,
  fetchFdcFaqInquiryWhatsappTemplate,
  updateFdcFaqInquiryStatus,
  updateFdcFaqInquiryWhatsappTemplate,
} from '../../services/fdcService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'
import { ROUTES } from '../../utils/constants.js'
import {
  DEFAULT_FDC_FAQ_INQUIRY_WHATSAPP_TEMPLATE,
  normalizePhoneForWhatsapp,
  openInquiryWhatsApp,
} from '../../utils/inquiryWhatsapp.js'

const PAGE_SIZE = 12
const ACTION_BTN_BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
const ACTION_BTN_NEUTRAL = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`
const ACTION_BTN_WHATSAPP = `${ACTION_BTN_BASE} border border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-300 hover:bg-emerald-100/90`

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'sin_resolver', label: 'Sin resolver' },
  { value: 'leida', label: 'Leídas' },
  { value: 'resuelta', label: 'Resueltas' },
]

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function formatDateTime(value) {
  if (!value) return 'Sin fecha'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

function StatCard({ label, value, tone = 'slate' }) {
  const styles = {
    slate: 'border-slate-200 bg-white text-slate-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    sky: 'border-sky-200 bg-sky-50 text-sky-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  }
  const labelStyles = {
    slate: 'text-slate-500',
    amber: 'text-amber-700',
    sky: 'text-sky-700',
    emerald: 'text-emerald-700',
  }
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${styles[tone] || styles.slate}`}>
      <p className={`text-xs font-bold uppercase tracking-wide ${labelStyles[tone] || labelStyles.slate}`}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-black tabular-nums tracking-tight">{value}</p>
    </article>
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
  const set = new Set([1, totalPages, page, page - 1, page + 1].filter((n) => n >= 1 && n <= totalPages))
  const sorted = Array.from(set).sort((a, b) => a - b)
  const items = []
  for (let i = 0; i < sorted.length; i += 1) {
    items.push({ type: 'page', n: sorted[i] })
    const next = sorted[i + 1]
    if (next != null && next - sorted[i] > 1) items.push({ type: 'gap', key: `gap-${sorted[i]}` })
  }
  return { totalPages, items }
}

function WhatsAppGlyph({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function AdminFdcFaqInquiries() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [inquiries, setInquiries] = useState([])
  const [inquiriesLoading, setInquiriesLoading] = useState(true)
  const [inquiriesError, setInquiriesError] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailUpdating, setDetailUpdating] = useState(false)
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [toast, setToast] = useState(null)
  const [conflictOpen, setConflictOpen] = useState(false)
  const [whatsappConflictOpen, setWhatsappConflictOpen] = useState(false)
  const [whatsappTemplateMessage, setWhatsappTemplateMessage] = useState('')
  const [whatsappTemplateUpdatedAt, setWhatsappTemplateUpdatedAt] = useState(null)
  const [whatsappTemplateLoading, setWhatsappTemplateLoading] = useState(false)
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false)
  const [whatsappDraft, setWhatsappDraft] = useState('')
  const [whatsappModalSaving, setWhatsappModalSaving] = useState(false)
  const [inquirySearch, setInquirySearch] = useState('')
  const [page, setPage] = useState(1)
  const dismissToast = useCallback(() => setToast(null), [])

  const stats = useMemo(() => {
    const total = inquiries.length
    return {
      total,
      sinResolver: inquiries.filter((i) => i.status === 'sin_resolver').length,
      leidas: inquiries.filter((i) => i.status === 'leida').length,
      resueltas: inquiries.filter((i) => i.status === 'resuelta').length,
    }
  }, [inquiries])

  const filteredInquiries = useMemo(() => {
    const term = normalize(inquirySearch)
    if (!term) return inquiries
    return inquiries.filter((inquiry) =>
      [inquiry.id, inquiry.fullName, inquiry.phone, inquiry.topic, inquiry.message].some((value) =>
        normalize(value).includes(term),
      ),
    )
  }, [inquiries, inquirySearch])

  const totalPages = Math.max(1, Math.ceil(filteredInquiries.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const rangeStart = (safePage - 1) * PAGE_SIZE
  const paginatedInquiries = filteredInquiries.slice(rangeStart, rangeStart + PAGE_SIZE)
  const pagModel = paginationModel(safePage, totalPages)

  const loadWhatsappTemplate = useCallback(async () => {
    if (!isApiConfigured()) return
    setWhatsappTemplateLoading(true)
    try {
      const data = await fetchFdcFaqInquiryWhatsappTemplate()
      setWhatsappTemplateMessage(data.message || '')
      setWhatsappTemplateUpdatedAt(data.updatedAt || null)
    } catch (e) {
      setToast({ variant: 'error', message: e.message || 'No se pudo cargar la plantilla de WhatsApp.' })
    } finally {
      setWhatsappTemplateLoading(false)
    }
  }, [])

  const loadInquiries = useCallback(async () => {
    if (!isApiConfigured()) {
      setInquiries([])
      setInquiriesLoading(false)
      return
    }
    setInquiriesLoading(true)
    setInquiriesError('')
    try {
      const list = await fetchFdcFaqInquiriesAdmin(statusFilter === 'all' ? '' : statusFilter)
      setInquiries(list)
    } catch (e) {
      setInquiriesError(e.message || 'No se pudieron cargar las consultas.')
    } finally {
      setInquiriesLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    void loadInquiries()
  }, [loadInquiries])

  useEffect(() => {
    void loadWhatsappTemplate()
  }, [loadWhatsappTemplate])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, inquirySearch])

  async function openDetail(id) {
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const inquiry = await fetchFdcFaqInquiryAdminById(id)
      setSelectedInquiry(inquiry)
    } catch (e) {
      setSelectedInquiry(null)
      setToast({ variant: 'error', message: e.message || 'No se pudo abrir la consulta.' })
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleChangeInquiryStatus(status) {
    if (!selectedInquiry) return
    setDetailUpdating(true)
    try {
      const next = await updateFdcFaqInquiryStatus(selectedInquiry.id, status, selectedInquiry.updatedAt)
      setSelectedInquiry(next)
      setInquiries((list) => list.map((item) => (item.id === next.id ? next : item)))
      setToast({ variant: 'success', message: 'Estado actualizado.' })
    } catch (e) {
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
      else setToast({ variant: 'error', message: e.message || 'No se pudo actualizar el estado.' })
    } finally {
      setDetailUpdating(false)
    }
  }

  async function handleDeleteInquiry() {
    if (!selectedInquiry) return
    setDetailUpdating(true)
    try {
      await deleteFdcFaqInquiry(selectedInquiry.id)
      setInquiries((list) => list.filter((item) => item.id !== selectedInquiry.id))
      setDetailOpen(false)
      setSelectedInquiry(null)
      setToast({ variant: 'success', message: 'Consulta eliminada.' })
    } catch (e) {
      setToast({ variant: 'error', message: e.message || 'No se pudo eliminar la consulta.' })
    } finally {
      setDetailUpdating(false)
    }
  }

  function handleInquiryWhatsapp(inquiry) {
    try {
      openInquiryWhatsApp(inquiry, whatsappTemplateMessage, DEFAULT_FDC_FAQ_INQUIRY_WHATSAPP_TEMPLATE)
    } catch (e) {
      setToast({ variant: 'error', message: e.message || 'No se pudo abrir WhatsApp.' })
    }
  }

  async function handleSaveWhatsappTemplate() {
    setWhatsappModalSaving(true)
    try {
      const data = await updateFdcFaqInquiryWhatsappTemplate({
        message: whatsappDraft,
        expectedUpdatedAt: whatsappTemplateUpdatedAt,
      })
      setWhatsappTemplateMessage(data.message || '')
      setWhatsappTemplateUpdatedAt(data.updatedAt || null)
      setWhatsappModalOpen(false)
      setToast({ variant: 'success', message: 'Plantilla de WhatsApp guardada.' })
    } catch (e) {
      if (isConcurrencyConflictError(e)) setWhatsappConflictOpen(true)
      else setToast({ variant: 'error', message: e.message || 'No se pudo guardar la plantilla.' })
    } finally {
      setWhatsappModalSaving(false)
    }
  }

  return (
    <>
      {toast ? <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} /> : null}
      <ConfirmDialog
        open={conflictOpen}
        title="La consulta cambió"
        message="Otro operador actualizó esta consulta. Recargala para ver el estado más reciente."
        confirmLabel="Recargar"
        onCancel={() => setConflictOpen(false)}
        onConfirm={() => {
          setConflictOpen(false)
          if (selectedInquiry?.id) void openDetail(selectedInquiry.id)
          void loadInquiries()
        }}
      />
      <ConfirmDialog
        open={whatsappConflictOpen}
        title="La plantilla cambió"
        message="Otro operador guardó la plantilla. Recargala antes de volver a editar."
        confirmLabel="Recargar"
        onCancel={() => setWhatsappConflictOpen(false)}
        onConfirm={() => {
          setWhatsappConflictOpen(false)
          void loadWhatsappTemplate()
        }}
      />

      <Modal
        open={detailOpen}
        onClose={() => {
          if (!detailUpdating) setDetailOpen(false)
        }}
        loading={detailLoading || detailUpdating}
        size="wide"
        title={selectedInquiry ? `Consulta N° ${selectedInquiry.id}` : 'Consulta'}
      >
        {detailLoading ? (
          <p className="text-sm text-slate-600">Cargando consulta…</p>
        ) : selectedInquiry ? (
          <InquiryDetailPanel
            inquiry={selectedInquiry}
            busy={detailUpdating}
            onChangeStatus={(status) => void handleChangeInquiryStatus(status)}
            onWhatsApp={() => handleInquiryWhatsapp(selectedInquiry)}
            onDelete={() => void handleDeleteInquiry()}
          />
        ) : (
          <p className="text-sm text-slate-600">No se pudo cargar la consulta seleccionada.</p>
        )}
      </Modal>

      <Modal
        open={whatsappModalOpen}
        onClose={() => {
          if (!whatsappModalSaving) setWhatsappModalOpen(false)
        }}
        loading={whatsappModalSaving}
        size="wide"
        title="Mensaje de WhatsApp"
        description="Este texto se usa al abrir WhatsApp desde una consulta de la Fiesta del Caballo."
      >
        <div className="space-y-4">
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
            Variables:{' '}
            <code className="font-mono text-slate-800">{'{{nombre}}'}</code>,{' '}
            <code className="font-mono text-slate-800">{'{{vecino}}'}</code>,{' '}
            <code className="font-mono text-slate-800">{'{{id}}'}</code>,{' '}
            <code className="font-mono text-slate-800">{'{{tema}}'}</code>.
          </p>
          <label className={labelClass}>
            Plantilla
            <textarea
              className={`${textareaClass} min-h-40 font-mono text-sm`}
              value={whatsappDraft}
              onChange={(e) => setWhatsappDraft(e.target.value)}
              disabled={whatsappModalSaving}
            />
          </label>
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-4 sm:flex-row sm:justify-end">
            <button type="button" disabled={whatsappModalSaving} onClick={() => setWhatsappModalOpen(false)} className={ACTION_BTN_NEUTRAL}>
              Cancelar
            </button>
            <button type="button" disabled={whatsappModalSaving} onClick={() => void handleSaveWhatsappTemplate()} className={ACTION_BTN_PRIMARY}>
              Guardar plantilla
            </button>
          </div>
        </div>
      </Modal>

      <AdminPageShell
        showBackLink={false}
        eyebrow="Fiesta del Caballo"
        title="Consultas de la FAQ"
        subtitle="Bandeja de mensajes enviados desde el formulario de preguntas frecuentes del festival."
        maxWidthClass="max-w-none"
        variant="plain"
        actions={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3">
            <Link to={ROUTES.adminFdc} className={`${ACTION_BTN_NEUTRAL} text-center no-underline`}>
              Editar FAQ
            </Link>
            <button
              type="button"
              onClick={() => {
                setWhatsappDraft(whatsappTemplateMessage || DEFAULT_FDC_FAQ_INQUIRY_WHATSAPP_TEMPLATE)
                setWhatsappModalOpen(true)
              }}
              disabled={!isApiConfigured() || whatsappTemplateLoading}
              className={ACTION_BTN_WHATSAPP}
            >
              <WhatsAppGlyph className="h-4 w-4 shrink-0" />
              Mensaje WhatsApp
            </button>
            <button type="button" onClick={() => void loadInquiries()} disabled={inquiriesLoading} className={ACTION_BTN_NEUTRAL}>
              <span aria-hidden>↻</span>
              Actualizar
            </button>
          </div>
        }
      >
        {!isApiConfigured() ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend.
          </div>
        ) : null}

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Sin resolver" value={stats.sinResolver} tone="amber" />
            <StatCard label="Leídas" value={stats.leidas} tone="sky" />
            <StatCard label="Resueltas" value={stats.resueltas} tone="emerald" />
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
              <label className={`${labelClass} sm:col-span-7`}>
                Buscar
                <input
                  type="search"
                  className={inputClass}
                  placeholder="Número, nombre, celular, motivo o mensaje..."
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  disabled={inquiriesLoading}
                />
              </label>
              <label className={`${labelClass} sm:col-span-3`}>
                Estado
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="news-select-minimal" disabled={inquiriesLoading}>
                  {STATUS_FILTERS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('all')
                    setInquirySearch('')
                  }}
                  disabled={statusFilter === 'all' && !inquirySearch.trim()}
                  className={`${ACTION_BTN_NEUTRAL} w-full`}
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {inquiriesError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800" role="alert">
              {inquiriesError}
            </div>
          ) : null}

          {inquiriesLoading ? (
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
              <p className="text-base font-medium text-slate-800">Todavía no hay consultas.</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                Cuando alguien complete el formulario de la FAQ, va a aparecer acá para responderle por WhatsApp.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">N°</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Celular</th>
                    <th className="px-4 py-3">Motivo</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-semibold text-slate-900">{inquiry.id}</td>
                      <td className="px-4 py-3 text-slate-800">{inquiry.fullName || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{inquiry.phone || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{inquiry.topic || '—'}</td>
                      <td className="px-4 py-3">
                        <InquiryStatusPill status={inquiry.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDateTime(inquiry.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" className={ACTION_BTN_NEUTRAL} onClick={() => void openDetail(inquiry.id)}>
                            Ver
                          </button>
                          {normalizePhoneForWhatsapp(inquiry.phone) ? (
                            <button type="button" className={ACTION_BTN_WHATSAPP} onClick={() => handleInquiryWhatsapp(inquiry)}>
                              WP
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pagModel.totalPages > 1 ? (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3">
                  {pagModel.items.map((item) =>
                    item.type === 'gap' ? (
                      <span key={item.key} className="px-1 text-slate-400">
                        …
                      </span>
                    ) : (
                      <button
                        key={item.n}
                        type="button"
                        onClick={() => setPage(item.n)}
                        className={`min-h-9 min-w-9 rounded-lg px-2 text-sm font-semibold ${
                          item.n === safePage ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {item.n}
                      </button>
                    ),
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </AdminPageShell>
    </>
  )
}
