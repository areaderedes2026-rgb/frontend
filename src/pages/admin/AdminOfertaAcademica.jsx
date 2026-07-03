import { useCallback, useEffect, useState } from 'react'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { AdminOfertaAcademicaEditorPreview } from '../../components/admin/AdminOfertaAcademicaEditorPreview.jsx'
import { PageCoverModal } from '../../components/admin/PageCoverModal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  DEFAULT_OFERTA_ACADEMICA_CONTENT,
  applyHeroCoverToOfertaContent,
  mergeOfertaAcademicaContent,
  ofertaContentToHeroCover,
} from '../../data/ofertaAcademicaContent.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import {
  fetchOfertaAcademicaContent,
  updateOfertaAcademicaContent,
} from '../../services/ofertaAcademicaService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'

function cloneContent(c) {
  return JSON.parse(JSON.stringify(c))
}

export function AdminOfertaAcademica() {
  const [form, setForm] = useState(() => cloneContent(DEFAULT_OFERTA_ACADEMICA_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [heroCoverOpen, setHeroCoverOpen] = useState(false)
  const [heroCoverDraft, setHeroCoverDraft] = useState(() =>
    ofertaContentToHeroCover(DEFAULT_OFERTA_ACADEMICA_CONTENT),
  )
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const apiAvailable = isApiConfigured()

  const loadFromServer = useCallback(async () => {
    const remote = await fetchOfertaAcademicaContent()
    const merged = mergeOfertaAcademicaContent(DEFAULT_OFERTA_ACADEMICA_CONTENT, remote || {})
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
        if (!cancelled) setError(e.message || 'No se pudo cargar Oferta académica.')
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
      overlayOpacity: form.overlayOpacity,
      heroSearchPlaceholder: String(form.heroSearchPlaceholder || ''),
      showHeroBadge: form.showHeroBadge,
      showHeroTitle: form.showHeroTitle,
      showHeroSubtitle: form.showHeroSubtitle,
      showSearch: form.showSearch,
      showPrimaryButton: form.showPrimaryButton,
      heroPrimaryLabel: String(form.heroPrimaryLabel || '').trim(),
      heroPrimaryHref: String(form.heroPrimaryHref || '').trim(),
      showSecondaryButton: form.showSecondaryButton,
      heroSecondaryLabel: String(form.heroSecondaryLabel || '').trim(),
      heroSecondaryHref: String(form.heroSecondaryHref || '').trim(),
      introTitle: String(form.introTitle || '').trim(),
      introParagraphs: (form.introParagraphs || [])
        .map((p) => String(p || '').trim())
        .filter(Boolean),
      highlights: (form.highlights || [])
        .map((h) => ({
          label: String(h?.label || '').trim(),
          value: String(h?.value || '').trim(),
        }))
        .filter((h) => h.label || h.value),
      categories: (form.categories || [])
        .map((c) => String(c || '').trim())
        .filter(Boolean),
      offers: form.offers || [],
      ctaTitle: String(form.ctaTitle || '').trim(),
      ctaBody: String(form.ctaBody || ''),
    }),
    [contentUpdatedAt, form],
  )

  const persistContent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const saved = await updateOfertaAcademicaContent(buildPayload(forceOverwrite))
      const merged = mergeOfertaAcademicaContent(DEFAULT_OFERTA_ACADEMICA_CONTENT, saved || {})
      setForm(cloneContent(merged))
      setContentUpdatedAt(saved?.updatedAt || null)
      setError('')
      setToast({ variant: 'success', message: 'Se guardaron los cambios de Oferta académica.' })
    },
    [buildPayload],
  )

  const { conflictDialog, handleConflict } = useContentEditorConcurrencyConflict({
    reloadFromServer: loadFromServer,
    persistContent,
    entityLabel: 'Oferta académica',
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

      {toast ? (
        <Toast
          variant={toast.variant}
          message={toast.message}
          onDismiss={dismissToast}
        />
      ) : null}

      <PageCoverModal
        open={heroCoverOpen}
        title="Portada de Oferta académica"
        description="Imagen, overlay, textos y botones del header público de Oferta académica."
        draft={heroCoverDraft}
        onFieldChange={(key, value) =>
          setHeroCoverDraft((prev) => ({ ...prev, [key]: value }))
        }
        onClose={() => setHeroCoverOpen(false)}
        onSave={() => {
          setForm((prev) => applyHeroCoverToOfertaContent(prev, heroCoverDraft))
          setHeroCoverOpen(false)
          setToast({
            variant: 'success',
            message: 'Portada actualizada en el borrador. Guardá los cambios para publicarla.',
          })
        }}
        saving={saving}
        disabled={loading || saving}
        saveLabel="Aplicar al borrador"
        imageHelpText="Subí la imagen principal de Oferta académica o importala por URL."
      />

      <AdminPageShell
        showBackLink={false}
        eyebrow=""
        maxWidthClass="max-w-none"
        variant="plain"
      >
        <h1 className="sr-only">Administrar Oferta académica</h1>

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
            <div className="h-56 rounded-3xl border border-[#ddd7ca] bg-slate-100" />
          </div>
        ) : (
          <AdminOfertaAcademicaEditorPreview
            form={form}
            setForm={setForm}
            loading={loading}
            saving={saving}
            error={error}
            onChangeCover={() => {
              setHeroCoverDraft(ofertaContentToHeroCover(form))
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
