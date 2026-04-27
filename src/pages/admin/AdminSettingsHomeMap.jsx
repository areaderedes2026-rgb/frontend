import { useCallback, useEffect, useState } from 'react'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { formErrorClass, inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import {
  DEFAULT_HOME_MAP_CONTENT,
  HOME_MAP_POINT_TYPES,
  mergeHomeMapContent,
} from '../../data/homeMapContent.js'
import { fetchHomeMapContent, updateHomeMapContent } from '../../services/homeMapService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'

function updatePoint(setter, index, field, value) {
  setter((prev) => {
    const list = [...prev.points]
    list[index] = { ...list[index], [field]: value }
    return { ...prev, points: list }
  })
}

function cleanText(value) {
  return String(value || '').trim()
}

export function AdminSettingsHomeMap() {
  const [form, setForm] = useState(() => mergeHomeMapContent(DEFAULT_HOME_MAP_CONTENT, {}))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  const dismissToast = useCallback(() => setToast(null), [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const remote = await fetchHomeMapContent()
      setForm(mergeHomeMapContent(DEFAULT_HOME_MAP_CONTENT, remote || {}))
    } catch (e) {
      setError(e.message || 'No se pudo cargar la configuración del mapa.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoading(false)
      return
    }
    void load()
  }, [load])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isApiConfigured()) {
      setToast({ type: 'error', message: 'No hay conexión disponible con el backend.' })
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        center: {
          lat: Number(form.center.lat) || -26.2312,
          lng: Number(form.center.lng) || -65.2818,
        },
        zoom: Math.min(18, Math.max(10, Math.round(Number(form.zoom) || 14))),
        points: form.points
          .map((point, idx) => ({
            id: cleanText(point.id) || `punto-${idx + 1}`,
            title: cleanText(point.title),
            subtitle: cleanText(point.subtitle),
            description: cleanText(point.description),
            address: cleanText(point.address),
            pointType: cleanText(point.pointType).toLowerCase() || 'otro',
            lat: Number(point.lat),
            lng: Number(point.lng),
            isActive: point.isActive !== false,
            sortOrder: Math.max(0, Math.round(Number(point.sortOrder) || idx * 10)),
          }))
          .filter((point) => point.title || point.description || point.address),
      }
      const saved = await updateHomeMapContent(payload)
      setForm(mergeHomeMapContent(DEFAULT_HOME_MAP_CONTENT, saved || {}))
      setToast({ type: 'success', message: 'Mapa de Inicio actualizado.' })
    } catch (e) {
      const message = e.message || 'No se pudo guardar el mapa de Inicio.'
      setError(message)
      setToast({ type: 'error', message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {toast ? <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} /> : null}
      <AdminPageShell
        showBackLink={false}
        eyebrow="Configuración"
        title="Mapa interactivo de Inicio"
        subtitle="Definí el centro del mapa y los puntos clave de Trancas que se muestran al ciudadano."
        maxWidthClass="max-w-6xl"
        variant="plain"
      >
        {!isApiConfigured() ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend para guardar cambios.
          </div>
        ) : null}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error ? (
            <p className={formErrorClass} role="alert">
              {error}
            </p>
          ) : null}

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Vista general</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className={labelClass}>
                Latitud del centro
                <input
                  className={inputClass}
                  value={form.center.lat}
                  disabled={loading || saving}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, center: { ...prev.center, lat: e.target.value } }))
                  }
                />
              </label>
              <label className={labelClass}>
                Longitud del centro
                <input
                  className={inputClass}
                  value={form.center.lng}
                  disabled={loading || saving}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, center: { ...prev.center, lng: e.target.value } }))
                  }
                />
              </label>
              <label className={labelClass}>
                Zoom inicial (10-18)
                <input
                  className={inputClass}
                  value={form.zoom}
                  disabled={loading || saving}
                  onChange={(e) => setForm((prev) => ({ ...prev, zoom: e.target.value }))}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900">Puntos del mapa</h2>
              <Button
                type="button"
                variant="secondary"
                disabled={loading || saving}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    points: [
                      ...prev.points,
                      {
                        id: '',
                        title: '',
                        subtitle: '',
                        description: '',
                        address: '',
                        pointType: 'otro',
                        lat: prev.center.lat,
                        lng: prev.center.lng,
                        isActive: true,
                        sortOrder: prev.points.length * 10,
                      },
                    ],
                  }))
                }
              >
                + Agregar punto
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {form.points.map((point, idx) => (
                <div key={`${point.id || 'point'}-${idx}`} className="grid gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 sm:grid-cols-12">
                  <input className={`${inputClass} sm:col-span-2`} placeholder="ID" value={point.id} disabled={loading || saving} onChange={(e) => updatePoint(setForm, idx, 'id', e.target.value)} />
                  <input className={`${inputClass} sm:col-span-4`} placeholder="Título" value={point.title} disabled={loading || saving} onChange={(e) => updatePoint(setForm, idx, 'title', e.target.value)} />
                  <input className={`${inputClass} sm:col-span-3`} placeholder="Subtítulo" value={point.subtitle} disabled={loading || saving} onChange={(e) => updatePoint(setForm, idx, 'subtitle', e.target.value)} />
                  <input className={`${inputClass} sm:col-span-1`} placeholder="Orden" value={point.sortOrder} disabled={loading || saving} onChange={(e) => updatePoint(setForm, idx, 'sortOrder', e.target.value)} />
                  <Button
                    type="button"
                    variant="danger"
                    className="sm:col-span-2"
                    disabled={loading || saving}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        points: prev.points.filter((_, i) => i !== idx),
                      }))
                    }
                  >
                    Quitar
                  </Button>

                  <input className={`${inputClass} sm:col-span-3`} placeholder="Latitud" value={point.lat} disabled={loading || saving} onChange={(e) => updatePoint(setForm, idx, 'lat', e.target.value)} />
                  <input className={`${inputClass} sm:col-span-3`} placeholder="Longitud" value={point.lng} disabled={loading || saving} onChange={(e) => updatePoint(setForm, idx, 'lng', e.target.value)} />
                  <input className={`${inputClass} sm:col-span-4`} placeholder="Dirección" value={point.address} disabled={loading || saving} onChange={(e) => updatePoint(setForm, idx, 'address', e.target.value)} />
                  <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={point.isActive !== false}
                      disabled={loading || saving}
                      onChange={(e) => updatePoint(setForm, idx, 'isActive', e.target.checked)}
                    />
                    Activo
                  </label>
                  <label className={`${labelClass} sm:col-span-4`}>
                    Tipo de punto
                    <select
                      className={inputClass}
                      value={point.pointType || 'otro'}
                      disabled={loading || saving}
                      onChange={(e) => updatePoint(setForm, idx, 'pointType', e.target.value)}
                    >
                      {HOME_MAP_POINT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <textarea className={`${textareaClass} sm:col-span-12 min-h-20`} placeholder="Descripción" value={point.description} disabled={loading || saving} onChange={(e) => updatePoint(setForm, idx, 'description', e.target.value)} />
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end border-t border-slate-200/80 pt-4">
            <Button type="submit" disabled={loading || saving}>
              {saving ? 'Guardando…' : 'Guardar mapa'}
            </Button>
          </div>
        </form>
      </AdminPageShell>
    </>
  )
}
