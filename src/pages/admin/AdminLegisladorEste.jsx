import { useCallback, useEffect, useState } from 'react'
import { AdminLegisladorEsteEditorPreview } from '../../components/admin/AdminLegisladorEsteEditorPreview.jsx'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  DEFAULT_LEGISLADOR_ESTE_CONTENT,
  mergeLegisladorEsteContent,
} from '../../data/legisladorEsteContent.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import {
  fetchLegisladorEsteContent,
  updateLegisladorEsteContent,
} from '../../services/legisladorEsteService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'

function cloneContent(c) {
  return JSON.parse(JSON.stringify(c))
}

export function AdminLegisladorEste() {
  const [form, setForm] = useState(() => cloneContent(DEFAULT_LEGISLADOR_ESTE_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const apiAvailable = isApiConfigured()

  const loadFromServer = useCallback(async () => {
    const remote = await fetchLegisladorEsteContent()
    const merged = mergeLegisladorEsteContent(
      DEFAULT_LEGISLADOR_ESTE_CONTENT,
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
        if (!cancelled) setError(e.message || 'No se pudo cargar Legislador por el Este.')
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
      heroEyebrow: String(form.heroEyebrow || '').trim(),
      heroTitle: String(form.heroTitle || '').trim(),
      heroSubtitle: String(form.heroSubtitle || ''),
      heroImageUrl: String(form.heroImageUrl || '').trim(),
      legislatorName: String(form.legislatorName || '').trim(),
      legislatorRole: String(form.legislatorRole || '').trim(),
      legislatorBio: String(form.legislatorBio || ''),
      legislatorPhotoUrl: String(form.legislatorPhotoUrl || '').trim(),
      contactEmail: String(form.contactEmail || '').trim(),
      contactPhone: String(form.contactPhone || '').trim(),
      officeHours: String(form.officeHours || '').trim(),
      showLegislatorPhoto: Boolean(form.showLegislatorPhoto),
      showLegislatorRole: Boolean(form.showLegislatorRole),
      showLegislatorBio: Boolean(form.showLegislatorBio),
      showContactPanel: Boolean(form.showContactPanel),
      showContactEmail: Boolean(form.showContactEmail),
      showContactPhone: Boolean(form.showContactPhone),
      showOfficeHours: Boolean(form.showOfficeHours),
      showContactNote: Boolean(form.showContactNote),
      presentedProjects: form.presentedProjects || {},
      commissions: form.commissions || {},
      laws: form.laws || {},
      showPresentedProjects: Boolean(form.showPresentedProjects),
      showCommissions: Boolean(form.showCommissions),
      showLaws: Boolean(form.showLaws),
      projectsPdfUrl: String(form.projectsPdfUrl || '').trim(),
      showProjectsPdfButton: Boolean(form.showProjectsPdfButton),
    }),
    [contentUpdatedAt, form],
  )

  const persistContent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const saved = await updateLegisladorEsteContent(buildPayload(forceOverwrite))
      const merged = mergeLegisladorEsteContent(
        DEFAULT_LEGISLADOR_ESTE_CONTENT,
        saved || {},
      )
      setForm(cloneContent(merged))
      setContentUpdatedAt(saved?.updatedAt || null)
      setError('')
      setToast({
        variant: 'success',
        message: 'Se guardaron los cambios de Legislador por el Este.',
      })
    },
    [buildPayload],
  )

  const { conflictDialog, handleConflict } = useContentEditorConcurrencyConflict({
    reloadFromServer: loadFromServer,
    persistContent,
    entityLabel: 'Legislador por el Este',
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
      const msg = e.message || 'No se pudo guardar Legislador por el Este.'
      setError(msg)
      setToast({ variant: 'error', message: msg })
    },
  })

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!apiAvailable) {
      setToast({
        variant: 'error',
        message: 'No hay conexión disponible con el backend.',
      })
      return
    }
    setSaving(true)
    try {
      await persistContent()
    } catch (e) {
      if (handleConflict(e)) return
      setError(e.message || 'No se pudo guardar Legislador por el Este.')
      setToast({
        variant: 'error',
        message: e.message || 'No se pudo guardar Legislador por el Este.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {conflictDialog}
      {toast ? <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} /> : null}
      <AdminPageShell
        backTo={ROUTES.adminSettings}
        backLabel="Volver a configuración"
        eyebrow="Gobierno"
        title="Legislador por el Este"
        subtitle="Ficha del legislador, proyectos por año, comisiones y leyes."
        maxWidthClass="max-w-6xl"
        variant="plain"
      >
        {!apiAvailable ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend para guardar cambios.
          </div>
        ) : null}

        <AdminLegisladorEsteEditorPreview
          form={form}
          setForm={setForm}
          loading={loading}
          saving={saving}
          error={error}
          onSubmit={handleSubmit}
          apiAvailable={apiAvailable}
        />
      </AdminPageShell>
    </>
  )
}
