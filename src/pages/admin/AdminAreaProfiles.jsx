import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { SingleImageUploadField } from '../../components/admin/SingleImageUploadField.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  formErrorClass,
  inputClass,
  labelClass,
  textareaClass,
} from '../../components/ui/formStyles.js'
import { MUNICIPAL_AREAS } from '../../data/areas.js'
import { getAreaProfileBySlug, mergeAreaProfile } from '../../data/areaProfiles.js'
import { fetchAreaProfile, updateAreaProfile } from '../../services/areaProfilesService.js'
import {
  createArea,
  deleteArea,
  fetchAreasAdmin,
  updateArea,
} from '../../services/areasService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import {
  fetchAreasPageContent,
  updateAreasPageContent,
} from '../../services/areasPageService.js'

function mapProfileToForm(profile) {
  return {
    heroTag: profile.heroTag || '',
    mission: profile.mission || '',
    director: {
      name: profile.director?.name || '',
      role: profile.director?.role || '',
      bio: profile.director?.bio || '',
      photoUrl: profile.director?.photoUrl || '',
      email: profile.director?.email || '',
      phone: profile.director?.phone || '',
      officeHours: profile.director?.officeHours || '',
    },
    serviceBlocks: Array.isArray(profile.serviceBlocks)
      ? profile.serviceBlocks.map((x) => ({
          title: x?.title || '',
          description: x?.description || '',
          mode: x?.mode || '',
        }))
      : [],
    initiatives: Array.isArray(profile.initiatives)
      ? profile.initiatives.map((x) => ({
          title: x?.title || '',
          description: x?.description || '',
        }))
      : [],
    contactCards: Array.isArray(profile.contactCards)
      ? profile.contactCards.map((x) => ({
          label: x?.label || '',
          value: x?.value || '',
          note: x?.note || '',
        }))
      : [],
    notices: Array.isArray(profile.notices)
      ? profile.notices.map((x) => String(x || ''))
      : [],
    location: {
      address: profile.location?.address || '',
      references: profile.location?.references || '',
      mapEmbedUrl: profile.location?.mapEmbedUrl || '',
      mapExternalUrl: profile.location?.mapExternalUrl || '',
    },
  }
}

function cleanRows(list, shape) {
  return list
    .map((row) => {
      const out = {}
      for (const key of shape) out[key] = String(row?.[key] || '').trim()
      return out
    })
    .filter((row) => shape.some((k) => row[k]))
}

function cleanNotices(list) {
  return list.map((x) => String(x || '').trim()).filter(Boolean)
}

