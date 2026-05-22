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
  buildCoordinatingPresidentsList,
  cleanConcejoSortOrder,
  nextCommissionPriority,
  normalizeCommissions,
  sortCommissions,
} from '../../../data/concejoCommissionsContent.js'
import { ConcejoCommissionsSection } from '../../concejo/ConcejoCommissionsSection.jsx'

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function emptyCommissionDraft(sortOrder = 10, kind = 'standard') {
  const empty = { name: '', role: '' }
  return {
    id: makeId('com'),
    sortOrder,
    number: '',
    name: '',
    kind,
    presidenteName: '',
    presidenteRole: '',
    vocal1Name: '',
    vocal1Role: '',
    vocal2Name: '',
    vocal2Role: '',
  }
}

function commissionToDraft(commission) {
  return {
    id: commission.id,
    sortOrder: cleanConcejoSortOrder(commission.sortOrder, 10),
    number: commission.number || '',
    name: commission.name || '',
    kind: commission.kind === 'coordinating' ? 'coordinating' : 'standard',
    presidenteName: commission.presidente?.name || '',
    presidenteRole: commission.presidente?.role || '',
    vocal1Name: commission.vocal1?.name || '',
    vocal1Role: commission.vocal1?.role || '',
    vocal2Name: commission.vocal2?.name || '',
    vocal2Role: commission.vocal2?.role || '',
  }
}

function draftToCommission(draft) {
  const name = String(draft.name || '').trim()
  if (!name) return null
  const kind = draft.kind === 'coordinating' ? 'coordinating' : 'standard'
  const holder = (n, r) => ({
    name: String(n || '').trim(),
    role: String(r || '').trim(),
  })
  return {
    id: draft.id || makeId('com'),
    sortOrder: cleanConcejoSortOrder(draft.sortOrder, 10),
    number: String(draft.number || '').trim(),
    name,
    kind,
    presidente: holder(draft.presidenteName, draft.presidenteRole),
    vocal1: kind === 'standard' ? holder(draft.vocal1Name, draft.vocal1Role) : { name: '', role: '' },
    vocal2: kind === 'standard' ? holder(draft.vocal2Name, draft.vocal2Role) : { name: '', role: '' },
  }
}

function CommissionAdminCard({
  commission,
  index,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
  disabled,
}) {
  const isCoord = commission.kind === 'coordinating'
  return (
    <li className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={onMoveUp}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm font-bold hover:bg-sky-50 disabled:opacity-50"
          aria-label="Subir"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onMoveDown}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm font-bold hover:bg-sky-50 disabled:opacity-50"
          aria-label="Bajar"
        >
          ↓
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onEdit}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold hover:bg-sky-50"
        >
          Editar
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-800"
        >
          Quitar
        </button>
      </div>
      <span className="inline-flex rounded-full bg-slate-900/85 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
        P.{cleanConcejoSortOrder(commission.sortOrder, (index + 1) * 10)}
      </span>
      {isCoord ? (
        <span className="ml-2 inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-900">
          Coordinadora
        </span>
      ) : null}
      <h4 className="mt-2 pr-32 font-serif text-lg font-bold text-[#171b22]">
        {commission.number}. {commission.name}
      </h4>
      <p className="mt-1 text-xs text-slate-500">
        {isCoord
          ? `Presidente: ${commission.presidente?.name || '(sin asignar)'} · Lista auto desde com. 1–7`
          : `Presidente: ${commission.presidente?.name || '—'} · Vocal 1: ${commission.vocal1?.name || '—'} · Vocal 2: ${commission.vocal2?.name || '—'}`}
      </p>
    </li>
  )
}

function HolderFields({ prefix, labelPrefix, draft, setDraft, saving, disabled }) {
  const nameKey = `${prefix}Name`
  const roleKey = `${prefix}Role`
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className={labelClass}>
        {labelPrefix} — nombre
        <input
          className={inputClass}
          value={draft[nameKey] || ''}
          onChange={(e) => setDraft((d) => ({ ...d, [nameKey]: e.target.value }))}
          disabled={saving || disabled}
        />
      </label>
      <label className={labelClass}>
        {labelPrefix} — cargo (opcional)
        <input
          className={inputClass}
          value={draft[roleKey] || ''}
          onChange={(e) => setDraft((d) => ({ ...d, [roleKey]: e.target.value }))}
          disabled={saving || disabled}
          placeholder="Ej. Concejal"
        />
      </label>
    </div>
  )
}

