import { useState } from 'react'
import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { ServiceAuthoritiesEditor } from './ServiceAuthoritiesEditor.jsx'
import { ServiceContactsEditor } from './ServiceContactsEditor.jsx'
import { ServiceGalleryEditor } from './ServiceGalleryEditor.jsx'
import { ServiceProjectsEditor } from './ServiceProjectsEditor.jsx'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'
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

const TABS = [
  { id: 'general', label: 'Información' },
  { id: 'projects', label: 'Proyectos' },
  { id: 'blocks', label: 'Secciones opcionales' },
]

function TabButton({ active, onClick, label, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-sky-700 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {label}
      {badge != null && badge > 0 ? (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}
        >
          {badge}
        </span>
      ) : null}
    </button>
  )
}

function OptionalBlockShell({ title, subtitle, enabled, onToggle, disabled, children }) {
  const [open, setOpen] = useState(enabled)

  function handlePublishToggle(checked) {
    onToggle(checked)
    if (checked) setOpen(true)
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span
            className={`text-slate-400 transition ${open ? 'rotate-90' : ''}`}
            aria-hidden
          >
            ▸
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-900">{title}</span>
            {subtitle ? (
              <span className="block text-xs text-slate-500">{subtitle}</span>
            ) : null}
          </span>
        </button>
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600"
            checked={enabled}
            onChange={(e) => handlePublishToggle(e.target.checked)}
            disabled={disabled}
          />
          Publicar
        </label>
      </div>
      {open ? <div className="p-3 sm:p-4">{children}</div> : null}
    </section>
  )
}

export function ServiceEditorWorkspace({
  draft,
  setDraftField,
  saving = false,
  canManageServicePriority = false,
  projectImageKind = 'gallery',
}) {
  const [tab, setTab] = useState('general')

  const projectCount = normalizeServiceProjects(draft?.projects).length
  const blocksCount =
    (isServiceContactSectionVisible(draft?.contactSection) ? 1 : 0) +
    (isServiceGallerySectionVisible(draft?.gallerySection) ? 1 : 0) +
    (isServiceAuthoritySectionVisible(draft?.authoritySection) ? 1 : 0)

  const contact = normalizeServiceContactSection(draft?.contactSection)
  const gallery = normalizeServiceGallerySection(draft?.gallerySection)
  const authority = normalizeServiceAuthoritySection(draft?.authoritySection)

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden">
      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50/80 p-1">
        {TABS.map((item) => (
          <TabButton
            key={item.id}
            active={tab === item.id}
            onClick={() => setTab(item.id)}
            label={item.label}
            badge={
              item.id === 'projects'
                ? projectCount
                : item.id === 'blocks'
                  ? blocksCount
                  : undefined
            }
          />
        ))}
      </div>

      {tab === 'general' ? (
        <div className="min-w-0 space-y-4">
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              Título del servicio
              <input
                className={inputClass}
                value={draft.title || ''}
                onChange={(e) => setDraftField('title', e.target.value)}
                disabled={saving}
                maxLength={180}
                required
              />
            </label>
            <label className={labelClass}>
              Modalidad / horarios
              <input
                className={inputClass}
                value={draft.mode || ''}
                onChange={(e) => setDraftField('mode', e.target.value)}
                disabled={saving}
                maxLength={140}
                placeholder="Presencial, virtual..."
              />
            </label>
            <label className={labelClass}>
              Responsable (texto breve)
              <input
                className={inputClass}
                value={draft.personInCharge || ''}
                onChange={(e) => setDraftField('personInCharge', e.target.value)}
                disabled={saving}
                maxLength={200}
              />
            </label>
            {canManageServicePriority ? (
              <label className={labelClass}>
                Prioridad en el portal
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
                  Número más bajo = aparece primero.
                </span>
              </label>
            ) : null}
            <label className={`${labelClass} sm:col-span-2`}>
              Descripción
              <textarea
                className={`${textareaClass} min-h-32`}
                value={draft.description || ''}
                onChange={(e) => setDraftField('description', e.target.value)}
                disabled={saving}
                maxLength={2200}
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Objetivo general
              <textarea
                className={`${textareaClass} min-h-28`}
                value={draft.generalObjective || ''}
                onChange={(e) => setDraftField('generalObjective', e.target.value)}
                disabled={saving}
                maxLength={3000}
              />
            </label>
          </div>

          <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
              Imagen principal
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Portada del servicio en el portal. La vista previa usa el ancho completo del formulario.
            </p>
            <div className="mt-3 min-w-0">
              <SingleImageUploadField
                label="Subir o importar imagen"
                value={draft.imageUrl || ''}
                onChange={(value) => setDraftField('imageUrl', value)}
                kind="cover"
                disabled={saving}
                compact
              />
            </div>
          </section>
        </div>
      ) : null}

      {tab === 'projects' ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50/30 p-3 sm:p-4">
          <ServiceProjectsEditor
            projects={draft.projects}
            onChange={(projects) => setDraftField('projects', projects)}
            saving={saving}
            imageKind={projectImageKind}
          />
        </div>
      ) : null}

      {tab === 'blocks' ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Activá solo las secciones que necesites. Cada bloque se muestra en el detalle público del
            servicio.
          </p>

          <OptionalBlockShell
            title="Contactos"
            subtitle="Teléfonos, emails, WhatsApp o enlaces"
            enabled={contact.enabled}
            disabled={saving}
            onToggle={(enabled) =>
              setDraftField('contactSection', { ...contact, enabled })
            }
          >
            <ServiceContactsEditor
              contactSection={draft.contactSection}
              onChange={(contactSection) => setDraftField('contactSection', contactSection)}
              saving={saving}
              className="!border-0 !bg-transparent !p-0"
              hideHeader
            />
          </OptionalBlockShell>

          <OptionalBlockShell
            title="Galería de fotos"
            subtitle={`${gallery.images.filter((i) => i.imageUrl).length} imagen(es)`}
            enabled={gallery.enabled}
            disabled={saving}
            onToggle={(enabled) =>
              setDraftField('gallerySection', { ...gallery, enabled })
            }
          >
            <ServiceGalleryEditor
              gallerySection={draft.gallerySection}
              onChange={(gallerySection) => setDraftField('gallerySection', gallerySection)}
              saving={saving}
              className="!border-0 !bg-transparent !p-0"
              hideHeader
            />
          </OptionalBlockShell>

          <OptionalBlockShell
            title="Autoridades a cargo"
            subtitle={`${authority.people.length} persona(s)`}
            enabled={authority.enabled}
            disabled={saving}
            onToggle={(enabled) =>
              setDraftField('authoritySection', { ...authority, enabled })
            }
          >
            <ServiceAuthoritiesEditor
              authoritySection={draft.authoritySection}
              onChange={(authoritySection) => setDraftField('authoritySection', authoritySection)}
              saving={saving}
              className="!border-0 !bg-transparent !p-0"
              hideHeader
            />
          </OptionalBlockShell>
        </div>
      ) : null}
    </div>
  )
}
