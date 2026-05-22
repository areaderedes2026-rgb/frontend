import { useCallback, useEffect, useState } from 'react'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { AdminConcejoDeliberanteEditorPreview } from '../../components/admin/AdminConcejoDeliberanteEditorPreview.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  DEFAULT_CONCEJO_DELIBERANTE_CONTENT,
  mergeConcejoDeliberanteContent,
} from '../../data/concejoDeliberanteContent.js'
import { serializeCommissionsForSave } from '../../data/concejoCommissionsContent.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import {
  fetchConcejoDeliberanteContent,
  updateConcejoDeliberanteContent,
} from '../../services/concejoDeliberanteService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'

function cloneContent(c) {
  return JSON.parse(JSON.stringify(c))
}

export function AdminConcejoDeliberante() {
  const [form, setForm] = useState(() => cloneContent(DEFAULT_CONCEJO_DELIBERANTE_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const apiAvailable = isApiConfigured()

  const loadFromServer = useCallback(async () => {
    const remote = await fetchConcejoDeliberanteContent()
    const merged = mergeConcejoDeliberanteContent(
      DEFAULT_CONCEJO_DELIBERANTE_CONTENT,
      remote || {},
    )
    setForm(cloneContent(merged))
    setContentUpdatedAt(remote?.updatedAt || null)
    setError('')
  }, [])

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
        await loadFromServer()
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
  }, [apiAvailable, loadFromServer])

  const buildPayload = useCallback(
    (forceOverwrite = false) => ({
      expectedUpdatedAt: contentUpdatedAt,
      forceOverwrite,
      heroEyebrow: form.heroEyebrow.trim(),
      heroTitle: form.heroTitle.trim(),
      heroSubtitle: form.heroSubtitle,
      heroImageUrl: form.heroImageUrl.trim(),
      introTitle: form.introTitle.trim(),
      introLogoUrl: form.introLogoUrl.trim(),
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
      commissions: serializeCommissionsForSave(form.commissions || {}),
    }),
    [contentUpdatedAt, form],
  )

  const persistContent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const saved = await updateConcejoDeliberanteContent(buildPayload(forceOverwrite))
      const merged = mergeConcejoDeliberanteContent(
        DEFAULT_CONCEJO_DELIBERANTE_CONTENT,
        saved || {},
      )
      setForm(cloneContent(merged))
      setContentUpdatedAt(saved?.updatedAt || null)
      setError('')
      setToast({ variant: 'success', message: 'Se guardó el Concejo Deliberante.' })
    },
    [buildPayload],
  )

  const { conflictDialog, handleConflict } = useContentEditorConcurrencyConflict({
    reloadFromServer: loadFromServer,
    persistContent,
    entityLabel: 'el Concejo Deliberante',
    onReloadSuccess: () =>
      setToast({
        variant: 'success',
        message: 'Se cargó la última versión del servidor.',
      }),
    onReloadError: (e) =>
      setToast({
        variant: 'error',
        message: e.message || 'No se pudo recargar el contenido.',
      }),
    onForceSaveError: (e) => {
      const msg = e.message || 'No se pudo guardar el Concejo Deliberante.'
      setError(msg)
      setToast({ variant: 'error', message: msg })
    },
  })

  const handleSubmit = useCallback(async () => {
    setError('')
    if (!apiAvailable) {
      setToast({ variant: 'error', message: 'No hay conexión disponible con el backend.' })
      return
    }
    setSaving(true)
    try {
      await persistContent()
    } catch (e) {
      if (handleConflict(e)) return
      const msg = e.message || 'No se pudo guardar.'
      setError(msg)
      setToast({ variant: 'error', message: msg })
    } finally {
      setSaving(false)
    }
  }, [apiAvailable, handleConflict, persistContent])

  return (
    <>
      {conflictDialog}

      {toast ? (
        <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} />
      ) : null}

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
            onSubmit={() => void handleSubmit()}
            apiAvailable={apiAvailable}
          />
        )}
      </AdminPageShell>
    </>
  )
}
