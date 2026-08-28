import { useMemo, useState } from 'react'
import { Modal } from '../ui/Modal.jsx'
import { inputClass, labelClass } from '../ui/formStyles.js'
import { makeFdcItemId } from '../../data/fdcContent.js'
import {
  collectDistinctLocalities,
  getAssignedLocalityVariants,
  localityVariantKey,
} from '../../utils/fdcStallApplicationFilters.js'

const BTN =
  'inline-flex min-h-9 items-center justify-center rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60'
const BTN_NEUTRAL = `${BTN} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`
const BTN_PRIMARY = `${BTN} bg-sky-700 text-white hover:bg-sky-800`
const BTN_DANGER = `${BTN} border border-red-200 bg-white text-red-700 hover:bg-red-50`
const BTN_GHOST = `${BTN} text-slate-600 hover:bg-slate-100`

export function FdcLocalityGroupManager({
  items,
  groups,
  onSave,
  saving = false,
}) {
  const [open, setOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [draft, setDraft] = useState(null)

  const distinctLocalities = useMemo(() => collectDistinctLocalities(items), [items])

  const assignedElsewhere = useMemo(
    () => getAssignedLocalityVariants(groups, draft?.id || null),
    [groups, draft?.id],
  )

  const unassigned = useMemo(() => {
    const assigned = getAssignedLocalityVariants(groups)
    return distinctLocalities.filter((entry) => !assigned.has(localityVariantKey(entry.raw)))
  }, [distinctLocalities, groups])

  function openNewGroup() {
    setDraft({ id: makeFdcItemId('loc'), label: '', variants: [] })
    setEditorOpen(true)
  }

  function openEditGroup(group) {
    setDraft({
      id: group.id,
      label: group.label,
      variants: [...(group.variants || [])],
    })
    setEditorOpen(true)
  }

  function toggleVariant(raw) {
    if (!draft) return
    const key = localityVariantKey(raw)
    const has = draft.variants.some((v) => localityVariantKey(v) === key)
    setDraft({
      ...draft,
      variants: has
        ? draft.variants.filter((v) => localityVariantKey(v) !== key)
        : [...draft.variants, raw],
    })
  }

  async function persistGroups(nextGroups) {
    await onSave(nextGroups)
  }

  async function handleDeleteGroup(groupId) {
    const next = groups.filter((g) => g.id !== groupId)
    await persistGroups(next)
  }

  async function handleEditorSave() {
    if (!draft) return
    const label = String(draft.label || '').trim()
    if (!label) return
    if (draft.variants.length === 0) return

    const payload = {
      id: draft.id,
      label,
      variants: draft.variants,
    }

    const exists = groups.some((g) => g.id === draft.id)
    const next = exists
      ? groups.map((g) => (g.id === draft.id ? payload : g))
      : [...groups, payload]

    await persistGroups(next)
    setEditorOpen(false)
    setDraft(null)
  }

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left sm:px-4"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <p className="text-sm font-semibold text-slate-900">Agrupar localidades manualmente</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Unificá variantes a tu criterio. Tiene prioridad sobre la detección automática.
          </p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-sky-700">
          {open ? 'Ocultar' : 'Gestionar'}
          {groups.length > 0 ? ` (${groups.length})` : ''}
        </span>
      </button>

      {open ? (
        <div className="space-y-3 border-t border-slate-100 px-3.5 pb-3.5 pt-3 sm:px-4">
          {groups.length === 0 ? (
            <p className="text-sm text-slate-600">
              Todavía no hay agrupaciones manuales. Las localidades se agrupan solas por similitud.
            </p>
          ) : (
            <ul className="space-y-2">
              {groups.map((group) => (
                <li
                  key={group.id}
                  className="rounded-lg border border-slate-200/90 bg-slate-50/60 px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{group.label}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {(group.variants || []).map((variant) => (
                          <span
                            key={`${group.id}-${variant}`}
                            className="inline-flex rounded-md bg-white px-2 py-0.5 text-xs text-slate-700 ring-1 ring-slate-200/80"
                          >
                            {variant}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        className={BTN_GHOST}
                        disabled={saving}
                        onClick={() => openEditGroup(group)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={BTN_DANGER}
                        disabled={saving}
                        onClick={() => void handleDeleteGroup(group.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {unassigned.length > 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sin agrupar ({unassigned.length})
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Estas localidades siguen agrupándose automáticamente en el filtro.
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {unassigned.slice(0, 24).map((entry) => (
                  <span
                    key={entry.raw}
                    className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                  >
                    {entry.raw}
                  </span>
                ))}
                {unassigned.length > 24 ? (
                  <span className="text-xs text-slate-500">+{unassigned.length - 24} más</span>
                ) : null}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            className={BTN_PRIMARY}
            disabled={saving || distinctLocalities.length === 0}
            onClick={openNewGroup}
          >
            + Nueva agrupación
          </button>
        </div>
      ) : null}

      <Modal
        open={editorOpen}
        onClose={() => {
          if (saving) return
          setEditorOpen(false)
          setDraft(null)
        }}
        title={groups.some((g) => g.id === draft?.id) ? 'Editar agrupación' : 'Nueva agrupación'}
      >
        {draft ? (
          <div className="space-y-4">
            <label className={labelClass}>
              Nombre del grupo (aparece en el filtro)
              <input
                type="text"
                className={inputClass}
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                placeholder="Ej. Trancas"
                maxLength={120}
              />
            </label>

            <div>
              <p className={labelClass}>Variantes a unificar</p>
              <p className="mb-2 text-xs text-slate-500">
                Marcá cada forma distinta con la que escribieron la misma localidad.
              </p>
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
                {distinctLocalities.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-slate-500">No hay localidades en las solicitudes.</p>
                ) : (
                  distinctLocalities.map((entry) => {
                    const key = localityVariantKey(entry.raw)
                    const checked = draft.variants.some((v) => localityVariantKey(v) === key)
                    const blocked = !checked && assignedElsewhere.has(key)
                    return (
                      <label
                        key={entry.raw}
                        className={`flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm ${
                          blocked ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={checked}
                          disabled={blocked || saving}
                          onChange={() => toggleVariant(entry.raw)}
                        />
                        <span className="min-w-0 flex-1 text-slate-800">{entry.raw}</span>
                        {blocked ? (
                          <span className="shrink-0 text-[11px] text-slate-500">En otro grupo</span>
                        ) : null}
                      </label>
                    )
                  })
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                className={BTN_NEUTRAL}
                disabled={saving}
                onClick={() => {
                  setEditorOpen(false)
                  setDraft(null)
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={BTN_PRIMARY}
                disabled={
                  saving ||
                  !String(draft.label || '').trim() ||
                  draft.variants.length === 0
                }
                onClick={() => void handleEditorSave()}
              >
                {saving ? 'Guardando…' : 'Guardar agrupación'}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
