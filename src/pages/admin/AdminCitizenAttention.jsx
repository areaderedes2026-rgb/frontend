import { useCallback, useEffect, useState } from 'react'
import { AdminCitizenAttentionEditorPreview } from '../../components/admin/AdminCitizenAttentionEditorPreview.jsx'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import {
  DEFAULT_CITIZEN_ATTENTION_CONTENT,
  mergeCitizenAttentionContent,
} from '../../data/citizenAttentionContent.js'
import {
  fetchCitizenAttentionContent,
  updateCitizenAttentionContent,
} from '../../services/citizenAttentionService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'

function mapContentToForm(content) {
  return {
    heroEyebrow: content.heroEyebrow || '',
    heroTitle: content.heroTitle || '',
    heroSubtitle: content.heroSubtitle || '',
    heroImageUrl: content.heroImageUrl || '',
    channels: Array.isArray(content.channels)
      ? content.channels.map((x) => ({
          id: x?.id || '',
          title: x?.title || '',
          subtitle: x?.subtitle || '',
          description: x?.description || '',
          accent: x?.accent || '',
          icon: x?.icon || 'mail',
        }))
      : [],
    faq: Array.isArray(content.faq)
      ? content.faq.map((x) => ({
          id: x?.id || '',
          q: x?.q || '',
          a: x?.a || '',
        }))
      : [],
    tips: Array.isArray(content.tips) ? content.tips.map((x) => String(x || '')) : [],
    formTopics: Array.isArray(content.formTopics)
      ? content.formTopics.map((x) => ({
          value: x?.value || '',
          label: x?.label || '',
        }))
      : [],
    formIntroText: content.formIntroText || '',
  }
}

function cleanList(rows, mapper) {
  return rows.map(mapper).filter(Boolean)
}

export function AdminCitizenAttention() {
  const [contentForm, setContentForm] = useState(() => mapContentToForm(DEFAULT_CITIZEN_ATTENTION_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [contentLoading, setContentLoading] = useState(true)
  const [contentSaving, setContentSaving] = useState(false)
  const [contentError, setContentError] = useState('')

  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const loadContent = useCallback(async () => {
    setContentLoading(true)
    setContentError('')
    try {
      const remote = await fetchCitizenAttentionContent()
      const merged = mergeCitizenAttentionContent(DEFAULT_CITIZEN_ATTENTION_CONTENT, remote || {})
      setContentForm(mapContentToForm(merged))
      setContentUpdatedAt(remote?.updatedAt || null)
    } catch (e) {
      setContentError(e.message || 'No se pudo cargar el contenido de Atención al ciudadano.')
    } finally {
      setContentLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isApiConfigured()) {
      setContentLoading(false)
      return
    }
    void loadContent()
  }, [loadContent])

  const buildPayload = useCallback(
    (forceOverwrite = false) => ({
      expectedUpdatedAt: contentUpdatedAt,
      forceOverwrite,
      heroEyebrow: contentForm.heroEyebrow.trim(),
        heroTitle: contentForm.heroTitle.trim(),
        heroSubtitle: contentForm.heroSubtitle,
        heroImageUrl: contentForm.heroImageUrl.trim(),
        channels: cleanList(contentForm.channels, (item) => {
          const title = String(item?.title || '').trim()
          const subtitle = String(item?.subtitle || '').trim()
          const description = String(item?.description || '').trim()
          if (!title && !subtitle && !description) return null
          return {
            id: String(item?.id || '').trim(),
            title,
            subtitle,
            description,
            accent: String(item?.accent || '').trim(),
            icon: String(item?.icon || '').trim(),
          }
        }),
        faq: cleanList(contentForm.faq, (item) => {
          const q = String(item?.q || '').trim()
          const a = String(item?.a || '').trim()
          if (!q && !a) return null
          return {
            id: String(item?.id || '').trim(),
            q,
            a,
          }
        }),
        tips: cleanList(contentForm.tips, (item) => {
          const text = String(item || '').trim()
          return text || null
        }),
        formTopics: cleanList(contentForm.formTopics, (item) => {
          const value = String(item?.value || '').trim()
          const label = String(item?.label || '').trim()
          if (!value && !label) return null
          return { value, label }
        }),
      formIntroText: contentForm.formIntroText,
    }),
    [contentForm, contentUpdatedAt],
  )

  const persistContent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const saved = await updateCitizenAttentionContent(buildPayload(forceOverwrite))
      const merged = mergeCitizenAttentionContent(DEFAULT_CITIZEN_ATTENTION_CONTENT, saved || {})
      setContentForm(mapContentToForm(merged))
      setContentUpdatedAt(saved?.updatedAt || null)
      setContentError('')
      setToast({ variant: 'success', message: 'Se guardó Atención al ciudadano.' })
    },
    [buildPayload],
  )

  const { conflictDialog, handleConflict } = useContentEditorConcurrencyConflict({
    reloadFromServer: loadContent,
    persistContent,
    entityLabel: 'Atención al ciudadano',
    onReloadSuccess: () =>
      setToast({ variant: 'success', message: 'Se cargó la última versión del servidor.' }),
    onReloadError: (e) =>
      setToast({ variant: 'error', message: e.message || 'No se pudo recargar el contenido.' }),
    onForceSaveError: (e) => {
      setContentError(e.message || 'No se pudo guardar Atención al ciudadano.')
      setToast({ variant: 'error', message: e.message || 'No se pudo guardar Atención al ciudadano.' })
    },
  })

  const handleSaveContent = useCallback(async () => {
    if (!isApiConfigured()) {
      setToast({ variant: 'error', message: 'No hay conexión disponible con el backend.' })
      return
    }
    setContentSaving(true)
    setContentError('')
    try {
      await persistContent()
    } catch (e) {
      if (handleConflict(e)) return
      setContentError(e.message || 'No se pudo guardar Atención al ciudadano.')
      setToast({ variant: 'error', message: e.message || 'No se pudo guardar Atención al ciudadano.' })
    } finally {
      setContentSaving(false)
    }
  }, [handleConflict, persistContent])

  return (
    <>
      {conflictDialog}
      {toast ? <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} /> : null}

      <AdminPageShell
        showBackLink={false}
        eyebrow="Gestión ciudadana"
        title="Atención al ciudadano"
        subtitle="Editá la página pública: hero, canales, preguntas frecuentes y opciones del formulario web."
        maxWidthClass="max-w-none"
        variant="plain"
      >
        <h1 className="sr-only">Contenido público de atención al ciudadano</h1>
        {!isApiConfigured() ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend para operar.
          </div>
        ) : null}

        <AdminCitizenAttentionEditorPreview
          form={contentForm}
          setForm={setContentForm}
          loading={contentLoading}
          saving={contentSaving}
          error={contentError}
          onSubmit={() => void handleSaveContent()}
          apiAvailable={isApiConfigured()}
        />
      </AdminPageShell>
    </>
  )
}
