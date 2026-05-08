import { useCallback, useEffect, useState } from 'react'
import { AdminHistoryEditorPreview } from '../../components/admin/AdminHistoryEditorPreview.jsx'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { HeroImageModal } from '../../components/admin/HeroImageModal.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
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
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'

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
  const [conflictOpen, setConflictOpen] = useState(false)
  const [heroImageOpen, setHeroImageOpen] = useState(false)
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
        if (!cancelled) {
          setForm(mapToForm(merged))
          setContentUpdatedAt(remote?.updatedAt || null)
        }
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
      const payload = {
        expectedUpdatedAt: contentUpdatedAt,
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
        setContentUpdatedAt(saved?.updatedAt || null)
      }
      setToast({ type: 'success', message: 'Se guardaron los cambios de Historia.' })
    } catch (e) {
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
      setError(e.message || 'No se pudo guardar la historia.')
      setToast({ type: 'error', message: e.message || 'No se pudo guardar la historia.' })
    } finally {
      setSaving(false)
    }
  }, [contentUpdatedAt, form])

  return (
    <>
      <ConfirmDialog
        open={conflictOpen}
        onClose={() => setConflictOpen(false)}
        title="Cambios desactualizados"
        description="Otro usuario guardó cambios antes que vos. Recargá la última versión y reintentá."
        confirmLabel="Recargar última versión y reintentar"
        cancelLabel="Cerrar"
        onConfirm={() => window.location.reload()}
      />
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
