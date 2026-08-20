import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { PageCoverModal } from '../../components/admin/PageCoverModal.jsx'
import { PageListHeroHeader } from '../../components/shared/PageListHeroHeader.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import {
  DEFAULT_FDC_CONTENT,
  applyHeroCoverToFdcContent,
  fdcContentToHeroCover,
  fdcHeroToHeaderProps,
  mergeFdcContent,
} from '../../data/fdcContent.js'
import { normalizeHeroToggle } from '../../data/servicesPageContent.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import { fetchFdcContentAdmin, updateFdcContent } from '../../services/fdcService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'

function cloneContent(c) {
  return JSON.parse(JSON.stringify(c))
}

function normalizeOverlay(value, fallback = 65) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(90, Math.max(0, Math.round(n))) : fallback
}

function mapContentToForm(content) {
  const merged = mergeFdcContent(DEFAULT_FDC_CONTENT, content || {})
  return {
    ...merged,
    introParagraphs: [...(merged.introParagraphs || [])],
    highlights: (merged.highlights || []).map((h) => ({ ...h })),
    overlayOpacity: normalizeOverlay(merged.overlayOpacity, 65),
    showHeroBadge: normalizeHeroToggle(merged.showHeroBadge, true),
    showHeroTitle: normalizeHeroToggle(merged.showHeroTitle, true),
    showHeroSubtitle: normalizeHeroToggle(merged.showHeroSubtitle, true),
    showSearch: normalizeHeroToggle(merged.showSearch, false),
    showPrimaryButton: normalizeHeroToggle(merged.showPrimaryButton, true),
    showSecondaryButton: normalizeHeroToggle(merged.showSecondaryButton, true),
  }
}

const ACTION_BTN =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60'
const ACTION_PRIMARY = `${ACTION_BTN} bg-sky-700 text-white hover:bg-sky-800`
const ACTION_NEUTRAL = `${ACTION_BTN} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`

