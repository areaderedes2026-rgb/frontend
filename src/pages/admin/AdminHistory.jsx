import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  formErrorClass,
  inputClass,
  labelClass,
  textareaClass,
} from '../../components/ui/formStyles.js'
import {
  DEFAULT_HISTORY_CONTENT,
  mergeHistoryContent,
} from '../../data/historyContent.js'
import {
  fetchHistoryContent,
  updateHistoryContent,
} from '../../services/historyService.js'
import { fetchTourismPlacesAdmin } from '../../services/tourismPlacesService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'

function mapToForm(content) {
  return {
    heroBadge: content.heroBadge || '',
    heroTitle: content.heroTitle || '',
    heroSubtitle: content.heroSubtitle || '',
    heroImageUrl: content.heroImageUrl || '',
    introStory: content.introStory || '',
    ctaPrimaryLabel: content.ctaPrimaryLabel || '',
    ctaPrimaryHref: content.ctaPrimaryHref || '',
    ctaSecondaryLabel: content.ctaSecondaryLabel || '',
    ctaSecondaryHref: content.ctaSecondaryHref || '',
    legacyItems: Array.isArray(content.legacyItems)
      ? content.legacyItems.map((item) => ({
          title: item?.title || '',
          text: item?.text || '',
        }))
      : [],
    closingTitle: content.closingTitle || '',
    closingText: content.closingText || '',
  }
}

function cleanRows(rows, shape) {
  return rows
    .map((row) => {
      const out = {}
      for (const key of shape) out[key] = String(row?.[key] || '').trim()
      return out
    })
    .filter((row) => shape.some((key) => row[key]))
}

function updateArrayItem(setter, key, index, field, value) {
  setter((prev) => {
    const copy = [...prev[key]]
    copy[index] = { ...copy[index], [field]: value }
    return { ...prev, [key]: copy }
  })
}

