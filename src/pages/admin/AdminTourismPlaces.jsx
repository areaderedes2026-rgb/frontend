import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { NewsImageFields } from '../../components/admin/NewsImageFields.jsx'
import { NewsCoverMedia } from '../../components/news/NewsCoverMedia.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { formErrorClass, inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import {
  createTourismPlace,
  deleteTourismPlace,
  fetchTourismPlacesAdmin,
  updateTourismPlace,
} from '../../services/tourismPlacesService.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'
import { ROUTES } from '../../utils/constants.js'

const EMPTY_FORM = {
  name: '',
  slug: '',
  category: '',
  shortDescription: '',
  fullDescription: '',
  imageUrl: '',
  galleryUrls: [],
  address: '',
  howToGet: '',
  mapEmbedUrl: '',
  mapExternalUrl: '',
  contactPhone: '',
  contactEmail: '',
  contactWhatsapp: '',
  visitingHours: '',
  sortOrder: 0,
  isActive: true,
}

function toForm(place) {
  if (!place) return EMPTY_FORM
  return {
    name: place.name || '',
    slug: place.slug || '',
    category: place.category || '',
    shortDescription: place.shortDescription || '',
    fullDescription: place.fullDescription || '',
    imageUrl: place.imageUrl || '',
    galleryUrls: Array.isArray(place.gallery) ? [...place.gallery] : [],
    address: place.address || '',
    howToGet: place.howToGet || '',
    mapEmbedUrl: place.mapEmbedUrl || '',
    mapExternalUrl: place.mapExternalUrl || '',
    contactPhone: place.contactPhone || '',
    contactEmail: place.contactEmail || '',
    contactWhatsapp: place.contactWhatsapp || '',
    visitingHours: place.visitingHours || '',
    sortOrder: Number(place.sortOrder) || 0,
    isActive: place.isActive !== false,
  }
}