export function AdminFdc() {
  const [form, setForm] = useState(() => mapContentToForm(DEFAULT_FDC_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [heroCoverOpen, setHeroCoverOpen] = useState(false)
  const [heroCoverDraft, setHeroCoverDraft] = useState(() =>
    fdcContentToHeroCover(DEFAULT_FDC_CONTENT),
  )
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])
  const apiAvailable = isApiConfigured()

  const loadFromServer = useCallback(async () => {
    const remote = await fetchFdcContentAdmin()
    const nextForm = mapContentToForm(remote || {})
    setForm(cloneContent(nextForm))
    setContentUpdatedAt(remote?.updatedAt || null)
    setError('')
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      if (!apiAvailable) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        await loadFromServer()
      } catch (e) {
        if (!cancelled) setError(e.message || 'No se pudo cargar Fiesta del Caballo.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
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
      overlayOpacity: normalizeOverlay(form.overlayOpacity, 65),
      heroSearchPlaceholder: String(form.heroSearchPlaceholder || ''),
      showHeroBadge: normalizeHeroToggle(form.showHeroBadge, true),
      showHeroTitle: normalizeHeroToggle(form.showHeroTitle, true),
      showHeroSubtitle: normalizeHeroToggle(form.showHeroSubtitle, true),
      showSearch: normalizeHeroToggle(form.showSearch, false),
      showPrimaryButton: normalizeHeroToggle(form.showPrimaryButton, true),
      heroPrimaryLabel: String(form.heroPrimaryLabel || '').trim(),
      heroPrimaryHref: String(form.heroPrimaryHref || '').trim(),
      showSecondaryButton: normalizeHeroToggle(form.showSecondaryButton, true),
      heroSecondaryLabel: String(form.heroSecondaryLabel || '').trim(),
      heroSecondaryHref: String(form.heroSecondaryHref || '').trim(),
      introTitle: String(form.introTitle || '').trim(),
      introParagraphs: (form.introParagraphs || []).map((p) => String(p || '').trim()).filter(Boolean),
      highlights: (form.highlights || [])
        .map((h) => ({
          label: String(h?.label || '').trim(),
          value: String(h?.value || '').trim(),
        }))
        .filter((h) => h.label || h.value),
      formNotice: String(form.formNotice || ''),
      formOpenFrom: form.formOpenFrom || null,
      formOpenUntil: form.formOpenUntil || null,
      ctaTitle: String(form.ctaTitle || '').trim(),
      ctaBody: String(form.ctaBody || ''),
    }),
    [contentUpdatedAt, form],
  )

  const persistContent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const saved = await updateFdcContent(buildPayload(forceOverwrite))
      const nextForm = mapContentToForm(saved || {})
      setForm(cloneContent(nextForm))
      setContentUpdatedAt(saved?.updatedAt || null)
      setError('')
      setToast({ variant: 'success', message: 'Se guardaron los cambios de Fiesta del Caballo.' })
    },
    [buildPayload],
  )

  const { conflictDialog, handleConflict } = useContentEditorConcurrencyConflict({
    reloadFromServer: loadFromServer,
    persistContent,
    entityLabel: 'Fiesta del Caballo',
    onReloadSuccess: () =>
      setToast({ variant: 'success', message: 'Se cargó la última versión del servidor.' }),
    onReloadError: (e) =>
      setToast({ variant: 'error', message: e.message || 'No se pudo recargar.' }),
    onForceSaveError: (e) => {
      const msg = e.message || 'No se pudo guardar.'
      setError(msg)
      setToast({ variant: 'error', message: msg })
    },
  })

  async function handleSubmit() {
    if (!apiAvailable) {
      setToast({ variant: 'error', message: 'No hay conexión con el backend.' })
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
  }

  const heroProps = fdcHeroToHeaderProps(form)

  return (
    <>
      {conflictDialog}
      {toast ? <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} /> : null}

      <PageCoverModal
        open={heroCoverOpen}
        title="Portada Fiesta del Caballo"
        description="Imagen, overlay, textos y botones del header público."
        draft={heroCoverDraft}
        onFieldChange={(key, value) => setHeroCoverDraft((prev) => ({ ...prev, [key]: value }))}
        onClose={() => setHeroCoverOpen(false)}
        onSave={() => {
          setForm(cloneContent(mapContentToForm(applyHeroCoverToFdcContent(form, heroCoverDraft))))
          setHeroCoverOpen(false)
          setToast({
            variant: 'success',
            message: 'Portada aplicada al borrador. Guardá para publicarla.',
          })
        }}
        saving={saving}
        disabled={loading || saving}
        saveLabel="Aplicar al borrador"
      />

      <AdminPageShell
        showBackLink={false}
        eyebrow="Nuestra ciudad"
        title="Fiesta del Caballo"
        subtitle="Portada, textos y fechas de preinscripción. Las solicitudes se gestionan en la bandeja."
        maxWidthClass="max-w-5xl"
        variant="plain"
        actions={
          <Link to={ROUTES.adminFdcSolicitudes} className={ACTION_NEUTRAL}>
            Ver solicitudes
          </Link>
        }
      >
        {!apiAvailable ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere backend activo.
          </div>
        ) : null}
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
        ) : (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#171b22]">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100">
                  Portada pública
                </p>
                <button
                  type="button"
                  className={ACTION_NEUTRAL}
                  onClick={() => {
                    setHeroCoverDraft(fdcContentToHeroCover(form))
                    setHeroCoverOpen(true)
                  }}
                  disabled={saving}
                >
                  Cambiar portada
                </button>
              </div>
              <PageListHeroHeader {...heroProps} previewMode contentReady />
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Introducción</h2>
              <div className="mt-4 grid gap-4">
                <label className={labelClass}>
                  Título
                  <input
                    className={inputClass}
                    value={form.introTitle}
                    onChange={(e) => setForm((p) => ({ ...p, introTitle: e.target.value }))}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Párrafos (uno por línea)
                  <textarea
                    className={textareaClass}
                    value={(form.introParagraphs || []).join('\n\n')}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        introParagraphs: e.target.value
                          .split(/\n\s*\n/)
                          .map((x) => x.trim())
                          .filter(Boolean),
                      }))
                    }
                    disabled={saving}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Preinscripción</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Abre el
                  <input
                    type="date"
                    className={inputClass}
                    value={form.formOpenFrom || ''}
                    onChange={(e) => setForm((p) => ({ ...p, formOpenFrom: e.target.value }))}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Cierra el
                  <input
                    type="date"
                    className={inputClass}
                    value={form.formOpenUntil || ''}
                    onChange={(e) => setForm((p) => ({ ...p, formOpenUntil: e.target.value }))}
                    disabled={saving}
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Aviso del formulario
                  <textarea
                    className={textareaClass}
                    value={form.formNotice || ''}
                    onChange={(e) => setForm((p) => ({ ...p, formNotice: e.target.value }))}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Título CTA
                  <input
                    className={inputClass}
                    value={form.ctaTitle || ''}
                    onChange={(e) => setForm((p) => ({ ...p, ctaTitle: e.target.value }))}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Texto CTA
                  <textarea
                    className={textareaClass}
                    value={form.ctaBody || ''}
                    onChange={(e) => setForm((p) => ({ ...p, ctaBody: e.target.value }))}
                    disabled={saving}
                  />
                </label>
              </div>
            </section>

            <div className="sticky bottom-3 z-20 flex justify-end rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
              <button
                type="button"
                className={ACTION_PRIMARY}
                disabled={saving || !apiAvailable}
                onClick={() => void handleSubmit()}
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}
      </AdminPageShell>
    </>
  )
}