export function AdminConcejoCommissionsPanel({ form, setForm, saving }) {
  const [headerModal, setHeaderModal] = useState(false)
  const [headerDraft, setHeaderDraft] = useState({ title: '', subtitle: '' })
  const [commissionModal, setCommissionModal] = useState(null)
  const [commissionDraft, setCommissionDraft] = useState(() => emptyCommissionDraft())
  const [commissionError, setCommissionError] = useState('')
  const [removeCommissionId, setRemoveCommissionId] = useState(null)

  const commissions = useMemo(
    () => normalizeCommissions(form.commissions),
    [form.commissions],
  )

  const sortedItems = useMemo(
    () => sortCommissions(commissions.items || []),
    [commissions.items],
  )

  const linkedPreview = useMemo(
    () => buildCoordinatingPresidentsList(sortedItems),
    [sortedItems],
  )

  function updateCommissions(next) {
    setForm((prev) => ({
      ...prev,
      commissions: normalizeCommissions(next, prev.commissions),
    }))
  }

  function openHeaderModal() {
    setHeaderDraft({
      title: commissions.title || '',
      subtitle: commissions.subtitle || '',
    })
    setHeaderModal(true)
  }

  function saveHeader() {
    updateCommissions({
      ...commissions,
      title: headerDraft.title.trim(),
      subtitle: headerDraft.subtitle.trim(),
    })
    setHeaderModal(false)
  }

  function openNewCommission(kind = 'standard') {
    setCommissionDraft(emptyCommissionDraft(nextCommissionPriority(commissions.items), kind))
    setCommissionError('')
    setCommissionModal('new')
  }

  function openEditCommission(id) {
    const row = sortedItems.find((c) => c.id === id)
    if (!row) return
    setCommissionDraft(commissionToDraft(row))
    setCommissionError('')
    setCommissionModal(id)
  }

  function moveCommission(id, direction) {
    const list = sortCommissions(commissions.items || [])
    const index = list.findIndex((c) => c.id === id)
    if (index < 0) return
    const target = index + direction
    if (target < 0 || target >= list.length) return
    const next = [...list]
    const a = cleanConcejoSortOrder(next[index].sortOrder, (index + 1) * 10)
    const b = cleanConcejoSortOrder(next[target].sortOrder, (target + 1) * 10)
    next[index] = { ...next[index], sortOrder: b }
    next[target] = { ...next[target], sortOrder: a }
    updateCommissions({ ...commissions, items: next })
  }

  function saveCommission() {
    const built = draftToCommission(commissionDraft)
    if (!built) {
      setCommissionError('Completá al menos el nombre de la comisión.')
      return
    }
    const list = [...(commissions.items || [])]
    if (commissionModal === 'new') {
      list.push(built)
    } else {
      const idx = list.findIndex((c) => c.id === commissionModal)
      if (idx >= 0) list[idx] = built
      else list.push(built)
    }
    updateCommissions({ ...commissions, items: list })
    setCommissionModal(null)
    setCommissionError('')
  }

  function confirmRemove() {
    if (!removeCommissionId) return
    updateCommissions({
      ...commissions,
      items: (commissions.items || []).filter((c) => c.id !== removeCommissionId),
    })
    setRemoveCommissionId(null)
  }

  const isCoordinatingDraft = commissionDraft.kind === 'coordinating'

  return (
    <>
      <ConfirmDialog
        open={removeCommissionId !== null}
        onClose={() => !saving && setRemoveCommissionId(null)}
        title="¿Quitar esta comisión?"
        description="Se eliminará del borrador. Guardá el formulario para persistir."
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        loading={false}
        onConfirm={confirmRemove}
        variant="danger"
      />

      <Modal
        open={headerModal}
        onClose={() => !saving && setHeaderModal(false)}
        title="Encabezado de comisiones"
        size="default"
        loading={saving}
      >
        <label className={labelClass}>
          Título
          <input
            className={inputClass}
            value={headerDraft.title}
            onChange={(e) => setHeaderDraft((d) => ({ ...d, title: e.target.value }))}
            disabled={saving}
          />
        </label>
        <label className={`${labelClass} mt-4`}>
          Subtítulo
          <textarea
            className={textareaClass}
            rows={2}
            value={headerDraft.subtitle}
            onChange={(e) => setHeaderDraft((d) => ({ ...d, subtitle: e.target.value }))}
            disabled={saving}
          />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setHeaderModal(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={saveHeader} disabled={saving}>
            Aplicar
          </Button>
        </div>
      </Modal>

      <Modal
        open={commissionModal !== null}
        onClose={() => !saving && setCommissionModal(null)}
        title={commissionModal === 'new' ? 'Nueva comisión' : 'Editar comisión'}
        description={
          isCoordinatingDraft
            ? 'Comisión coordinadora: solo presidente. Los presidentes de las comisiones 1 a 7 se listan automáticamente en el portal.'
            : 'Presidente/a y dos vocales por comisión.'
        }
        size="wide"
        loading={saving}
      >
        <div className="max-h-[min(70dvh,560px)] space-y-4 overflow-y-auto px-0.5">
          {commissionError ? (
            <p className={formErrorClass} role="alert">
              {commissionError}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Tipo
              <select
                className={inputClass}
                value={commissionDraft.kind}
                onChange={(e) =>
                  setCommissionDraft((d) => ({
                    ...d,
                    kind: e.target.value,
                  }))
                }
                disabled={saving}
              >
                <option value="standard">Comisión estándar (presidente + 2 vocales)</option>
                <option value="coordinating">Comisión coordinadora (n.º 8)</option>
              </select>
            </label>
            <label className={labelClass}>
              Prioridad
              <input
                type="number"
                min={0}
                className={inputClass}
                value={commissionDraft.sortOrder ?? 0}
                onChange={(e) =>
                  setCommissionDraft((d) => ({ ...d, sortOrder: e.target.value }))
                }
                disabled={saving}
              />
            </label>
            <label className={labelClass}>
              Número
              <input
                className={inputClass}
                value={commissionDraft.number}
                onChange={(e) =>
                  setCommissionDraft((d) => ({ ...d, number: e.target.value }))
                }
                disabled={saving}
                placeholder="1"
              />
            </label>
            <label className={labelClass}>
              Nombre de la comisión
              <input
                className={inputClass}
                value={commissionDraft.name}
                onChange={(e) =>
                  setCommissionDraft((d) => ({ ...d, name: e.target.value }))
                }
                disabled={saving}
              />
            </label>
          </div>

          <HolderFields
            prefix="presidente"
            labelPrefix="Presidente/a"
            draft={commissionDraft}
            setDraft={setCommissionDraft}
            saving={saving}
          />

          {!isCoordinatingDraft ? (
            <>
              <HolderFields
                prefix="vocal1"
                labelPrefix="Vocal 1°"
                draft={commissionDraft}
                setDraft={setCommissionDraft}
                saving={saving}
              />
              <HolderFields
                prefix="vocal2"
                labelPrefix="Vocal 2°"
                draft={commissionDraft}
                setDraft={setCommissionDraft}
                saving={saving}
              />
            </>
          ) : (
            <div className="rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sm text-sky-950">
              <p className="font-semibold">Vista de presidentes vinculados</p>
              <ul className="mt-2 space-y-1 text-xs">
                {linkedPreview.length === 0 ? (
                  <li className="text-sky-800/80">Agregá comisiones estándar (1–7) con presidente.</li>
                ) : (
                  linkedPreview.map((row) => (
                    <li key={row.commissionId}>
                      Com. {row.number} — {row.commissionName}:{' '}
                      {row.presidentName || '(pendiente)'}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setCommissionModal(null)} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={saveCommission} disabled={saving}>
            Aplicar al borrador
          </Button>
        </div>
      </Modal>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600">Debajo del cuerpo de concejales en el portal.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={openHeaderModal}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
            >
              Editar encabezado
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => openNewCommission('standard')}
              className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800"
            >
              + Comisión
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => openNewCommission('coordinating')}
              className="rounded-lg border border-sky-300 bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-900"
            >
              + Coordinadora
            </button>
          </div>
        </div>

        <ConcejoCommissionsSection commissions={commissions} />

        <ul className="grid gap-3 lg:grid-cols-2">
          {sortedItems.map((commission, idx) => (
            <CommissionAdminCard
              key={commission.id}
              commission={commission}
              index={idx}
              disabled={saving}
              onEdit={() => openEditCommission(commission.id)}
              onRemove={() => setRemoveCommissionId(commission.id)}
              onMoveUp={() => moveCommission(commission.id, -1)}
              onMoveDown={() => moveCommission(commission.id, 1)}
            />
          ))}
        </ul>
      </div>
    </>
  )
}