export function AdminAreaProfiles() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [areas, setAreas] = useState(MUNICIPAL_AREAS.map((a, i) => ({ ...a, id: i + 1 })))
  const [areasLoading, setAreasLoading] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState(MUNICIPAL_AREAS[0]?.slug || '')
  const [form, setForm] = useState(() => {
    const base = getAreaProfileBySlug(selectedSlug)
    return base ? mapProfileToForm(base) : mapProfileToForm({})
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [catalogError, setCatalogError] = useState('')
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const [newArea, setNewArea] = useState({
    title: '',
    slug: '',
    description: '',
    coverImage: '',
  })
  const [creatingArea, setCreatingArea] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletingAreaId, setDeletingAreaId] = useState(null)
  const [areaMeta, setAreaMeta] = useState({
    title: '',
    slug: '',
    description: '',
    coverImage: '',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [globalCover, setGlobalCover] = useState('')
  const [savingGlobalCover, setSavingGlobalCover] = useState(false)

  const activeTab = useMemo(() => {
    const t = searchParams.get('tab')
    return t === 'edit' ? 'edit' : 'catalog'
  }, [searchParams])

  const setTab = useCallback(
    (tab, { replace = false } = {}) => {
      const next = new URLSearchParams(searchParams)
      next.set('tab', tab === 'edit' ? 'edit' : 'catalog')
      setSearchParams(next, { replace })
    },
    [searchParams, setSearchParams],
  )

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'catalog' || t === 'edit') return
    const next = new URLSearchParams(searchParams)
    next.set('tab', 'catalog')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const selectedArea = useMemo(
    () => areas.find((a) => a.slug === selectedSlug) || null,
    [areas, selectedSlug],
  )
  const PAGE_SIZE = 8
  const filteredAreas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return areas
    return areas.filter((area) => String(area.title || '').toLowerCase().includes(q))
  }, [areas, searchQuery])
  const totalPages = Math.max(1, Math.ceil(filteredAreas.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const paginatedAreas = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredAreas.slice(start, start + PAGE_SIZE)
  }, [filteredAreas, safePage])

  const loadAreas = useCallback(async () => {
    setCatalogError('')
    setAreasLoading(true)
    try {
      const list = await fetchAreasAdmin()
      const sorted = [...list].sort((a, b) => {
        const orderA = Number(a.sortOrder) || 0
        const orderB = Number(b.sortOrder) || 0
        if (orderA !== orderB) return orderA - orderB
        return String(a.title).localeCompare(String(b.title), 'es')
      })
      setAreas(sorted)
      setSelectedSlug((current) =>
        sorted.some((a) => a.slug === current) ? current : sorted[0]?.slug || '',
      )
    } catch (e) {
      setCatalogError(e.message || 'No se pudo cargar el catálogo de áreas.')
      setAreas([])
      setSelectedSlug('')
    } finally {
      setAreasLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAreas()
  }, [loadAreas])

  useEffect(() => {
    let cancelled = false
    if (!isApiConfigured()) return () => {}
    fetchAreasPageContent()
      .then((content) => {
        if (!cancelled) setGlobalCover(String(content?.heroImageUrl || ''))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError('')
      setLoading(true)
      if (!selectedSlug || !selectedArea) {
        if (!cancelled) setLoading(false)
        return
      }
      const base = getAreaProfileBySlug(selectedSlug, selectedArea)
      if (!base) {
        if (!cancelled) setError('Área no encontrada.')
        if (!cancelled) setLoading(false)
        return
      }
      let merged = base
      if (isApiConfigured()) {
        try {
          const remote = await fetchAreaProfile(selectedSlug)
          if (remote) merged = mergeAreaProfile(base, remote)
        } catch (e) {
          if (!cancelled) setError(e.message || 'No se pudo cargar el perfil remoto.')
        }
      }
      if (!cancelled) {
        setForm(mapProfileToForm(merged))
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [selectedSlug, selectedArea])

  useEffect(() => {
    setAreaMeta({
      title: selectedArea?.title || '',
      slug: selectedArea?.slug || '',
      description: selectedArea?.description || '',
      coverImage: selectedArea?.coverImage || '',
    })
  }, [selectedArea])

  function setDirectorField(field, value) {
    setForm((prev) => ({ ...prev, director: { ...prev.director, [field]: value } }))
  }
  function setLocationField(field, value) {
    setForm((prev) => ({ ...prev, location: { ...prev.location, [field]: value } }))
  }

  function updateListItem(key, index, field, value) {
    setForm((prev) => {
      const copy = [...prev[key]]
      copy[index] = { ...copy[index], [field]: value }
      return { ...prev, [key]: copy }
    })
  }
  function addListItem(key, row) {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], row] }))
  }
  function removeListItem(key, index) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }))
  }
  function updateNotice(index, value) {
    setForm((prev) => {
      const copy = [...prev.notices]
      copy[index] = value
      return { ...prev, notices: copy }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
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
      if (!selectedArea?.id) {
        throw new Error('No hay un área seleccionada para editar.')
      }
      const updatedArea = await updateArea(selectedArea.id, {
        title: areaMeta.title.trim(),
        slug: areaMeta.slug.trim(),
        description: areaMeta.description.trim(),
        coverImage: areaMeta.coverImage.trim(),
      })
      const payload = {
        heroTag: form.heroTag.trim(),
        director: {
          name: form.director.name.trim(),
          role: form.director.role.trim(),
          bio: form.director.bio.trim(),
          photoUrl: form.director.photoUrl.trim(),
          email: form.director.email.trim(),
          phone: form.director.phone.trim(),
          officeHours: form.director.officeHours.trim(),
        },
        serviceBlocks: cleanRows(form.serviceBlocks, ['title', 'description', 'mode']),
        initiatives: cleanRows(form.initiatives, ['title', 'description']),
        contactCards: cleanRows(form.contactCards, ['label', 'value', 'note']),
        notices: cleanNotices(form.notices),
        location: {
          address: form.location.address.trim(),
          references: form.location.references.trim(),
          mapEmbedUrl: form.location.mapEmbedUrl.trim(),
          mapExternalUrl: form.location.mapExternalUrl.trim(),
        },
      }
      const profileSlug = updatedArea?.slug || selectedSlug
      const saved = await updateAreaProfile(profileSlug, payload)
      await loadAreas()
      setSelectedSlug(profileSlug)
      const base = getAreaProfileBySlug(profileSlug, updatedArea || selectedArea)
      const merged = saved && base ? mergeAreaProfile(base, saved) : base
      if (merged) setForm(mapProfileToForm(merged))
      setToast({
        type: 'success',
        message: 'Área y perfil actualizados correctamente.',
      })
    } catch (e) {
      setError(e.message || 'No se pudo guardar.')
      setToast({ type: 'error', message: e.message || 'No se pudo guardar.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateArea(e) {
    e.preventDefault()
    if (!isApiConfigured()) {
      setToast({
        type: 'error',
        message: 'No hay conexión disponible con el backend.',
      })
      return
    }
    if (!newArea.title.trim() || !newArea.description.trim()) {
      setToast({
        type: 'error',
        message: 'Completá título y descripción para crear el área.',
      })
      return
    }
    setCreatingArea(true)
    try {
      const created = await createArea({
        title: newArea.title.trim(),
        description: newArea.description.trim(),
        slug: newArea.slug.trim() || undefined,
        coverImage: newArea.coverImage.trim() || undefined,
      })
      await loadAreas()
      if (created?.slug) setSelectedSlug(created.slug)
      if (created?.slug) setTab('edit')
      setNewArea({ title: '', slug: '', description: '', coverImage: '' })
      setCreateModalOpen(false)
      setToast({ type: 'success', message: 'Área creada correctamente.' })
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'No se pudo crear el área.' })
    } finally {
      setCreatingArea(false)
    }
  }

  async function handleConfirmDeleteArea() {
    if (!deleteTarget) return
    setDeletingAreaId(deleteTarget.id)
    try {
      await deleteArea(deleteTarget.id)
      setDeleteTarget(null)
      await loadAreas()
      setToast({ type: 'success', message: 'Área eliminada correctamente.' })
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'No se pudo eliminar el área.' })
    } finally {
      setDeletingAreaId(null)
    }
  }

  async function handleSaveGlobalCover() {
    if (!isApiConfigured()) {
      setToast({
        type: 'error',
        message: 'No hay conexión disponible con el backend.',
      })
      return
    }
    setSavingGlobalCover(true)
    try {
      const saved = await updateAreasPageContent({ heroImageUrl: globalCover.trim() })
      setGlobalCover(String(saved?.heroImageUrl || ''))
      setToast({
        type: 'success',
        message: 'Portada global de Áreas actualizada.',
      })
    } catch (e) {
      setToast({
        type: 'error',
        message: e.message || 'No se pudo guardar la portada global.',
      })
    } finally {
      setSavingGlobalCover(false)
    }
  }

  return (
    <>
      {toast ? (
        <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} />
      ) : null}
      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => {
          if (!deletingAreaId) setDeleteTarget(null)
        }}
        title="¿Eliminar esta área?"
        description={
          deleteTarget ? (
            <>
              Se eliminará el área{' '}
              <span className="font-semibold">«{deleteTarget.title}»</span> y también su
              perfil de contenido público.
            </>
          ) : null
        }
        confirmLabel="Eliminar área"
        cancelLabel="Cancelar"
        loading={Boolean(deletingAreaId)}
        onConfirm={handleConfirmDeleteArea}
        variant="danger"
      />
      <Modal
        open={createModalOpen}
        onClose={() => {
          if (!creatingArea) setCreateModalOpen(false)
        }}
        loading={creatingArea}
        size="wide"
        title="Crear nueva área"
        description="Completá los datos base para publicar una nueva área municipal."
      >
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleCreateArea}>
          <label className={labelClass}>
            Título
            <input
              className={inputClass}
              value={newArea.title}
              onChange={(e) =>
                setNewArea((prev) => ({ ...prev, title: e.target.value }))
              }
              disabled={creatingArea || areasLoading}
              required
            />
          </label>
          <label className={labelClass}>
            Slug (opcional)
            <input
              className={inputClass}
              value={newArea.slug}
              onChange={(e) =>
                setNewArea((prev) => ({ ...prev, slug: e.target.value }))
              }
              disabled={creatingArea || areasLoading}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Descripción base
            <textarea
              className={`${textareaClass} min-h-24`}
              value={newArea.description}
              onChange={(e) =>
                setNewArea((prev) => ({ ...prev, description: e.target.value }))
              }
              disabled={creatingArea || areasLoading}
              required
            />
          </label>
          <div className="sm:col-span-2">
            <SingleImageUploadField
              label="Imagen de portada"
              helpText="Subí la portada del área o importala por URL."
              value={newArea.coverImage}
              onChange={(value) =>
                setNewArea((prev) => ({ ...prev, coverImage: value }))
              }
              kind="cover"
              disabled={creatingArea || areasLoading}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2 border-t border-slate-200/80 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreateModalOpen(false)}
              disabled={creatingArea}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={creatingArea || areasLoading}>
              {creatingArea ? 'Creando…' : 'Crear área'}
            </Button>
          </div>
        </form>
      </Modal>

      <AdminPageShell
        showBackLink={false}
        eyebrow="Configuración"
        title="Perfiles de áreas"
        subtitle="Editá el contenido público que se muestra en cada área: identidad, dirección, servicios, ubicación y contacto."
        maxWidthClass="max-w-6xl"
        variant="plain"
      >
        {!isApiConfigured() ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend para guardar cambios.
          </div>
        ) : null}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab('catalog')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'catalog'
                  ? 'bg-sky-700 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Catálogo de áreas
            </button>
            <button
              type="button"
              onClick={() => setTab('edit')}
              disabled={!selectedSlug}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'edit'
                  ? 'bg-sky-700 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              } ${!selectedSlug ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              Editar área
            </button>
          </div>
        </div>

        {activeTab === 'catalog' ? (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900">Catálogo de áreas</h2>
              <Button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                disabled={!isApiConfigured()}
              >
                + Crear área
              </Button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:items-end">
              <label className={labelClass}>
                Búsqueda rápida por nombre
                <input
                  className={inputClass}
                  placeholder="Ej: Deportes, Cultura, Obras..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPage(1)
                  }}
                  disabled={areasLoading}
                />
              </label>
              <p className="text-xs text-slate-500 sm:text-right">
                {filteredAreas.length} área(s) encontrada(s)
              </p>
            </div>
            {catalogError ? (
              <p className={`mt-3 ${formErrorClass}`} role="alert">
                {catalogError}
              </p>
            ) : null}
            <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Portada global de la sección Áreas
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Esta imagen se muestra en el header de “Todas las áreas” (inicio del módulo).
              </p>
              <div className="mt-3">
                <SingleImageUploadField
                  label="Imagen de portada global"
                  helpText="No depende de ninguna área individual."
                  value={globalCover}
                  onChange={setGlobalCover}
                  kind="cover"
                  disabled={savingGlobalCover}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  onClick={() => void handleSaveGlobalCover()}
                  disabled={savingGlobalCover}
                >
                  {savingGlobalCover ? 'Guardando…' : 'Guardar portada global'}
                </Button>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/80">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Portada</th>
                    <th className="px-3 py-3">Área</th>
                    <th className="px-3 py-3">Slug</th>
                    <th className="px-3 py-3">Descripción</th>
                    <th className="px-3 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAreas.map((area) => (
                    <tr key={area.slug} className="border-t border-slate-100">
                      <td className="px-3 py-2.5">
                        {area.coverImage ? (
                          <img
                            src={area.coverImage}
                            alt=""
                            className="h-14 w-20 rounded-md object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="flex h-14 w-20 items-center justify-center rounded-md bg-slate-100 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                            Sin imagen
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{area.title}</td>
                      <td className="px-3 py-2.5 text-slate-600">{area.slug}</td>
                      <td className="max-w-xs truncate px-3 py-2.5 text-slate-600">
                        {area.description}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            className="px-2.5! py-1.5! text-xs!"
                            onClick={() => {
                              setSelectedSlug(area.slug)
                              setTab('edit')
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            className="px-2.5! py-1.5! text-xs!"
                            onClick={() => setDeleteTarget(area)}
                            disabled={
                              creatingArea ||
                              Boolean(deletingAreaId) ||
                              areasLoading ||
                              !isApiConfigured()
                            }
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedAreas.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={5}>
                        No hay áreas que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            {filteredAreas.length > PAGE_SIZE ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Página {safePage} de {totalPages}
                </p>
                <div className="inline-flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-2.5! py-1.5! text-xs!"
                    disabled={safePage <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-2.5! py-1.5! text-xs!"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {activeTab === 'edit' ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <label className={labelClass}>
              Área a editar
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="news-select-minimal"
                disabled={loading || saving}
              >
                {areas.map((area) => (
                  <option key={area.slug} value={area.slug}>
                    {area.title}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-2 text-xs text-slate-500">
              Área seleccionada: <span className="font-semibold">{selectedArea?.title}</span>
            </p>
          </div>

          {!selectedSlug ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-10 text-center text-sm text-slate-600">
              No hay áreas disponibles. Creá una nueva para comenzar.
            </div>
          ) : loading ? (
            <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="h-4 w-44 rounded bg-slate-100" />
              <div className="mt-3 h-3 w-full rounded bg-slate-100" />
              <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
            </div>
          ) : (
            <>
              {error ? (
                <p className={formErrorClass} role="alert">
                  {error}
                </p>
              ) : null}

              <div className="grid gap-5 lg:grid-cols-12">
                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-7">
                  <h2 className="text-base font-semibold text-slate-900">Identidad del área</h2>
                  <div className="mt-4 space-y-4">
                    <label className={labelClass}>
                      Nombre del área
                      <input
                        className={inputClass}
                        value={areaMeta.title}
                        onChange={(e) =>
                          setAreaMeta((prev) => ({ ...prev, title: e.target.value }))
                        }
                        disabled={saving}
                      />
                    </label>
                    <label className={labelClass}>
                      Slug del área
                      <input
                        className={inputClass}
                        value={areaMeta.slug}
                        onChange={(e) =>
                          setAreaMeta((prev) => ({
                            ...prev,
                            slug: e.target.value,
                          }))
                        }
                        disabled={saving}
                      />
                    </label>
                    <label className={labelClass}>
                      Descripción del área
                      <textarea
                        className={`${textareaClass} min-h-28`}
                        value={areaMeta.description}
                        onChange={(e) =>
                          setAreaMeta((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        disabled={saving}
                      />
                    </label>
                    <label className={labelClass}>
                      Etiqueta superior
                      <input
                        className={inputClass}
                        value={form.heroTag}
                        onChange={(e) => setForm((p) => ({ ...p, heroTag: e.target.value }))}
                        disabled={saving}
                      />
                    </label>
                    <SingleImageUploadField
                      label="Imagen de portada del área"
                      helpText="Se usa en la cabecera pública del detalle del área."
                      value={areaMeta.coverImage}
                      onChange={(value) =>
                        setAreaMeta((prev) => ({ ...prev, coverImage: value }))
                      }
                      kind="cover"
                      disabled={saving}
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-5">
                  <h2 className="text-base font-semibold text-slate-900">Dirección del área</h2>
                  <div className="mt-4 space-y-3">
                    <label className={labelClass}>
                      Nombre
                      <input className={inputClass} value={form.director.name} onChange={(e) => setDirectorField('name', e.target.value)} disabled={saving} />
                    </label>
                    <label className={labelClass}>
                      Cargo
                      <input className={inputClass} value={form.director.role} onChange={(e) => setDirectorField('role', e.target.value)} disabled={saving} />
                    </label>
                    <div>
                      <SingleImageUploadField
                        label="Foto del director/a"
                        helpText="Subí la imagen principal del responsable del área."
                        value={form.director.photoUrl}
                        onChange={(value) => setDirectorField('photoUrl', value)}
                        kind="cover"
                        disabled={saving}
                      />
                    </div>
                    <label className={labelClass}>
                      Correo
                      <input className={inputClass} value={form.director.email} onChange={(e) => setDirectorField('email', e.target.value)} disabled={saving} />
                    </label>
                    <label className={labelClass}>
                      Teléfono
                      <input className={inputClass} value={form.director.phone} onChange={(e) => setDirectorField('phone', e.target.value)} disabled={saving} />
                    </label>
                    <label className={labelClass}>
                      Horario
                      <input className={inputClass} value={form.director.officeHours} onChange={(e) => setDirectorField('officeHours', e.target.value)} disabled={saving} />
                    </label>
                    <label className={labelClass}>
                      Bio
                      <textarea className={`${textareaClass} min-h-28`} value={form.director.bio} onChange={(e) => setDirectorField('bio', e.target.value)} disabled={saving} />
                    </label>
                  </div>
                </section>
              </div>

              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-slate-900">Servicios</h2>
                  <Button type="button" variant="secondary" onClick={() => addListItem('serviceBlocks', { title: '', description: '', mode: '' })} disabled={saving}>
                    + Agregar servicio
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {form.serviceBlocks.map((row, idx) => (
                    <div key={`srv-${idx}`} className="grid gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 sm:grid-cols-12">
                      <input className={`${inputClass} sm:col-span-3`} placeholder="Título" value={row.title} onChange={(e) => updateListItem('serviceBlocks', idx, 'title', e.target.value)} disabled={saving} />
                      <input className={`${inputClass} sm:col-span-3`} placeholder="Modalidad" value={row.mode} onChange={(e) => updateListItem('serviceBlocks', idx, 'mode', e.target.value)} disabled={saving} />
                      <input className={`${inputClass} sm:col-span-5`} placeholder="Descripción" value={row.description} onChange={(e) => updateListItem('serviceBlocks', idx, 'description', e.target.value)} disabled={saving} />
                      <Button type="button" variant="danger" className="sm:col-span-1" onClick={() => removeListItem('serviceBlocks', idx)} disabled={saving}>
                        Quitar
                      </Button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-slate-900">Iniciativas</h2>
                  <Button type="button" variant="secondary" onClick={() => addListItem('initiatives', { title: '', description: '' })} disabled={saving}>
                    + Agregar iniciativa
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {form.initiatives.map((row, idx) => (
                    <div key={`ini-${idx}`} className="grid gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 sm:grid-cols-12">
                      <input className={`${inputClass} sm:col-span-4`} placeholder="Título" value={row.title} onChange={(e) => updateListItem('initiatives', idx, 'title', e.target.value)} disabled={saving} />
                      <input className={`${inputClass} sm:col-span-7`} placeholder="Descripción" value={row.description} onChange={(e) => updateListItem('initiatives', idx, 'description', e.target.value)} disabled={saving} />
                      <Button type="button" variant="danger" className="sm:col-span-1" onClick={() => removeListItem('initiatives', idx)} disabled={saving}>
                        Quitar
                      </Button>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid gap-5 lg:grid-cols-12">
                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-slate-900">Contactos</h2>
                    <Button type="button" variant="secondary" onClick={() => addListItem('contactCards', { label: '', value: '', note: '' })} disabled={saving}>
                      + Agregar contacto
                    </Button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {form.contactCards.map((row, idx) => (
                      <div key={`con-${idx}`} className="grid gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                        <input className={inputClass} placeholder="Etiqueta" value={row.label} onChange={(e) => updateListItem('contactCards', idx, 'label', e.target.value)} disabled={saving} />
                        <input className={inputClass} placeholder="Valor" value={row.value} onChange={(e) => updateListItem('contactCards', idx, 'value', e.target.value)} disabled={saving} />
                        <input className={inputClass} placeholder="Nota" value={row.note} onChange={(e) => updateListItem('contactCards', idx, 'note', e.target.value)} disabled={saving} />
                        <Button type="button" variant="danger" onClick={() => removeListItem('contactCards', idx)} disabled={saving}>
                          Quitar
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-slate-900">Avisos</h2>
                    <Button type="button" variant="secondary" onClick={() => setForm((p) => ({ ...p, notices: [...p.notices, ''] }))} disabled={saving}>
                      + Agregar aviso
                    </Button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {form.notices.map((notice, idx) => (
                      <div key={`note-${idx}`} className="flex gap-2">
                        <input className={inputClass} value={notice} onChange={(e) => updateNotice(idx, e.target.value)} disabled={saving} />
                        <Button type="button" variant="danger" onClick={() => setForm((p) => ({ ...p, notices: p.notices.filter((_, i) => i !== idx) }))} disabled={saving}>
                          Quitar
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">Ubicación y mapa</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Dirección
                    <input className={inputClass} value={form.location.address} onChange={(e) => setLocationField('address', e.target.value)} disabled={saving} />
                  </label>
                  <label className={labelClass}>
                    Referencias
                    <input className={inputClass} value={form.location.references} onChange={(e) => setLocationField('references', e.target.value)} disabled={saving} />
                  </label>
                  <label className={labelClass}>
                    URL mapa embebido
                    <input className={inputClass} value={form.location.mapEmbedUrl} onChange={(e) => setLocationField('mapEmbedUrl', e.target.value)} disabled={saving} />
                  </label>
                  <label className={labelClass}>
                    URL mapa externo
                    <input className={inputClass} value={form.location.mapExternalUrl} onChange={(e) => setLocationField('mapExternalUrl', e.target.value)} disabled={saving} />
                  </label>
                </div>
              </section>
            </>
          )}

          <div className="flex justify-end border-t border-slate-200/80 pt-4">
            <Button type="submit" disabled={loading || saving || !selectedSlug}>
              {saving ? 'Guardando…' : 'Guardar cambios del área'}
            </Button>
          </div>
          </form>
        ) : null}
      </AdminPageShell>
    </>
  )
}
