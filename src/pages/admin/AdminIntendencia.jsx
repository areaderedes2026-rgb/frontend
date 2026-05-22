import { useCallback, useEffect, useState } from 'react'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { SingleImageUploadField } from '../../components/admin/SingleImageUploadField.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  formErrorClass,
  inputClass,
  labelClass,
  textareaClass,
} from '../../components/ui/formStyles.js'
import {
  DEFAULT_INTENDENCIA_CONTENT,
  mergeIntendenciaContent,
} from '../../data/intendenciaContent.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import {
  fetchIntendenciaContent,
  updateIntendenciaContent,
} from '../../services/intendenciaService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'

function mapToForm(content) {
  return {
    heroEyebrow: content.heroEyebrow || '',
    heroTitle: content.heroTitle || '',
    heroSubtitle: content.heroSubtitle || '',
    heroImageUrl: content.heroImageUrl || '',
    mayorName: content.mayorName || '',
    mayorRole: content.mayorRole || '',
    mayorBio: content.mayorBio || '',
    mayorPhotoUrl: content.mayorPhotoUrl || '',
    contactEmail: content.contactEmail || '',
    contactPhone: content.contactPhone || '',
    officeHours: content.officeHours || '',
    showMayorPhoto: content.showMayorPhoto !== false,
    showMayorRole: content.showMayorRole !== false,
    showMayorBio: content.showMayorBio !== false,
    showContactPanel: content.showContactPanel !== false,
    showContactEmail: content.showContactEmail !== false,
    showContactPhone: content.showContactPhone !== false,
    showOfficeHours: content.showOfficeHours !== false,
    showContactNote: content.showContactNote !== false,
    showManagementAxes: content.showManagementAxes !== false,
  }
}

function VisibilityToggle({ label, hint, checked, onChange, disabled }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 transition hover:border-slate-300 hover:bg-white">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-sky-600 focus:ring-sky-500 disabled:cursor-not-allowed"
        checked={Boolean(checked)}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        {hint ? <span className="mt-0.5 text-xs text-slate-500">{hint}</span> : null}
      </span>
    </label>
  )
}

