import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { NewsImageFields } from '../../components/admin/NewsImageFields.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  inputClass,
  labelClass,
  textareaClass,
} from '../../components/ui/formStyles.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import {
  createTourismPlace,
  deleteTourismPlace,
  fetchTourismPlacesAdmin,
  updateTourismPlace,
} from '../../services/tourismPlacesService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { ROUTES } from '../../utils/constants.js'

const PAGE_SIZE = 20

const ACTION_BTN_BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
const ACTION_BTN_NEUTRAL = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`

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

function Spinner({ tone = 'sky', size = 'sm' }) {
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

function PlaceThumb({ src, size = 'md' }) {
  const resolved = src ? resolveMediaUrl(src) : ''
  const dim = size === 'sm' ? 'h-11 w-14' : 'h-12 w-16'
  if (!resolved) {
    return (
      <div
        className={`${dim} shrink-0 rounded-lg bg-slate-50 ring-1 ring-inset ring-slate-200/80`}
        aria-hidden
      />
    )
  }
  return (
    <img
      src={resolved}
      alt=""
      className={`${dim} shrink-0 rounded-lg object-cover ring-1 ring-inset ring-slate-200/80`}
      loading="lazy"
      decoding="async"
    />
  )
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function paginationModel(page, totalPages) {
  if (totalPages <= 1) return { items: [{ type: 'page', n: 1 }], totalPages: 1 }
  if (totalPages <= 7) {
    return {
      totalPages,
      items: Array.from({ length: totalPages }, (_, i) => ({ type: 'page', n: i + 1 })),
    }
  }
  const set = new Set(
    [1, totalPages, page, page - 1, page + 1].filter((n) => n >= 1 && n <= totalPages),
  )
  const sorted = Array.from(set).sort((a, b) => a - b)
  const items = []
  for (let i = 0; i < sorted.length; i += 1) {
    items.push({ type: 'page', n: sorted[i] })
    const next = sorted[i + 1]
    if (next != null && next - sorted[i] > 1) items.push({ type: 'gap', key: `gap-${sorted[i]}` })
  }
  return { totalPages, items }
}

export function AdminTourismPlaces() {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlace, setEditingPlace] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const loadFromServer = useCallback(async () => {
    if (!isApiConfigured()) return
    const list = await fetchTourismPlacesAdmin()
    const nextPlaces = Array.isArray(list) ? list : []
    setPlaces(nextPlaces)
    if (editingPlace?.id) {
      const fresh = nextPlaces.find((p) => p.id === editingPlace.id)
      if (fresh) {
        setEditingPlace(fresh)
        setForm(toForm(fresh))
      }
    }
  }, [editingPlace?.id])

  const buildPayload = useCallback(
    () => ({
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
    }),
    [form],
  )

  const persistContent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const payload = { ...buildPayload(), forceOverwrite }
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
      await loadFromServer()
    },
    [buildPayload, editingPlace, loadFromServer],
  )

  const { conflictDialog, handleConflict } = useContentEditorConcurrencyConflict({
    reloadFromServer: loadFromServer,
    persistContent,
    entityLabel: 'este lugar turístico',
    onReloadSuccess: () =>
      setToast({
        type: 'success',
        message: 'Se cargó la última versión del servidor.',
      }),
    onReloadError: (e) =>
      setToast({
        type: 'error',
        message: e.message || 'No se pudo recargar el listado.',
      }),
    onForceSaveError: (e) => {
      const msg = e.message || 'No se pudo guardar el lugar turístico.'
      setFormError(msg)
      setToast({ type: 'error', message: msg })
    },
  })

  const loadPlaces = useCallback(
    async (showToast = false) => {
      if (!isApiConfigured()) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const list = await fetchTourismPlacesAdmin()
        setPlaces(Array.isArray(list) ? list : [])
        if (showToast) {
          setToast({ type: 'success', message: 'Listado actualizado.' })
        }
      } catch (e) {
        setError(e.message || 'No se pudieron cargar los lugares turísticos.')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    loadPlaces()
  }, [loadPlaces])

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

  const categoriesAvailable = useMemo(() => {
    const set = new Set()
    for (const place of places) {
      const cat = String(place.category || '').trim()
      if (cat) set.add(cat)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
  }, [places])

  const filteredPlaces = useMemo(() => {
    const term = normalize(searchQuery)
    return sortedPlaces.filter((place) => {
      if (statusFilter === 'active' && place.isActive === false) return false
      if (statusFilter === 'hidden' && place.isActive !== false) return false
      if (categoryFilter !== 'all') {
        const cat = String(place.category || '').trim()
        if (cat !== categoryFilter) return false
      }
      if (!term) return true
      const haystack = [
        place.name,
        place.slug,
        place.category,
        place.shortDescription,
        place.fullDescription,
        place.address,
      ]
      return haystack.some((value) => normalize(value).includes(term))
    })
  }, [sortedPlaces, searchQuery, statusFilter, categoryFilter])

  const filtersActive =
    searchQuery.trim().length > 0 ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all'

  const totalPages = Math.max(1, Math.ceil(filteredPlaces.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const rangeStart = (safePage - 1) * PAGE_SIZE
  const rangeEnd = Math.min(rangeStart + PAGE_SIZE, filteredPlaces.length)
  const paginated = useMemo(
    () => filteredPlaces.slice(rangeStart, rangeEnd),
    [filteredPlaces, rangeStart, rangeEnd],
  )
  const pagModel = paginationModel(safePage, totalPages)

  useEffect(() => {
    setPage(1)
  }, [searchQuery, statusFilter, categoryFilter])

  function clearFilters() {
    setSearchQuery('')
    setStatusFilter('all')
    setCategoryFilter('all')
    setPage(1)
  }

  function openCreateModal() {
    setEditingPlace(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  function openEditModal(place) {
    setEditingPlace(place)
    setForm(toForm(place))
    setFormError('')
    setModalOpen(true)
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(event) {
    event?.preventDefault?.()
    setFormError('')
    if (!form.name.trim()) {
      setFormError('Completá el nombre del lugar.')
      return
    }
    if (!form.fullDescription.trim()) {
      setFormError('Completá la descripción completa del lugar.')
      return
    }
    setSaving(true)
    try {
      await persistContent()
    } catch (e) {
      if (handleConflict(e)) return
      const msg = e.message || 'No se pudo guardar el lugar turístico.'
      setFormError(msg)
      setToast({ type: 'error', message: msg })
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
      setToast({
        type: 'error',
        message: e.message || 'No se pudo eliminar el lugar turístico.',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {toast ? (
        <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} />
      ) : null}
      {conflictDialog}
      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        title="¿Eliminar lugar turístico?"
        description={
          deleteTarget ? (
            <>
              Esta acción eliminará{' '}
              <span className="font-semibold">«{deleteTarget.name}»</span> y no se puede
              deshacer.
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
          {formError ? (
            <p
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {formError}
            </p>
          ) : null}
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
                    placeholder="Ej. Dique El Potrero"
                  />
                </label>
                <label className={labelClass}>
                  Slug (opcional)
                  <input
                    className={inputClass}
                    value={form.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    disabled={saving}
                    placeholder="dique-el-potrero"
                  />
                </label>
                <label className={labelClass}>
                  Categoría
                  <input
                    className={inputClass}
                    value={form.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    disabled={saving}
                    placeholder="Naturaleza, Patrimonio…"
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
                  Cómo llegar
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

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={saving}
              className={ACTION_BTN_NEUTRAL}
            >
              Cancelar
            </button>
            <button type="submit" disabled={saving} className={ACTION_BTN_PRIMARY}>
              {saving ? (
                <>
                  <Spinner tone="white" size="sm" />
                  Guardando…
                </>
              ) : editingPlace ? (
                'Guardar cambios'
              ) : (
                'Crear lugar'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <AdminPageShell
        showBackLink={false}
        eyebrow=""
        maxWidthClass="max-w-none"
        variant="plain"
        actions={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={() => loadPlaces(true)}
              disabled={loading}
              className={ACTION_BTN_NEUTRAL}
              aria-label="Actualizar listado"
            >
              <span aria-hidden>↻</span>
              Actualizar
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              disabled={!isApiConfigured()}
              className={ACTION_BTN_PRIMARY}
            >
              + Nuevo lugar turístico
            </button>
          </div>
        }
      >
        <h1 className="sr-only">Administrar lugares turísticos</h1>

        {!isApiConfigured() ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend para funcionar.
          </div>
        ) : null}

        {/* Toolbar de filtros */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={ROUTES.adminHistory}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900"
            >
              <span aria-hidden>←</span>
              Volver a Historia
            </Link>
            <span className="hidden text-slate-300 sm:inline" aria-hidden>
              ·
            </span>
            <p className="text-xs text-slate-500">
              {places.length} lugares cargados
              {filtersActive ? ` · ${filteredPlaces.length} coinciden con los filtros` : ''}
            </p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-12 sm:items-end">
            <label className={`${labelClass} sm:col-span-6`}>
              Buscar
              <input
                type="search"
                className={inputClass}
                placeholder="Nombre, slug, categoría o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
            </label>
            <label className={`${labelClass} sm:col-span-3`}>
              Categoría
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="news-select-minimal"
                disabled={loading}
              >
                <option value="all">Todas</option>
                {categoriesAvailable.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <label className={`${labelClass} sm:col-span-3`}>
              Estado
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="news-select-minimal"
                disabled={loading}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="hidden">Ocultos</option>
              </select>
            </label>
          </div>
          {filtersActive ? (
            <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Limpiar filtros
              </button>
            </div>
          ) : null}
        </div>

        {error ? (
          <div
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 shadow-sm"
            role="alert"
          >
            <p className="font-semibold">No se pudieron cargar los lugares turísticos.</p>
            <p className="mt-1 text-red-700/90">{error}</p>
            <button
              type="button"
              onClick={() => void loadPlaces()}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50"
            >
              <span aria-hidden>↻</span>
              Reintentar
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        ) : places.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
            <p className="text-base font-medium text-slate-800">
              Todavía no hay lugares turísticos cargados.
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Creá el primero para que aparezca en el portal público.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              disabled={!isApiConfigured()}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              + Nuevo lugar turístico
            </button>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-200/90 bg-amber-50/50 px-6 py-12 text-center">
            <p className="text-base font-medium text-slate-800">
              No hay lugares que coincidan con los filtros.
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Probá otra búsqueda o limpiá los filtros para ver todos los lugares.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-sky-200 hover:bg-sky-50"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            {/* Tabla en desktop */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="w-20 px-4 py-3.5" scope="col">
                      <span className="sr-only">Portada</span>
                    </th>
                    <th className="min-w-0 px-3 py-3.5">Lugar</th>
                    <th className="w-44 px-4 py-3.5">Categoría</th>
                    <th className="w-28 px-4 py-3.5">Estado</th>
                    <th className="w-20 px-4 py-3.5 text-right tabular-nums">Orden</th>
                    <th className="w-44 px-4 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((place) => (
                    <tr
                      key={place.id}
                      className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/90"
                    >
                      <td className="px-4 py-3 align-middle">
                        <PlaceThumb src={place.imageUrl} />
                      </td>
                      <td className="min-w-0 px-3 py-3 align-middle">
                        <button
                          type="button"
                          onClick={() => openEditModal(place)}
                          className="line-clamp-2 text-left font-semibold text-slate-900 transition hover:text-sky-800"
                        >
                          {place.name || 'Sin nombre'}
                        </button>
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {place.shortDescription || place.fullDescription || ''}
                        </p>
                        {place.slug ? (
                          <span className="mt-1 inline-block rounded-md bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-500 ring-1 ring-slate-200">
                            {place.slug}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-middle text-slate-600">
                        {place.category ? (
                          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800 ring-1 ring-sky-100">
                            {place.category}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            place.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-100'
                              : 'bg-slate-200 text-slate-700 ring-1 ring-slate-200'
                          }`}
                        >
                          {place.isActive !== false ? 'Activo' : 'Oculto'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right align-middle font-mono text-sm tabular-nums text-slate-700">
                        {Number(place.sortOrder) || 0}
                      </td>
                      <td className="px-4 py-3 text-right align-middle">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(place)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(place)}
                            disabled={Boolean(deleting)}
                            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards en mobile */}
            <ul className="space-y-3 lg:hidden">
              {paginated.map((place) => (
                <li
                  key={place.id}
                  className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                >
                  <div className="shrink-0 pt-0.5">
                    <PlaceThumb src={place.imageUrl} size="sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(place)}
                        className="line-clamp-2 text-left text-base font-semibold text-slate-900 hover:text-sky-800"
                      >
                        {place.name || 'Sin nombre'}
                      </button>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          place.isActive !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {place.isActive !== false ? 'Activo' : 'Oculto'}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {place.category ? (
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800 ring-1 ring-sky-100">
                          {place.category}
                        </span>
                      ) : null}
                      <span className="text-xs text-slate-500 tabular-nums">
                        Orden {Number(place.sortOrder) || 0}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {place.shortDescription || place.fullDescription || 'Sin descripción.'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(place)}
                        className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-sky-200 hover:bg-sky-50/50 hover:text-sky-900 sm:flex-none"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(place)}
                        disabled={Boolean(deleting)}
                        className="inline-flex flex-1 items-center justify-center rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <nav
              className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              aria-label="Paginación de lugares turísticos"
            >
              <p className="text-center text-sm leading-relaxed text-slate-600 sm:text-left">
                Mostrando{' '}
                <span className="font-semibold tabular-nums text-slate-900">
                  {rangeStart + 1}
                </span>
                –
                <span className="font-semibold tabular-nums text-slate-900">{rangeEnd}</span>{' '}
                de{' '}
                <span className="font-semibold tabular-nums text-slate-900">
                  {filteredPlaces.length}
                </span>
                {totalPages > 1 ? (
                  <>
                    <span className="text-slate-400" aria-hidden>
                      {' '}
                      ·{' '}
                    </span>
                    <span className="tabular-nums text-slate-600">
                      página {safePage} de {totalPages}
                    </span>
                  </>
                ) : null}
              </p>
              {totalPages > 1 ? (
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <div className="hidden items-center gap-1 sm:flex">
                    {pagModel.items.map((entry, idx) =>
                      entry.type === 'gap' ? (
                        <span
                          key={`gap-${idx}`}
                          className="px-1 text-slate-400"
                          aria-hidden
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={entry.n}
                          type="button"
                          onClick={() => setPage(entry.n)}
                          className={`min-h-10 min-w-10 rounded-lg text-sm font-semibold transition ${
                            entry.n === safePage
                              ? 'bg-sky-700 text-white shadow-sm'
                              : 'text-slate-700 hover:bg-white hover:ring-1 hover:ring-slate-200'
                          }`}
                        >
                          {entry.n}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              ) : null}
            </nav>
          </>
        )}
      </AdminPageShell>
    </>
  )
}
