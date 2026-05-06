import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminFormSection } from '../../components/admin/AdminFormSection.jsx'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { deleteNews, fetchNewsById, updateNews } from '../../services/newsService.js'
import {
  formErrorClass,
  inputClass,
  labelClass,
  textareaClass,
} from '../../components/ui/formStyles.js'
import { NewsImageFields } from '../../components/admin/NewsImageFields.jsx'
import { NewsCategoryField } from '../../components/admin/NewsCategoryField.jsx'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'
import { ROUTES } from '../../utils/constants.js'

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
  const [conflictOpen, setConflictOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchNewsById(id)
      .then((data) => {
        if (cancelled) return
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
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Error al cargar')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!title.trim() || !summary.trim() || !body.trim()) {
      setError('Completá título, resumen y cuerpo.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        expectedUpdatedAt: newsUpdatedAt,
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
      await updateNews(id, payload)
      navigate(ROUTES.adminNews, {
        replace: true,
        state: { flash: 'Cambios guardados correctamente.' },
      })
    } catch (err) {
      if (isConcurrencyConflictError(err)) setConflictOpen(true)
      setError(err.message || 'No se pudo guardar.')
    } finally {
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
      setError(err.message || 'No se pudo eliminar la noticia.')
    } finally {
      setDeleting(false)
    }
  }

  const displayTitle = title.trim() || 'Sin título'

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[min(100%,90rem)]">
        <div className="admin-fade-up grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-5">
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="mt-6 aspect-video rounded-xl bg-slate-50" />
          </div>
          <div className="animate-pulse space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-7">
            <div className="h-4 w-40 rounded bg-slate-100" />
            <div className="h-10 w-full rounded bg-slate-100" />
            <div className="h-40 w-full rounded-xl bg-slate-50" />
          </div>
        </div>
      </div>
    )
  }

  if (error === 'noticias.no_encontrada') {
    return (
      <div className="mx-auto w-full max-w-lg">
        <div className="admin-fade-up rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm sm:p-10">
          <p className="text-base font-medium text-slate-800">La noticia no existe o fue eliminada.</p>
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
          <p className={formErrorClass} role="alert">
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
      <ConfirmDialog
        open={conflictOpen}
        onClose={() => setConflictOpen(false)}
        title="Cambios desactualizados"
        description="Otro usuario guardó cambios antes que vos. Recargá la última versión y reintentá."
        confirmLabel="Recargar última versión y reintentar"
        cancelLabel="Cerrar"
        loading={false}
        onConfirm={() => window.location.reload()}
      />
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
        backTo={ROUTES.adminNews}
        backLabel="Volver a noticias"
        eyebrow="Noticias"
        title="Editar noticia"
        subtitle="Actualizá el contenido y las imágenes. Los cambios se reflejan en el portal al guardar."
        variant="plain"
        maxWidthClass="max-w-[min(100%,90rem)]"
      >
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {error ? (
            <p className={formErrorClass} role="alert">
              {error}
            </p>
          ) : null}

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
                />
              </label>
              <NewsCategoryField
                value={categoryId}
                onChange={setCategoryId}
                disabled={saving || deleting}
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
              disabled={saving || deleting}
              onClick={() => navigate(ROUTES.adminNews)}
            >
              Volver sin guardar
            </Button>
            <Button type="submit" disabled={saving || deleting}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>

        <AdminFormSection
          title="Zona de peligro"
          description="Eliminá la noticia del servidor y del almacenamiento de imágenes cuando corresponda. No se puede deshacer."
          className="mt-8 border-red-200/60 bg-linear-to-b from-white to-red-50/40"
        >
          <Button
            type="button"
            variant="danger"
            disabled={saving || deleting}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Eliminar noticia
          </Button>
        </AdminFormSection>
      </AdminPageShell>
    </>
  )
}