export function AdminHistory() {
  const [form, setForm] = useState(() => mapToForm(DEFAULT_HISTORY_CONTENT))
  const [places, setPlaces] = useState([])
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
      const base = DEFAULT_HISTORY_CONTENT
      if (!isApiConfigured()) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const remote = await fetchHistoryContent()
        const merged = remote ? mergeHistoryContent(base, remote) : base
        if (!cancelled) setForm(mapToForm(merged))
      } catch (e) {
        if (!cancelled) setError(e.message || 'No se pudo cargar la historia.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadContent()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadPlaces() {
      try {
        const list = await fetchTourismPlacesAdmin()
        if (!cancelled) setPlaces(Array.isArray(list) ? list : [])
      } catch {
        if (!cancelled) setPlaces([])
      }
    }
    loadPlaces()
    return () => {
      cancelled = true
    }
  }, [])

  function addRow(key, row) {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], row] }))
  }

  function removeRow(key, index) {
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, idx) => idx !== index) }))
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
      const payload = {
        heroBadge: form.heroBadge.trim(),
        heroTitle: form.heroTitle.trim(),
        heroSubtitle: form.heroSubtitle.trim(),
        heroImageUrl: form.heroImageUrl.trim(),
        introStory: form.introStory,
        ctaPrimaryLabel: form.ctaPrimaryLabel.trim(),
        ctaPrimaryHref: form.ctaPrimaryHref.trim(),
        ctaSecondaryLabel: form.ctaSecondaryLabel.trim(),
        ctaSecondaryHref: form.ctaSecondaryHref.trim(),
        legacyItems: cleanRows(form.legacyItems, ['title', 'text']),
        closingTitle: form.closingTitle.trim(),
        closingText: form.closingText,
      }
      const saved = await updateHistoryContent(payload)
      if (saved) {
        const merged = mergeHistoryContent(DEFAULT_HISTORY_CONTENT, saved)
        setForm(mapToForm(merged))
      }
      setToast({ type: 'success', message: 'Se guardaron los cambios de Historia.' })
    } catch (e) {
      setError(e.message || 'No se pudo guardar la historia.')
      setToast({ type: 'error', message: e.message || 'No se pudo guardar la historia.' })
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
        title="Historia pública"
        subtitle="Administrá el contenido de la página de Historia: hero, resumen principal, categorías turísticas y tarjetas."
        maxWidthClass="max-w-6xl"
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
            <h2 className="text-base font-semibold text-slate-900">Hero principal</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Etiqueta
                <input
                  className={inputClass}
                  value={form.heroBadge}
                  onChange={(e) => setForm((prev) => ({ ...prev, heroBadge: e.target.value }))}
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
                  className={`${textareaClass} min-h-28`}
                  value={form.heroSubtitle}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))
                  }
                  disabled={loading || saving}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Imagen principal (URL)
                <input
                  className={inputClass}
                  value={form.heroImageUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, heroImageUrl: e.target.value }))
                  }
                  disabled={loading || saving}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Resumen histórico (texto largo)
                <textarea
                  className={`${textareaClass} min-h-44`}
                  value={form.introStory}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, introStory: e.target.value }))
                  }
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Botón 1 (texto)
                <input
                  className={inputClass}
                  value={form.ctaPrimaryLabel}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, ctaPrimaryLabel: e.target.value }))
                  }
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Botón 1 (link)
                <input
                  className={inputClass}
                  value={form.ctaPrimaryHref}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, ctaPrimaryHref: e.target.value }))
                  }
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Botón 2 (texto)
                <input
                  className={inputClass}
                  value={form.ctaSecondaryLabel}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, ctaSecondaryLabel: e.target.value }))
                  }
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Botón 2 (link)
                <input
                  className={inputClass}
                  value={form.ctaSecondaryHref}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, ctaSecondaryHref: e.target.value }))
                  }
                  disabled={loading || saving}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900">Tarjetas introductorias</h2>
              <Button
                type="button"
                variant="secondary"
                onClick={() => addRow('legacyItems', { title: '', text: '' })}
                disabled={loading || saving}
              >
                + Agregar tarjeta
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {form.legacyItems.map((item, idx) => (
                <div key={`legacy-${idx}`} className="grid gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 sm:grid-cols-12">
                  <input
                    className={`${inputClass} sm:col-span-4`}
                    placeholder="Título"
                    value={item.title}
                    onChange={(e) =>
                      updateArrayItem(setForm, 'legacyItems', idx, 'title', e.target.value)
                    }
                    disabled={loading || saving}
                  />
                  <input
                    className={`${inputClass} sm:col-span-7`}
                    placeholder="Texto"
                    value={item.text}
                    onChange={(e) =>
                      updateArrayItem(setForm, 'legacyItems', idx, 'text', e.target.value)
                    }
                    disabled={loading || saving}
                  />
                  <Button
                    type="button"
                    variant="danger"
                    className="sm:col-span-1"
                    onClick={() => removeRow('legacyItems', idx)}
                    disabled={loading || saving}
                  >
                    Quitar
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Lugares turísticos</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Administrá cada destino en una sección dedicada con tarjetas, modales y acciones.
                </p>
              </div>
              <Link to={ROUTES.adminTourismPlaces}>
                <Button type="button">Administrar lugares turísticos</Button>
              </Link>
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {places.slice(0, 8).map((place) => (
                <li
                  key={place.id}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 text-sm text-slate-700"
                >
                  <span className="font-semibold text-slate-900">{place.name}</span>
                  {place.category ? <span className="ml-2 text-slate-500">({place.category})</span> : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Bloque de cierre</h2>
            <div className="mt-4 grid gap-4">
              <label className={labelClass}>
                Título final
                <input
                  className={inputClass}
                  value={form.closingTitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, closingTitle: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Texto final
                <textarea
                  className={`${textareaClass} min-h-24`}
                  value={form.closingText}
                  onChange={(e) => setForm((prev) => ({ ...prev, closingText: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
            </div>
          </section>

          <div className="flex justify-end border-t border-slate-200/80 pt-4">
            <Button type="submit" disabled={loading || saving}>
              {saving ? 'Guardando…' : 'Guardar historia'}
            </Button>
          </div>
        </form>
      </AdminPageShell>
    </>
  )
}
