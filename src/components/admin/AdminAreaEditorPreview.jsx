import { useMemo, useState } from 'react'
import { Modal } from '../ui/Modal.jsx'
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx'
import { AdminAreaOfficesPanel } from './AdminAreaOfficesPanel.jsx'
import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { ServiceContactsEditor } from './ServiceContactsEditor.jsx'
import { ServiceProjectsEditor } from './ServiceProjectsEditor.jsx'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { normalizeServiceProjects } from '../../utils/serviceProjects.js'
import {
  isServiceContactSectionVisible,
  normalizeServiceContactSection,
} from '../../utils/serviceContacts.js'

function newClientServiceId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `srv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const ACTION_BTN_BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
const ACTION_BTN_NEUTRAL = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`

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

function PencilIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487 18.549 2.799a2.121 2.121 0 1 1 3 3L19.862 7.487m-3-3L6.34 14.99a4.5 4.5 0 0 0-1.113 1.81L4.5 19.5l2.7-.727a4.5 4.5 0 0 0 1.81-1.113l10.49-10.49m-3-3L19.5 7.5"
      />
    </svg>
  )
}

function PlusIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function TrashIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  )
}

function EditChip({ label = 'Editar', onClick, disabled = false, tone = 'neutral' }) {
  const base =
    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60'
  const styles =
    tone === 'primary'
      ? 'border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-300 hover:bg-sky-100'
      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900'
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      <PencilIcon />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden sr-only">{label}</span>
    </button>
  )
}

function AddChip({ label = 'Agregar', onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <PlusIcon />
      <span>{label}</span>
    </button>
  )
}

function DeleteChip({ label = 'Eliminar', onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <TrashIcon />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden sr-only">{label}</span>
    </button>
  )
}

const EMPTY_SERVICE = {
  id: '',
  title: '',
  mode: '',
  description: '',
  imageUrl: '',
  personInCharge: '',
  generalObjective: '',
  sortOrder: 0,
  projects: [],
  contactSection: { enabled: false, title: 'Contacto', items: [] },
}
const EMPTY_CONTACT = { label: '', value: '', note: '' }
const EMPTY_SCHOOL = {
  id: '',
  name: '',
  discipline: '',
  schedule: '',
  venue: '',
  description: '',
  imageUrl: '',
}

function SectionCard({
  id,
  title,
  description,
  rightSlot,
  children,
  className = '',
  variant = 'card',
}) {
  const base =
    variant === 'plain'
      ? ''
      : 'rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-7'
  return (
    <section id={id} className={`scroll-mt-32 ${base} ${className}`.trim()}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          ) : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function EmptyHint({ children, onAdd, addLabel = 'Agregar' }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
      <p className="text-sm text-slate-600">{children}</p>
      {onAdd ? (
        <div className="mt-4 inline-flex">
          <AddChip label={addLabel} onClick={onAdd} />
        </div>
      ) : null}
    </div>
  )
}