export function AdminTourismPlaces() {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [conflictOpen, setConflictOpen] = useState(false)
  const dismissToast = useCallback(() => setToast(null), [])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlace, setEditingPlace] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const sortedPlaces = useMemo(
    () =>
      [...places].sort((a, b) => {
        const orderA = Number(a.sortOrder) || 0
        const orderB = Number(b.sortOrder) || 0
        if (orderA !== orderB) return orderA - orderB
        return String(a.name).localeCompare(String(b.name), 'es')
      }),
    [places],
  )

  const loadPlaces = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const list = await fetchTourismPlacesAdmin()
      setPlaces(Array.isArray(list) ? list : [])
    } catch (e) {
      setError(e.message || 'No se pudieron cargar los lugares turísticos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPlaces()
  }, [loadPlaces])

  function openCreateModal() {
    setEditingPlace(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEditModal(place) {
    setEditingPlace(place)
    setForm(toForm(place))
    setModalOpen(true)
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        category: form.category.trim(),
        shortDescription: form.shortDescription,
        fullDescription: form.fullDescription,
        imageUrl: form.imageUrl.trim(),
        gallery: form.galleryUrls.filter((x) => typeof x === 'string' && x.trim()),
        address: form.address.trim(),
        howToGet: form.howToGet,
        mapEmbedUrl: form.mapEmbedUrl.trim(),
        mapExternalUrl: form.mapExternalUrl.trim(),
        contactPhone: form.contactPhone.trim(),
        contactEmail: form.contactEmail.trim(),
        contactWhatsapp: form.contactWhatsapp.trim(),
        visitingHours: form.visitingHours.trim(),
        sortOrder: Number(form.sortOrder) || 0,
        isActive: Boolean(form.isActive),
      }
      if (editingPlace) {
        await updateTourismPlace(editingPlace.id, {
          ...payload,
          expectedUpdatedAt: editingPlace.updatedAt || null,
        })
        setToast({ type: 'success', message: 'Lugar turístico actualizado.' })
      } else {
        await createTourismPlace(payload)
        setToast({ type: 'success', message: 'Lugar turístico creado.' })
      }
      setModalOpen(false)
      await loadPlaces()
    } catch (e) {
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
      setToast({ type: 'error', message: e.message || 'No se pudo guardar el lugar turístico.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteTourismPlace(deleteTarget.id)
      setDeleteTarget(null)
      setToast({ type: 'success', message: 'Lugar turístico eliminado.' })
      await loadPlaces()
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'No se pudo eliminar el lugar turístico.' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {toast ? <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} /> : null}
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
        open={deleteTarget != null}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        title="¿Eliminar lugar turístico?"
        description={
          deleteTarget ? (
            <>
              Esta acción eliminará <span className="font-semibold">«{deleteTarget.name}»</span>.
            </>
          ) : null
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        variant="danger"
      />

      <Modal
        open={modalOpen}
        onClose={() => {
          if (!saving) setModalOpen(false)
        }}
        loading={saving}
        size="wide"
        title={editingPlace ? 'Editar lugar turístico' : 'Nuevo lugar turístico'}
        description="Completá la información que se mostrará en el detalle público. Las imágenes se suben igual que en noticias."
      >
        <form className="flex flex-col gap-6" onSubmit={handleSave}>
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <aside className="space-y-1 lg:col-span-4 lg:sticky lg:top-0 lg:self-start">
              <p className="text-sm font-semibold text-slate-900">Medios</p>
              <p className="text-xs leading-relaxed text-slate-500">
                Portada y galería opcionales. Podés subir archivos o importar desde una URL pública.
              </p>
              <div className="mt-2 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4">
                <NewsImageFields
                  coverLabel="Imagen principal"
                  coverHelp="Opcional. JPEG, PNG, WebP o GIF (máx. 5 MB)."
                  galleryLabel="Galería"
                  galleryHelpText="Hasta 18 imágenes adicionales. Se muestran en la ficha pública del lugar."
                  maxGallery={18}
                  imageUrl={form.imageUrl || null}
                  onImageUrlChange={(url) => updateField('imageUrl', url ?? '')}
                  galleryUrls={form.galleryUrls}
                  onGalleryUrlsChange={(urls) => updateField('galleryUrls', urls)}
                />
              </div>
            </aside>

            <div className="min-w-0 space-y-4 lg:col-span-8">
              <p className="text-sm font-semibold text-slate-900">Datos del lugar</p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <label className={labelClass}>
                  Nombre *
                  <input
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    disabled={saving}
                    required
                  />
                </label>
                <label className={labelClass}>
                  Slug (opcional)
                  <input
                    className={inputClass}
                    value={form.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Categoría
                  <input
                    className={inputClass}
                    value={form.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Orden
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={form.sortOrder}
                    onChange={(e) => updateField('sortOrder', e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2 xl:col-span-2`}>
                  <span className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(form.isActive)}
                      onChange={(e) => updateField('isActive', e.target.checked)}
                      disabled={saving}
                    />
                    Activo en portal público
                  </span>
                </label>
                <label className={`${labelClass} sm:col-span-2 xl:col-span-3`}>
                  Descripción corta
                  <textarea
                    className={`${textareaClass} min-h-20`}
                    value={form.shortDescription}
                    onChange={(e) => updateField('shortDescription', e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2 xl:col-span-3`}>
                  Descripción completa *
                  <textarea
                    className={`${textareaClass} min-h-28`}
                    value={form.fullDescription}
                    onChange={(e) => updateField('fullDescription', e.target.value)}
                    disabled={saving}
                    required
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2 xl:col-span-3`}>
                  Dirección
                  <input
                    className={inputClass}
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2 xl:col-span-3`}>
                  Como llegar
                  <textarea
                    className={`${textareaClass} min-h-20`}
                    value={form.howToGet}
                    onChange={(e) => updateField('howToGet', e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Mapa embebido (URL)
                  <input
                    className={inputClass}
                    value={form.mapEmbedUrl}
                    onChange={(e) => updateField('mapEmbedUrl', e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Mapa externo (URL)
                  <input
                    className={inputClass}
                    value={form.mapExternalUrl}
                    onChange={(e) => updateField('mapExternalUrl', e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Teléfono
                  <input
                    className={inputClass}
                    value={form.contactPhone}
                    onChange={(e) => updateField('contactPhone', e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Email
                  <input
                    className={inputClass}
                    value={form.contactEmail}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  WhatsApp
                  <input
                    className={inputClass}
                    value={form.contactWhatsapp}
                    onChange={(e) => updateField('contactWhatsapp', e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className={labelClass}>
                  Horarios
                  <input
                    className={inputClass}
                    value={form.visitingHours}
                    onChange={(e) => updateField('visitingHours', e.target.value)}
                    disabled={saving}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200/80 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando…' : editingPlace ? 'Guardar cambios' : 'Crear lugar'}
            </Button>
          </div>
        </form>
      </Modal>

      <AdminPageShell
        showBackLink={false}
        eyebrow="Historia"
        title="Administrar lugares turísticos"
        subtitle="Gestioná los destinos que se muestran en la sección pública de Historia y en sus páginas de detalle."
        maxWidthClass="max-w-6xl"
        variant="plain"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <Link to={ROUTES.adminHistory} className="text-sm font-semibold text-slate-700 hover:text-sky-800">
            ← Volver a Historia
          </Link>
          <Button type="button" onClick={openCreateModal}>
            Nuevo lugar turístico
          </Button>
        </div>

        {error ? (
          <p className={formErrorClass} role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="h-4 w-44 rounded bg-slate-100" />
            <div className="mt-3 h-3 w-full rounded bg-slate-100" />
            <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sortedPlaces.map((place) => (
              <article
                key={place.id}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
              >
                <NewsCoverMedia
                  imageUrl={place.imageUrl}
                  className="aspect-16/10 w-full shrink-0"
                  loading="lazy"
                  iconScale="md"
                />
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">{place.name}</h2>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        place.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {place.isActive ? 'Activo' : 'Oculto'}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {place.shortDescription || place.fullDescription}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" onClick={() => openEditModal(place)}>
                      Editar
                    </Button>
                    <Button type="button" variant="danger" onClick={() => setDeleteTarget(place)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </AdminPageShell>
    </>
  )
}
