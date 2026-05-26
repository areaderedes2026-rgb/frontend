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
      className={`shrink-0 inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition ${
        active
          ? 'bg-sky-700 text-white shadow-sm'
          : 'text-slate-600 hover:bg-white hover:text-slate-900'
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

function SectionTitle({ children, hint }) {
  return (
    <div className="mb-3 border-b border-slate-100 pb-2">
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-sky-800">{children}</h3>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

function OptionalBlockShell({ title, subtitle, enabled, onToggle, disabled, children }) {
  const [open, setOpen] = useState(enabled)

  function handlePublishToggle(checked) {
    onToggle(checked)
    if (checked) setOpen(true)
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span
            className={`shrink-0 text-slate-400 transition ${open ? 'rotate-90' : ''}`}
            aria-hidden
          >
            ▸
          </span>
          <span className="min-w-0 overflow-hidden">
            <span className="block truncate text-sm font-bold text-slate-900">{title}</span>
            {subtitle ? (
              <span className="block truncate text-xs text-slate-500">{subtitle}</span>
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
      {open ? <div className="min-w-0 p-3 sm:p-4">{children}</div> : null}
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
      <div className="-mx-1 overflow-x-auto pb-0.5">
        <div className="flex min-w-max gap-1 rounded-xl border border-slate-200 bg-slate-50/90 p-1 px-1">
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
      </div>

      {tab === 'general' ? (
        <div className="min-w-0 space-y-6">
          <section className="min-w-0">
            <SectionTitle hint="Datos que aparecen en la tarjeta y en el encabezado del detalle.">
              Datos principales
            </SectionTitle>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <label className={`${labelClass} sm:col-span-2 xl:col-span-2`}>
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
            </div>
          </section>

          <section className="min-w-0">
            <SectionTitle>Contenido del detalle</SectionTitle>
            <div className="grid min-w-0 gap-3 lg:grid-cols-2">
              <label className={labelClass}>
                Descripción
                <textarea
                  className={`${textareaClass} min-h-32`}
                  value={draft.description || ''}
                  onChange={(e) => setDraftField('description', e.target.value)}
                  disabled={saving}
                  maxLength={2200}
                />
              </label>
              <label className={labelClass}>
                Objetivo general
                <textarea
                  className={`${textareaClass} min-h-32`}
                  value={draft.generalObjective || ''}
                  onChange={(e) => setDraftField('generalObjective', e.target.value)}
                  disabled={saving}
                  maxLength={3000}
                />
              </label>
            </div>
          </section>

          <section className="min-w-0 max-w-3xl">
            <SectionTitle hint="Portada del servicio en el portal.">
              Imagen principal
            </SectionTitle>
            <SingleImageUploadField
              label=""
              helpText="JPEG, PNG, WebP o GIF · máx. 10 MB."
              value={draft.imageUrl || ''}
              onChange={(value) => setDraftField('imageUrl', value)}
              kind="cover"
              disabled={saving}
            />
          </section>
        </div>
      ) : null}

      {tab === 'projects' ? (
        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/40 p-3 sm:p-4">
          <ServiceProjectsEditor
            projects={draft.projects}
            onChange={(projects) => setDraftField('projects', projects)}
            saving={saving}
            imageKind={projectImageKind}
          />
        </div>
      ) : null}

      {tab === 'blocks' ? (
        <div className="min-w-0 space-y-3">
          <p className="text-xs leading-relaxed text-slate-600">
            Activá solo las secciones que necesites. Cada bloque se muestra en el detalle público del
            servicio.
          </p>

          <OptionalBlockShell
            title="Contactos"
            subtitle="Teléfonos, emails, WhatsApp o enlaces"
            enabled={contact.enabled}
            disabled={saving}
            onToggle={(enabled) => setDraftField('contactSection', { ...contact, enabled })}
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
            onToggle={(enabled) => setDraftField('gallerySection', { ...gallery, enabled })}
          >
            <ServiceGalleryEditor
              gallerySection={draft.gallerySection}
              onChange={(gallerySection) => setDraftField('gallerySection', gallerySection)}
              saving={saving}
              className="!max-w-full !border-0 !bg-transparent !p-0"
              hideHeader
            />
          </OptionalBlockShell>

          <OptionalBlockShell
            title="Autoridades a cargo"
            subtitle={`${authority.people.length} persona(s)`}
            enabled={authority.enabled}
            disabled={saving}
            onToggle={(enabled) => setDraftField('authoritySection', { ...authority, enabled })}
          >
            <ServiceAuthoritiesEditor
              authoritySection={draft.authoritySection}
              onChange={(authoritySection) => setDraftField('authoritySection', authoritySection)}
              saving={saving}
              className="!max-w-full !border-0 !bg-transparent !p-0"
              hideHeader
            />
          </OptionalBlockShell>
        </div>
      ) : null}
    </div>
  )
}
