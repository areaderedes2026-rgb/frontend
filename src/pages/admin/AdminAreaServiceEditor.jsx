import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { ServiceEditorWorkspace } from '../../components/admin/ServiceEditorWorkspace.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { formErrorClass } from '../../components/ui/formStyles.js'
import {
  fetchAreaProfileService,
  updateAreaProfileService,
} from '../../services/areaProfilesService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'
import {
  isServiceAuthoritySectionVisible,
  normalizeServiceAuthoritySection,
} from '../../utils/serviceAuthority.js'
import {
  isServiceContactSectionVisible,
  normalizeServiceContactSection,
} from '../../utils/serviceContacts.js'
import {
  isServiceGallerySectionVisible,
  normalizeServiceGallerySection,
} from '../../utils/serviceGallery.js'
import { normalizeServiceProjects } from '../../utils/serviceProjects.js'

const EMPTY_SERVICE = {
  id: '',
  title: '',
  description: '',
  mode: '',
  imageUrl: '',
  personInCharge: '',
  generalObjective: '',
  projects: [],
  contactSection: { enabled: false, title: 'Contacto', items: [] },
  gallerySection: { enabled: false, title: 'Galería de fotos', images: [] },
  authoritySection: { enabled: false, title: 'Autoridades a cargo', intro: '', people: [] },
}

function snapshot(service) {
  return JSON.stringify({
    title: service.title || '',
    description: service.description || '',
    mode: service.mode || '',
    imageUrl: service.imageUrl || '',
    personInCharge: service.personInCharge || '',
    generalObjective: service.generalObjective || '',
    projects: normalizeServiceProjects(service.projects),
    contactSection: normalizeServiceContactSection(service.contactSection),
    gallerySection: normalizeServiceGallerySection(service.gallerySection),
    authoritySection: normalizeServiceAuthoritySection(service.authoritySection),
  })
}

function StatusPill({ label, active }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${
        active
          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
          : 'bg-slate-100 text-slate-500 ring-slate-200'
      }`}
    >
      {label}
    </span>
  )
}

export function AdminAreaServiceEditor() {
  const { areaSlug, serviceId } = useParams()
  const [area, setArea] = useState(null)
  const [service, setService] = useState(EMPTY_SERVICE)
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot(EMPTY_SERVICE))
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(() => isApiConfigured())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState(null)

  const hasChanges = useMemo(
    () => snapshot(service) !== savedSnapshot,
    [savedSnapshot, service],
  )

  useEffect(() => {
    if (!isApiConfigured()) {
      return
    }
    let cancelled = false
    setError('')
    fetchAreaProfileService(areaSlug, serviceId)
      .then((data) => {
        if (cancelled) return
        const next = {
          ...EMPTY_SERVICE,
          ...(data?.service || {}),
          projects: normalizeServiceProjects(data?.service?.projects),
          contactSection: normalizeServiceContactSection(data?.service?.contactSection),
          gallerySection: normalizeServiceGallerySection(data?.service?.gallerySection),
          authoritySection: normalizeServiceAuthoritySection(data?.service?.authoritySection),
        }
        setArea(data?.area || null)
        setService(next)
        setSavedSnapshot(snapshot(next))
        setExpectedUpdatedAt(data?.updatedAt || null)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'No se pudo cargar el servicio.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [areaSlug, serviceId])

  function updateField(field, value) {
    setService((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    setFormError('')
    if (!service.title.trim()) {
      setFormError('El título del servicio es obligatorio.')
      return
    }
    setSaving(true)
    try {
      const data = await updateAreaProfileService(areaSlug, serviceId, {
        expectedUpdatedAt,
        service: {
          ...service,
          projects: normalizeServiceProjects(service.projects),
          contactSection: normalizeServiceContactSection(service.contactSection),
          gallerySection: normalizeServiceGallerySection(service.gallerySection),
          authoritySection: normalizeServiceAuthoritySection(service.authoritySection),
        },
      })
      const next = {
        ...EMPTY_SERVICE,
        ...(data?.service || {}),
        projects: normalizeServiceProjects(data?.service?.projects),
        contactSection: normalizeServiceContactSection(data?.service?.contactSection),
        gallerySection: normalizeServiceGallerySection(data?.service?.gallerySection),
        authoritySection: normalizeServiceAuthoritySection(data?.service?.authoritySection),
      }
      setArea(data?.area || area)
      setService(next)
      setSavedSnapshot(snapshot(next))
      setExpectedUpdatedAt(data?.updatedAt || null)
      setToast({ type: 'success', message: 'Servicio guardado correctamente.' })
    } catch (e) {
      const message = isConcurrencyConflictError(e)
        ? 'El servicio fue modificado por otra persona. Recargá y volvé a intentar.'
        : e.message || 'No se pudo guardar el servicio.'
      setToast({ type: 'error', message })
    } finally {
      setSaving(false)
    }
  }

  const projectCount = normalizeServiceProjects(service.projects).length

  return (
    <AdminPageShell
      eyebrow="Editor de servicio"
      title={service.title || 'Servicio de área'}
      subtitle={
        area?.title
          ? `${area.title} · Editá el contenido por pestañas y guardá cuando termines.`
          : 'Editá el servicio asignado por pestañas.'
      }
      showBackLink={false}
      maxWidthClass="max-w-[min(96vw,88rem)]"
      variant="plain"
      contentClassName="!mt-4"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/my-area-services"
            className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Mis servicios
          </Link>
          <StatusPill
            label={`${projectCount} proyecto${projectCount === 1 ? '' : 's'}`}
            active={projectCount > 0}
          />
          <StatusPill label="Contactos" active={isServiceContactSectionVisible(service.contactSection)} />
          <StatusPill label="Galería" active={isServiceGallerySectionVisible(service.gallerySection)} />
          <StatusPill
            label="Autoridades"
            active={isServiceAuthoritySectionVisible(service.authoritySection)}
          />
        </div>
      }
    >
      {toast ? (
        <Toast variant={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Cargando servicio...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          {error}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="sticky top-[calc(var(--navbar-h,4rem)+0.5rem)] z-20 flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-md backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {service.title || 'Sin título'}
              </p>
              <p className="text-xs text-slate-500">
                {hasChanges ? (
                  <span className="font-semibold text-amber-800">Cambios sin guardar</span>
                ) : (
                  'Todo guardado'
                )}
              </p>
            </div>
            <Button type="submit" disabled={saving || !hasChanges} className="shrink-0">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            {formError ? (
              <p className={`${formErrorClass} mb-4`} role="alert">
                {formError}
              </p>
            ) : null}
            <ServiceEditorWorkspace
              draft={service}
              setDraftField={updateField}
              saving={saving}
              canManageServicePriority={false}
              projectImageKind="cover"
            />
          </div>
        </form>
      )}
    </AdminPageShell>
  )
}
