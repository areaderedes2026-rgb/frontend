import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'
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
  }
}

export function ServiceProjectsEditor({
  projects,
  onChange,
  saving = false,
  imageKind = 'gallery',
}) {
  const list = (Array.isArray(projects) ? projects : []).map(normalizeProject)

  function updateProject(index, field, value) {
    const next = [...list]
    next[index] = {
      ...next[index],
      [field]: value,
    }
    onChange(next)
  }

  function addProject() {
    onChange([
      ...list,
      {
        ...EMPTY_SERVICE_PROJECT,
        id: newProjectId(),
        linkLabel: 'Ver más',
      },
    ])
  }

  function removeProject(index) {
    onChange(list.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 sm:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Proyectos del servicio</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Se muestran como cards dentro del modal público del servicio.
          </p>
        </div>
        <button
          type="button"
          onClick={addProject}
          disabled={saving}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Agregar proyecto
        </button>
      </div>

      {list.length ? (
        <div className="space-y-4">
          {list.map((project, index) => (
            <article
              key={project.id || `project-${index}`}
              className="rounded-2xl border border-white bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                    Proyecto {index + 1}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Completá solo los campos que quieras publicar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  disabled={saving}
                  className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Quitar
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>
                  Título del proyecto
                  <input
                    className={inputClass}
                    value={project.title || ''}
                    onChange={(e) => updateProject(index, 'title', e.target.value)}
                    disabled={saving}
                    maxLength={180}
                  />
                </label>
                <label className={labelClass}>
                  Estado o etiqueta
                  <input
                    className={inputClass}
                    value={project.status || ''}
                    onChange={(e) => updateProject(index, 'status', e.target.value)}
                    disabled={saving}
                    maxLength={120}
                    placeholder="Ej. En curso, Inscripción abierta"
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Descripción
                  <textarea
                    className={`${textareaClass} min-h-24`}
                    value={project.description || ''}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
                    disabled={saving}
                    maxLength={2200}
                  />
                </label>
                <label className={labelClass}>
                  Enlace opcional
                  <input
                    className={inputClass}
                    value={project.linkUrl || ''}
                    onChange={(e) => updateProject(index, 'linkUrl', e.target.value)}
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
                    onChange={(e) => updateProject(index, 'linkLabel', e.target.value)}
                    disabled={saving}
                    maxLength={80}
                    placeholder="Ver más"
                  />
                </label>
                <div className="sm:col-span-2">
                  <SingleImageUploadField
                    label="Imagen del proyecto"
                    helpText="Opcional. Se usa en la card del proyecto dentro del modal."
                    value={project.imageUrl || ''}
                    onChange={(value) => updateProject(index, 'imageUrl', value)}
                    kind={imageKind}
                    disabled={saving}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-sky-200 bg-white/80 px-4 py-5 text-center text-sm text-slate-600">
          Todavía no hay proyectos cargados para este servicio.
        </div>
      )}
    </div>
  )
}
