import { useState } from 'react'
import { Button } from '../ui/Button.jsx'
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx'
import { Modal } from '../ui/Modal.jsx'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'
import { SingleImageUploadField } from './SingleImageUploadField.jsx'

const EMPTY_DRAFT = {
  id: '',
  name: '',
  discipline: '',
  schedule: '',
  venue: '',
  description: '',
  imageUrl: '',
}

/**
 * Lista compacta + modales para editar la sección «Escuelas» del perfil de área.
 */
export function AdminAreaSchoolsEditor({
  saving,
  schoolsSection,
  onSetSectionField,
  onAppendSchool,
  onReplaceSchool,
  onRemoveSchool,
}) {
  const items = schoolsSection?.items || []
  const [sectionModalOpen, setSectionModalOpen] = useState(false)
  /** null | 'new' | índice */
  const [schoolDialog, setSchoolDialog] = useState(null)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [schoolFormError, setSchoolFormError] = useState('')
  const [removeIndex, setRemoveIndex] = useState(null)

  function openNewSchoolModal() {
    setDraft({ ...EMPTY_DRAFT })
    setSchoolFormError('')
    setSchoolDialog('new')
  }

  function openEditSchoolModal(index) {
    const row = items[index]
    if (!row) return
    setDraft({
      id: String(row.id || ''),
      name: String(row.name || ''),
      discipline: String(row.discipline || ''),
      schedule: String(row.schedule || ''),
      venue: String(row.venue || ''),
      description: String(row.description || ''),
      imageUrl: String(row.imageUrl || ''),
    })
    setSchoolFormError('')
    setSchoolDialog(index)
  }

  function closeSchoolModal() {
    setSchoolDialog(null)
    setSchoolFormError('')
  }

  function handleSaveSchool() {
    const name = draft.name.trim()
    const description = draft.description.trim()
    if (!name && !description) {
      setSchoolFormError('Completá al menos el nombre o la descripción.')
      return
    }
    const payload = {
      id: draft.id.trim(),
      name,
      discipline: draft.discipline.trim(),
      schedule: draft.schedule.trim(),
      venue: draft.venue.trim(),
      description,
      imageUrl: draft.imageUrl.trim(),
    }
    if (schoolDialog === 'new') {
      onAppendSchool(payload)
    } else if (typeof schoolDialog === 'number') {
      onReplaceSchool(schoolDialog, payload)
    }
    closeSchoolModal()
  }

  function schedulePreview(text, max = 56) {
    const t = String(text || '').trim()
    if (t.length <= max) return t || '—'
    return `${t.slice(0, max)}…`
  }

  return (
    <>
      <ConfirmDialog
        open={removeIndex !== null}
        onClose={() => {
          if (!saving) setRemoveIndex(null)
        }}
        title="¿Quitar esta escuela o taller?"
        description={
          removeIndex !== null ? (
            <>
              Se eliminará{' '}
              <span className="font-semibold">
                {items[removeIndex]?.name?.trim() || 'esta entrada'}
              </span>{' '}
              de la lista. Guardá los cambios del área para persistir en el servidor.
            </>
          ) : null
        }
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        loading={false}
        onConfirm={() => {
          if (removeIndex !== null) onRemoveSchool(removeIndex)
          setRemoveIndex(null)
        }}
        variant="danger"
      />

      <Modal
        open={sectionModalOpen}
        onClose={() => !saving && setSectionModalOpen(false)}
        title="Textos de la sección Escuelas"
        description="Estos campos definen el encabezado público de la sección y el enlace del menú lateral."
        size="wide"
        loading={saving}
      >
        <div className="grid gap-4 px-1 pb-1 sm:grid-cols-2">
          <label className={labelClass}>
            Texto del enlace en el menú
            <input
              className={inputClass}
              value={schoolsSection.navLabel}
              onChange={(e) => onSetSectionField('navLabel', e.target.value)}
              disabled={saving}
              placeholder="Escuelas"
            />
          </label>
          <label className={labelClass}>
            Etiqueta pequeña (eyebrow)
            <input
              className={inputClass}
              value={schoolsSection.eyebrow}
              onChange={(e) => onSetSectionField('eyebrow', e.target.value)}
              disabled={saving}
              placeholder="Escuelas municipales"
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Título de la sección
            <input
              className={inputClass}
              value={schoolsSection.title}
              onChange={(e) => onSetSectionField('title', e.target.value)}
              disabled={saving}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Introducción
            <textarea
              className={`${textareaClass} min-h-28`}
              value={schoolsSection.intro}
              onChange={(e) => onSetSectionField('intro', e.target.value)}
              disabled={saving}
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
          <Button type="button" onClick={() => setSectionModalOpen(false)} disabled={saving}>
            Listo
          </Button>
        </div>
      </Modal>

      <Modal
        open={schoolDialog !== null}
        onClose={() => !saving && closeSchoolModal()}
        title={schoolDialog === 'new' ? 'Nueva escuela o taller' : 'Editar escuela o taller'}
        description="Completá los datos que verán los vecinos en la ficha pública."
        size="wide"
        loading={saving}
      >
        <div className="max-h-[min(70dvh,520px)] space-y-4 overflow-y-auto px-1 pb-1">
          {schoolFormError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {schoolFormError}
            </p>
          ) : null}
          <p className="text-xs text-slate-500">
            Tenés que completar al menos el nombre o la descripción para poder guardar la entrada
            en la lista.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Identificador interno (opcional)
              <input
                className={inputClass}
                value={draft.id}
                onChange={(e) => setDraft((d) => ({ ...d, id: e.target.value }))}
                disabled={saving}
                placeholder="ej. escuela-musica"
              />
            </label>
            <label className={labelClass}>
              Nombre
              <input
                className={inputClass}
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                disabled={saving}
              />
            </label>
            <label className={labelClass}>
              Disciplina (etiqueta)
              <input
                className={inputClass}
                value={draft.discipline}
                onChange={(e) => setDraft((d) => ({ ...d, discipline: e.target.value }))}
                disabled={saving}
                placeholder="Música, Danza…"
              />
            </label>
            <label className={labelClass}>
              Horarios
              <input
                className={inputClass}
                value={draft.schedule}
                onChange={(e) => setDraft((d) => ({ ...d, schedule: e.target.value }))}
                disabled={saving}
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Lugar / sede
              <input
                className={inputClass}
                value={draft.venue}
                onChange={(e) => setDraft((d) => ({ ...d, venue: e.target.value }))}
                disabled={saving}
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Descripción
              <textarea
                className={`${textareaClass} min-h-28`}
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                disabled={saving}
              />
            </label>
            <div className="sm:col-span-2">
              <SingleImageUploadField
                label="Imagen de la escuela o taller"
                helpText="Opcional. Se muestra en la tarjeta pública."
                value={draft.imageUrl}
                onChange={(value) => setDraft((d) => ({ ...d, imageUrl: value }))}
                kind="cover"
                disabled={saving}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={() => !saving && closeSchoolModal()} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSaveSchool} disabled={saving}>
            Guardar en la lista
          </Button>
        </div>
      </Modal>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-slate-900">Escuelas y talleres</h2>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-600">
              Gestioná la lista desde acá. Los cambios se aplican al sitio público cuando pulsás
              «Guardar cambios del área». Si quitás todas las entradas y guardás, la sección deja
              de mostrarse (ya no se rellena con datos de respaldo una vez guardado el perfil en
              el servidor).
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => setSectionModalOpen(true)} disabled={saving}>
              Textos de la sección
            </Button>
            <Button type="button" onClick={openNewSchoolModal} disabled={saving}>
              + Nueva escuela
            </Button>
          </div>
        </div>

        {schoolsSection.title?.trim() || schoolsSection.intro?.trim() ? (
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
            {schoolsSection.title?.trim() ? (
              <p className="font-semibold text-slate-900">{schoolsSection.title.trim()}</p>
            ) : null}
            {schoolsSection.intro?.trim() ? (
              <p className="mt-1 line-clamp-2 text-slate-600">{schoolsSection.intro.trim()}</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/80">
          {items.length === 0 ? (
            <div className="bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-600">
              No hay escuelas en la lista. Agregá una con «Nueva escuela» o editá los textos de la
              sección.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((row, idx) => (
                <li
                  key={String(row.id || '').trim() || `school-row-${idx}`}
                  className="flex flex-col gap-3 bg-white p-4 transition hover:bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/80">
                      {row.imageUrl ? (
                        <img src={row.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Sin foto
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">
                        {row.name?.trim() || '(Sin nombre)'}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {row.discipline?.trim() ? (
                          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-800 ring-1 ring-sky-100">
                            {row.discipline.trim()}
                          </span>
                        ) : null}
                        <span className="text-xs text-slate-500">
                          {schedulePreview(row.schedule)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-3! py-1.5! text-xs!"
                      onClick={() => openEditSchoolModal(idx)}
                      disabled={saving}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="px-3! py-1.5! text-xs!"
                      onClick={() => setRemoveIndex(idx)}
                      disabled={saving}
                    >
                      Quitar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