export function AdminAreaEditorPreview({
  selectedArea,
  selectedSlug,
  setSelectedSlug,
  areas,
  areasLoading,
  loading,
  saving,
  error,
  form,
  setForm,
  areaMeta,
  setAreaMeta,
  onSubmit,
  onBackToCatalog,
  apiAvailable,
  canManageServicePriority = false,
}) {
  const [editor, setEditor] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null)

  function openEditor(kind, index = null, draft = null) {
    setEditor({ kind, index, draft })
  }
  function closeEditor() {
    if (saving) return
    setEditor(null)
  }
  function setDraftField(field, value) {
    setEditor((prev) =>
      prev ? { ...prev, draft: { ...(prev.draft || {}), [field]: value } } : prev,
    )
  }

  function nextServicePriority() {
    const list = Array.isArray(form.serviceBlocks) ? form.serviceBlocks : []
    const maxOrder = list.reduce(
      (max, service) => Math.max(max, Math.max(0, Math.round(Number(service?.sortOrder)) || 0)),
      0,
    )
    return maxOrder + 10
  }

  function applyIdentity(draft) {
    setAreaMeta({
      title: String(draft.title || '').trim(),
      slug: String(draft.slug || '').trim(),
      description: String(draft.description || '').trim(),
      coverImage: String(draft.coverImage || '').trim(),
      sortOrder: Math.max(0, Math.round(Number(draft.sortOrder)) || 0),
    })
    setForm((prev) => ({
      ...prev,
      heroTag: String(draft.heroTag || '').trim(),
      mission: String(draft.mission || '').trim(),
    }))
  }

  function applyDirector(draft) {
    setForm((prev) => ({
      ...prev,
      director: {
        name: String(draft.name || '').trim(),
        role: String(draft.role || '').trim(),
        bio: String(draft.bio || '').trim(),
        photoUrl: String(draft.photoUrl || '').trim(),
        email: '',
        phone: '',
        officeHours: '',
      },
    }))
  }

  function upsertListItem(key, index, draft) {
    setForm((prev) => {
      const list = Array.isArray(prev[key]) ? [...prev[key]] : []
      if (index === null || index === undefined) {
        list.push(draft)
      } else {
        list[index] = { ...list[index], ...draft }
      }
      return { ...prev, [key]: list }
    })
  }

  function removeListItem(key, index) {
    setForm((prev) => {
      const list = Array.isArray(prev[key]) ? [...prev[key]] : []
      list.splice(index, 1)
      return { ...prev, [key]: list }
    })
  }

  function applyLocation(draft) {
    setForm((prev) => ({
      ...prev,
      location: {
        address: String(draft.address || '').trim(),
        references: String(draft.references || '').trim(),
        mapEmbedUrl: String(draft.mapEmbedUrl || '').trim(),
        mapExternalUrl: String(draft.mapExternalUrl || '').trim(),
      },
    }))
  }

  function applySchoolsSection(draft) {
    setForm((prev) => ({
      ...prev,
      schoolsSection: {
        ...(prev.schoolsSection || {}),
        navLabel: String(draft.navLabel || 'Escuelas').trim(),
        eyebrow: String(draft.eyebrow || '').trim(),
        title: String(draft.title || '').trim(),
        intro: String(draft.intro || '').trim(),
      },
    }))
  }

  function upsertSchoolItem(index, draft) {
    setForm((prev) => {
      const items = Array.isArray(prev.schoolsSection?.items)
        ? [...prev.schoolsSection.items]
        : []
      if (index === null || index === undefined) {
        items.push(draft)
      } else {
        items[index] = { ...items[index], ...draft }
      }
      return {
        ...prev,
        schoolsSection: {
          ...(prev.schoolsSection || {
            navLabel: 'Escuelas',
            eyebrow: '',
            title: '',
            intro: '',
          }),
          items,
        },
      }
    })
  }

  function removeSchoolItem(index) {
    setForm((prev) => {
      const items = Array.isArray(prev.schoolsSection?.items)
        ? [...prev.schoolsSection.items]
        : []
      items.splice(index, 1)
      return {
        ...prev,
        schoolsSection: {
          ...(prev.schoolsSection || {
            navLabel: 'Escuelas',
            eyebrow: '',
            title: '',
            intro: '',
          }),
          items,
        },
      }
    })
  }

  function handleSaveEditor() {
    if (!editor) return
    const draft = editor.draft || {}
    switch (editor.kind) {
      case 'identity':
        applyIdentity(draft)
        break
      case 'director':
        applyDirector(draft)
        break
      case 'service': {
        const id = String(draft.id || '').trim() || newClientServiceId()
        upsertListItem('serviceBlocks', editor.index, {
          id,
          title: String(draft.title || '').trim(),
          mode: String(draft.mode || '').trim(),
          description: String(draft.description || '').trim(),
          imageUrl: String(draft.imageUrl || '').trim(),
          personInCharge: String(draft.personInCharge || '').trim(),
          generalObjective: String(draft.generalObjective || '').trim(),
          sortOrder: Math.max(0, Math.round(Number(draft.sortOrder)) || 0),
          projects: normalizeServiceProjects(draft.projects),
          contactSection: normalizeServiceContactSection(draft.contactSection),
        })
        break
      }
      case 'contact':
        upsertListItem('contactCards', editor.index, {
          label: String(draft.label || '').trim(),
          value: String(draft.value || '').trim(),
          note: String(draft.note || '').trim(),
        })
        break
      case 'notice':
        upsertListItem('notices', editor.index, String(draft.value || '').trim())
        break
      case 'location':
        applyLocation(draft)
        break
      case 'schools-section':
        applySchoolsSection(draft)
        break
      case 'school':
        upsertSchoolItem(editor.index, {
          id: String(draft.id || '').trim(),
          name: String(draft.name || '').trim(),
          discipline: String(draft.discipline || '').trim(),
          schedule: String(draft.schedule || '').trim(),
          venue: String(draft.venue || '').trim(),
          description: String(draft.description || '').trim(),
          imageUrl: String(draft.imageUrl || '').trim(),
        })
        break
      default:
        break
    }
    setEditor(null)
  }

  function handleConfirmRemove() {
    if (!confirmRemove) return
    const { kind, index } = confirmRemove
    if (kind === 'service') removeListItem('serviceBlocks', index)
    else if (kind === 'contact') removeListItem('contactCards', index)
    else if (kind === 'notice') removeListItem('notices', index)
    else if (kind === 'school') removeSchoolItem(index)
    setConfirmRemove(null)
  }

  const navLinks = useMemo(() => {
    const arr = [
      ['#director-area', 'Dirección'],
      ['#oficinas-admin-area', 'Oficinas'],
      ['#servicios-area', 'Servicios'],
    ]
    if ((form.schoolsSection?.items || []).length > 0)
      arr.push(['#escuelas-area', form.schoolsSection?.navLabel || 'Escuelas'])
    arr.push(['#contactos-area', 'Contactos'])
    if ((form.notices || []).length > 0) arr.push(['#avisos-area', 'Avisos'])
    arr.push(['#ubicacion-area', 'Ubicación'])
    return arr
  }, [form.schoolsSection?.items, form.schoolsSection?.navLabel, form.notices])

  const editorTitle = useMemo(() => {
    if (!editor) return ''
    const labels = {
      identity: 'Editar identidad del área',
      director: 'Editar dirección del área',
      service: editor.index === null ? 'Nuevo servicio' : 'Editar servicio',
      contact: editor.index === null ? 'Nuevo contacto' : 'Editar contacto',
      notice: editor.index === null ? 'Nuevo aviso' : 'Editar aviso',
      location: 'Editar ubicación',
      'schools-section': 'Editar textos de la sección Escuelas',
      school: editor.index === null ? 'Nueva escuela o taller' : 'Editar escuela o taller',
    }
    return labels[editor.kind] || 'Editar'
  }, [editor])

  if (!apiAvailable) {
    return (
      <div className="admin-fade-up rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        Esta sección requiere conexión activa con el backend para guardar cambios.
        Configurá <code className="font-mono">VITE_API_URL</code> en el frontend para continuar.
      </div>
    )
  }

  if (!selectedSlug) {
    return (
      <div className="admin-fade-up rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
        <p className="text-base font-medium text-slate-800">Elegí un área para editar.</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          Volvé al catálogo y tocá «Editar» en la fila del área que querés modificar.
        </p>
        <button
          type="button"
          onClick={onBackToCatalog}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
        >
          Ir al catálogo
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin-fade-up overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="h-56 animate-pulse bg-slate-100" />
        <div className="space-y-4 p-6">
          <div className="h-5 w-1/3 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
          <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    )
  }

  const draft = editor?.draft || {}
  const heroCoverUrl = areaMeta.coverImage ? resolveMediaUrl(areaMeta.coverImage) : ''
  const directorPhotoUrl = form.director?.photoUrl
    ? resolveMediaUrl(form.director.photoUrl)
    : ''

  return (
    <>
      <ConfirmDialog
        open={confirmRemove != null}
        onClose={() => {
          if (!saving) setConfirmRemove(null)
        }}
        title={confirmRemove?.title || '¿Quitar elemento?'}
        description={confirmRemove?.description || 'Esta acción no se puede deshacer.'}
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        loading={false}
        onConfirm={handleConfirmRemove}
        variant="danger"
      />

      <Modal
        open={editor != null}
        onClose={closeEditor}
        loading={saving}
        size={
          editor?.kind === 'school' || editor?.kind === 'identity' || editor?.kind === 'service'
            ? 'wide'
            : 'default'
        }
        title={editorTitle}
        description="Los cambios quedarán pendientes hasta que toques «Guardar cambios» en el pie de la página."
      >
        <EditorBody
          editor={editor}
          draft={draft}
          setDraftField={setDraftField}
          saving={saving}
          canManageServicePriority={canManageServicePriority}
        />
        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeEditor}
            disabled={saving}
            className={ACTION_BTN_NEUTRAL}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveEditor}
            disabled={saving}
            className={ACTION_BTN_PRIMARY}
          >
            Aplicar al borrador
          </button>
        </div>
      </Modal>

      <div className="admin-fade-up space-y-5">
        {/* Toolbar superior */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBackToCatalog}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900"
            >
              <span aria-hidden>←</span>
              Catálogo
            </button>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              Área
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                disabled={loading || saving || areasLoading}
                className="news-select-minimal min-w-44"
              >
                {areas.map((area) => (
                  <option key={area.slug} value={area.slug}>
                    {area.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-xs text-slate-500">
            Tocá el lápiz de cada sección para editar.{' '}
            <span className="hidden sm:inline">
              Los cambios quedan en borrador hasta «Guardar cambios».
            </span>
          </p>
        </div>

        {error ? (
          <p
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {/* Vista previa */}
        <article className="overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
          {/* Hero */}
          <header className="relative overflow-hidden">
            {heroCoverUrl ? (
              <img
                src={heroCoverUrl}
                alt=""
                className="h-56 w-full object-cover sm:h-64 lg:h-72"
              />
            ) : (
              <div className="flex h-56 w-full items-center justify-center bg-linear-to-br from-slate-700 to-slate-900 text-sm text-slate-300 sm:h-64 lg:h-72">
                Sin imagen de portada
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/45 to-slate-900/10" />
            <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
              <button
                type="button"
                onClick={() =>
                  openEditor('identity', null, {
                    title: areaMeta.title,
                    slug: areaMeta.slug,
                    description: areaMeta.description,
                    coverImage: areaMeta.coverImage,
                    sortOrder: Number(areaMeta.sortOrder) || 0,
                    heroTag: form.heroTag || '',
                    mission: form.mission || '',
                  })
                }
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#171b22] shadow-sm ring-1 ring-slate-900/10 backdrop-blur transition hover:bg-white"
              >
                <PencilIcon />
                Editar identidad
              </button>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
              {form.heroTag ? (
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
                  {form.heroTag}
                </p>
              ) : null}
              <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {areaMeta.title || 'Sin título'}
              </h1>
              {form.mission ? (
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-100 sm:text-base">
                  {form.mission}
                </p>
              ) : (
                <p className="mt-3 max-w-3xl text-sm italic text-slate-300/90">
                  (Sin texto de misión cargado)
                </p>
              )}
            </div>
          </header>

          <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-12 lg:gap-10 lg:p-10">
            {/* Aside con navegación de la previsualización */}
            <aside className="lg:col-span-4 lg:sticky lg:top-[calc(var(--navbar-h)+1rem)] lg:self-start">
              <div className="rounded-2xl border border-[#ddd7ca] bg-[#f8f7f3] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                  Navegación de contenido
                </p>
                <ul className="mt-4 space-y-2">
                  {navLinks.map(([href, label]) => (
                    <li key={href}>
                      <a
                        href={href}
                        className="flex items-center justify-between rounded-xl border border-[#ddd7ca] bg-white px-3 py-2 text-sm font-semibold text-[#171b22] transition hover:border-sky-200 hover:text-[#0f1319]"
                      >
                        <span>{label}</span>
                        <span aria-hidden>↘</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
                  Esta tarjeta es una previsualización de cómo verán la página los vecinos.
                </p>
              </div>
            </aside>

            <div className="space-y-10 lg:col-span-8">
              {/* Director */}
              <SectionCard
                id="director-area"
                title="Dirección del área"
                rightSlot={
                  <EditChip
                    label="Editar"
                    onClick={() =>
                      openEditor('director', null, { ...(form.director || {}) })
                    }
                    disabled={saving}
                  />
                }
              >
                <>
                <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
                  {directorPhotoUrl ? (
                    <img
                      src={directorPhotoUrl}
                      alt={form.director?.name || ''}
                      className="aspect-4/5 w-full max-w-72 self-start rounded-2xl object-cover object-top ring-1 ring-slate-200/80 sm:aspect-auto sm:h-full sm:max-w-none sm:object-center"
                    />
                  ) : (
                    <div className="flex aspect-4/5 w-full max-w-72 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-500 sm:aspect-auto sm:h-full sm:max-w-none">
                      Sin foto cargada
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                      Responsable
                    </p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                      {form.director?.name || '—'}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-[#4b505a]">
                      {form.director?.role || '—'}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-[#4b505a] sm:text-base">
                      {form.director?.bio || (
                        <span className="italic text-slate-400">
                          (Sin biografía cargada)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {String(areaMeta.description || '').trim() ? (
                  <div
                    id="area-catalogo"
                    className="mt-8 border-t border-[#e5e2da] pt-8"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
                      Descripción corta (catálogo)
                    </p>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#4b505a] sm:text-base">
                      {String(areaMeta.description).trim()}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Se edita desde «Editar identidad» en la portada del borrador.
                    </p>
                  </div>
                ) : null}
                </>
              </SectionCard>

              <SectionCard
                id="oficinas-admin-area"
                title="Oficinas"
                description="Publicación independiente del perfil: se guarda al crear o editar cada oficina."
                variant="plain"
              >
                <AdminAreaOfficesPanel
                  areaSlug={selectedSlug}
                  areaTitle={selectedArea?.title || ''}
                  disabled={!apiAvailable}
                />
              </SectionCard>

              {/* Servicios */}
              <SectionCard
                id="servicios-area"
                title="Servicios y prestaciones"
                variant="plain"
                rightSlot={
                  <AddChip
                    label="Agregar servicio"
                    onClick={() =>
                      openEditor('service', null, {
                        ...EMPTY_SERVICE,
                        sortOrder: nextServicePriority(),
                      })
                    }
                    disabled={saving}
                  />
                }
              >
                {(form.serviceBlocks || []).length === 0 ? (
                  <EmptyHint
                    onAdd={() =>
                      openEditor('service', null, {
                        ...EMPTY_SERVICE,
                        sortOrder: nextServicePriority(),
                      })
                    }
                    addLabel="Agregar servicio"
                  >
                    Aún no hay servicios cargados. Agregá el primero para que aparezca en la página.
                  </EmptyHint>
                ) : (
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {[...(form.serviceBlocks || [])]
                      .map((service, idx) => ({ service, idx }))
                      .sort((a, b) => {
                        const oa = Math.max(0, Math.round(Number(a.service?.sortOrder)) || 0)
                        const ob = Math.max(0, Math.round(Number(b.service?.sortOrder)) || 0)
                        if (oa !== ob) return oa - ob
                        return a.idx - b.idx
                      })
                      .map(({ service, idx }) => {
                      const srvImg = service.imageUrl ? resolveMediaUrl(service.imageUrl) : ''
                      return (
                        <li
                          key={service.id || `srv-${idx}`}
                          className="group relative overflow-hidden rounded-2xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200/80"
                        >
                          <div className="absolute right-2 top-2 z-10 flex gap-1.5 sm:right-3 sm:top-3">
                            <EditChip
                              label="Editar"
                              onClick={() =>
                                openEditor('service', idx, {
                                  ...EMPTY_SERVICE,
                                  ...service,
                                  projects: normalizeServiceProjects(service.projects),
                                  contactSection: normalizeServiceContactSection(service.contactSection),
                                })
                              }
                              disabled={saving}
                            />
                            <DeleteChip
                              label="Quitar"
                              onClick={() =>
                                setConfirmRemove({
                                  kind: 'service',
                                  index: idx,
                                  title: '¿Quitar este servicio?',
                                  description: (
                                    <>
                                      Vas a quitar{' '}
                                      <span className="font-semibold">
                                        «{service.title || 'sin título'}»
                                      </span>{' '}
                                      del borrador. Recordá guardar los cambios para que se aplique en
                                      el portal.
                                    </>
                                  ),
                                })
                              }
                              disabled={saving}
                            />
                          </div>
                          <div className="relative aspect-16/10 w-full overflow-hidden bg-[#ece8df]">
                            {srvImg ? (
                              <img
                                src={srvImg}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Sin imagen
                              </div>
                            )}
                          </div>
                          <div className="p-4 sm:p-5">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-700">
                                {service.mode || '—'}
                              </p>
                              {canManageServicePriority ? (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200">
                                  Prioridad {Math.max(0, Math.round(Number(service.sortOrder)) || 0)}
                                </span>
                              ) : null}
                            </div>
                            <h3 className="mt-1.5 pr-16 text-base font-bold tracking-tight text-slate-900 sm:pr-24 sm:text-lg">
                              {service.title || 'Sin título'}
                            </h3>
                            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#4b505a]">
                              {service.description || (
                                <span className="italic text-slate-400">(Sin descripción)</span>
                              )}
                            </p>
                            {(service.personInCharge || service.generalObjective) && (
                              <p className="mt-2 text-xs text-slate-500">
                                {service.personInCharge ? (
                                  <span className="block truncate">A cargo: {service.personInCharge}</span>
                                ) : null}
                                {service.generalObjective ? (
                                  <span className="mt-0.5 line-clamp-2 block">
                                    Objetivo: {service.generalObjective}
                                  </span>
                                ) : null}
                              </p>
                            )}
                            {normalizeServiceProjects(service.projects).length ? (
                              <p className="mt-3 inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-800 ring-1 ring-sky-100">
                                {normalizeServiceProjects(service.projects).length} proyecto(s)
                              </p>
                            ) : null}
                            {isServiceContactSectionVisible(service.contactSection) ? (
                              <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-100">
                                Contactos activos
                              </p>
                            ) : null}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </SectionCard>

              {/* Escuelas */}
              <SectionCard
                id="escuelas-area"
                title={
                  form.schoolsSection?.title ||
                  form.schoolsSection?.navLabel ||
                  'Escuelas'
                }
                description={
                  form.schoolsSection?.intro ||
                  'Sumá escuelas, talleres o programas comunitarios para esta área.'
                }
                rightSlot={
                  <div className="flex flex-wrap gap-1.5">
                    <EditChip
                      label="Textos"
                      onClick={() =>
                        openEditor('schools-section', null, {
                          navLabel: form.schoolsSection?.navLabel || 'Escuelas',
                          eyebrow: form.schoolsSection?.eyebrow || '',
                          title: form.schoolsSection?.title || '',
                          intro: form.schoolsSection?.intro || '',
                        })
                      }
                      disabled={saving}
                    />
                    <AddChip
                      label="Agregar"
                      onClick={() => openEditor('school', null, { ...EMPTY_SCHOOL })}
                      disabled={saving}
                    />
                  </div>
                }
              >
                {(form.schoolsSection?.items || []).length === 0 ? (
                  <EmptyHint
                    onAdd={() => openEditor('school', null, { ...EMPTY_SCHOOL })}
                    addLabel="Agregar escuela"
                  >
                    Esta sección no se mostrará en el portal hasta que cargues al menos una escuela.
                  </EmptyHint>
                ) : (
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {form.schoolsSection.items.map((school, idx) => (
                      <li
                        key={school.id || `school-${idx}`}
                        className="group relative overflow-hidden rounded-2xl border border-[#ddd7ca] bg-white shadow-sm"
                      >
                        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-200">
                          {school.imageUrl ? (
                            <img
                              src={resolveMediaUrl(school.imageUrl)}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-700 to-sky-900 text-xs font-semibold uppercase tracking-wide text-white/60">
                              Sin imagen
                            </div>
                          )}
                          <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-900/20 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
                            <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-800 shadow-sm">
                              {school.discipline || 'Sin disciplina'}
                            </span>
                            <div className="flex gap-1.5">
                              <EditChip
                                label="Editar"
                                onClick={() =>
                                  openEditor('school', idx, { ...school })
                                }
                                disabled={saving}
                              />
                              <DeleteChip
                                label="Quitar"
                                onClick={() =>
                                  setConfirmRemove({
                                    kind: 'school',
                                    index: idx,
                                    title: '¿Quitar esta escuela?',
                                    description: (
                                      <>
                                        Vas a quitar{' '}
                                        <span className="font-semibold">
                                          «{school.name || 'sin nombre'}»
                                        </span>{' '}
                                        del borrador.
                                      </>
                                    ),
                                  })
                                }
                                disabled={saving}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-bold tracking-tight text-[#171b22]">
                            {school.name || 'Sin nombre'}
                          </h3>
                          <p className="mt-2 text-sm text-[#4b505a]">
                            <span className="font-semibold">Horarios:</span>{' '}
                            {school.schedule || '—'}
                          </p>
                          <p className="text-sm text-[#4b505a]">
                            <span className="font-semibold">Lugar:</span>{' '}
                            {school.venue || '—'}
                          </p>
                          <p className="mt-3 text-sm leading-relaxed text-[#4b505a]">
                            {school.description || (
                              <span className="italic text-slate-400">
                                (Sin descripción)
                              </span>
                            )}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              {/* Contactos */}
              <SectionCard
                id="contactos-area"
                title="Contactos rápidos"
                variant="plain"
                rightSlot={
                  <AddChip
                    label="Agregar contacto"
                    onClick={() => openEditor('contact', null, { ...EMPTY_CONTACT })}
                    disabled={saving}
                  />
                }
              >
                {(form.contactCards || []).length === 0 ? (
                  <EmptyHint
                    onAdd={() => openEditor('contact', null, { ...EMPTY_CONTACT })}
                    addLabel="Agregar contacto"
                  >
                    Aún no hay tarjetas de contacto.
                  </EmptyHint>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {form.contactCards.map((card, idx) => (
                      <article
                        key={`con-${idx}`}
                        className="relative rounded-xl border border-[#ddd7ca] bg-[#f8f7f3] p-3"
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">
                          {card.label || '—'}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {card.value || '—'}
                        </p>
                        {card.note ? (
                          <p className="mt-1 text-xs text-slate-500">{card.note}</p>
                        ) : null}
                        <div className="mt-3 flex justify-end gap-1.5">
                          <EditChip
                            label="Editar"
                            onClick={() => openEditor('contact', idx, { ...card })}
                            disabled={saving}
                          />
                          <DeleteChip
                            label="Quitar"
                            onClick={() =>
                              setConfirmRemove({
                                kind: 'contact',
                                index: idx,
                                title: '¿Quitar este contacto?',
                                description: 'Esta acción quita la tarjeta del borrador.',
                              })
                            }
                            disabled={saving}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* Avisos */}
              <SectionCard
                id="avisos-area"
                title="Avisos breves"
                description="Mensajes cortos que se muestran en la página pública del área."
                variant="plain"
                rightSlot={
                  <AddChip
                    label="Agregar aviso"
                    onClick={() => openEditor('notice', null, { value: '' })}
                    disabled={saving}
                  />
                }
              >
                {(form.notices || []).length === 0 ? (
                  <EmptyHint
                    onAdd={() => openEditor('notice', null, { value: '' })}
                    addLabel="Agregar aviso"
                  >
                    No hay avisos cargados.
                  </EmptyHint>
                ) : (
                  <ul className="space-y-2">
                    {form.notices.map((notice, idx) => (
                      <li
                        key={`note-${idx}`}
                        className="flex items-start justify-between gap-3 rounded-xl border border-[#ddd7ca] bg-white px-4 py-3 shadow-sm"
                      >
                        <p className="text-sm text-slate-700">
                          {notice || (
                            <span className="italic text-slate-400">(Aviso vacío)</span>
                          )}
                        </p>
                        <div className="flex shrink-0 gap-1.5">
                          <EditChip
                            label="Editar"
                            onClick={() =>
                              openEditor('notice', idx, { value: notice || '' })
                            }
                            disabled={saving}
                          />
                          <DeleteChip
                            label="Quitar"
                            onClick={() =>
                              setConfirmRemove({
                                kind: 'notice',
                                index: idx,
                                title: '¿Quitar este aviso?',
                                description: 'El aviso se quitará del borrador.',
                              })
                            }
                            disabled={saving}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              {/* Ubicación */}
              <SectionCard
                id="ubicacion-area"
                title="Ubicación y mapa"
                rightSlot={
                  <EditChip
                    label="Editar"
                    onClick={() =>
                      openEditor('location', null, { ...(form.location || {}) })
                    }
                    disabled={saving}
                  />
                }
              >
                <p className="text-sm text-[#4b505a] sm:text-base">
                  {form.location?.address || (
                    <span className="italic text-slate-400">(Sin dirección)</span>
                  )}
                </p>
                {form.location?.references ? (
                  <p className="mt-1 text-sm text-slate-500">{form.location.references}</p>
                ) : null}
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#ddd7ca]">
                  {form.location?.mapEmbedUrl ? (
                    <iframe
                      title={`Mapa de ${areaMeta.title || 'área'}`}
                      src={form.location.mapEmbedUrl}
                      className="h-72 w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-slate-50 text-sm text-slate-500">
                      Sin URL de mapa embebido
                    </div>
                  )}
                </div>
                {form.location?.mapExternalUrl ? (
                  <a
                    href={form.location.mapExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-[#2a313b] bg-[#171b22] px-4 text-sm font-semibold text-white transition hover:bg-[#222831]"
                  >
                    Abrir mapa en pestaña nueva
                  </a>
                ) : null}
              </SectionCard>
            </div>
          </div>
        </article>

        {/* Footer pegajoso con guardar */}
        <StickyFooter
          saving={saving}
          loading={loading}
          selectedSlug={selectedSlug}
          onSubmit={onSubmit}
        />
      </div>
    </>
  )
}

function StickyFooter({ saving, loading, selectedSlug, onSubmit }) {
  return (
    <div className="sticky bottom-3 z-30 mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-600">
        Los cambios no son visibles en el portal hasta que toques «Guardar cambios del área».
      </p>
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || saving || !selectedSlug}
        className={ACTION_BTN_PRIMARY}
      >
        {saving ? (
          <>
            <Spinner tone="white" size="sm" />
            Guardando…
          </>
        ) : (
          'Guardar cambios del área'
        )}
      </button>
    </div>
  )
}

/** Cuerpo dinámico del modal según `editor.kind`. */
function EditorBody({ editor, draft, setDraftField, saving, canManageServicePriority }) {
  if (!editor) return null
  switch (editor.kind) {
    case 'identity':
      return <IdentityForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'director':
      return <DirectorForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'service':
      return (
        <ServiceForm
          draft={draft}
          setDraftField={setDraftField}
          saving={saving}
          canManageServicePriority={canManageServicePriority}
        />
      )
    case 'contact':
      return <ContactForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'notice':
      return <NoticeForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'location':
      return <LocationForm draft={draft} setDraftField={setDraftField} saving={saving} />
    case 'schools-section':
      return (
        <SchoolsSectionForm draft={draft} setDraftField={setDraftField} saving={saving} />
      )
    case 'school':
      return <SchoolForm draft={draft} setDraftField={setDraftField} saving={saving} />
    default:
      return null
  }
}

function IdentityForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        Nombre del área
        <input
          className={inputClass}
          value={draft.title || ''}
          onChange={(e) => setDraftField('title', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Slug
        <input
          className={inputClass}
          value={draft.slug || ''}
          onChange={(e) => setDraftField('slug', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Prioridad
        <input
          type="number"
          min={0}
          step={1}
          className={inputClass}
          value={draft.sortOrder ?? 0}
          onChange={(e) => setDraftField('sortOrder', e.target.value)}
          disabled={saving}
        />
        <span className="mt-1 block text-xs font-normal text-slate-500">
          Número más bajo = aparece antes en el listado público y en el carrusel.
        </span>
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Descripción corta (catálogo)
        <textarea
          className={`${textareaClass} min-h-24`}
          value={draft.description || ''}
          onChange={(e) => setDraftField('description', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Etiqueta superior (eyebrow)
        <input
          className={inputClass}
          value={draft.heroTag || ''}
          onChange={(e) => setDraftField('heroTag', e.target.value)}
          disabled={saving}
          placeholder="Ej. Cultura municipal"
        />
      </label>
      <label className={labelClass}>
        &nbsp;
        <span className="text-xs font-medium text-slate-500">
          Aparece arriba del título en la portada del área.
        </span>
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Texto de misión (bajo el título)
        <textarea
          className={`${textareaClass} min-h-24`}
          value={draft.mission || ''}
          onChange={(e) => setDraftField('mission', e.target.value)}
          disabled={saving}
        />
      </label>
      <div className="sm:col-span-2">
        <SingleImageUploadField
          label="Imagen de portada del área"
          helpText="Se usa en la cabecera pública del detalle del área."
          value={draft.coverImage || ''}
          onChange={(value) => setDraftField('coverImage', value)}
          kind="cover"
          disabled={saving}
        />
      </div>
    </div>
  )
}

function DirectorForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        Nombre
        <input
          className={inputClass}
          value={draft.name || ''}
          onChange={(e) => setDraftField('name', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Cargo
        <input
          className={inputClass}
          value={draft.role || ''}
          onChange={(e) => setDraftField('role', e.target.value)}
          disabled={saving}
        />
      </label>
      <div className="sm:col-span-2">
        <SingleImageUploadField
          label="Foto del responsable"
          helpText="Subí la imagen principal del responsable del área."
          value={draft.photoUrl || ''}
          onChange={(value) => setDraftField('photoUrl', value)}
          kind="cover"
          disabled={saving}
        />
      </div>
      <label className={`${labelClass} sm:col-span-2`}>
        Bio / presentación
        <textarea
          className={`${textareaClass} min-h-32`}
          value={draft.bio || ''}
          onChange={(e) => setDraftField('bio', e.target.value)}
          disabled={saving}
        />
      </label>
    </div>
  )
}

function ServiceForm({ draft, setDraftField, saving, canManageServicePriority }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        Título
        <input
          className={inputClass}
          value={draft.title || ''}
          onChange={(e) => setDraftField('title', e.target.value)}
          disabled={saving}
          placeholder="Ej. Atención al vecino"
        />
      </label>
      <label className={labelClass}>
        Modalidad
        <input
          className={inputClass}
          value={draft.mode || ''}
          onChange={(e) => setDraftField('mode', e.target.value)}
          disabled={saving}
          placeholder="Ej. Presencial · Virtual"
        />
      </label>
      {canManageServicePriority ? (
        <label className={labelClass}>
          Prioridad de visualización
          <input
            type="number"
            min={0}
            step={1}
            className={inputClass}
            value={draft.sortOrder ?? 0}
            onChange={(e) => setDraftField('sortOrder', e.target.value)}
            disabled={saving}
          />
          <span className="mt-1 block text-xs font-normal text-slate-500">
            Número más bajo = aparece antes en el portal público.
          </span>
        </label>
      ) : null}
      <div className="sm:col-span-2">
        <SingleImageUploadField
          label="Imagen del servicio"
          helpText="Se muestra en la tarjeta del portal y en el detalle ampliado."
          value={draft.imageUrl || ''}
          onChange={(value) => setDraftField('imageUrl', value)}
          kind="gallery"
          disabled={saving}
        />
      </div>
      <label className={`${labelClass} sm:col-span-2`}>
        Quien está a cargo
        <input
          className={inputClass}
          value={draft.personInCharge || ''}
          onChange={(e) => setDraftField('personInCharge', e.target.value)}
          disabled={saving}
          placeholder="Nombre o equipo responsable (se muestra en el detalle)"
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Objetivo general
        <textarea
          className={`${textareaClass} min-h-24`}
          value={draft.generalObjective || ''}
          onChange={(e) => setDraftField('generalObjective', e.target.value)}
          disabled={saving}
          placeholder="Resumen del propósito del servicio (detalle ampliado)"
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Descripción
        <textarea
          className={`${textareaClass} min-h-28`}
          value={draft.description || ''}
          onChange={(e) => setDraftField('description', e.target.value)}
          disabled={saving}
          placeholder="Texto en la tarjeta y en el detalle del portal"
        />
      </label>
      <ServiceProjectsEditor
        projects={draft.projects}
        onChange={(projects) => setDraftField('projects', projects)}
        saving={saving}
      />
      <ServiceContactsEditor
        contactSection={draft.contactSection}
        onChange={(contactSection) => setDraftField('contactSection', contactSection)}
        saving={saving}
      />
    </div>
  )
}

function ContactForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-4">
      <label className={labelClass}>
        Etiqueta
        <input
          className={inputClass}
          value={draft.label || ''}
          onChange={(e) => setDraftField('label', e.target.value)}
          disabled={saving}
          placeholder="Ej. Mesa de entrada"
        />
      </label>
      <label className={labelClass}>
        Valor
        <input
          className={inputClass}
          value={draft.value || ''}
          onChange={(e) => setDraftField('value', e.target.value)}
          disabled={saving}
          placeholder="Ej. mesa@trancas.gob.ar"
        />
      </label>
      <label className={labelClass}>
        Nota (opcional)
        <input
          className={inputClass}
          value={draft.note || ''}
          onChange={(e) => setDraftField('note', e.target.value)}
          disabled={saving}
          placeholder="Ej. Lunes a viernes"
        />
      </label>
    </div>
  )
}

function NoticeForm({ draft, setDraftField, saving }) {
  return (
    <label className={labelClass}>
      Texto del aviso
      <textarea
        className={`${textareaClass} min-h-32`}
        value={draft.value || ''}
        onChange={(e) => setDraftField('value', e.target.value)}
        disabled={saving}
        placeholder="Ej. Esta semana atendemos por turnos."
      />
    </label>
  )
}

function LocationForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        Dirección
        <input
          className={inputClass}
          value={draft.address || ''}
          onChange={(e) => setDraftField('address', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Referencias
        <input
          className={inputClass}
          value={draft.references || ''}
          onChange={(e) => setDraftField('references', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        URL del mapa embebido
        <input
          className={inputClass}
          value={draft.mapEmbedUrl || ''}
          onChange={(e) => setDraftField('mapEmbedUrl', e.target.value)}
          disabled={saving}
          placeholder="https://www.google.com/maps/embed?..."
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        URL del mapa externo
        <input
          className={inputClass}
          value={draft.mapExternalUrl || ''}
          onChange={(e) => setDraftField('mapExternalUrl', e.target.value)}
          disabled={saving}
          placeholder="https://maps.app.goo.gl/..."
        />
      </label>
    </div>
  )
}

function SchoolsSectionForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        Texto del enlace en el menú
        <input
          className={inputClass}
          value={draft.navLabel || ''}
          onChange={(e) => setDraftField('navLabel', e.target.value)}
          disabled={saving}
          placeholder="Escuelas"
        />
      </label>
      <label className={labelClass}>
        Eyebrow (etiqueta superior)
        <input
          className={inputClass}
          value={draft.eyebrow || ''}
          onChange={(e) => setDraftField('eyebrow', e.target.value)}
          disabled={saving}
          placeholder="Formación y comunidad"
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Título visible
        <input
          className={inputClass}
          value={draft.title || ''}
          onChange={(e) => setDraftField('title', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Introducción
        <textarea
          className={`${textareaClass} min-h-24`}
          value={draft.intro || ''}
          onChange={(e) => setDraftField('intro', e.target.value)}
          disabled={saving}
        />
      </label>
    </div>
  )
}

function SchoolForm({ draft, setDraftField, saving }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className={labelClass}>
        Identificador interno (opcional)
        <input
          className={inputClass}
          value={draft.id || ''}
          onChange={(e) => setDraftField('id', e.target.value)}
          disabled={saving}
          placeholder="ej. escuela-musica"
        />
      </label>
      <label className={labelClass}>
        Nombre
        <input
          className={inputClass}
          value={draft.name || ''}
          onChange={(e) => setDraftField('name', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={labelClass}>
        Disciplina
        <input
          className={inputClass}
          value={draft.discipline || ''}
          onChange={(e) => setDraftField('discipline', e.target.value)}
          disabled={saving}
          placeholder="Música, Danza…"
        />
      </label>
      <label className={labelClass}>
        Horarios
        <input
          className={inputClass}
          value={draft.schedule || ''}
          onChange={(e) => setDraftField('schedule', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Lugar / sede
        <input
          className={inputClass}
          value={draft.venue || ''}
          onChange={(e) => setDraftField('venue', e.target.value)}
          disabled={saving}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Descripción
        <textarea
          className={`${textareaClass} min-h-28`}
          value={draft.description || ''}
          onChange={(e) => setDraftField('description', e.target.value)}
          disabled={saving}
        />
      </label>
      <div className="sm:col-span-2">
        <SingleImageUploadField
          label="Imagen de la escuela o taller"
          helpText="Opcional. Se muestra en la tarjeta pública."
          value={draft.imageUrl || ''}
          onChange={(value) => setDraftField('imageUrl', value)}
          kind="cover"
          disabled={saving}
        />
      </div>
    </div>
  )
}
