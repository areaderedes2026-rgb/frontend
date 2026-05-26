import { useMemo, useState } from 'react'
import { Modal } from '../ui/Modal.jsx'
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx'
import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { EMPTY_SERVICE_PROJECT } from '../../utils/serviceProjects.js'

function newProjectId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeProject(project) {
  return {
    ...EMPTY_SERVICE_PROJECT,
    ...(project || {}),
    id: String(project?.id || '').trim() || newProjectId(),
    linkLabel: String(project?.linkLabel || '').trim() || 'Ver más',
  }
}

function projectSummary(project) {
  const title = String(project?.title || '').trim()
  const status = String(project?.status || '').trim()
  const description = String(project?.description || '').trim()
  if (title) return title
  if (status) return status
  if (description) return description.slice(0, 80)
  return 'Proyecto sin título'
}

function ProjectThumbnail({ imageUrl, title }) {
  const src = imageUrl ? resolveMediaUrl(imageUrl) : ''
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 object-cover"
      />
    )
  }
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-sky-200 bg-sky-50 text-[10px] font-bold uppercase tracking-wide text-sky-700"
      aria-hidden
    >
      Sin foto
    </div>
  )
}

function ServiceProjectFormFields({ project, onChange, saving, imageKind }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        Título del proyecto
        <input
          className={inputClass}
          value={project.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          disabled={saving}
          maxLength={180}
          placeholder="Ej. Red de acompañamiento barrial"
        />
      </label>
      <label className={labelClass}>
        Estado o etiqueta
        <input
          className={inputClass}
          value={project.status || ''}
          onChange={(e) => onChange('status', e.target.value)}
          disabled={saving}
          maxLength={120}
          placeholder="Ej. En curso, Inscripción abierta"
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Descripción
        <textarea
          className={`${textareaClass} min-h-32`}
          value={project.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          disabled={saving}
          maxLength={2200}
          placeholder="Detalle del proyecto que verán los vecinos"
        />
      </label>
      <label className={labelClass}>
        Enlace opcional
        <input
          className={inputClass}
          value={project.linkUrl || ''}
          onChange={(e) => onChange('linkUrl', e.target.value)}
          disabled={saving}
          maxLength={2048}
          placeholder="https://..."
        />
      </label>
      <label className={labelClass}>
        Texto del botón
        <input
          className={inputClass}
          value={project.linkLabel || ''}
          onChange={(e) => onChange('linkLabel', e.target.value)}
          disabled={saving}
          maxLength={80}
          placeholder="Ver más"
        />
      </label>
      <div className="sm:col-span-2">
        <SingleImageUploadField
          label="Imagen del proyecto"
          helpText="Opcional. Se muestra en la tarjeta del portal."
          value={project.imageUrl || ''}
          onChange={(value) => onChange('imageUrl', value)}
          kind={imageKind}
          disabled={saving}
        />
      </div>
    </div>
  )
}

const actionBtn =
  'inline-flex min-h-8 items-center justify-center rounded-lg px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50'
const actionNeutral = `${actionBtn} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const actionPrimary = `${actionBtn} border border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-300 hover:bg-sky-100`
const actionDanger = `${actionBtn} border border-red-200 bg-white text-red-700 hover:bg-red-50`

export function ServiceProjectsEditor({
  projects,
  onChange,
  saving = false,
  imageKind = 'gallery',
  className = '',
}) {
  const list = useMemo(
    () => (Array.isArray(projects) ? projects : []).map(normalizeProject),
    [projects],
  )

  const [viewIndex, setViewIndex] = useState(null)
  const [editState, setEditState] = useState(null)
  const [removeIndex, setRemoveIndex] = useState(null)
  const [draft, setDraft] = useState(null)

  const viewProject = viewIndex != null ? list[viewIndex] : null
  const editing = editState != null

  function persistList(next) {
    onChange(next.map(normalizeProject))
  }

  function openCreate() {
    setDraft(
      normalizeProject({
        ...EMPTY_SERVICE_PROJECT,
        id: newProjectId(),
        linkLabel: 'Ver más',
      }),
    )
    setEditState({ mode: 'create' })
  }

  function openEdit(index) {
    setDraft({ ...list[index] })
    setEditState({ mode: 'edit', index })
  }

  function closeEdit() {
    setEditState(null)
    setDraft(null)
  }

  function updateDraftField(field, value) {
    setDraft((current) => (current ? { ...current, [field]: value } : current))
  }

  function saveDraft() {
    if (!draft) return
    const normalized = normalizeProject(draft)
    if (editState?.mode === 'edit' && editState.index != null) {
      const next = [...list]
      next[editState.index] = normalized
      persistList(next)
    } else {
      persistList([...list, normalized])
    }
    closeEdit()
  }

  function confirmRemove() {
    if (removeIndex == null) return
    persistList(list.filter((_, i) => i !== removeIndex))
    setRemoveIndex(null)
    if (viewIndex === removeIndex) setViewIndex(null)
  }

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">Proyectos vinculados</p>
          <p className="mt-0.5 text-xs text-slate-600">
            {list.length
              ? `${list.length} proyecto${list.length === 1 ? '' : 's'} · editá cada uno en su ventana`
              : 'Agregá proyectos que se muestran en el detalle público'}
          </p>
        </div>
        <button type="button" onClick={openCreate} disabled={saving} className={actionPrimary}>
          + Nuevo proyecto
        </button>
      </div>

      {list.length ? (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {list.map((project, index) => {
            const title = projectSummary(project)
            const status = String(project.status || '').trim()
            const description = String(project.description || '').trim()
            return (
              <li
                key={project.id || `project-${index}`}
                className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-3.5"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <ProjectThumbnail imageUrl={project.imageUrl} title={title} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{title}</p>
                    {status ? (
                      <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-sky-700">
                        {status}
                      </p>
                    ) : null}
                    {description ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                        {description}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs italic text-slate-400">Sin descripción</p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5 sm:justify-end">
                  <button
                    type="button"
                    className={actionNeutral}
                    disabled={saving}
                    onClick={() => setViewIndex(index)}
                  >
                    Ver
                  </button>
                  <button
                    type="button"
                    className={actionPrimary}
                    disabled={saving}
                    onClick={() => openEdit(index)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className={actionDanger}
                    disabled={saving}
                    onClick={() => setRemoveIndex(index)}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/40 px-4 py-8 text-center">
          <p className="text-sm font-semibold text-slate-800">No hay proyectos cargados</p>
          <p className="mt-1 text-xs text-slate-600">
            Usá «Nuevo proyecto» para agregar el primero con todos sus datos.
          </p>
        </div>
      )}

      <Modal
        open={viewProject != null}
        onClose={() => setViewIndex(null)}
        layer="stacked"
        size="wide"
        title={projectSummary(viewProject)}
        description="Vista previa de cómo se publicará el proyecto."
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className={actionNeutral} onClick={() => setViewIndex(null)}>
              Cerrar
            </button>
            <button
              type="button"
              className={actionPrimary}
              onClick={() => {
                const idx = viewIndex
                setViewIndex(null)
                if (idx != null) openEdit(idx)
              }}
            >
              Editar proyecto
            </button>
          </div>
        }
      >
        {viewProject ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              {viewProject.status ? (
                <p className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-800 ring-1 ring-sky-100">
                  {viewProject.status}
                </p>
              ) : null}
              {viewProject.description ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                  {viewProject.description}
                </p>
              ) : (
                <p className="text-sm italic text-slate-400">Sin descripción</p>
              )}
              {viewProject.linkUrl ? (
                <p className="text-sm">
                  <span className="font-semibold text-slate-700">Enlace: </span>
                  <a
                    href={viewProject.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-medium text-sky-700 hover:text-sky-900"
                  >
                    {viewProject.linkLabel || viewProject.linkUrl}
                  </a>
                </p>
              ) : null}
            </div>
            {viewProject.imageUrl ? (
              <img
                src={resolveMediaUrl(viewProject.imageUrl)}
                alt=""
                className="aspect-video w-full rounded-2xl border border-slate-200 object-cover lg:aspect-4/3"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 lg:aspect-4/3">
                Sin imagen
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={editing && draft != null}
        onClose={closeEdit}
        loading={saving}
        layer="stacked"
        size="xlarge"
        title={editState?.mode === 'create' ? 'Nuevo proyecto' : 'Editar proyecto'}
        description="Completá los campos que quieras publicar en el portal."
        bodyClassName="pb-2"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className={actionNeutral} onClick={closeEdit} disabled={saving}>
              Cancelar
            </button>
            <button type="button" className={actionPrimary} onClick={saveDraft} disabled={saving}>
              {editState?.mode === 'create' ? 'Agregar proyecto' : 'Guardar proyecto'}
            </button>
          </div>
        }
      >
        {draft ? (
          <ServiceProjectFormFields
            project={draft}
            onChange={updateDraftField}
            saving={saving}
            imageKind={imageKind}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={removeIndex != null}
        onClose={() => setRemoveIndex(null)}
        title="¿Quitar este proyecto?"
        description="Se eliminará del servicio. Podés volver a crearlo después."
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        loading={false}
        onConfirm={confirmRemove}
        variant="danger"
      />
    </div>
  )
}
