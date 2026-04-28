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
  }
}

export function AdminIntendencia() {
  const [form, setForm] = useState(() => mapToForm(DEFAULT_INTENDENCIA_CONTENT))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

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
        const remote = await fetchIntendenciaContent()
        const merged = mergeIntendenciaContent(DEFAULT_INTENDENCIA_CONTENT, remote || {})
        if (!cancelled) setForm(mapToForm(merged))
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
  }, [])

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
      const payload = {
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
      }
      const saved = await updateIntendenciaContent(payload)
      const merged = mergeIntendenciaContent(DEFAULT_INTENDENCIA_CONTENT, saved || {})
      setForm(mapToForm(merged))
      setToast({ type: 'success', message: 'Se guardaron los cambios de Intendencia.' })
    } catch (e) {
      setError(e.message || 'No se pudo guardar Intendencia.')
      setToast({ type: 'error', message: e.message || 'No se pudo guardar Intendencia.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
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
