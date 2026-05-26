import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'
import {
  EMPTY_SERVICE_AUTHORITY_PERSON,
  EMPTY_SERVICE_AUTHORITY_SECTION,
  normalizeServiceAuthoritySection,
} from '../../utils/serviceAuthority.js'

function newAuthorityPersonId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `auth-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function ServiceAuthoritiesEditor({
  authoritySection,
  onChange,
  saving = false,
  className = '',
}) {
  const section = normalizeServiceAuthoritySection(authoritySection)

  function updateSection(patch) {
    onChange({ ...section, ...patch })
  }

  function updatePerson(index, field, value) {
    const people = [...section.people]
    people[index] = { ...people[index], [field]: value }
    updateSection({ people })
  }

  function addPerson() {
    updateSection({
      people: [
        ...section.people,
        { ...EMPTY_SERVICE_AUTHORITY_PERSON, id: newAuthorityPersonId() },
      ],
    })
  }

  function removePerson(index) {
    updateSection({ people: section.people.filter((_, i) => i !== index) })
  }

  return (
    <div
      className={`space-y-4 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 sm:col-span-2 ${className}`.trim()}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Autoridades a cargo</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Opcional. Personas responsables del servicio con foto y mini biografía.
          </p>
        </div>
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-950 shadow-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            checked={section.enabled}
            onChange={(e) => updateSection({ enabled: e.target.checked })}
            disabled={saving}
          />
          Mostrar en el portal
        </label>
      </div>

      {section.enabled ? (
        <>
          <label className={labelClass}>
            Título de la sección
            <input
              className={inputClass}
              value={section.title}
              onChange={(e) => updateSection({ title: e.target.value })}
              disabled={saving}
              maxLength={80}
              placeholder="Ej. Equipo a cargo, Autoridades"
            />
          </label>
          <label className={labelClass}>
            Introducción (opcional)
            <textarea
              className={`${textareaClass} min-h-20`}
              value={section.intro || ''}
              onChange={(e) => updateSection({ intro: e.target.value })}
              disabled={saving}
              maxLength={600}
              placeholder="Breve texto introductorio de la sección"
            />
          </label>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-900">
              Personas
            </p>
            <button
              type="button"
              onClick={addPerson}
              disabled={saving}
              className="inline-flex min-h-9 items-center justify-center rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Agregar persona
            </button>
          </div>

          {section.people.length ? (
            <div className="space-y-4">
              {section.people.map((person, index) => (
                <article
                  key={person.id || `auth-${index}`}
                  className="rounded-2xl border border-white bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      Persona {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removePerson(index)}
                      disabled={saving}
                      className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className={labelClass}>
                      Nombre y apellido
                      <input
                        className={inputClass}
                        value={person.name || ''}
                        onChange={(e) => updatePerson(index, 'name', e.target.value)}
                        disabled={saving}
                        maxLength={160}
                      />
                    </label>
                    <label className={labelClass}>
                      Cargo / función
                      <input
                        className={inputClass}
                        value={person.role || ''}
                        onChange={(e) => updatePerson(index, 'role', e.target.value)}
                        disabled={saving}
                        maxLength={180}
                        placeholder="Ej. Coordinador/a"
                      />
                    </label>
                    <div className="sm:col-span-2">
                      <SingleImageUploadField
                        label="Foto"
                        value={person.photoUrl || ''}
                        onChange={(value) => updatePerson(index, 'photoUrl', value)}
                        kind="cover"
                        disabled={saving}
                      />
                    </div>
                    <label className={`${labelClass} sm:col-span-2`}>
                      Mini biografía
                      <textarea
                        className={`${textareaClass} min-h-24`}
                        value={person.bio || ''}
                        onChange={(e) => updatePerson(index, 'bio', e.target.value)}
                        disabled={saving}
                        maxLength={1200}
                        placeholder="Experiencia, funciones o trayectoria breve"
                      />
                    </label>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-amber-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-600">
              Agregá al menos una persona para publicar esta sección.
            </p>
          )}
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-amber-200 bg-white/70 px-4 py-5 text-sm text-slate-600">
          Activá la opción para mostrar quiénes están a cargo del servicio.
        </p>
      )}
    </div>
  )
}

export { EMPTY_SERVICE_AUTHORITY_SECTION }