export function AdminIntendencia() {
  const [form, setForm] = useState(() => mapToForm(DEFAULT_INTENDENCIA_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const loadFromServer = useCallback(async () => {
    const remote = await fetchIntendenciaContent()
    const merged = mergeIntendenciaContent(DEFAULT_INTENDENCIA_CONTENT, remote || {})
    setForm(mapToForm(merged))
    setContentUpdatedAt(remote?.updatedAt || null)
    setError('')
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadContent() {
      setError('')
      setLoading(true)
      if (!isApiConfigured()) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        await loadFromServer()
      } catch (e) {
        if (!cancelled) setError(e.message || 'No se pudo cargar Intendencia.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadContent()
    return () => {
      cancelled = true
    }
  }, [loadFromServer])

  const buildPayload = useCallback(
    (forceOverwrite = false) => ({
      expectedUpdatedAt: contentUpdatedAt,
      forceOverwrite,
      heroEyebrow: form.heroEyebrow.trim(),
      heroTitle: form.heroTitle.trim(),
      heroSubtitle: form.heroSubtitle,
      heroImageUrl: form.heroImageUrl.trim(),
      mayorName: form.mayorName.trim(),
      mayorRole: form.mayorRole.trim(),
      mayorBio: form.mayorBio,
      mayorPhotoUrl: form.mayorPhotoUrl.trim(),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      officeHours: form.officeHours.trim(),
      showMayorPhoto: Boolean(form.showMayorPhoto),
      showMayorRole: Boolean(form.showMayorRole),
      showMayorBio: Boolean(form.showMayorBio),
      showContactPanel: Boolean(form.showContactPanel),
      showContactEmail: Boolean(form.showContactEmail),
      showContactPhone: Boolean(form.showContactPhone),
      showOfficeHours: Boolean(form.showOfficeHours),
      showContactNote: Boolean(form.showContactNote),
      showManagementAxes: Boolean(form.showManagementAxes),
    }),
    [contentUpdatedAt, form],
  )

  const persistContent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const saved = await updateIntendenciaContent(buildPayload(forceOverwrite))
      const merged = mergeIntendenciaContent(DEFAULT_INTENDENCIA_CONTENT, saved || {})
      setForm(mapToForm(merged))
      setContentUpdatedAt(saved?.updatedAt || null)
      setError('')
      setToast({ type: 'success', message: 'Se guardaron los cambios de Intendencia.' })
    },
    [buildPayload],
  )

  const { conflictDialog, handleConflict } = useContentEditorConcurrencyConflict({
    reloadFromServer: loadFromServer,
    persistContent,
    entityLabel: 'Intendencia',
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
      const msg = e.message || 'No se pudo guardar Intendencia.'
      setError(msg)
      setToast({ type: 'error', message: msg })
    },
  })

  function setFlag(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!isApiConfigured()) {
      setToast({
        type: 'error',
        message: 'No hay conexión disponible con el backend.',
      })
      return
    }
    setSaving(true)
    try {
      await persistContent()
    } catch (e) {
      if (handleConflict(e)) return
      const msg = e.message || 'No se pudo guardar Intendencia.'
      setError(msg)
      setToast({ type: 'error', message: msg })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {conflictDialog}
      {toast ? <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} /> : null}
      <AdminPageShell
        backTo={ROUTES.adminSettings}
        backLabel="Volver a configuración"
        eyebrow="Gobierno"
        title="Intendencia"
        subtitle="Editá la información pública del intendente: foto, biografía, contacto y horario."
        maxWidthClass="max-w-5xl"
        variant="plain"
      >
        {!isApiConfigured() ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend para guardar cambios.
          </div>
        ) : null}
        {error ? (
          <p className={formErrorClass} role="alert">
            {error}
          </p>
        ) : null}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Encabezado</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Etiqueta
                <input
                  className={inputClass}
                  value={form.heroEyebrow}
                  onChange={(e) => setForm((prev) => ({ ...prev, heroEyebrow: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Título
                <input
                  className={inputClass}
                  value={form.heroTitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, heroTitle: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Subtítulo
                <textarea
                  className={`${textareaClass} min-h-24`}
                  value={form.heroSubtitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <div className="sm:col-span-2">
                <SingleImageUploadField
                  label="Imagen de portada"
                  helpText="Subí imagen principal de la sección o importala por URL."
                  value={form.heroImageUrl}
                  onChange={(value) => setForm((prev) => ({ ...prev, heroImageUrl: value }))}
                  kind="cover"
                  disabled={loading || saving}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Ficha del Intendente</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Nombre
                <input
                  className={inputClass}
                  value={form.mayorName}
                  onChange={(e) => setForm((prev) => ({ ...prev, mayorName: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Cargo
                <input
                  className={inputClass}
                  value={form.mayorRole}
                  onChange={(e) => setForm((prev) => ({ ...prev, mayorRole: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Biografía
                <textarea
                  className={`${textareaClass} min-h-28`}
                  value={form.mayorBio}
                  onChange={(e) => setForm((prev) => ({ ...prev, mayorBio: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <div className="sm:col-span-2">
                <SingleImageUploadField
                  label="Foto del intendente"
                  helpText="Subí una foto en formato retrato o importala por URL."
                  value={form.mayorPhotoUrl}
                  onChange={(value) => setForm((prev) => ({ ...prev, mayorPhotoUrl: value }))}
                  kind="cover"
                  disabled={loading || saving}
                />
              </div>
              <label className={labelClass}>
                Correo
                <input
                  className={inputClass}
                  value={form.contactEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Teléfono
                <input
                  className={inputClass}
                  value={form.contactPhone}
                  onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Horario de atención
                <input
                  className={inputClass}
                  value={form.officeHours}
                  onChange={(e) => setForm((prev) => ({ ...prev, officeHours: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold text-slate-900">Visibilidad pública</h2>
              <p className="text-sm text-slate-500">
                Controlá qué elementos se muestran en la página pública. Los datos no se borran:
                podés volver a habilitarlos cuando quieras.
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <VisibilityToggle
                label="Foto del intendente"
                hint="Muestra la imagen retrato junto a la ficha."
                checked={form.showMayorPhoto}
                onChange={(v) => setFlag('showMayorPhoto', v)}
                disabled={loading || saving}
              />
              <VisibilityToggle
                label="Cargo del intendente"
                hint="Texto debajo del nombre (ej. Intendente Municipal)."
                checked={form.showMayorRole}
                onChange={(v) => setFlag('showMayorRole', v)}
                disabled={loading || saving}
              />
              <VisibilityToggle
                label="Biografía / descripción"
                hint="Párrafo de presentación del intendente."
                checked={form.showMayorBio}
                onChange={(v) => setFlag('showMayorBio', v)}
                disabled={loading || saving}
              />
              <VisibilityToggle
                label="Panel lateral de contacto"
                hint="Si lo desactivás, no se muestra el bloque oscuro de la derecha."
                checked={form.showContactPanel}
                onChange={(v) => setFlag('showContactPanel', v)}
                disabled={loading || saving}
              />
              <VisibilityToggle
                label="Correo dentro del panel"
                hint="Línea “Correo” en el panel de contacto."
                checked={form.showContactEmail}
                onChange={(v) => setFlag('showContactEmail', v)}
                disabled={loading || saving || !form.showContactPanel}
              />
              <VisibilityToggle
                label="Teléfono dentro del panel"
                hint="Línea “Teléfono” en el panel de contacto."
                checked={form.showContactPhone}
                onChange={(v) => setFlag('showContactPhone', v)}
                disabled={loading || saving || !form.showContactPanel}
              />
              <VisibilityToggle
                label="Horario de atención"
                hint="Línea “Horario” en el panel de contacto."
                checked={form.showOfficeHours}
                onChange={(v) => setFlag('showOfficeHours', v)}
                disabled={loading || saving || !form.showContactPanel}
              />
              <VisibilityToggle
                label="Nota institucional"
                hint='Recuadro azul: "La intendencia articula con todas las áreas…".'
                checked={form.showContactNote}
                onChange={(v) => setFlag('showContactNote', v)}
                disabled={loading || saving || !form.showContactPanel}
              />
              <VisibilityToggle
                label="Sección Ejes de gestión"
                hint="Tarjeta inferior con los seis ejes."
                checked={form.showManagementAxes}
                onChange={(v) => setFlag('showManagementAxes', v)}
                disabled={loading || saving}
              />
            </div>
          </section>

          <div className="flex justify-end border-t border-slate-200/80 pt-4">
            <Button type="submit" disabled={loading || saving}>
              {saving ? 'Guardando…' : 'Guardar intendencia'}
            </Button>
          </div>
        </form>
      </AdminPageShell>
    </>
  )
}
