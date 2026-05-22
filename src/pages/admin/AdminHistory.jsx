import { useCallback, useEffect, useState } from 'react'
import { AdminHistoryEditorPreview } from '../../components/admin/AdminHistoryEditorPreview.jsx'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { HeroImageModal } from '../../components/admin/HeroImageModal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  DEFAULT_HISTORY_CONTENT,
  mergeHistoryContent,
} from '../../data/historyContent.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import {
  fetchHistoryContent,
  updateHistoryContent,
} from '../../services/historyService.js'
import { fetchTourismPlacesAdmin } from '../../services/tourismPlacesService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'

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

export function AdminHistory() {
  const [form, setForm] = useState(() => mapToForm(DEFAULT_HISTORY_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [heroImageOpen, setHeroImageOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const loadFromServer = useCallback(async () => {
    const remote = await fetchHistoryContent()
    const merged = remote ? mergeHistoryContent(DEFAULT_HISTORY_CONTENT, remote) : DEFAULT_HISTORY_CONTENT
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
        if (!cancelled) setError(e.message || 'No se pudo cargar la historia.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadContent()
    return () => {
      cancelled = true
    }
  }, [loadFromServer])

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

  const buildPayload = useCallback(
    (forceOverwrite = false) => ({
      expectedUpdatedAt: contentUpdatedAt,
      forceOverwrite,
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
    }),
    [contentUpdatedAt, form],
  )

  const persistContent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const saved = await updateHistoryContent(buildPayload(forceOverwrite))
      if (saved) {
        const merged = mergeHistoryContent(DEFAULT_HISTORY_CONTENT, saved)
        setForm(mapToForm(merged))
        setContentUpdatedAt(saved?.updatedAt || null)
      }
      setError('')
      setToast({ type: 'success', message: 'Se guardaron los cambios de Historia.' })
    },
    [buildPayload],
  )

  const { conflictDialog, handleConflict } = useContentEditorConcurrencyConflict({
    reloadFromServer: loadFromServer,
    persistContent,
    entityLabel: 'Historia',
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
      const msg = e.message || 'No se pudo guardar la historia.'
      setError(msg)
      setToast({ type: 'error', message: msg })
    },
  })

  const handleSubmit = useCallback(async () => {
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
      setError(e.message || 'No se pudo guardar la historia.')
      setToast({ type: 'error', message: e.message || 'No se pudo guardar la historia.' })
    } finally {
      setSaving(false)
    }
  }, [handleConflict, persistContent])

  return (
    <>
      {conflictDialog}
      <HeroImageModal
        open={heroImageOpen}
        title="Portada de Historia"
        value={form.heroImageUrl}
        onChange={(value) => setForm((prev) => ({ ...prev, heroImageUrl: value }))}
        onClose={() => setHeroImageOpen(false)}
        onSave={() => {
          setHeroImageOpen(false)
          setToast({
            type: 'success',
            message: 'Portada actualizada en el formulario. Guardá los cambios para publicarla.',
          })
        }}
        saving={saving}
        disabled={loading || saving}
        saveLabel="Aplicar al formulario"
      />
      {toast ? (
        <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} />
      ) : null}
      <AdminPageShell
        showBackLink={false}
        eyebrow=""
        maxWidthClass="max-w-none"
        variant="plain"
      >
        <h1 className="sr-only">Historia pública</h1>
        <AdminHistoryEditorPreview
          form={form}
          setForm={setForm}
          loading={loading}
          saving={saving}
          error={error}
          places={places}
          onChangeCover={() => setHeroImageOpen(true)}
          onSubmit={handleSubmit}
          apiAvailable={isApiConfigured()}
        />
      </AdminPageShell>
    </>
  )
}
