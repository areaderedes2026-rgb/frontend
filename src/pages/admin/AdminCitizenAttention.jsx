import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { formErrorClass, inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import {
  DEFAULT_CITIZEN_ATTENTION_CONTENT,
  mergeCitizenAttentionContent,
} from '../../data/citizenAttentionContent.js'
import {
  deleteCitizenInquiry,
  fetchCitizenAttentionContent,
  fetchCitizenInquiryAdminById,
  fetchCitizenInquiriesAdmin,
  updateCitizenAttentionContent,
  updateCitizenInquiryStatus,
} from '../../services/citizenAttentionService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'

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

function mapContentToForm(content) {
  return {
    heroEyebrow: content.heroEyebrow || '',
    heroTitle: content.heroTitle || '',
    heroSubtitle: content.heroSubtitle || '',
    heroImageUrl: content.heroImageUrl || '',
    channels: Array.isArray(content.channels)
      ? content.channels.map((x) => ({
          id: x?.id || '',
          title: x?.title || '',
          subtitle: x?.subtitle || '',
          description: x?.description || '',
          accent: x?.accent || '',
          icon: x?.icon || 'mail',
        }))
      : [],
    faq: Array.isArray(content.faq)
      ? content.faq.map((x) => ({
          id: x?.id || '',
          q: x?.q || '',
          a: x?.a || '',
        }))
      : [],
    tips: Array.isArray(content.tips) ? content.tips.map((x) => String(x || '')) : [],
    formTopics: Array.isArray(content.formTopics)
      ? content.formTopics.map((x) => ({
          value: x?.value || '',
          label: x?.label || '',
        }))
      : [],
    formIntroText: content.formIntroText || '',
  }
}

function updateArrayItem(setter, key, index, field, value) {
  setter((prev) => {
    const list = [...prev[key]]
    const current = list[index]
    list[index] = field == null ? value : { ...current, [field]: value }
    return { ...prev, [key]: list }
  })
}

function addRow(setter, key, row) {
  setter((prev) => ({ ...prev, [key]: [...prev[key], row] }))
}

function removeRow(setter, key, index) {
  setter((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }))
}

