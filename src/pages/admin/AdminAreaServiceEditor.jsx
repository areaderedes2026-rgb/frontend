import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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
  fetchAreaProfileService,
  updateAreaProfileService,
} from '../../services/areaProfilesService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'

const EMPTY_SERVICE = {
  id: '',
  title: '',
  description: '',
  mode: '',
  imageUrl: '',
  personInCharge: '',
  generalObjective: '',
}

function snapshot(service) {
  return JSON.stringify({
    title: service.title || '',
    description: service.description || '',
    mode: service.mode || '',
    imageUrl: service.imageUrl || '',
    personInCharge: service.personInCharge || '',
    generalObjective: service.generalObjective || '',
  })
}

export function AdminAreaServiceEditor() {
  const { areaSlug, serviceId } = useParams()
  const [area, setArea] = useState(null)
  const [service, setService] = useState(EMPTY_SERVICE)
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot(EMPTY_SERVICE))
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState(null)

  const hasChanges = useMemo(
    () => snapshot(service) !== savedSnapshot,
    [savedSnapshot, service],
  )

  useEffect(() => {
    if (!isApiConfigured()) {
      return
    }
    let cancelled = false
    setError('')
    fetchAreaProfileService(areaSlug, serviceId)
      .then((data) => {
        if (cancelled) return
        const next = { ...EMPTY_SERVICE, ...(data?.service || {}) }
        setArea(data?.area || null)
        setService(next)
        setSavedSnapshot(snapshot(next))
        setExpectedUpdatedAt(data?.updatedAt || null)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'No se pudo cargar el servicio.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [areaSlug, serviceId])

  function updateField(field, value) {
    setService((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    setFormError('')
    if (!service.title.trim()) {
      setFormError('El título del servicio es obligatorio.')
      return
    }
    setSaving(true)
    try {
      const data = await updateAreaProfileService(areaSlug, serviceId, {
        expectedUpdatedAt,
        service,
      })
      const next = { ...EMPTY_SERVICE, ...(data?.service || {}) }
      setArea(data?.area || area)
      setService(next)
      setSavedSnapshot(snapshot(next))
      setExpectedUpdatedAt(data?.updatedAt || null)
      setToast({ type: 'success', message: 'Servicio guardado correctamente.' })
    } catch (e) {
      const message = isConcurrencyConflictError(e)
        ? 'El servicio fue modificado por otra persona. Recargá y volvé a intentar.'
        : e.message || 'No se pudo guardar el servicio.'
      setToast({ type: 'error', message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageShell
      eyebrow="Editor limitado"
      title={service.title || 'Servicio de área'}
      subtitle={
        area?.title
          ? `Área: ${area.title}. Solo podés editar este servicio asignado.`
          : 'Solo podés editar el servicio asignado por un administrador.'
      }
      showBackLink={false}
      actions={
        <Link
          to="/admin/my-area-services"
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Mis servicios
        </Link>
      }
      maxWidthClass="max-w-6xl"
      variant="plain"
    >
      {toast ? (
        <Toast
          variant={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      ) : null}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Cargando servicio...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          {error}
        </div>
      ) : (
        <>
          <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleSubmit}>
            <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              {formError ? (
                <p className={formErrorClass} role="alert">
                  {formError}
                </p>
              ) : null}
              <label className={labelClass}>
                Título del servicio
                <input
                  className={inputClass}
                  value={service.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  disabled={saving}
                  maxLength={180}
                  required
                />
              </label>
              <label className={labelClass}>
                Responsable
                <input
                  className={inputClass}
                  value={service.personInCharge}
                  onChange={(e) => updateField('personInCharge', e.target.value)}
                  disabled={saving}
                  maxLength={200}
                />
              </label>
              <label className={labelClass}>
                Modalidad, días u horarios
                <input
                  className={inputClass}
                  value={service.mode}
                  onChange={(e) => updateField('mode', e.target.value)}
                  disabled={saving}
                  maxLength={140}
                />
              </label>
              <label className={labelClass}>
                Descripción
                <textarea
                  className={textareaClass}
                  value={service.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  disabled={saving}
                  maxLength={2200}
                />
              </label>
              <label className={labelClass}>
                Objetivo general
                <textarea
                  className={textareaClass}
                  value={service.generalObjective}
                  onChange={(e) => updateField('generalObjective', e.target.value)}
                  disabled={saving}
                  maxLength={3000}
                />
              </label>
              <SingleImageUploadField
                label="Imagen del servicio"
                value={service.imageUrl}
                onChange={(value) => updateField('imageUrl', value)}
                disabled={saving}
                kind="cover"
              />
              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" disabled={saving || !hasChanges}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </div>
            <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
                Vista previa
              </p>
              {service.imageUrl ? (
                <img
                  src={resolveMediaUrl(service.imageUrl)}
                  alt=""
                  className="mt-4 aspect-4/3 w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="mt-4 flex aspect-4/3 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
                  Sin imagen
                </div>
              )}
              <h2 className="mt-4 text-xl font-bold text-slate-900">{service.title}</h2>
              {service.personInCharge ? (
                <p className="mt-2 text-sm font-semibold text-sky-700">
                  {service.personInCharge}
                </p>
              ) : null}
              {service.mode ? (
                <p className="mt-2 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  {service.mode}
                </p>
              ) : null}
              {service.description ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {service.description}
                </p>
              ) : null}
              {hasChanges ? (
                <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                  Hay cambios sin guardar.
                </p>
              ) : null}
            </aside>
          </form>
        </>
      )}
    </AdminPageShell>
  )
}
