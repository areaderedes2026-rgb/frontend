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

function mapToForm(content) {
  return {
    heroEyebrow: content.heroEyebrow || '',
    heroTitle: content.heroTitle || '',
    heroSubtitle: content.heroSubtitle || '',
    heroImageUrl: content.heroImageUrl || '',
    legislatorName: content.legislatorName || '',
    legislatorRole: content.legislatorRole || '',
    legislatorBio: content.legislatorBio || '',
    legislatorPhotoUrl: content.legislatorPhotoUrl || '',
    contactEmail: content.contactEmail || '',
    contactPhone: content.contactPhone || '',
    officeHours: content.officeHours || '',
    showLegislatorPhoto: content.showLegislatorPhoto !== false,
    showLegislatorRole: content.showLegislatorRole !== false,
    showLegislatorBio: content.showLegislatorBio !== false,
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

export function AdminLegisladorEste() {
  const [form, setForm] = useState(() => mapToForm(DEFAULT_LEGISLADOR_ESTE_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const loadFromServer = useCallback(async () => {
    const remote = await fetchLegisladorEsteContent()
    const merged = mergeLegisladorEsteContent(
      DEFAULT_LEGISLADOR_ESTE_CONTENT,
      remote || {},
    )
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
        if (!cancelled) setError(e.message || 'No se pudo cargar Legislador por el Este.')
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
      legislatorName: form.legislatorName.trim(),
      legislatorRole: form.legislatorRole.trim(),
      legislatorBio: form.legislatorBio,
      legislatorPhotoUrl: form.legislatorPhotoUrl.trim(),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      officeHours: form.officeHours.trim(),
      showLegislatorPhoto: Boolean(form.showLegislatorPhoto),
      showLegislatorRole: Boolean(form.showLegislatorRole),
      showLegislatorBio: Boolean(form.showLegislatorBio),
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
      const saved = await updateLegisladorEsteContent(buildPayload(forceOverwrite))
      const merged = mergeLegisladorEsteContent(
        DEFAULT_LEGISLADOR_ESTE_CONTENT,
        saved || {},
      )
      setForm(mapToForm(merged))
      setContentUpdatedAt(saved?.updatedAt || null)
      setError('')
      setToast({
        type: 'success',
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
        type: 'success',
        message: 'Se cargó la última versión del servidor.',
      }),
    onReloadError: (e) =>
      setToast({
        type: 'error',
        message: e.message || 'No se pudo recargar el contenido.',
      }),
    onForceSaveError: (e) => {
      const msg = e.message || 'No se pudo guardar Legislador por el Este.'
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
      setError(e.message || 'No se pudo guardar Legislador por el Este.')
      setToast({
        type: 'error',
        message: e.message || 'No se pudo guardar Legislador por el Este.',
      })
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
        title="Legislador por el Este"
        subtitle="Editá la información pública del legislador: foto, biografía, contacto y horario."
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
            <h2 className="text-base font-semibold text-slate-900">Ficha del Legislador</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Nombre
                <input
                  className={inputClass}
                  value={form.legislatorName}
                  onChange={(e) => setForm((prev) => ({ ...prev, legislatorName: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Cargo
                <input
                  className={inputClass}
                  value={form.legislatorRole}
                  onChange={(e) => setForm((prev) => ({ ...prev, legislatorRole: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Biografía
                <textarea
                  className={`${textareaClass} min-h-28`}
                  value={form.legislatorBio}
                  onChange={(e) => setForm((prev) => ({ ...prev, legislatorBio: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <div className="sm:col-span-2">
                <SingleImageUploadField
                  label="Foto del legislador"
                  helpText="Subí una foto en formato retrato o importala por URL."
                  value={form.legislatorPhotoUrl}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, legislatorPhotoUrl: value }))
                  }
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
                label="Foto del legislador"
                hint="Muestra la imagen retrato junto a la ficha."
                checked={form.showLegislatorPhoto}
                onChange={(v) => setFlag('showLegislatorPhoto', v)}
                disabled={loading || saving}
              />
              <VisibilityToggle
                label="Cargo del legislador"
                hint="Texto debajo del nombre (ej. Legislador por la Sección…)."
                checked={form.showLegislatorRole}
                onChange={(v) => setFlag('showLegislatorRole', v)}
                disabled={loading || saving}
              />
              <VisibilityToggle
                label="Biografía / descripción"
                hint="Párrafo de presentación del legislador."
                checked={form.showLegislatorBio}
                onChange={(v) => setFlag('showLegislatorBio', v)}
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
                hint='Recuadro azul: "El legislador articula con la intendencia y las áreas…".'
                checked={form.showContactNote}
                onChange={(v) => setFlag('showContactNote', v)}
                disabled={loading || saving || !form.showContactPanel}
              />
              <VisibilityToggle
                label="Sección Ejes de gestión legislativa"
                hint="Tarjeta inferior con los seis ejes."
                checked={form.showManagementAxes}
                onChange={(v) => setFlag('showManagementAxes', v)}
                disabled={loading || saving}
              />
            </div>
          </section>

          <div className="flex justify-end border-t border-slate-200/80 pt-4">
            <Button type="submit" disabled={loading || saving}>
              {saving ? 'Guardando…' : 'Guardar legislador'}
            </Button>
          </div>
        </form>
      </AdminPageShell>
    </>
  )
}
