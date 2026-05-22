import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminFormSection } from '../../components/admin/AdminFormSection.jsx'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import {
  deleteNews,
  fetchNewsById,
  updateNews,
} from '../../services/newsService.js'
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
const ACTION_BTN_DANGER = `${ACTION_BTN_BASE} bg-red-600 text-white hover:bg-red-700`

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

export function EditNews() {
  const { id } = useParams()
  return <EditNewsForm key={id} id={id} />
}

function EditNewsForm({ id }) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [body, setBody] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [mockCategoryName, setMockCategoryName] = useState('General')
  const [imageUrl, setImageUrl] = useState(null)
  const [galleryUrls, setGalleryUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [newsUpdatedAt, setNewsUpdatedAt] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const loadFromServer = useCallback(async () => {
    const data = await fetchNewsById(id)
    if (!data) {
      setError('noticias.no_encontrada')
      return
    }
    setError('')
    setTitle(data.title || '')
    setSummary(data.summary || '')
    setBody(data.body || '')
    setCategoryId(data.categoryId ? String(data.categoryId) : '')
    setMockCategoryName(data.category || 'General')
    setImageUrl(data.imageUrl ?? null)
    setGalleryUrls(Array.isArray(data.galleryUrls) ? data.galleryUrls : [])
    setNewsUpdatedAt(data.updatedAt || null)
  }, [id])

  const buildPayload = useCallback(
    (forceOverwrite = false) => {
      const payload = {
        expectedUpdatedAt: newsUpdatedAt,
        forceOverwrite,
        title: title.trim(),
        summary: summary.trim(),
        body: body.trim(),
        imageUrl,
        galleryUrls,
      }
      if (isApiConfigured()) {
        if (categoryId) payload.categoryId = Number(categoryId)
      } else {
        payload.category = mockCategoryName || 'General'
      }
      return payload
    },
    [body, categoryId, galleryUrls, imageUrl, mockCategoryName, newsUpdatedAt, summary, title],
  )

  const persistContent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      await updateNews(id, buildPayload(forceOverwrite))
      navigate(ROUTES.adminNews, {
        replace: true,
        state: { flash: 'Cambios guardados correctamente.' },
      })
    },
    [buildPayload, id, navigate],
  )

  const { conflictDialog, handleConflict } = useContentEditorConcurrencyConflict({
    reloadFromServer: loadFromServer,
    persistContent,
    entityLabel: 'esta noticia',
    onReloadSuccess: () =>
      setToast({
        type: 'success',
        message: 'Se cargó la última versión del servidor.',
      }),
    onReloadError: (e) =>
      setToast({
        type: 'error',
        message: e.message || 'No se pudo recargar la noticia.',
      }),
    onForceSaveError: (e) => {
      const msg = e.message || 'No se pudo guardar.'
      setError(msg)
      setToast({ type: 'error', message: msg })
      setSaving(false)
    },
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadFromServer()
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Error al cargar')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [loadFromServer])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!title.trim() || !summary.trim() || !body.trim()) {
      setToast({
        type: 'error',
        message: 'Completá título, resumen y cuerpo antes de guardar.',
      })
      setError('Completá título, resumen y cuerpo.')
      return
    }
    setSaving(true)
    setToast({ type: 'success', message: 'Guardando cambios…' })
    try {
      await persistContent()
    } catch (err) {
      if (handleConflict(err)) return
      const msg = err.message || 'No se pudo guardar.'
      setError(msg)
      setToast({ type: 'error', message: msg })
      setSaving(false)
    }
  }

  async function handleConfirmDelete() {
    setError('')
    setDeleting(true)
    try {
      await deleteNews(id)
      setDeleteDialogOpen(false)
      navigate(ROUTES.adminNews, {
        replace: true,
        state: { flash: 'Noticia eliminada.' },
      })
    } catch (err) {
      const msg = err.message || 'No se pudo eliminar la noticia.'
      setError(msg)
      setToast({ type: 'error', message: msg })
      setDeleting(false)
    }
  }

  const displayTitle = title.trim() || 'Sin título'
  const busy = saving || deleting

  if (loading) {
    return (
      <div className="mx-auto w-full">
        <div className="admin-fade-up">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-10 w-44 animate-pulse rounded-xl bg-slate-100" />
            <div className="flex gap-2">
              <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-5">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
              <div className="mt-6 aspect-video animate-pulse rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-7">
              <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
              <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-40 w-full animate-pulse rounded-xl bg-slate-50" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error === 'noticias.no_encontrada') {
    return (
      <div className="mx-auto w-full max-w-lg">
        <div className="admin-fade-up rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm sm:p-10">
          <p className="text-base font-medium text-slate-800">
            La noticia no existe o fue eliminada.
          </p>
          <Link
            to={ROUTES.adminNews}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
          >
            Volver a noticias
          </Link>
        </div>
      </div>
    )
  }

  if (error && !title) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <div className="admin-fade-up rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm sm:p-10">
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
          <Link
            to={ROUTES.adminNews}
            className="mt-6 inline-block text-sm font-semibold text-sky-700 hover:text-sky-900"
          >
            ← Volver a noticias
          </Link>
        </div>
      </div>
    )
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
            <span>Guardando cambios…</span>
          </div>
        </div>
      ) : null}

      {conflictDialog}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deleting) setDeleteDialogOpen(false)
        }}
        title="¿Eliminar esta noticia?"
        description={
          <>
            Vas a eliminar{' '}
            <span className="font-semibold text-slate-800">«{displayTitle}»</span>. Se
            borrará la noticia en el servidor, las filas de galería en la base de datos y
            las imágenes en Cloudinary cuando correspondan. Esta acción no se puede
            deshacer.
          </>
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        variant="danger"
      />

      <AdminPageShell
        showBackLink={false}
        eyebrow=""
        variant="plain"
        maxWidthClass="max-w-none"
        actions={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link to={ROUTES.adminNews} className={ACTION_BTN_BACK}>
              <span aria-hidden className="text-base leading-none">
                ←
              </span>
              Volver a noticias
            </Link>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={busy}
                onClick={() => navigate(ROUTES.adminNews)}
                className={ACTION_BTN_NEUTRAL}
              >
                Volver sin guardar
              </button>
              <button
                type="submit"
                form="edit-news-form"
                disabled={busy}
                className={ACTION_BTN_PRIMARY}
              >
                {saving ? (
                  <>
                    <Spinner />
                    Guardando…
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </button>
            </div>
          </div>
        }
      >
        <h1 className="sr-only">Editar noticia</h1>

        {error ? (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <form
          id="edit-news-form"
          className="admin-fade-up space-y-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
            <AdminFormSection
              title="Medios"
              description="Portada y galería. Podés quitar o reemplazar imágenes en cualquier momento."
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
              description="Título, categoría y textos visibles en la noticia pública."
              className="order-1 min-w-0 lg:order-2 lg:col-span-7"
            >
              <label className={labelClass}>
                Título
                <input
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={busy}
                />
              </label>
              <NewsCategoryField
                value={categoryId}
                onChange={setCategoryId}
                disabled={busy}
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
                  disabled={busy}
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
                  disabled={busy}
                />
              </label>
            </AdminFormSection>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 pt-6 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={() => navigate(ROUTES.adminNews)}
              className={ACTION_BTN_NEUTRAL}
            >
              Volver sin guardar
            </button>
            <button type="submit" disabled={busy} className={ACTION_BTN_PRIMARY}>
              {saving ? (
                <>
                  <Spinner />
                  Guardando…
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>

        <AdminFormSection
          title="Zona de peligro"
          description="Eliminá la noticia del servidor y del almacenamiento de imágenes cuando corresponda. No se puede deshacer."
          className="mt-8 border-red-200/60 bg-linear-to-b from-white to-red-50/40"
        >
          <button
            type="button"
            disabled={busy}
            onClick={() => setDeleteDialogOpen(true)}
            className={ACTION_BTN_DANGER}
          >
            {deleting ? (
              <>
                <Spinner />
                Eliminando…
              </>
            ) : (
              'Eliminar noticia'
            )}
          </button>
        </AdminFormSection>
      </AdminPageShell>
    </>
  )
}
