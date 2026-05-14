import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import {
  deleteCitizenInquiry,
  fetchCitizenInquiryAdminById,
  fetchCitizenInquiriesAdmin,
  fetchInquiryWhatsappTemplate,
  updateCitizenInquiryStatus,
  updateInquiryWhatsappTemplate,
} from '../../services/citizenAttentionService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'
import { ROUTES } from '../../utils/constants.js'
import {
  DEFAULT_INQUIRY_WHATSAPP_TEMPLATE,
  normalizePhoneForWhatsapp,
  openInquiryWhatsApp,
} from '../../utils/inquiryWhatsapp.js'

const PAGE_SIZE = 12

const ACTION_BTN_BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
const ACTION_BTN_NEUTRAL = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`
const ACTION_BTN_DANGER = `${ACTION_BTN_BASE} bg-red-600 text-white hover:bg-red-700`
const ACTION_BTN_WHATSAPP = `${ACTION_BTN_BASE} border border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-300 hover:bg-emerald-100/90`

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'sin_resolver', label: 'Sin resolver' },
  { value: 'leida', label: 'Leídas' },
  { value: 'resuelta', label: 'Resueltas' },
]

const STATUS_META = {
  sin_resolver: {
    label: 'Sin resolver',
    card: 'border-amber-200 bg-amber-50 text-amber-800',
    dot: 'bg-amber-500',
  },
  leida: {
    label: 'Leída',
    card: 'border-sky-200 bg-sky-50 text-sky-800',
    dot: 'bg-sky-500',
  },
  resuelta: {
    label: 'Resuelta',
    card: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    dot: 'bg-emerald-500',
  },
}

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
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

function InquiryStatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.sin_resolver
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.card}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </span>
  )
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
  const set = new Set(
    [1, totalPages, page, page - 1, page + 1].filter((n) => n >= 1 && n <= totalPages),
  )
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

export function AdminCitizenInquiries() {
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
    const sinResolver = inquiries.filter((i) => i.status === 'sin_resolver').length
    const leidas = inquiries.filter((i) => i.status === 'leida').length
    const resueltas = inquiries.filter((i) => i.status === 'resuelta').length
    return { total, sinResolver, leidas, resueltas }
  }, [inquiries])

  const filteredInquiries = useMemo(() => {
    const term = normalize(inquirySearch)
    if (!term) return inquiries
    return inquiries.filter((inquiry) => {
      const haystack = [
        inquiry.id,
        inquiry.firstName,
        inquiry.lastName,
        inquiry.dni,
        inquiry.phone,
        inquiry.topic,
        inquiry.message,
      ]
      return haystack.some((value) => normalize(value).includes(term))
    })
  }, [inquiries, inquirySearch])

  const totalPages = Math.max(1, Math.ceil(filteredInquiries.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const rangeStart = (safePage - 1) * PAGE_SIZE
  const rangeEnd = Math.min(rangeStart + PAGE_SIZE, filteredInquiries.length)
  const paginatedInquiries = useMemo(
    () => filteredInquiries.slice(rangeStart, rangeEnd),
    [filteredInquiries, rangeStart, rangeEnd],
  )
  const pagModel = paginationModel(safePage, totalPages)

  const loadWhatsappTemplate = useCallback(async () => {
    if (!isApiConfigured()) return
    setWhatsappTemplateLoading(true)
    try {
      const data = await fetchInquiryWhatsappTemplate()
      setWhatsappTemplateMessage(data.message || '')
      setWhatsappTemplateUpdatedAt(data.updatedAt || null)
    } catch (e) {
      setToast({
        variant: 'error',
        message: e.message || 'No se pudo cargar la plantilla de WhatsApp.',
      })
    } finally {
      setWhatsappTemplateLoading(false)
    }
  }, [])

  const loadInquiries = useCallback(async () => {
    setInquiriesLoading(true)
    setInquiriesError('')
    try {
      const list = await fetchCitizenInquiriesAdmin(statusFilter === 'all' ? '' : statusFilter)
      setInquiries(Array.isArray(list) ? list : [])
    } catch (e) {
      setInquiriesError(e.message || 'No se pudieron cargar las consultas.')
    } finally {
      setInquiriesLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    if (!isApiConfigured()) {
      setInquiriesLoading(false)
      setInquiries([])
      return
    }
    void loadInquiries()
    void loadWhatsappTemplate()
  }, [loadInquiries, loadWhatsappTemplate])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, inquirySearch])

  async function openInquiryDetail(id) {
    setDetailOpen(true)
    setDetailLoading(true)
    setSelectedInquiry(null)
    try {
      const inquiry = await fetchCitizenInquiryAdminById(id)
      setSelectedInquiry(inquiry)
    } catch (e) {
      setToast({ variant: 'error', message: e.message || 'No se pudo cargar el detalle.' })
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleChangeInquiryStatus(nextStatus) {
    if (!selectedInquiry) return
    setDetailUpdating(true)
    try {
      const updated = await updateCitizenInquiryStatus(
        selectedInquiry.id,
        nextStatus,
        selectedInquiry.updatedAt || null,
      )
      setSelectedInquiry(updated)
      await loadInquiries()
      setToast({ variant: 'success', message: 'Estado actualizado.' })
    } catch (e) {
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
      setToast({ variant: 'error', message: e.message || 'No se pudo actualizar el estado.' })
    } finally {
      setDetailUpdating(false)
    }
  }

  function clearInquiryFilters() {
    setStatusFilter('all')
    setInquirySearch('')
    setPage(1)
  }

  async function handleDeleteInquiry() {
    if (!selectedInquiry) return
    setDetailUpdating(true)
    try {
      await deleteCitizenInquiry(selectedInquiry.id)
      setDetailOpen(false)
      setSelectedInquiry(null)
      await loadInquiries()
      setToast({ variant: 'success', message: 'Consulta eliminada.' })
    } catch (e) {
      setToast({ variant: 'error', message: e.message || 'No se pudo eliminar la consulta.' })
    } finally {
      setDetailUpdating(false)
    }
  }

  async function handleDownloadInquiryPdf(inquiry) {
    if (!inquiry) return
    try {
      const { downloadCitizenInquiryPdf } = await import('../../utils/citizenInquiryPdf.js')
      downloadCitizenInquiryPdf(inquiry)
      setToast({ variant: 'success', message: 'PDF descargado correctamente.' })
    } catch (e) {
      setToast({
        variant: 'error',
        message: e?.message || 'No se pudo generar el PDF. Probá de nuevo.',
      })
    }
  }

  function openWhatsappTemplateModal() {
    setWhatsappDraft(
      (whatsappTemplateMessage || '').trim()
        ? whatsappTemplateMessage
        : DEFAULT_INQUIRY_WHATSAPP_TEMPLATE,
    )
    setWhatsappModalOpen(true)
  }

  async function handleSaveWhatsappTemplate() {
    setWhatsappModalSaving(true)
    try {
      const saved = await updateInquiryWhatsappTemplate({
        message: whatsappDraft,
        expectedUpdatedAt: whatsappTemplateUpdatedAt,
      })
      setWhatsappTemplateMessage(saved.message || '')
      setWhatsappTemplateUpdatedAt(saved.updatedAt || null)
      setWhatsappModalOpen(false)
      setToast({ variant: 'success', message: 'Plantilla de WhatsApp guardada.' })
    } catch (e) {
      if (isConcurrencyConflictError(e)) setWhatsappConflictOpen(true)
      setToast({
        variant: 'error',
        message: e?.message || 'No se pudo guardar la plantilla.',
      })
    } finally {
      setWhatsappModalSaving(false)
    }
  }

  function handleInquiryWhatsapp(inquiry) {
    try {
      openInquiryWhatsApp(inquiry, whatsappTemplateMessage || '')
    } catch (e) {
      setToast({
        variant: 'error',
        message: e?.message || 'No se pudo abrir WhatsApp.',
      })
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
        open={whatsappConflictOpen}
        onClose={() => setWhatsappConflictOpen(false)}
        title="Plantilla de WhatsApp desactualizada"
        description="Otro usuario guardó cambios en la plantilla o en el contenido de Atención. Recargá para obtener la última versión."
        confirmLabel="Recargar página"
        cancelLabel="Cerrar"
        loading={false}
        onConfirm={() => window.location.reload()}
      />
      {toast ? <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} /> : null}
      <Modal
        open={detailOpen}
        onClose={() => {
          if (!detailUpdating) setDetailOpen(false)
        }}
        loading={detailUpdating}
        size="wide"
        title={selectedInquiry ? `Consulta #${selectedInquiry.id}` : 'Detalle de consulta'}
        description="Revisá la información y actualizá el estado de seguimiento."
      >
        {detailLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-44 rounded bg-slate-100" />
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-5/6 rounded bg-slate-100" />
          </div>
        ) : selectedInquiry ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nombre</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedInquiry.firstName} {selectedInquiry.lastName}
                </p>
              </article>
              <article className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">DNI</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedInquiry.dni}</p>
              </article>
              <article className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</p>
                <div className="mt-1">
                  <InquiryStatusPill status={selectedInquiry.status} />
                </div>
              </article>
              <article className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teléfono</p>
                <p className="mt-1 text-sm text-slate-800">{selectedInquiry.phone || 'No informado'}</p>
              </article>
              <article className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tema</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{selectedInquiry.topic}</p>
              </article>
            </div>

            <article className="rounded-xl border border-slate-200/80 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mensaje</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{selectedInquiry.message}</p>
            </article>

            <div className="grid gap-2 sm:grid-cols-2">
              <p className="text-xs text-slate-500">
                Creada: <span className="font-medium text-slate-700">{formatDateTime(selectedInquiry.createdAt)}</span>
              </p>
              <p className="text-xs text-slate-500 sm:text-right">
                Actualizada: <span className="font-medium text-slate-700">{formatDateTime(selectedInquiry.updatedAt)}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-slate-200/80 pt-4">
              <button
                type="button"
                disabled={detailLoading}
                onClick={() => void handleDownloadInquiryPdf(selectedInquiry)}
                className={ACTION_BTN_NEUTRAL}
              >
                Descargar PDF
              </button>
              <button
                type="button"
                disabled={detailLoading || !normalizePhoneForWhatsapp(selectedInquiry.phone)}
                onClick={() => handleInquiryWhatsapp(selectedInquiry)}
                className={ACTION_BTN_WHATSAPP}
                title={
                  normalizePhoneForWhatsapp(selectedInquiry.phone)
                    ? 'Abrir WhatsApp con el teléfono del vecino'
                    : 'No hay teléfono válido para WhatsApp'
                }
              >
                <WhatsAppGlyph className="h-4 w-4 shrink-0" />
                WhatsApp
              </button>
              <button
                type="button"
                disabled={detailUpdating}
                onClick={() => void handleChangeInquiryStatus('sin_resolver')}
                className={ACTION_BTN_NEUTRAL}
              >
                Marcar sin resolver
              </button>
              <button
                type="button"
                disabled={detailUpdating}
                onClick={() => void handleChangeInquiryStatus('leida')}
                className={ACTION_BTN_NEUTRAL}
              >
                Marcar leída
              </button>
              <button
                type="button"
                disabled={detailUpdating}
                onClick={() => void handleChangeInquiryStatus('resuelta')}
                className={ACTION_BTN_PRIMARY}
              >
                Marcar resuelta
              </button>
              <button
                type="button"
                disabled={detailUpdating}
                onClick={() => void handleDeleteInquiry()}
                className={ACTION_BTN_DANGER}
              >
                Eliminar consulta
              </button>
            </div>
          </div>
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
        description="Este texto se usa al abrir WhatsApp desde una consulta. Podés usar variables que se completan solas con los datos del vecino."
      >
        <div className="space-y-4">
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
            Variables:{' '}
            <code className="font-mono text-slate-800">{'{{nombre}}'}</code>,{' '}
            <code className="font-mono text-slate-800">{'{{apellido}}'}</code>,{' '}
            <code className="font-mono text-slate-800">{'{{vecino}}'}</code>,{' '}
            <code className="font-mono text-slate-800">{'{{id}}'}</code>,{' '}
            <code className="font-mono text-slate-800">{'{{tema}}'}</code>,{' '}
            <code className="font-mono text-slate-800">{'{{dni}}'}</code>. Si dejás el mensaje vacío y guardás, en
            WhatsApp se usará el texto sugerido por defecto del sistema.
          </p>
          <label className={labelClass}>
            Plantilla
            <textarea
              className={`${textareaClass} min-h-40 font-mono text-sm`}
              value={whatsappDraft}
              onChange={(e) => setWhatsappDraft(e.target.value)}
              disabled={whatsappModalSaving}
              spellCheck
            />
          </label>
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={whatsappModalSaving}
              onClick={() => setWhatsappModalOpen(false)}
              className={ACTION_BTN_NEUTRAL}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={whatsappModalSaving}
              onClick={() => void handleSaveWhatsappTemplate()}
              className={ACTION_BTN_PRIMARY}
            >
              Guardar plantilla
            </button>
          </div>
        </div>
      </Modal>

      <AdminPageShell
        showBackLink={false}
        eyebrow="Gestión ciudadana"
        title="Consultas ciudadanas"
        subtitle="Bandeja de mensajes enviados desde el formulario web de Atención al ciudadano."
        maxWidthClass="max-w-none"
        variant="plain"
        actions={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3">
            <Link
              to={ROUTES.adminCitizenAttention}
              className={`${ACTION_BTN_NEUTRAL} text-center no-underline`}
            >
              Ir a contenido público
            </Link>
            <button
              type="button"
              onClick={() => openWhatsappTemplateModal()}
              disabled={!isApiConfigured() || whatsappTemplateLoading}
              className={ACTION_BTN_WHATSAPP}
            >
              <WhatsAppGlyph className="h-4 w-4 shrink-0" />
              Mensaje WhatsApp
            </button>
            <button
              type="button"
              onClick={() => {
                void loadInquiries()
                void loadWhatsappTemplate()
              }}
              disabled={inquiriesLoading}
              className={ACTION_BTN_NEUTRAL}
            >
              <span aria-hidden>↻</span>
              Actualizar
            </button>
          </div>
        }
      >
        <h1 className="sr-only">Consultas ciudadanas</h1>
        {!isApiConfigured() ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend para operar.
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
                  placeholder="Número, nombre, DNI, tema o mensaje..."
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  disabled={inquiriesLoading}
                  autoComplete="off"
                />
              </label>
              <label className={`${labelClass} sm:col-span-3`}>
                Estado
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="news-select-minimal"
                  disabled={inquiriesLoading}
                >
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
                  onClick={clearInquiryFilters}
                  disabled={statusFilter === 'all' && !inquirySearch.trim()}
                  className={`${ACTION_BTN_NEUTRAL} w-full`}
                >
                  Limpiar
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">{filteredInquiries.length}</span>{' '}
              consultas visibles de <span className="font-semibold text-slate-900">{inquiries.length}</span>.
            </p>
          </div>

          {inquiriesError ? (
            <div
              className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 shadow-sm"
              role="alert"
            >
              <p className="font-semibold">No se pudieron cargar las consultas.</p>
              <p className="mt-1 text-red-700/90">{inquiriesError}</p>
              <button
                type="button"
                onClick={() => void loadInquiries()}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50"
              >
                <span aria-hidden>↻</span>
                Reintentar
              </button>
            </div>
          ) : null}

          {inquiriesLoading ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
              <p className="text-base font-medium text-slate-800">
                Todavía no hay consultas ciudadanas.
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                Cuando los vecinos completen el formulario público, aparecerán en esta bandeja.
              </p>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200/90 bg-amber-50/50 px-6 py-12 text-center">
              <p className="text-base font-medium text-slate-800">
                No hay consultas que coincidan con los filtros.
              </p>
              <button
                type="button"
                onClick={clearInquiryFilters}
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
                      <th className="w-24 px-4 py-3.5">Nro.</th>
                      <th className="min-w-0 px-4 py-3.5">Vecino</th>
                      <th className="w-44 px-4 py-3.5">Tema</th>
                      <th className="w-36 px-4 py-3.5">Estado</th>
                      <th className="w-44 px-4 py-3.5">Fecha</th>
                      <th className="w-52 min-w-0 px-4 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInquiries.map((inquiry) => (
                      <tr
                        key={inquiry.id}
                        className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/90"
                      >
                        <td className="px-4 py-3 align-middle font-mono text-xs font-semibold text-slate-600">
                          #{inquiry.id}
                        </td>
                        <td className="min-w-0 px-4 py-3 align-middle">
                          <button
                            type="button"
                            onClick={() => void openInquiryDetail(inquiry.id)}
                            className="text-left font-semibold text-slate-900 transition hover:text-sky-800"
                          >
                            {inquiry.firstName} {inquiry.lastName}
                          </button>
                          <p className="mt-0.5 text-xs text-slate-500">DNI: {inquiry.dni}</p>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{inquiry.message}</p>
                        </td>
                        <td className="px-4 py-3 align-middle text-slate-700">{inquiry.topic || '—'}</td>
                        <td className="px-4 py-3 align-middle">
                          <InquiryStatusPill status={inquiry.status} />
                        </td>
                        <td className="px-4 py-3 align-middle text-xs text-slate-600">
                          {formatDateTime(inquiry.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right align-middle">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => void openInquiryDetail(inquiry.id)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900"
                            >
                              Ver detalle
                            </button>
                            <button
                              type="button"
                              title="Abrir WhatsApp"
                              disabled={!normalizePhoneForWhatsapp(inquiry.phone)}
                              onClick={() => handleInquiryWhatsapp(inquiry)}
                              className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-45"
                            >
                              <WhatsAppGlyph className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Descargar PDF de esta consulta"
                              onClick={() => void handleDownloadInquiryPdf(inquiry)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900"
                            >
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-3 lg:hidden">
                {paginatedInquiries.map((inquiry) => (
                  <li key={inquiry.id}>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-sky-200/80 hover:shadow-md">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          #{inquiry.id} · {inquiry.firstName} {inquiry.lastName}
                        </p>
                        <InquiryStatusPill status={inquiry.status} />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">DNI: {inquiry.dni}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDateTime(inquiry.createdAt)}</p>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {inquiry.message}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void openInquiryDetail(inquiry.id)}
                          className="inline-flex flex-1 min-w-38 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-sky-800 shadow-sm transition hover:border-sky-200 hover:bg-sky-50"
                        >
                          Ver detalle
                        </button>
                        <button
                          type="button"
                          title="WhatsApp"
                          disabled={!normalizePhoneForWhatsapp(inquiry.phone)}
                          onClick={() => handleInquiryWhatsapp(inquiry)}
                          className="inline-flex flex-1 min-w-38 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <WhatsAppGlyph className="h-3.5 w-3.5 shrink-0" />
                          WhatsApp
                        </button>
                        <button
                          type="button"
                          title="Descargar PDF"
                          onClick={() => void handleDownloadInquiryPdf(inquiry)}
                          className="inline-flex flex-1 min-w-38 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50"
                        >
                          Descargar PDF
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <nav
                className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                aria-label="Paginación de consultas"
              >
                <p className="text-center text-sm leading-relaxed text-slate-600 sm:text-left">
                  Mostrando{' '}
                  <span className="font-semibold tabular-nums text-slate-900">{rangeStart + 1}</span>
                  –
                  <span className="font-semibold tabular-nums text-slate-900">{rangeEnd}</span>{' '}
                  de{' '}
                  <span className="font-semibold tabular-nums text-slate-900">
                    {filteredInquiries.length}
                  </span>
                </p>
                {totalPages > 1 ? (
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <div className="hidden items-center gap-1 sm:flex">
                      {pagModel.items.map((entry, idx) =>
                        entry.type === 'gap' ? (
                          <span key={`gap-${idx}`} className="px-1 text-slate-400" aria-hidden>
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
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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
      </AdminPageShell>
    </>
  )
}
