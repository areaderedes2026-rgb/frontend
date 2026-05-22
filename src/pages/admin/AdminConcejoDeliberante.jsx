import { useCallback, useEffect, useState } from 'react'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { AdminConcejoDeliberanteEditorPreview } from '../../components/admin/AdminConcejoDeliberanteEditorPreview.jsx'
import { HeroImageModal } from '../../components/admin/HeroImageModal.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  DEFAULT_CONCEJO_DELIBERANTE_CONTENT,
  mergeConcejoDeliberanteContent,
} from '../../data/concejoDeliberanteContent.js'
import {
  fetchConcejoDeliberanteContent,
  updateConcejoDeliberanteContent,
} from '../../services/concejoDeliberanteService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'

function cloneContent(c) {
  return JSON.parse(JSON.stringify(c))
}

export function AdminConcejoDeliberante() {
  const [form, setForm] = useState(() => cloneContent(DEFAULT_CONCEJO_DELIBERANTE_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [conflictOpen, setConflictOpen] = useState(false)
  const [heroImageOpen, setHeroImageOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const apiAvailable = isApiConfigured()

  useEffect(() => {
    let cancelled = false
    async function loadContent() {
      setError('')
      setLoading(true)
      if (!apiAvailable) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const remote = await fetchConcejoDeliberanteContent()
        const merged = mergeConcejoDeliberanteContent(
          DEFAULT_CONCEJO_DELIBERANTE_CONTENT,
          remote || {},
        )
        if (!cancelled) {
          setForm(cloneContent(merged))
          setContentUpdatedAt(remote?.updatedAt || null)
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'No se pudo cargar el Concejo Deliberante.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadContent()
    return () => {
      cancelled = true
    }
  }, [apiAvailable])

  const handleSubmit = useCallback(async () => {
    setError('')
    if (!apiAvailable) {
      setToast({ variant: 'error', message: 'No hay conexión disponible con el backend.' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        expectedUpdatedAt: contentUpdatedAt,
        heroEyebrow: form.heroEyebrow.trim(),
        heroTitle: form.heroTitle.trim(),
        heroSubtitle: form.heroSubtitle,
        heroImageUrl: form.heroImageUrl.trim(),
        introTitle: form.introTitle.trim(),
        introParagraphs: (form.introParagraphs || [])
          .map((p) => String(p || '').trim())
          .filter(Boolean),
        presidentName: form.presidentName.trim(),
        presidentRole: form.presidentRole.trim(),
        presidentBio: form.presidentBio,
        presidentPhotoUrl: form.presidentPhotoUrl.trim(),
        sessionsTitle: form.sessionsTitle.trim(),
        sessionsSchedule: form.sessionsSchedule.trim(),
        sessionsLocation: form.sessionsLocation.trim(),
        sessionsNote: form.sessionsNote,
        commissionsSchedule: form.commissionsSchedule.trim(),
        contactSectionTitle: form.contactSectionTitle.trim(),
        contactSectionSubtitle: form.contactSectionSubtitle.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
        contactAddress: form.contactAddress.trim(),
        contactHours: form.contactHours.trim(),
        members: form.members || [],
        mainFunctions: form.mainFunctions || {},
        commissions: form.commissions || {},
      }
      const saved = await updateConcejoDeliberanteContent(payload)
      const merged = mergeConcejoDeliberanteContent(
        DEFAULT_CONCEJO_DELIBERANTE_CONTENT,
        saved || {},
      )
      setForm(cloneContent(merged))
      setContentUpdatedAt(saved?.updatedAt || null)
      setToast({ variant: 'success', message: 'Se guardó el Concejo Deliberante.' })
    } catch (e) {
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
      const msg = e.message || 'No se pudo guardar.'
      setError(msg)
      setToast({ variant: 'error', message: msg })
    } finally {
      setSaving(false)
    }
  }, [apiAvailable, contentUpdatedAt, form])

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

      {toast ? (
        <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} />
      ) : null}

      <HeroImageModal
        open={heroImageOpen}
        title="Portada del Concejo Deliberante"
        value={form.heroImageUrl}
        onChange={(value) => setForm((prev) => ({ ...prev, heroImageUrl: value }))}
        onClose={() => setHeroImageOpen(false)}
        onSave={() => {
          setHeroImageOpen(false)
          setToast({
            variant: 'success',
            message: 'Portada actualizada en el borrador. Guardá los cambios para publicarla.',
          })
        }}
        saving={saving}
        disabled={loading || saving}
        saveLabel="Aplicar al borrador"
      />

      <AdminPageShell
        showBackLink={false}
        eyebrow=""
        maxWidthClass="max-w-none"
        variant="plain"
      >
        <h1 className="sr-only">Administrar Concejo Deliberante</h1>

        {!apiAvailable ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend para guardar cambios.
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-4">
            <div className="h-12 rounded-2xl border border-slate-200/70 bg-white shadow-sm" />
            <div className="h-72 rounded-3xl border border-[#ddd7ca] bg-slate-100" />
            <div className="h-40 rounded-3xl border border-[#ddd7ca] bg-slate-100" />
            <div className="h-56 rounded-3xl border border-[#ddd7ca] bg-slate-100" />
            <div className="h-48 rounded-3xl border border-[#ddd7ca] bg-slate-100" />
          </div>
        ) : (
          <AdminConcejoDeliberanteEditorPreview
            form={form}
            setForm={setForm}
            loading={loading}
            saving={saving}
            error={error}
            onChangeCover={() => setHeroImageOpen(true)}
            onSubmit={() => void handleSubmit()}
            apiAvailable={apiAvailable}
          />
        )}
      </AdminPageShell>
    </>
  )
}
