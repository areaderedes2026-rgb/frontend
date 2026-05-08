import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AdminFormSection } from '../../components/admin/AdminFormSection.jsx'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { createNews } from '../../services/newsService.js'
import {
  inputClass,
  labelClass,
  textareaClass,
} from '../../components/ui/formStyles.js'
import { NewsImageFields } from '../../components/admin/NewsImageFields.jsx'
import { NewsCategoryField } from '../../components/admin/NewsCategoryField.jsx'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'

const ACTION_BTN_BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
const ACTION_BTN_BACK = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const ACTION_BTN_NEUTRAL = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`

function Spinner({ tone = 'white', size = 'sm' }) {
  const dim = size === 'sm' ? 'h-4 w-4 border-2' : 'h-5 w-5 border-2'
  const color =
    tone === 'white'
      ? 'border-white/40 border-t-white'
      : 'border-slate-300 border-t-sky-700'
  return (
    <span
      className={`inline-block animate-spin rounded-full ${color} ${dim}`}
      aria-hidden
    />
  )
}

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
        message: 'Completá título, resumen y cuerpo antes de publicar.',
      })
      return
    }
    setSaving(true)
    setToast({ type: 'success', message: 'Publicando noticia…' })
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
      setSaving(false)
    }
  }

  return (
    <>
      {toast ? (
        <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} />
      ) : null}

      {saving ? (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-[1px]"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-800 shadow-xl">
            <Spinner tone="sky" size="md" />
            <span>Publicando noticia…</span>
          </div>
        </div>
      ) : null}

      <AdminPageShell
        showBackLink={false}
        eyebrow=""
        variant="plain"
        maxWidthClass="max-w-none"
        actions={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to={ROUTES.adminNews}
              className={ACTION_BTN_BACK}
            >
              <span aria-hidden className="text-base leading-none">
                ←
              </span>
              Volver a noticias
            </Link>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={saving}
                onClick={() => navigate(ROUTES.adminNews)}
                className={ACTION_BTN_NEUTRAL}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="create-news-form"
                disabled={saving}
                className={ACTION_BTN_PRIMARY}
              >
                {saving ? (
                  <>
                    <Spinner />
                    Publicando…
                  </>
                ) : (
                  'Publicar noticia'
                )}
              </button>
            </div>
          </div>
        }
      >
        <h1 className="sr-only">Nueva noticia</h1>

        {!isApiConfigured() ? (
          <div
            className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="status"
          >
            No se detectó conexión con el backend. La noticia se guardará localmente para vista previa.
          </div>
        ) : null}

        <form
          id="create-news-form"
          className="admin-fade-up space-y-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
            <AdminFormSection
              title="Medios"
              description="Subí una portada y, opcionalmente, una galería. Aparecen en la ficha pública de la noticia."
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
              description="Título, categoría y textos visibles en el portal."
              className="order-1 min-w-0 lg:order-2 lg:col-span-7"
            >
              <label className={labelClass}>
                Título
                <input
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={saving}
                  placeholder="Ej. Se inauguró el nuevo polideportivo"
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
                  disabled={saving}
                  placeholder="Una oración breve para tarjetas y previsualizaciones."
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
                  disabled={saving}
                  placeholder="Texto completo de la noticia. Podés incluir varios párrafos."
                />
              </label>
            </AdminFormSection>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 pt-6 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => navigate(ROUTES.adminNews)}
              className={ACTION_BTN_NEUTRAL}
            >
              Cancelar
            </button>
            <button type="submit" disabled={saving} className={ACTION_BTN_PRIMARY}>
              {saving ? (
                <>
                  <Spinner />
                  Publicando…
                </>
              ) : (
                'Publicar noticia'
              )}
            </button>
          </div>
        </form>
      </AdminPageShell>
    </>
  )
}
