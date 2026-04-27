import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminFormSection } from '../../components/admin/AdminFormSection.jsx'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { createNews } from '../../services/newsService.js'
import { inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import { NewsImageFields } from '../../components/admin/NewsImageFields.jsx'
import { NewsCategoryField } from '../../components/admin/NewsCategoryField.jsx'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'

export function CreateNews() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [body, setBody] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [mockCategoryName, setMockCategoryName] = useState('General')
  const [imageUrl, setImageUrl] = useState(null)
  const [galleryUrls, setGalleryUrls] = useState([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !summary.trim() || !body.trim()) {
      setToast({
        type: 'error',
        message: 'Completá título, resumen y cuerpo.',
      })
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        body: body.trim(),
        imageUrl,
        galleryUrls,
        slug: title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      }
      if (isApiConfigured()) {
        if (categoryId) payload.categoryId = Number(categoryId)
      } else {
        payload.category = mockCategoryName || 'General'
      }
      await createNews(payload)
      navigate(ROUTES.adminNews, {
        replace: true,
        state: { flash: 'Noticia publicada correctamente.' },
      })
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message || 'No se pudo publicar la noticia.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {toast ? (
        <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} />
      ) : null}

      <AdminPageShell
        backTo={ROUTES.adminNews}
        backLabel="Volver a noticias"
        eyebrow="Noticias"
        title="Nueva noticia"
        subtitle={
          isApiConfigured()
            ? 'Completá los campos y publicá: la noticia quedará disponible en el portal público.'
            : 'No se detectó conexión con el backend para publicar noticias.'
        }
        variant="plain"
        maxWidthClass="max-w-[min(100%,90rem)]"
      >
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
            <AdminFormSection
              title="Medios"
              description="Portada y galería opcionales. Requiere API configurada para subir archivos o importar por URL."
              className="order-2 min-w-0 lg:order-1 lg:col-span-5 lg:self-start"
            >
              <div className="lg:sticky lg:top-28">
                <NewsImageFields
                  imageUrl={imageUrl}
                  onImageUrlChange={setImageUrl}
                  galleryUrls={galleryUrls}
                  onGalleryUrlsChange={setGalleryUrls}
                />
              </div>
            </AdminFormSection>

            <AdminFormSection
              title="Contenido público"
              description="Título, categoría y textos que verán los vecinos en la ficha de la noticia."
              className="order-1 min-w-0 lg:order-2 lg:col-span-7"
            >
              <label className={labelClass}>
                Título
                <input
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>
              <NewsCategoryField
                value={categoryId}
                onChange={setCategoryId}
                disabled={saving}
                onMockCategoryName={setMockCategoryName}
              />
              <label className={labelClass}>
                Resumen
                <textarea
                  className={textareaClass}
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  required
                />
              </label>
              <label className={labelClass}>
                Cuerpo
                <textarea
                  className={`${textareaClass} min-h-48 lg:min-h-88`}
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </label>
            </AdminFormSection>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() => navigate(ROUTES.adminNews)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Publicando…' : 'Publicar noticia'}
            </Button>
          </div>
        </form>
      </AdminPageShell>
    </>
  )
}
