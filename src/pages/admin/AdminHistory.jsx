import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminHistoryEditorPreview } from '../../components/admin/AdminHistoryEditorPreview.jsx'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { HeroImageModal } from '../../components/admin/HeroImageModal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  DEFAULT_HISTORY_CONTENT,
  mergeHistoryContent,
  normalizeHistoryDocumentary,
  normalizeHistorySectionVisibility,
  normalizeHistoryStorySections,
} from '../../data/historyContent.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import {
  fetchHistoryContent,
  updateHistoryContent,
} from '../../services/historyService.js'
import { fetchTourismPlacesAdmin } from '../../services/tourismPlacesService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'

function mapStorySectionsToForm(content) {
  return normalizeHistoryStorySections(content?.storySections, content?.introStory).map((section) => ({
    id: section.id || '',
    title: section.title || '',
    subtitle: section.subtitle || '',
    paragraphs: section.paragraphs?.length ? [...section.paragraphs] : [''],
    images: (section.images || []).map((image) => ({
      id: image.id || '',
      imageUrl: image.imageUrl || '',
      caption: image.caption || '',
      sortOrder: Number(image.sortOrder) || 0,
    })),
    sortOrder: Number(section.sortOrder) || 0,
  }))
}

function mapToForm(content) {
  const documentary = normalizeHistoryDocumentary(content?.documentary)
  return {
    heroBadge: content.heroBadge || '',
    heroTitle: content.heroTitle || '',
    heroSubtitle: content.heroSubtitle || '',
    heroSearchPlaceholder: content.heroSearchPlaceholder || '',
    heroImageUrl: content.heroImageUrl || '',
    storySections: mapStorySectionsToForm(content),
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
    documentary: {
      title: documentary.title || '',
      description: documentary.description || '',
      chapters: documentary.chapters.map((ch) => ({
        id: ch.id || '',
        title: ch.title || '',
        description: ch.description || '',
        driveUrl: ch.driveUrl || '',
        sortOrder: Number(ch.sortOrder) || 0,
      })),
    },
    sectionVisibility: normalizeHistorySectionVisibility(content?.sectionVisibility),
    tourismCategories: Array.isArray(content.tourismCategories) ? content.tourismCategories : [],
    tourismSpots: Array.isArray(content.tourismSpots) ? content.tourismSpots : [],
    closingTitle: content.closingTitle || '',
    closingText: content.closingText || '',
  }
}

function contentFormSnapshot(form) {
  return JSON.stringify({
    heroBadge: form.heroBadge || '',
    heroTitle: form.heroTitle || '',
    heroSubtitle: form.heroSubtitle || '',
    heroSearchPlaceholder: form.heroSearchPlaceholder || '',
    heroImageUrl: form.heroImageUrl || '',
    storySections: form.storySections || [],
    ctaPrimaryLabel: form.ctaPrimaryLabel || '',
    ctaPrimaryHref: form.ctaPrimaryHref || '',
    ctaSecondaryLabel: form.ctaSecondaryLabel || '',
    ctaSecondaryHref: form.ctaSecondaryHref || '',
    legacyItems: form.legacyItems || [],
    documentary: form.documentary || { title: '', description: '', chapters: [] },
    sectionVisibility: normalizeHistorySectionVisibility(form.sectionVisibility),
    tourismCategories: form.tourismCategories || [],
    tourismSpots: form.tourismSpots || [],
    closingTitle: form.closingTitle || '',
    closingText: form.closingText || '',
  })
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

function cleanStorySections(sections) {
  if (!Array.isArray(sections)) return []
  return sections
    .map((section, index) => {
      const title = String(section?.title || '').trim()
      if (!title) return null
      const paragraphs = (Array.isArray(section?.paragraphs) ? section.paragraphs : [])
        .map((p) => String(p || '').trim())
        .filter(Boolean)
      const images = (Array.isArray(section?.images) ? section.images : [])
        .map((image, imageIndex) => {
          const imageUrl = String(image?.imageUrl || '').trim()
          const caption = String(image?.caption || '').trim()
          if (!imageUrl && !caption) return null
          return {
            id: String(image?.id || '').trim() || `hist-img-${index + 1}-${imageIndex + 1}`,
            imageUrl,
            caption,
            sortOrder: Number.isFinite(Number(image?.sortOrder))
              ? Number(image.sortOrder)
              : (imageIndex + 1) * 10,
          }
        })
        .filter(Boolean)
      return {
        id: String(section?.id || '').trim() || `story-${index + 1}`,
        title,
        subtitle: String(section?.subtitle || '').trim(),
        paragraphs,
        images,
        sortOrder: Number.isFinite(Number(section?.sortOrder))
          ? Number(section.sortOrder)
          : (index + 1) * 10,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

function cleanChapters(chapters) {
  if (!Array.isArray(chapters)) return []
  return chapters
    .map((ch, index) => ({
      id: String(ch?.id || '').trim() || `doc-ch-${index + 1}`,
      title: String(ch?.title || '').trim(),
      description: String(ch?.description || '').trim(),
      driveUrl: String(ch?.driveUrl || '').trim(),
      sortOrder: Number.isFinite(Number(ch?.sortOrder)) ? Number(ch.sortOrder) : (index + 1) * 10,
    }))
    .filter((ch) => ch.title)
}

const initialForm = mapToForm(DEFAULT_HISTORY_CONTENT)

export function AdminHistory() {
  const [form, setForm] = useState(() => initialForm)
  const [savedSnapshot, setSavedSnapshot] = useState(() => contentFormSnapshot(initialForm))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [heroImageOpen, setHeroImageOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const hasContentChanges = useMemo(
    () => contentFormSnapshot(form) !== savedSnapshot,
    [form, savedSnapshot],
  )

  const loadFromServer = useCallback(async () => {
    const remote = await fetchHistoryContent()
    const merged = remote ? mergeHistoryContent(DEFAULT_HISTORY_CONTENT, remote) : DEFAULT_HISTORY_CONTENT
    const nextForm = mapToForm(merged)
    setForm(nextForm)
    setSavedSnapshot(contentFormSnapshot(nextForm))
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
      heroSearchPlaceholder: form.heroSearchPlaceholder.trim(),
      heroImageUrl: form.heroImageUrl.trim(),
      storySections: cleanStorySections(form.storySections),
      ctaPrimaryLabel: form.ctaPrimaryLabel.trim(),
      ctaPrimaryHref: form.ctaPrimaryHref.trim(),
      ctaSecondaryLabel: form.ctaSecondaryLabel.trim(),
      ctaSecondaryHref: form.ctaSecondaryHref.trim(),
      legacyItems: cleanRows(form.legacyItems, ['title', 'text']),
      documentary: {
        title: String(form.documentary?.title || '').trim(),
        description: String(form.documentary?.description || '').trim(),
        chapters: cleanChapters(form.documentary?.chapters),
      },
      sectionVisibility: normalizeHistorySectionVisibility(form.sectionVisibility),
      tourismCategories: form.tourismCategories || [],
      tourismSpots: form.tourismSpots || [],
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
        const nextForm = mapToForm(merged)
        setForm(nextForm)
        setSavedSnapshot(contentFormSnapshot(nextForm))
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
          hasChanges={hasContentChanges}
          onChangeCover={() => setHeroImageOpen(true)}
          onSubmit={handleSubmit}
          apiAvailable={isApiConfigured()}
        />
      </AdminPageShell>
    </>
  )
}
