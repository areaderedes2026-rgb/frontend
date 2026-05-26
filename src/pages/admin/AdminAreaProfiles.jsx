import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminAreaEditorPreview } from '../../components/admin/AdminAreaEditorPreview.jsx'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { HeroImageModal } from '../../components/admin/HeroImageModal.jsx'
import { SingleImageUploadField } from '../../components/admin/SingleImageUploadField.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import {
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
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import {
  isServiceAuthoritySectionVisible,
  normalizeServiceAuthoritySection,
} from '../../utils/serviceAuthority.js'
import {
  isServiceGallerySectionVisible,
  normalizeServiceGallerySection,
} from '../../utils/serviceGallery.js'
import {
  isServiceContactSectionVisible,
  normalizeServiceContactSection,
} from '../../utils/serviceContacts.js'
import { normalizeServiceProjects } from '../../utils/serviceProjects.js'
import {
  fetchAreasPageContent,
  updateAreasPageContent,
} from '../../services/areasPageService.js'

const PAGE_SIZE = 8
const ACTION_BTN_BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
const ACTION_BTN_NEUTRAL = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`

function mapSchoolsToForm(profile) {
  const ss = profile.schoolsSection
  if (ss && Array.isArray(ss.items) && ss.items.length > 0) {
    return {
      navLabel: ss.navLabel || 'Escuelas',
      eyebrow: ss.eyebrow || '',
      title: ss.title || '',
      intro: ss.intro || '',
      items: ss.items.map((x) => ({
        id: String(x?.id || '').trim(),
        name: String(x?.name || '').trim(),
        discipline: String(x?.discipline || '').trim(),
        schedule: String(x?.schedule || '').trim(),
        venue: String(x?.venue || '').trim(),
        description: String(x?.description || '').trim(),
        imageUrl: String(x?.imageUrl || '').trim(),
      })),
    }
  }
  return {
    navLabel: 'Escuelas',
    eyebrow: '',
    title: '',
    intro: '',
    items: [],
  }
}

function buildSchoolsPayload(section) {
  if (!section || !Array.isArray(section.items)) return null
  const items = section.items
    .map((row) => ({
      id: String(row?.id || '').trim(),
      name: String(row?.name || '').trim(),
      discipline: String(row?.discipline || '').trim(),
      schedule: String(row?.schedule || '').trim(),
      venue: String(row?.venue || '').trim(),
      description: String(row?.description || '').trim(),
      imageUrl: String(row?.imageUrl || '').trim(),
    }))
    .filter((row) => row.name || row.description)
  if (!items.length) return null
  return {
    navLabel: String(section.navLabel || '').trim() || 'Escuelas',
    eyebrow: String(section.eyebrow || '').trim(),
    title: String(section.title || '').trim(),
    intro: String(section.intro || '').trim(),
    items,
  }
}

function mapServiceProjects(projects) {
  return normalizeServiceProjects(projects).map((project) => ({
    ...project,
    id: project.id || '',
  }))
}

function mapServiceToForm(service, idx = 0) {
  const rawOrder = service?.sortOrder
  return {
    id: String(service?.id || '').trim(),
    title: service?.title || '',
    description: service?.description || '',
    mode: service?.mode || '',
    imageUrl: String(service?.imageUrl || '').trim(),
    personInCharge: String(service?.personInCharge || '').trim(),
    generalObjective: String(service?.generalObjective || '').trim(),
    sortOrder:
      rawOrder == null || rawOrder === ''
        ? (idx + 1) * 10
        : Math.max(0, Math.round(Number(rawOrder)) || 0),
    projects: mapServiceProjects(service?.projects),
    contactSection: normalizeServiceContactSection(service?.contactSection),
    gallerySection: normalizeServiceGallerySection(service?.gallerySection),
    authoritySection: normalizeServiceAuthoritySection(service?.authoritySection),
  }
}

function buildServicesPayload(services) {
  return (Array.isArray(services) ? services : [])
    .map((service) => ({
      id: String(service?.id || '').trim(),
      title: String(service?.title || '').trim(),
      description: String(service?.description || '').trim(),
      mode: String(service?.mode || '').trim(),
      imageUrl: String(service?.imageUrl || '').trim(),
      personInCharge: String(service?.personInCharge || '').trim(),
      generalObjective: String(service?.generalObjective || '').trim(),
      sortOrder: Math.max(0, Math.round(Number(service?.sortOrder)) || 0),
      projects: normalizeServiceProjects(service?.projects),
      contactSection: normalizeServiceContactSection(service?.contactSection),
      gallerySection: normalizeServiceGallerySection(service?.gallerySection),
      authoritySection: normalizeServiceAuthoritySection(service?.authoritySection),
    }))
    .filter((service) =>
      Boolean(
        service.id ||
          service.title ||
          service.description ||
          service.mode ||
          service.imageUrl ||
          service.personInCharge ||
          service.generalObjective ||
          service.projects.length ||
          isServiceContactSectionVisible(service.contactSection) ||
          isServiceGallerySectionVisible(service.gallerySection) ||
          isServiceAuthoritySectionVisible(service.authoritySection),
      ),
    )
}

function mapProfileToForm(profile) {
  return {
    heroTag: profile.heroTag || '',
    mission: profile.mission || '',
    director: {
      name: profile.director?.name || '',
      role: profile.director?.role || '',
      bio: profile.director?.bio || '',
      photoUrl: profile.director?.photoUrl || '',
    },
    serviceBlocks: Array.isArray(profile.serviceBlocks)
      ? profile.serviceBlocks.map(mapServiceToForm)
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
    schoolsSection: mapSchoolsToForm(profile),
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

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function AreaThumb({ src, size = 'md' }) {
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
  const sorted = [...set].sort((a, b) => a - b)
  const out = []
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push({ type: 'gap' })
    out.push({ type: 'page', n: sorted[i] })
  }
  return { items: out, totalPages }
}

export function AdminAreaProfiles() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [areas, setAreas] = useState(
    MUNICIPAL_AREAS.map((a, i) => ({ ...a, id: i + 1, sortOrder: (i + 1) * 10 })),
  )
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
  const [conflictOpen, setConflictOpen] = useState(false)
  const dismissToast = useCallback(() => setToast(null), [])

  const [newArea, setNewArea] = useState({
    title: '',
    slug: '',
    description: '',
    coverImage: '',
    sortOrder: '',
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
    sortOrder: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [catalogSort, setCatalogSort] = useState('priority')
  const [page, setPage] = useState(1)
  const [globalCover, setGlobalCover] = useState('')
  const [globalCoverOpen, setGlobalCoverOpen] = useState(false)
  const [savingGlobalCover, setSavingGlobalCover] = useState(false)
  const [profileUpdatedAt, setProfileUpdatedAt] = useState(null)
  const [areasPageUpdatedAt, setAreasPageUpdatedAt] = useState(null)

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
  const filteredAreas = useMemo(() => {
    const q = normalize(searchQuery.trim())
    if (!q) return areas
    return areas.filter((area) =>
      normalize(`${area.title || ''} ${area.slug || ''} ${area.description || ''}`).includes(q),
    )
  }, [areas, searchQuery])
  const catalogOrderedAreas = useMemo(() => {
    const copy = [...filteredAreas]
    if (catalogSort === 'alpha') {
      copy.sort((a, b) =>
        String(a.title || '').localeCompare(String(b.title || ''), 'es', {
          sensitivity: 'base',
        }),
      )
      return copy
    }
    copy.sort((a, b) => {
      const oa = Number(a.sortOrder) || 0
      const ob = Number(b.sortOrder) || 0
      if (oa !== ob) return oa - ob
      return String(a.title || '').localeCompare(String(b.title || ''), 'es', {
        sensitivity: 'base',
      })
    })
    return copy
  }, [filteredAreas, catalogSort])
  const totalPages = Math.max(1, Math.ceil(catalogOrderedAreas.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const paginatedAreas = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return catalogOrderedAreas.slice(start, start + PAGE_SIZE)
  }, [catalogOrderedAreas, safePage])
  const rangeStart = (safePage - 1) * PAGE_SIZE
  const rangeEnd =
    catalogOrderedAreas.length === 0
      ? 0
      : Math.min(rangeStart + paginatedAreas.length, catalogOrderedAreas.length)
  const pagModel = paginationModel(safePage, totalPages)
  const catalogFiltersActive =
    searchQuery.trim() !== '' || catalogSort !== 'priority'

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
        if (!cancelled) {
          setGlobalCover(String(content?.heroImageUrl || ''))
          setAreasPageUpdatedAt(content?.updatedAt || null)
        }
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
          if (remote) {
            merged = mergeAreaProfile(base, remote)
            if (!cancelled) setProfileUpdatedAt(remote.updatedAt || null)
          } else if (!cancelled) {
            setProfileUpdatedAt(null)
          }
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
      sortOrder: Number(selectedArea?.sortOrder) || 0,
    })
  }, [selectedArea])

  async function handleSubmit(e) {
    e?.preventDefault?.()
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
        expectedUpdatedAt: selectedArea.updatedAt || null,
        title: areaMeta.title.trim(),
        slug: areaMeta.slug.trim(),
        description: areaMeta.description.trim(),
        coverImage: areaMeta.coverImage.trim(),
        sortOrder: Math.max(0, Math.round(Number(areaMeta.sortOrder)) || 0),
      })
      const payload = {
        expectedUpdatedAt: profileUpdatedAt,
        heroTag: form.heroTag.trim(),
        mission: form.mission.trim(),
        director: {
          name: form.director.name.trim(),
          role: form.director.role.trim(),
          bio: form.director.bio.trim(),
          photoUrl: form.director.photoUrl.trim(),
          email: '',
          phone: '',
          officeHours: '',
        },
        serviceBlocks: buildServicesPayload(form.serviceBlocks),
        initiatives: [],
        contactCards: cleanRows(form.contactCards, ['label', 'value', 'note']),
        notices: cleanNotices(form.notices),
        location: {
          address: form.location.address.trim(),
          references: form.location.references.trim(),
          mapEmbedUrl: form.location.mapEmbedUrl.trim(),
          mapExternalUrl: form.location.mapExternalUrl.trim(),
        },
        schoolsSection: buildSchoolsPayload(form.schoolsSection),
      }
      const profileSlug = updatedArea?.slug || selectedSlug
      const saved = await updateAreaProfile(profileSlug, payload)
      setProfileUpdatedAt(saved?.updatedAt || null)
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
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
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
      const maxOrder = areas.reduce(
        (m, a) => Math.max(m, Number(a.sortOrder) || 0),
        0,
      )
      const rawOrder = String(newArea.sortOrder || '').trim()
      const sortOrder =
        rawOrder === ''
          ? maxOrder + 10
          : Math.max(0, Math.round(Number(rawOrder)) || 0)
      const created = await createArea({
        title: newArea.title.trim(),
        description: newArea.description.trim(),
        slug: newArea.slug.trim() || undefined,
        coverImage: newArea.coverImage.trim() || undefined,
        sortOrder,
      })
      await loadAreas()
      if (created?.slug) setSelectedSlug(created.slug)
      if (created?.slug) setTab('edit')
      setNewArea({ title: '', slug: '', description: '', coverImage: '', sortOrder: '' })
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
      const saved = await updateAreasPageContent({
        heroImageUrl: globalCover.trim(),
        expectedUpdatedAt: areasPageUpdatedAt,
      })
      setGlobalCover(String(saved?.heroImageUrl || ''))
      setAreasPageUpdatedAt(saved?.updatedAt || null)
      setGlobalCoverOpen(false)
      setToast({
        type: 'success',
        message: 'Portada global de Áreas actualizada.',
      })
    } catch (e) {
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
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
      <HeroImageModal
        open={globalCoverOpen}
        title="Portada de Áreas"
        description="Esta imagen se muestra en el header público de “Todas las áreas” y no depende de ninguna tarjeta individual."
        value={globalCover}
        onChange={setGlobalCover}
        onClose={() => setGlobalCoverOpen(false)}
        onSave={handleSaveGlobalCover}
        saving={savingGlobalCover}
        disabled={!isApiConfigured()}
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
          <label className={labelClass}>
            Prioridad
            <input
              type="number"
              min={0}
              step={1}
              className={inputClass}
              value={newArea.sortOrder}
              onChange={(e) =>
                setNewArea((prev) => ({ ...prev, sortOrder: e.target.value }))
              }
              disabled={creatingArea || areasLoading}
              placeholder="Automático"
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Menor número = primero en el portal. Vacío = siguiente libre.
            </span>
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
          <div className="sm:col-span-2 flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              disabled={creatingArea}
              className={ACTION_BTN_NEUTRAL}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creatingArea || areasLoading}
              className={ACTION_BTN_PRIMARY}
            >
              {creatingArea ? 'Creando…' : 'Crear área'}
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
              onClick={() => setGlobalCoverOpen(true)}
              className={ACTION_BTN_NEUTRAL}
            >
              Cambiar portada
            </button>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              disabled={!isApiConfigured()}
              className={ACTION_BTN_PRIMARY}
            >
              + Crear área
            </button>
          </div>
        }
      >
        <h1 className="sr-only">Perfiles de áreas</h1>
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
          <section className="admin-fade-up space-y-5">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
              <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
                <label className={`${labelClass} sm:col-span-5`}>
                  Buscar
                  <input
                    type="search"
                    className={inputClass}
                    placeholder="Nombre, slug o descripción..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setPage(1)
                    }}
                    disabled={areasLoading}
                    autoComplete="off"
                  />
                </label>
                <div className="sm:col-span-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Orden del listado
                  </p>
                  <div className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-50/90 p-0.5 shadow-inner">
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogSort('priority')
                        setPage(1)
                      }}
                      className={`min-h-10 flex-1 rounded-[10px] px-3 text-xs font-semibold transition sm:text-sm ${
                        catalogSort === 'priority'
                          ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      aria-pressed={catalogSort === 'priority'}
                    >
                      Prioridad
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogSort('alpha')
                        setPage(1)
                      }}
                      className={`min-h-10 flex-1 rounded-[10px] px-3 text-xs font-semibold transition sm:text-sm ${
                        catalogSort === 'alpha'
                          ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      aria-pressed={catalogSort === 'alpha'}
                    >
                      A–Z
                    </button>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <button
                    type="button"
                    onClick={() => setGlobalCoverOpen(true)}
                    className={`${ACTION_BTN_NEUTRAL} w-full`}
                  >
                    Cambiar portada
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <p className="tabular-nums leading-relaxed">
                  {searchQuery.trim() ? (
                    <>
                      <span className="font-semibold text-slate-900">
                        {filteredAreas.length}
                      </span>{' '}
                      de{' '}
                      <span className="font-semibold text-slate-900">
                        {areas.length}
                      </span>{' '}
                      coinciden con el texto.
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-slate-900">
                        {areas.length}
                      </span>{' '}
                      áreas en el catálogo.
                    </>
                  )}{' '}
                  <span className="text-slate-500">
                    {catalogSort === 'alpha'
                      ? 'Orden alfabético en la tabla.'
                      : 'Orden por prioridad (predeterminado).'}
                  </span>
                </p>
                {catalogFiltersActive ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setCatalogSort('priority')
                      setPage(1)
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Restablecer filtros
                  </button>
                ) : null}
              </div>
            </div>

            {catalogError ? (
              <div
                className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 shadow-sm"
                role="alert"
              >
                <p className="font-semibold">No se pudo cargar el catálogo de áreas.</p>
                <p className="mt-1 text-red-700/90">{catalogError}</p>
                <button
                  type="button"
                  onClick={() => void loadAreas()}
                  className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50"
                >
                  <span aria-hidden>↻</span>
                  Reintentar
                </button>
              </div>
            ) : null}

            {areasLoading ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              </div>
            ) : areas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
                <p className="text-base font-medium text-slate-800">
                  Todavía no hay áreas cargadas.
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                  Creá la primera para que aparezca en el portal público.
                </p>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  disabled={!isApiConfigured()}
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Crear área
                </button>
              </div>
            ) : filteredAreas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-200/90 bg-amber-50/50 px-6 py-12 text-center">
                <p className="text-base font-medium text-slate-800">
                  No hay áreas que coincidan con la búsqueda.
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                  Probá otro término o limpiá la búsqueda para ver todo el catálogo.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setCatalogSort('priority')
                    setPage(1)
                  }}
                  className="mt-5 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-sky-200 hover:bg-sky-50"
                >
                  Restablecer búsqueda
                </button>
              </div>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <th className="w-20 px-4 py-3.5" scope="col">
                          <span className="sr-only">Portada</span>
                        </th>
                        <th className="w-24 px-3 py-3.5 text-right font-mono normal-case tracking-normal">
                          Prioridad
                        </th>
                        <th className="min-w-0 px-3 py-3.5">Área</th>
                        <th className="w-56 px-4 py-3.5">Slug</th>
                        <th className="min-w-0 px-4 py-3.5">Descripción</th>
                        <th className="w-44 px-4 py-3.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAreas.map((area) => (
                        <tr
                          key={area.slug}
                          className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/90"
                        >
                          <td className="px-4 py-3 align-middle">
                            <AreaThumb src={area.coverImage} />
                          </td>
                          <td className="px-3 py-3 text-right align-middle font-mono text-xs font-semibold tabular-nums text-slate-700">
                            {Number(area.sortOrder) || 0}
                          </td>
                          <td className="min-w-0 px-3 py-3 align-middle">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSlug(area.slug)
                                setTab('edit')
                              }}
                              className="line-clamp-2 text-left font-semibold text-slate-900 transition hover:text-sky-800"
                            >
                              {area.title || 'Sin título'}
                            </button>
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <span className="rounded-lg bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600 ring-1 ring-slate-200">
                              {area.slug || 'sin-slug'}
                            </span>
                          </td>
                          <td className="max-w-lg px-4 py-3 align-middle text-slate-600">
                            <p className="line-clamp-2">{area.description || 'Sin descripción.'}</p>
                          </td>
                          <td className="px-4 py-3 text-right align-middle">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSlug(area.slug)
                                  setTab('edit')
                                }}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(area)}
                                disabled={
                                  creatingArea ||
                                  Boolean(deletingAreaId) ||
                                  areasLoading ||
                                  !isApiConfigured()
                                }
                                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {deletingAreaId === area.id ? 'Eliminando…' : 'Eliminar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ul className="space-y-3 lg:hidden">
                  {paginatedAreas.map((area) => (
                    <li
                      key={area.slug}
                      className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                    >
                      <div className="shrink-0 pt-0.5">
                        <AreaThumb src={area.coverImage} size="sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSlug(area.slug)
                            setTab('edit')
                          }}
                          className="line-clamp-2 text-left text-base font-semibold text-slate-900 hover:text-sky-800"
                        >
                          {area.title || 'Sin título'}
                        </button>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-slate-500">
                          <span>{area.slug || 'sin-slug'}</span>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 ring-1 ring-slate-200/80">
                            P. {Number(area.sortOrder) || 0}
                          </span>
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                          {area.description || 'Sin descripción.'}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSlug(area.slug)
                              setTab('edit')
                            }}
                            className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-sky-200 hover:bg-sky-50/50 hover:text-sky-900 sm:flex-none"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(area)}
                            disabled={
                              creatingArea ||
                              Boolean(deletingAreaId) ||
                              areasLoading ||
                              !isApiConfigured()
                            }
                            className="inline-flex flex-1 items-center justify-center rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                          >
                            {deletingAreaId === area.id ? 'Eliminando…' : 'Eliminar'}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <nav
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  aria-label="Paginación del catálogo de áreas"
                >
                  <p className="text-center text-sm leading-relaxed text-slate-600 sm:text-left">
                    Mostrando{' '}
                    <span className="font-semibold tabular-nums text-slate-900">
                      {rangeStart + 1}
                    </span>
                    –
                    <span className="font-semibold tabular-nums text-slate-900">
                      {rangeEnd}
                    </span>{' '}
                    de{' '}
                    <span className="font-semibold tabular-nums text-slate-900">
                      {catalogOrderedAreas.length}
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
          </section>
        ) : null}

        {activeTab === 'edit' ? (
          <AdminAreaEditorPreview
            selectedArea={selectedArea}
            selectedSlug={selectedSlug}
            setSelectedSlug={setSelectedSlug}
            areas={areas}
            areasLoading={areasLoading}
            loading={loading}
            saving={saving}
            error={error}
            form={form}
            setForm={setForm}
            areaMeta={areaMeta}
            setAreaMeta={setAreaMeta}
            onSubmit={() => void handleSubmit()}
            onBackToCatalog={() => setTab('catalog')}
            apiAvailable={isApiConfigured()}
            canManageServicePriority={user?.role === 'admin'}
          />
        ) : null}
      </AdminPageShell>
    </>
  )
}