function cleanList(rows, mapper) {
  return rows.map(mapper).filter(Boolean)
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

export function AdminCitizenAttention() {
  const [activeTab, setActiveTab] = useState('content')
  const [contentForm, setContentForm] = useState(() => mapContentToForm(DEFAULT_CITIZEN_ATTENTION_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [contentLoading, setContentLoading] = useState(true)
  const [contentSaving, setContentSaving] = useState(false)
  const [contentError, setContentError] = useState('')

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
  const dismissToast = useCallback(() => setToast(null), [])

  const stats = useMemo(() => {
    const total = inquiries.length
    const sinResolver = inquiries.filter((i) => i.status === 'sin_resolver').length
    const leidas = inquiries.filter((i) => i.status === 'leida').length
    const resueltas = inquiries.filter((i) => i.status === 'resuelta').length
    return { total, sinResolver, leidas, resueltas }
  }, [inquiries])

  const loadContent = useCallback(async () => {
    setContentLoading(true)
    setContentError('')
    try {
      const remote = await fetchCitizenAttentionContent()
      const merged = mergeCitizenAttentionContent(DEFAULT_CITIZEN_ATTENTION_CONTENT, remote || {})
      setContentForm(mapContentToForm(merged))
      setContentUpdatedAt(remote?.updatedAt || null)
    } catch (e) {
      setContentError(e.message || 'No se pudo cargar el contenido de Atención al ciudadano.')
    } finally {
      setContentLoading(false)
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
      setContentLoading(false)
      setInquiriesLoading(false)
      return
    }
    void loadContent()
  }, [loadContent])

  useEffect(() => {
    if (!isApiConfigured()) {
      setInquiries([])
      return
    }
    void loadInquiries()
  }, [loadInquiries])

  async function handleSaveContent(event) {
    event.preventDefault()
    if (!isApiConfigured()) {
      setToast({ type: 'error', message: 'No hay conexión disponible con el backend.' })
      return
    }
    setContentSaving(true)
    setContentError('')
    try {
      const payload = {
        expectedUpdatedAt: contentUpdatedAt,
        heroEyebrow: contentForm.heroEyebrow.trim(),
        heroTitle: contentForm.heroTitle.trim(),
        heroSubtitle: contentForm.heroSubtitle,
        heroImageUrl: contentForm.heroImageUrl.trim(),
        channels: cleanList(contentForm.channels, (item) => {
          const title = String(item?.title || '').trim()
          const subtitle = String(item?.subtitle || '').trim()
          const description = String(item?.description || '').trim()
          if (!title && !subtitle && !description) return null
          return {
            id: String(item?.id || '').trim(),
            title,
            subtitle,
            description,
            accent: String(item?.accent || '').trim(),
            icon: String(item?.icon || '').trim(),
          }
        }),
        faq: cleanList(contentForm.faq, (item) => {
          const q = String(item?.q || '').trim()
          const a = String(item?.a || '').trim()
          if (!q && !a) return null
          return {
            id: String(item?.id || '').trim(),
            q,
            a,
          }
        }),
        tips: cleanList(contentForm.tips, (item) => {
          const text = String(item || '').trim()
          return text || null
        }),
        formTopics: cleanList(contentForm.formTopics, (item) => {
          const value = String(item?.value || '').trim()
          const label = String(item?.label || '').trim()
          if (!value && !label) return null
          return { value, label }
        }),
        formIntroText: contentForm.formIntroText,
      }
      const saved = await updateCitizenAttentionContent(payload)
      const merged = mergeCitizenAttentionContent(DEFAULT_CITIZEN_ATTENTION_CONTENT, saved || {})
      setContentForm(mapContentToForm(merged))
      setContentUpdatedAt(saved?.updatedAt || null)
      setToast({ type: 'success', message: 'Se guardó Atención al ciudadano.' })
    } catch (e) {
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
      setContentError(e.message || 'No se pudo guardar Atención al ciudadano.')
      setToast({ type: 'error', message: e.message || 'No se pudo guardar Atención al ciudadano.' })
    } finally {
      setContentSaving(false)
    }
  }

  async function openInquiryDetail(id) {
    setDetailOpen(true)
    setDetailLoading(true)
    setSelectedInquiry(null)
    try {
      const inquiry = await fetchCitizenInquiryAdminById(id)
      setSelectedInquiry(inquiry)
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'No se pudo cargar el detalle.' })
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
      setToast({ type: 'success', message: 'Estado actualizado.' })
    } catch (e) {
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
      setToast({ type: 'error', message: e.message || 'No se pudo actualizar el estado.' })
    } finally {
      setDetailUpdating(false)
    }
  }

  async function handleDeleteInquiry() {
    if (!selectedInquiry) return
    setDetailUpdating(true)
    try {
      await deleteCitizenInquiry(selectedInquiry.id)
      setDetailOpen(false)
      setSelectedInquiry(null)
      await loadInquiries()
      setToast({ type: 'success', message: 'Consulta eliminada.' })
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'No se pudo eliminar la consulta.' })
    } finally {
      setDetailUpdating(false)
    }
  }

  return (
    <>
      <Modal
        open={conflictOpen}
        onClose={() => setConflictOpen(false)}
        title="Cambios desactualizados"
        description="Otro usuario guardó cambios antes que vos. Recargá la última versión y reintentá."
        size="default"
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setConflictOpen(false)}>
            Cerrar
          </Button>
          <Button type="button" onClick={() => window.location.reload()}>
            Recargar última versión y reintentar
          </Button>
        </div>
      </Modal>
      {toast ? <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} /> : null}
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
              <Button type="button" variant="secondary" disabled={detailUpdating} onClick={() => void handleChangeInquiryStatus('sin_resolver')}>
                Marcar sin resolver
              </Button>
              <Button type="button" variant="secondary" disabled={detailUpdating} onClick={() => void handleChangeInquiryStatus('leida')}>
                Marcar leída
              </Button>
              <Button type="button" disabled={detailUpdating} onClick={() => void handleChangeInquiryStatus('resuelta')}>
                Marcar resuelta
              </Button>
              <Button type="button" variant="danger" disabled={detailUpdating} onClick={() => void handleDeleteInquiry()}>
                Eliminar consulta
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600">No se pudo cargar la consulta seleccionada.</p>
        )}
      </Modal>

      <AdminPageShell
        showBackLink={false}
        eyebrow="Atención al ciudadano"
        title="Administrar atención"
        subtitle="Gestioná el contenido público y seguí las consultas de vecinos como un tablero de tareas."
        maxWidthClass="max-w-6xl"
        variant="plain"
      >
        {!isApiConfigured() ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend para operar.
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={activeTab === 'content' ? 'primary' : 'secondary'} onClick={() => setActiveTab('content')}>
            Contenido público
          </Button>
          <Button type="button" variant={activeTab === 'inquiries' ? 'primary' : 'secondary'} onClick={() => setActiveTab('inquiries')}>
            Consultas ciudadanas
          </Button>
        </div>

        {activeTab === 'content' ? (
          <form className="space-y-6" onSubmit={handleSaveContent}>
            {contentError ? (
              <p className={formErrorClass} role="alert">
                {contentError}
              </p>
            ) : null}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Hero</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Etiqueta superior
                  <input className={inputClass} value={contentForm.heroEyebrow} disabled={contentLoading || contentSaving} onChange={(e) => setContentForm((p) => ({ ...p, heroEyebrow: e.target.value }))} />
                </label>
                <label className={labelClass}>
                  Título principal
                  <input className={inputClass} value={contentForm.heroTitle} disabled={contentLoading || contentSaving} onChange={(e) => setContentForm((p) => ({ ...p, heroTitle: e.target.value }))} />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Subtítulo
                  <textarea className={`${textareaClass} min-h-24`} value={contentForm.heroSubtitle} disabled={contentLoading || contentSaving} onChange={(e) => setContentForm((p) => ({ ...p, heroSubtitle: e.target.value }))} />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Imagen de fondo (URL)
                  <input className={inputClass} value={contentForm.heroImageUrl} disabled={contentLoading || contentSaving} onChange={(e) => setContentForm((p) => ({ ...p, heroImageUrl: e.target.value }))} />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900">Canales de atención</h2>
                <Button type="button" variant="secondary" disabled={contentLoading || contentSaving} onClick={() => addRow(setContentForm, 'channels', { id: '', title: '', subtitle: '', description: '', accent: 'from-sky-600 to-cyan-600', icon: 'mail' })}>
                  + Agregar canal
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {contentForm.channels.map((row, idx) => (
                  <div key={`channel-${idx}`} className="grid gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 sm:grid-cols-12">
                    <input className={`${inputClass} sm:col-span-2`} placeholder="ID" value={row.id} disabled={contentLoading || contentSaving} onChange={(e) => updateArrayItem(setContentForm, 'channels', idx, 'id', e.target.value)} />
                    <input className={`${inputClass} sm:col-span-3`} placeholder="Título" value={row.title} disabled={contentLoading || contentSaving} onChange={(e) => updateArrayItem(setContentForm, 'channels', idx, 'title', e.target.value)} />
                    <input className={`${inputClass} sm:col-span-3`} placeholder="Subtítulo" value={row.subtitle} disabled={contentLoading || contentSaving} onChange={(e) => updateArrayItem(setContentForm, 'channels', idx, 'subtitle', e.target.value)} />
                    <input className={`${inputClass} sm:col-span-2`} placeholder="Icono" value={row.icon} disabled={contentLoading || contentSaving} onChange={(e) => updateArrayItem(setContentForm, 'channels', idx, 'icon', e.target.value)} />
                    <Button type="button" variant="danger" className="sm:col-span-2" disabled={contentLoading || contentSaving} onClick={() => removeRow(setContentForm, 'channels', idx)}>
                      Quitar
                    </Button>
                    <input className={`${inputClass} sm:col-span-4`} placeholder="Gradiente (Tailwind)" value={row.accent} disabled={contentLoading || contentSaving} onChange={(e) => updateArrayItem(setContentForm, 'channels', idx, 'accent', e.target.value)} />
                    <textarea className={`${textareaClass} sm:col-span-8 min-h-20`} placeholder="Descripción" value={row.description} disabled={contentLoading || contentSaving} onChange={(e) => updateArrayItem(setContentForm, 'channels', idx, 'description', e.target.value)} />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900">FAQ</h2>
                <Button type="button" variant="secondary" disabled={contentLoading || contentSaving} onClick={() => addRow(setContentForm, 'faq', { id: '', q: '', a: '' })}>
                  + Agregar FAQ
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {contentForm.faq.map((row, idx) => (
                  <div key={`faq-${idx}`} className="grid gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 sm:grid-cols-12">
                    <input className={`${inputClass} sm:col-span-3`} placeholder="ID" value={row.id} disabled={contentLoading || contentSaving} onChange={(e) => updateArrayItem(setContentForm, 'faq', idx, 'id', e.target.value)} />
                    <input className={`${inputClass} sm:col-span-7`} placeholder="Pregunta" value={row.q} disabled={contentLoading || contentSaving} onChange={(e) => updateArrayItem(setContentForm, 'faq', idx, 'q', e.target.value)} />
                    <Button type="button" variant="danger" className="sm:col-span-2" disabled={contentLoading || contentSaving} onClick={() => removeRow(setContentForm, 'faq', idx)}>
                      Quitar
                    </Button>
                    <textarea className={`${textareaClass} sm:col-span-12 min-h-20`} placeholder="Respuesta" value={row.a} disabled={contentLoading || contentSaving} onChange={(e) => updateArrayItem(setContentForm, 'faq', idx, 'a', e.target.value)} />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Formulario de consulta</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className={`${labelClass} sm:col-span-2`}>
                  Texto introductorio del formulario
                  <textarea className={`${textareaClass} min-h-20`} value={contentForm.formIntroText} disabled={contentLoading || contentSaving} onChange={(e) => setContentForm((p) => ({ ...p, formIntroText: e.target.value }))} />
                </label>
              </div>
            </section>

            <div className="flex justify-end border-t border-slate-200/80 pt-4">
              <Button type="submit" disabled={contentLoading || contentSaving}>
                {contentSaving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
              </article>
              <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-amber-700">Sin resolver</p>
                <p className="mt-2 text-2xl font-bold text-amber-900">{stats.sinResolver}</p>
              </article>
              <article className="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-sky-700">Leídas</p>
                <p className="mt-2 text-2xl font-bold text-sky-900">{stats.leidas}</p>
              </article>
              <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-emerald-700">Resueltas</p>
                <p className="mt-2 text-2xl font-bold text-emerald-900">{stats.resueltas}</p>
              </article>
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={statusFilter === item.value ? 'primary' : 'secondary'}
                  onClick={() => setStatusFilter(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            {inquiriesError ? (
              <p className={formErrorClass} role="alert">
                {inquiriesError}
              </p>
            ) : null}

            {inquiriesLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="h-3 w-28 rounded bg-slate-100" />
                    <div className="mt-3 h-4 w-40 rounded bg-slate-100" />
                    <div className="mt-2 h-3 w-full rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : inquiries.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-sm text-slate-600 shadow-sm">
                No hay consultas para este filtro.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {inquiries.map((inquiry) => (
                  <button
                    key={inquiry.id}
                    type="button"
                    onClick={() => void openInquiryDetail(inquiry.id)}
                    className="group rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        #{inquiry.id} · {inquiry.firstName} {inquiry.lastName}
                      </p>
                      <InquiryStatusPill status={inquiry.status} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">DNI: {inquiry.dni}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(inquiry.createdAt)}</p>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{inquiry.message}</p>
                    <span className="mt-3 inline-flex text-xs font-semibold text-sky-800 group-hover:text-sky-950">
                      Ver detalle →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </AdminPageShell>
    </>
  )
}
