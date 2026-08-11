import { useCallback, useEffect, useState } from 'react'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { AdminGastronomicCatalogEditorPreview } from '../../components/admin/AdminGastronomicCatalogEditorPreview.jsx'
import { PageCoverModal } from '../../components/admin/PageCoverModal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  DEFAULT_GASTRONOMIC_CATALOG_CONTENT,
  applyHeroCoverToGastronomyContent,
  gastronomyContentToHeroCover,
  mergeGastronomicCatalogContent,
} from '../../data/gastronomicCatalogContent.js'
import { normalizeHeroToggle } from '../../data/servicesPageContent.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import {
  fetchGastronomicCatalogContent,
  updateGastronomicCatalogContent,
} from '../../services/gastronomicCatalogService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'

function cloneContent(c) {
  return JSON.parse(JSON.stringify(c))
}

function normalizeOverlay(value, fallback = 65) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(90, Math.max(0, Math.round(n))) : fallback
}

function mapContentToForm(content) {
  const merged = mergeGastronomicCatalogContent(DEFAULT_GASTRONOMIC_CATALOG_CONTENT, content || {})
  return {
    ...merged,
    categories: [...(merged.categories || [])],
    introParagraphs: [...(merged.introParagraphs || [])],
    highlights: (merged.highlights || []).map((h) => ({ ...h })),
    venues: (merged.venues || []).map((v) => ({ ...v })),
    overlayOpacity: normalizeOverlay(merged.overlayOpacity, 65),
    showHeroBadge: normalizeHeroToggle(merged.showHeroBadge, true),
    showHeroTitle: normalizeHeroToggle(merged.showHeroTitle, true),
    showHeroSubtitle: normalizeHeroToggle(merged.showHeroSubtitle, true),
    showSearch: normalizeHeroToggle(merged.showSearch, true),
    showPrimaryButton: normalizeHeroToggle(merged.showPrimaryButton, true),
    showSecondaryButton: normalizeHeroToggle(merged.showSecondaryButton, true),
  }
}

export function AdminGastronomicCatalog() {
  const [form, setForm] = useState(() => mapContentToForm(DEFAULT_GASTRONOMIC_CATALOG_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [heroCoverOpen, setHeroCoverOpen] = useState(false)
  const [heroCoverDraft, setHeroCoverDraft] = useState(() =>
    gastronomyContentToHeroCover(DEFAULT_GASTRONOMIC_CATALOG_CONTENT),
  )
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const apiAvailable = isApiConfigured()

  const loadFromServer = useCallback(async () => {
    const remote = await fetchGastronomicCatalogContent()
    const nextForm = mapContentToForm(remote || {})
    setForm(cloneContent(nextForm))
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
        if (!cancelled) setError(e.message || 'No se pudo cargar el catálogo gastronómico.')
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
      overlayOpacity: normalizeOverlay(form.overlayOpacity, 65),
      heroSearchPlaceholder: String(form.heroSearchPlaceholder || ''),
      showHeroBadge: normalizeHeroToggle(form.showHeroBadge, true),
      showHeroTitle: normalizeHeroToggle(form.showHeroTitle, true),
      showHeroSubtitle: normalizeHeroToggle(form.showHeroSubtitle, true),
      showSearch: normalizeHeroToggle(form.showSearch, true),
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
      categories: (form.categories || []).map((c) => String(c || '').trim()).filter(Boolean),
      venues: form.venues || [],
      ctaTitle: String(form.ctaTitle || '').trim(),
      ctaBody: String(form.ctaBody || ''),
    }),
    [contentUpdatedAt, form],
  )

  const persistContent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const saved = await updateGastronomicCatalogContent(buildPayload(forceOverwrite))
      const nextForm = mapContentToForm(saved || {})
      setForm(cloneContent(nextForm))
      setContentUpdatedAt(saved?.updatedAt || null)
      setError('')
      setToast({ variant: 'success', message: 'Se guardaron los cambios del catálogo gastronómico.' })
    },
    [buildPayload],
  )

  const { conflictDialog, handleConflict } = useContentEditorConcurrencyConflict({
    reloadFromServer: loadFromServer,
    persistContent,
    entityLabel: 'Catálogo gastronómico',
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
      const msg = e.message || 'No se pudo guardar.'
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
    const realCats = (form.categories || []).filter((c) => c && c !== 'Todos')
    if (!realCats.length) {
      setToast({
        variant: 'error',
        message: 'Agregá al menos una categoría además de «Todos».',
      })
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
  }, [apiAvailable, form.categories, handleConflict, persistContent])

  return (
    <>
      {conflictDialog}

      {toast ? <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} /> : null}

      <PageCoverModal
        open={heroCoverOpen}
        title="Portada del catálogo gastronómico"
        description="Imagen, overlay, textos y botones del header público."
        draft={heroCoverDraft}
        onFieldChange={(key, value) => setHeroCoverDraft((prev) => ({ ...prev, [key]: value }))}
        onClose={() => setHeroCoverOpen(false)}
        onSave={() => {
          const nextForm = mapContentToForm(applyHeroCoverToGastronomyContent(form, heroCoverDraft))
          setForm(cloneContent(nextForm))
          setHeroCoverOpen(false)
          setToast({
            variant: 'success',
            message: 'Portada actualizada en el borrador. Guardá los cambios para publicarla.',
          })
        }}
        saving={saving}
        disabled={loading || saving}
        saveLabel="Aplicar al borrador"
        imageHelpText="Subí la imagen principal del catálogo o importala por URL."
      />

      <AdminPageShell showBackLink={false} eyebrow="" maxWidthClass="max-w-none" variant="plain">
        <h1 className="sr-only">Administrar catálogo gastronómico</h1>

        {!apiAvailable ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend para guardar cambios.
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-4">
            <div className="h-12 rounded-2xl border border-slate-200/70 bg-white shadow-sm" />
            <div className="h-72 rounded-3xl border border-[#ddd7ca] bg-slate-100" />
            <div className="h-40 rounded-3xl border border-[#ddd7ca] bg-slate-100" />
          </div>
        ) : (
          <AdminGastronomicCatalogEditorPreview
            form={form}
            setForm={setForm}
            loading={loading}
            saving={saving}
            error={error}
            onChangeCover={() => {
              setHeroCoverDraft(gastronomyContentToHeroCover(form))
              setHeroCoverOpen(true)
            }}
            onSubmit={() => void handleSubmit()}
            apiAvailable={apiAvailable}
          />
        )}
      </AdminPageShell>
    </>
  )
}
