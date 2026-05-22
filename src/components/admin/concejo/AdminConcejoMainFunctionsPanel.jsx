import { useMemo, useState } from 'react'
import { Modal } from '../../ui/Modal.jsx'
import { ConfirmDialog } from '../../ui/ConfirmDialog.jsx'
import { Button } from '../../ui/Button.jsx'
import {
  formErrorClass,
  inputClass,
  labelClass,
  textareaClass,
} from '../../ui/formStyles.js'
import {
  cleanConcejoSortOrder,
  nextMainFunctionSectionPriority,
  normalizeMainFunctions,
  sortMainFunctionSections,
} from '../../../data/concejoMainFunctionsContent.js'
import { ConcejoMainFunctionsSection } from '../../concejo/ConcejoMainFunctionsSection.jsx'

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function linesToArray(text) {
  return String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

function arrayToLines(arr) {
  return (Array.isArray(arr) ? arr : []).join('\n')
}

function paragraphsToText(arr) {
  return (Array.isArray(arr) ? arr : []).join('\n\n')
}

function textToParagraphs(text) {
  return String(text || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

function emptySectionDraft(sortOrder = 10) {
  return {
    id: makeId('func'),
    sortOrder,
    number: '',
    title: '',
    paragraphsText: '',
    subsections: [],
  }
}

function sectionToDraft(section) {
  return {
    id: section.id,
    sortOrder: cleanConcejoSortOrder(section.sortOrder, 10),
    number: section.number || '',
    title: section.title || '',
    paragraphsText: paragraphsToText(section.paragraphs),
    subsections: (section.subsections || []).map((sub) => ({
      id: sub.id,
      sortOrder: cleanConcejoSortOrder(sub.sortOrder, 10),
      title: sub.title || '',
      paragraphsText: paragraphsToText(sub.paragraphs),
      listGroups: (sub.listGroups || []).map((g) => ({
        id: g.id,
        sortOrder: cleanConcejoSortOrder(g.sortOrder, 10),
        title: g.title || '',
        itemsText: arrayToLines(g.items),
      })),
      examplesTitle: sub.examples?.title || '',
      examplesItemsText: arrayToLines(sub.examples?.items),
    })),
  }
}

function draftToSection(draft) {
  const title = String(draft.title || '').trim()
  if (!title) return null
  return {
    id: draft.id || makeId('func'),
    sortOrder: cleanConcejoSortOrder(draft.sortOrder, 10),
    number: String(draft.number || '').trim(),
    title,
    paragraphs: textToParagraphs(draft.paragraphsText),
    subsections: (draft.subsections || [])
      .map((sub) => {
        const subTitle = String(sub.title || '').trim()
        const paragraphs = textToParagraphs(sub.paragraphsText)
        const listGroups = (sub.listGroups || [])
          .map((g) => {
            const items = linesToArray(g.itemsText)
            const gTitle = String(g.title || '').trim()
            if (!gTitle && !items.length) return null
            return {
              id: g.id || makeId('list'),
              sortOrder: cleanConcejoSortOrder(g.sortOrder, 10),
              title: gTitle,
              items,
            }
          })
          .filter(Boolean)
        const exampleItems = linesToArray(sub.examplesItemsText)
        const examples =
          exampleItems.length || String(sub.examplesTitle || '').trim()
            ? {
                title: String(sub.examplesTitle || '').trim() || 'Ejemplos',
                items: exampleItems,
              }
            : null
        if (!subTitle && !paragraphs.length && !listGroups.length && !examples) return null
        return {
          id: sub.id || makeId('sub'),
          sortOrder: cleanConcejoSortOrder(sub.sortOrder, 10),
          title: subTitle,
          paragraphs,
          listGroups,
          examples,
        }
      })
      .filter(Boolean),
  }
}

function SectionCardPreview({ section, index, onEdit, onRemove, onMoveUp, onMoveDown, disabled }) {
  const displayNumber = section.number || String(index + 1)
  return (
    <li className="group relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={onMoveUp}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:border-sky-200 hover:bg-sky-50 disabled:opacity-50"
          aria-label="Subir función"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onMoveDown}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:border-sky-200 hover:bg-sky-50 disabled:opacity-50"
          aria-label="Bajar función"
        >
          ↓
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onEdit}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-sky-200 hover:bg-sky-50"
        >
          Editar
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
        >
          Quitar
        </button>
      </div>
      <span className="inline-flex rounded-full bg-slate-900/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
        P.{cleanConcejoSortOrder(section.sortOrder, (index + 1) * 10)}
      </span>
      <h4 className="mt-2 pr-36 font-serif text-lg font-bold text-[#171b22]">
        {displayNumber}. {section.title}
      </h4>
      <p className="mt-1 text-xs text-slate-500">
        {(section.paragraphs || []).length} párrafo(s) · {(section.subsections || []).length}{' '}
        subsección(es)
      </p>
    </li>
  )
}

export function AdminConcejoMainFunctionsPanel({ form, setForm, saving }) {
  const [titleModal, setTitleModal] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [sectionModal, setSectionModal] = useState(null)
  const [sectionDraft, setSectionDraft] = useState(() => emptySectionDraft())
  const [sectionError, setSectionError] = useState('')
  const [removeSectionId, setRemoveSectionId] = useState(null)

  const mainFunctions = useMemo(
    () => normalizeMainFunctions(form.mainFunctions),
    [form.mainFunctions],
  )

  const sortedSections = useMemo(
    () => sortMainFunctionSections(mainFunctions.sections || []),
    [mainFunctions.sections],
  )

  function updateMainFunctions(next) {
    setForm((prev) => ({
      ...prev,
      mainFunctions: normalizeMainFunctions(next, prev.mainFunctions),
    }))
  }

  function openTitleModal() {
    setTitleDraft(mainFunctions.title || '')
    setTitleModal(true)
  }

  function saveTitle() {
    updateMainFunctions({ ...mainFunctions, title: titleDraft.trim() })
    setTitleModal(false)
  }

  function openNewSection() {
    setSectionDraft(emptySectionDraft(nextMainFunctionSectionPriority(mainFunctions.sections)))
    setSectionError('')
    setSectionModal('new')
  }

  function openEditSection(id) {
    const row = sortedSections.find((s) => s.id === id)
    if (!row) return
    setSectionDraft(sectionToDraft(row))
    setSectionError('')
    setSectionModal(id)
  }

  function moveSection(id, direction) {
    const list = sortMainFunctionSections(mainFunctions.sections || [])
    const index = list.findIndex((s) => s.id === id)
    if (index < 0) return
    const target = index + direction
    if (target < 0 || target >= list.length) return
    const next = [...list]
    const a = cleanConcejoSortOrder(next[index].sortOrder, (index + 1) * 10)
    const b = cleanConcejoSortOrder(next[target].sortOrder, (target + 1) * 10)
    next[index] = { ...next[index], sortOrder: b }
    next[target] = { ...next[target], sortOrder: a }
    updateMainFunctions({ ...mainFunctions, sections: next })
  }

  function saveSection() {
    const built = draftToSection(sectionDraft)
    if (!built) {
      setSectionError('Completá al menos el título de la función.')
      return
    }
    const list = [...(mainFunctions.sections || [])]
    if (sectionModal === 'new') {
      list.push(built)
    } else {
      const idx = list.findIndex((s) => s.id === sectionModal)
      if (idx >= 0) list[idx] = built
      else list.push(built)
    }
    updateMainFunctions({ ...mainFunctions, sections: list })
    setSectionModal(null)
    setSectionError('')
  }

  function confirmRemoveSection() {
    if (!removeSectionId) return
    updateMainFunctions({
      ...mainFunctions,
      sections: (mainFunctions.sections || []).filter((s) => s.id !== removeSectionId),
    })
    setRemoveSectionId(null)
  }

  function addSubsection() {
    setSectionDraft((d) => ({
      ...d,
      subsections: [
        ...(d.subsections || []),
        {
          id: makeId('sub'),
          sortOrder: ((d.subsections?.length || 0) + 1) * 10,
          title: '',
          paragraphsText: '',
          listGroups: [],
          examplesTitle: '',
          examplesItemsText: '',
        },
      ],
    }))
  }

  function updateSubsection(subId, patch) {
    setSectionDraft((d) => ({
      ...d,
      subsections: (d.subsections || []).map((s) =>
        s.id === subId ? { ...s, ...patch } : s,
      ),
    }))
  }

  function removeSubsection(subId) {
    setSectionDraft((d) => ({
      ...d,
      subsections: (d.subsections || []).filter((s) => s.id !== subId),
    }))
  }

  function addListGroup(subId) {
    setSectionDraft((d) => ({
      ...d,
      subsections: (d.subsections || []).map((s) =>
        s.id === subId
          ? {
              ...s,
              listGroups: [
                ...(s.listGroups || []),
                {
                  id: makeId('list'),
                  sortOrder: ((s.listGroups || []).length + 1) * 10,
                  title: '',
                  itemsText: '',
                },
              ],
            }
          : s,
      ),
    }))
  }

  function updateListGroup(subId, groupId, patch) {
    setSectionDraft((d) => ({
      ...d,
      subsections: (d.subsections || []).map((s) =>
        s.id === subId
          ? {
              ...s,
              listGroups: (s.listGroups || []).map((g) =>
                g.id === groupId ? { ...g, ...patch } : g,
              ),
            }
          : s,
      ),
    }))
  }

  function removeListGroup(subId, groupId) {
    setSectionDraft((d) => ({
      ...d,
      subsections: (d.subsections || []).map((s) =>
        s.id === subId
          ? {
              ...s,
              listGroups: (s.listGroups || []).filter((g) => g.id !== groupId),
            }
          : s,
      ),
    }))
  }

  return (
    <>
      <ConfirmDialog
        open={removeSectionId !== null}
        onClose={() => !saving && setRemoveSectionId(null)}
        title="¿Quitar esta función?"
        description="Se eliminará del borrador. Guardá el formulario para persistir."
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        loading={false}
        onConfirm={confirmRemoveSection}
        variant="danger"
      />

      <Modal
        open={titleModal}
        onClose={() => !saving && setTitleModal(false)}
        title="Título de la sección"
        description="Encabezado visible en el portal debajo del órgano legislativo."
        size="default"
        loading={saving}
      >
        <label className={labelClass}>
          Título
          <input
            className={inputClass}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            disabled={saving}
          />
        </label>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setTitleModal(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={saveTitle} disabled={saving}>
            Aplicar
          </Button>
        </div>
      </Modal>

      <Modal
        open={sectionModal !== null}
        onClose={() => !saving && setSectionModal(null)}
        title={sectionModal === 'new' ? 'Nueva función' : 'Editar función'}
        description="Numeración, textos, subsecciones y listas. Separá párrafos con una línea en blanco."
        size="wide"
        loading={saving}
      >
        <div className="max-h-[min(72dvh,640px)] space-y-5 overflow-y-auto px-0.5 pb-1">
          {sectionError ? (
            <p className={formErrorClass} role="alert">
              {sectionError}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-3">
            <label className={labelClass}>
              Número (opcional)
              <input
                className={inputClass}
                value={sectionDraft.number}
                onChange={(e) =>
                  setSectionDraft((d) => ({ ...d, number: e.target.value }))
                }
                disabled={saving}
                placeholder="1"
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Título de la función
              <input
                className={inputClass}
                value={sectionDraft.title}
                onChange={(e) =>
                  setSectionDraft((d) => ({ ...d, title: e.target.value }))
                }
                disabled={saving}
              />
            </label>
            <label className={labelClass}>
              Prioridad
              <input
                type="number"
                min={0}
                className={inputClass}
                value={sectionDraft.sortOrder ?? 0}
                onChange={(e) =>
                  setSectionDraft((d) => ({ ...d, sortOrder: e.target.value }))
                }
                disabled={saving}
              />
            </label>
          </div>
          <label className={labelClass}>
            Párrafos introductorios
            <textarea
              className={textareaClass}
              rows={4}
              value={sectionDraft.paragraphsText}
              onChange={(e) =>
                setSectionDraft((d) => ({ ...d, paragraphsText: e.target.value }))
              }
              disabled={saving}
              placeholder="Un párrafo por bloque; línea en blanco entre párrafos."
            />
          </label>

          <div className="space-y-4 border-t border-slate-200 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">Subsecciones</p>
              <button
                type="button"
                disabled={saving}
                onClick={addSubsection}
                className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 disabled:opacity-50"
              >
                + Subsección
              </button>
            </div>
            {(sectionDraft.subsections || []).length === 0 ? (
              <p className="text-sm text-slate-500">Sin subsecciones (opcional).</p>
            ) : (
              (sectionDraft.subsections || []).map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Subsección
                    </p>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => removeSubsection(sub.id)}
                      className="text-xs font-semibold text-red-700 hover:text-red-900"
                    >
                      Quitar subsección
                    </button>
                  </div>
                  <label className={labelClass}>
                    Título
                    <input
                      className={inputClass}
                      value={sub.title}
                      onChange={(e) => updateSubsection(sub.id, { title: e.target.value })}
                      disabled={saving}
                    />
                  </label>
                  <label className={labelClass}>
                    Párrafos
                    <textarea
                      className={textareaClass}
                      rows={3}
                      value={sub.paragraphsText}
                      onChange={(e) =>
                        updateSubsection(sub.id, { paragraphsText: e.target.value })
                      }
                      disabled={saving}
                    />
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-600">Listas</p>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => addListGroup(sub.id)}
                        className="text-xs font-semibold text-sky-800 hover:text-sky-950"
                      >
                        + Lista
                      </button>
                    </div>
                    {(sub.listGroups || []).map((g) => (
                      <div
                        key={g.id}
                        className="rounded-lg border border-slate-200 bg-white p-3 space-y-2"
                      >
                        <div className="flex justify-end">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => removeListGroup(sub.id, g.id)}
                            className="text-xs text-red-700"
                          >
                            Quitar lista
                          </button>
                        </div>
                        <label className={labelClass}>
                          Título de la lista (opcional)
                          <input
                            className={inputClass}
                            value={g.title}
                            onChange={(e) =>
                              updateListGroup(sub.id, g.id, { title: e.target.value })
                            }
                            disabled={saving}
                          />
                        </label>
                        <label className={labelClass}>
                          Ítems (uno por línea)
                          <textarea
                            className={textareaClass}
                            rows={3}
                            value={g.itemsText}
                            onChange={(e) =>
                              updateListGroup(sub.id, g.id, { itemsText: e.target.value })
                            }
                            disabled={saving}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                  <label className={labelClass}>
                    Ejemplos — título (opcional)
                    <input
                      className={inputClass}
                      value={sub.examplesTitle}
                      onChange={(e) =>
                        updateSubsection(sub.id, { examplesTitle: e.target.value })
                      }
                      disabled={saving}
                      placeholder="Ejemplos"
                    />
                  </label>
                  <label className={labelClass}>
                    Ejemplos — ítems (uno por línea)
                    <textarea
                      className={textareaClass}
                      rows={2}
                      value={sub.examplesItemsText}
                      onChange={(e) =>
                        updateSubsection(sub.id, { examplesItemsText: e.target.value })
                      }
                      disabled={saving}
                    />
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setSectionModal(null)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={saveSection} disabled={saving}>
            Aplicar al borrador
          </Button>
        </div>
      </Modal>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">
              Vista previa pública
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Debajo de «Órgano Legislativo y de Control Municipal».
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={openTitleModal}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-sky-200 hover:bg-sky-50"
            >
              Editar título
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={openNewSection}
              className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100"
            >
              + Función
            </button>
          </div>
        </div>

        <ConcejoMainFunctionsSection mainFunctions={mainFunctions} />

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedSections.map((section, idx) => (
            <SectionCardPreview
              key={section.id}
              section={section}
              index={idx}
              disabled={saving}
              onEdit={() => openEditSection(section.id)}
              onRemove={() => setRemoveSectionId(section.id)}
              onMoveUp={() => moveSection(section.id, -1)}
              onMoveDown={() => moveSection(section.id, 1)}
            />
          ))}
        </ul>
      </div>
    </>
  )
}
