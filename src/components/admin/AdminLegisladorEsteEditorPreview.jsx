import { useState } from 'react'
import { Modal } from '../ui/Modal.jsx'
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx'
import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { LegisladorCommissionsSection } from '../legislador/LegisladorCommissionsSection.jsx'
import { LegisladorLawsSection } from '../legislador/LegisladorLawsSection.jsx'
import { LegisladorProjectsSection } from '../legislador/LegisladorProjectsSection.jsx'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'
import { sortLegislatorCommissions } from '../../data/legisladorCommissionsContent.js'
import { sortLegislatorLaws } from '../../data/legisladorLawsContent.js'
import { sortProjectStats } from '../../data/legisladorProjectsContent.js'

const ACTION_BTN_PRIMARY =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60'

function EditChip({ label = 'Editar', onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 disabled:opacity-60"
    >
      {label}
    </button>
  )
}

function AddChip({ label = 'Agregar', onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-800 shadow-sm transition hover:bg-sky-100 disabled:opacity-60"
    >
      {label}
    </button>
  )
}

function DeleteChip({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-50 disabled:opacity-60"
    >
      Quitar
    </button>
  )
}

function VisibilityToggle({ label, hint, checked, onChange, disabled }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 transition hover:border-slate-300 hover:bg-white">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 disabled:cursor-not-allowed"
        checked={Boolean(checked)}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        {hint ? <span className="mt-0.5 text-xs text-slate-500">{hint}</span> : null}
      </span>
    </label>
  )
}

const EMPTY_PROJECT = { id: '', year: new Date().getFullYear(), count: 0 }
const EMPTY_COMMISSION = {
  id: '',
  number: '',
  name: '',
  roleLabel: 'MIEMBRO',
  roleHolder: '',
  competencies: '',
}
const EMPTY_LAW = { id: '', number: '', label: '', body: '' }

export function AdminLegisladorEsteEditorPreview({
  form,
  setForm,
  loading,
  saving,
  error,
  onSubmit,
  apiAvailable,
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

  function setFlag(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateSection(sectionKey, patch) {
    setForm((prev) => ({
      ...prev,
      [sectionKey]: { ...(prev[sectionKey] || {}), ...patch },
    }))
  }

  function applyProject(draft, index) {
    const row = {
      id: String(draft.id || '').trim() || `leg-proj-${Date.now()}`,
      sortOrder: Number(draft.sortOrder) || (index != null ? (index + 1) * 10 : 999),
      year: Math.round(Number(draft.year)),
      count: Math.max(0, Math.round(Number(draft.count) || 0)),
    }
    if (!row.year) return
    setForm((prev) => {
      const items = [...(prev.presentedProjects?.items || [])]
      if (index == null) items.push(row)
      else items[index] = row
      items.sort((a, b) => a.sortOrder - b.sortOrder || a.year - b.year)
      return {
        ...prev,
        presentedProjects: { ...(prev.presentedProjects || {}), items },
      }
    })
  }

  function applyCommission(draft, index) {
    const name = String(draft.name || '').trim()
    if (!name) return
    const row = {
      id: String(draft.id || '').trim() || `leg-com-${Date.now()}`,
      sortOrder: Number(draft.sortOrder) || (index != null ? (index + 1) * 10 : 999),
      number: String(draft.number || '').trim(),
      name,
      roleLabel: String(draft.roleLabel || '').trim() || 'MIEMBRO',
      roleHolder: String(draft.roleHolder || '').trim(),
      competencies: String(draft.competencies || '').trim(),
    }
    setForm((prev) => {
      const items = [...(prev.commissions?.items || [])]
      if (index == null) items.push(row)
      else items[index] = row
      items.sort((a, b) => a.sortOrder - b.sortOrder)
      return { ...prev, commissions: { ...(prev.commissions || {}), items } }
    })
  }

  function applyLaw(draft, index) {
    const body = String(draft.body || '').trim()
    const number = String(draft.number || '').trim()
    if (!body && !number) return
    const row = {
      id: String(draft.id || '').trim() || `leg-law-${Date.now()}`,
      sortOrder: Number(draft.sortOrder) || (index != null ? (index + 1) * 10 : 999),
      number,
      label: String(draft.label || '').trim() || (number ? `LEY ${number}` : 'LEY'),
      body,
    }
    setForm((prev) => {
      const items = [...(prev.laws?.items || [])]
      if (index == null) items.push(row)
      else items[index] = row
      items.sort((a, b) => a.sortOrder - b.sortOrder)
      return { ...prev, laws: { ...(prev.laws || {}), items } }
    })
  }

  function removeItem(sectionKey, index) {
    setForm((prev) => {
      const items = [...(prev[sectionKey]?.items || [])]
      items.splice(index, 1)
      return { ...prev, [sectionKey]: { ...(prev[sectionKey] || {}), items } }
    })
  }

  function handleSaveEditor() {
    if (!editor) return
    const { kind, index, draft } = editor
    switch (kind) {
      case 'legislator':
        setForm((prev) => ({
          ...prev,
          legislatorName: String(draft.legislatorName || '').trim(),
          legislatorRole: String(draft.legislatorRole || '').trim(),
          legislatorBio: String(draft.legislatorBio || ''),
          legislatorPhotoUrl: String(draft.legislatorPhotoUrl || '').trim(),
          contactEmail: String(draft.contactEmail || '').trim(),
          contactPhone: String(draft.contactPhone || '').trim(),
          officeHours: String(draft.officeHours || '').trim(),
        }))
        break
      case 'projectsMeta':
        updateSection('presentedProjects', {
          title: String(draft.title || '').trim(),
          subtitle: String(draft.subtitle || '').trim(),
          enabled: draft.enabled !== false,
        })
        break
      case 'project':
        applyProject(draft, index)
        break
      case 'commissionsMeta':
        updateSection('commissions', {
          title: String(draft.title || '').trim(),
          subtitle: String(draft.subtitle || '').trim(),
          enabled: draft.enabled !== false,
        })
        break
      case 'commission':
        applyCommission(draft, index)
        break
      case 'lawsMeta':
        updateSection('laws', {
          title: String(draft.title || '').trim(),
          subtitle: String(draft.subtitle || '').trim(),
          enabled: draft.enabled !== false,
        })
        break
      case 'law':
        applyLaw(draft, index)
        break
      default:
        break
    }
    closeEditor()
  }

  const projects = sortProjectStats(form.presentedProjects?.items || [])
  const commissions = sortLegislatorCommissions(form.commissions?.items || [])
  const laws = sortLegislatorLaws(form.laws?.items || [])

  return (
    <>
      <ConfirmDialog
        open={Boolean(confirmRemove)}
        title={confirmRemove?.title || '¿Quitar este elemento?'}
        description={confirmRemove?.description}
        confirmLabel="Quitar"
        tone="danger"
        onCancel={() => setConfirmRemove(null)}
        onConfirm={() => {
          if (confirmRemove?.onConfirm) confirmRemove.onConfirm()
          setConfirmRemove(null)
        }}
      />

      {editor ? (
        <Modal
          open
          title={
            editor.kind === 'legislator'
              ? 'Editar ficha del legislador'
              : editor.kind === 'project'
                ? editor.index == null
                  ? 'Nuevo año'
                  : 'Editar estadística'
                : editor.kind === 'commission'
                  ? editor.index == null
                    ? 'Nueva comisión'
                    : 'Editar comisión'
                  : editor.kind === 'law'
                    ? editor.index == null
                      ? 'Nueva ley'
                      : 'Editar ley'
                    : 'Editar sección'
          }
          onClose={closeEditor}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEditor}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
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
          }
        >
          {editor.kind === 'legislator' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Nombre
                <input
                  className={inputClass}
                  value={editor.draft?.legislatorName || ''}
                  onChange={(e) => setDraftField('legislatorName', e.target.value)}
                />
              </label>
              <label className={labelClass}>
                Cargo
                <input
                  className={inputClass}
                  value={editor.draft?.legislatorRole || ''}
                  onChange={(e) => setDraftField('legislatorRole', e.target.value)}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Biografía
                <textarea
                  className={`${textareaClass} min-h-28`}
                  value={editor.draft?.legislatorBio || ''}
                  onChange={(e) => setDraftField('legislatorBio', e.target.value)}
                />
              </label>
              <div className="sm:col-span-2">
                <SingleImageUploadField
                  label="Foto del legislador"
                  value={editor.draft?.legislatorPhotoUrl || ''}
                  onChange={(v) => setDraftField('legislatorPhotoUrl', v)}
                  kind="cover"
                  disabled={saving}
                />
              </div>
              <label className={labelClass}>
                Correo
                <input
                  className={inputClass}
                  value={editor.draft?.contactEmail || ''}
                  onChange={(e) => setDraftField('contactEmail', e.target.value)}
                />
              </label>
              <label className={labelClass}>
                Teléfono
                <input
                  className={inputClass}
                  value={editor.draft?.contactPhone || ''}
                  onChange={(e) => setDraftField('contactPhone', e.target.value)}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Horario
                <input
                  className={inputClass}
                  value={editor.draft?.officeHours || ''}
                  onChange={(e) => setDraftField('officeHours', e.target.value)}
                />
              </label>
            </div>
          ) : null}

          {editor.kind === 'projectsMeta' ? (
            <div className="grid gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={editor.draft?.enabled !== false}
                  onChange={(e) => setDraftField('enabled', e.target.checked)}
                />
                Sección visible en el sitio
              </label>
              <label className={labelClass}>
                Título
                <input
                  className={inputClass}
                  value={editor.draft?.title || ''}
                  onChange={(e) => setDraftField('title', e.target.value)}
                />
              </label>
              <label className={labelClass}>
                Subtítulo
                <textarea
                  className={`${textareaClass} min-h-20`}
                  value={editor.draft?.subtitle || ''}
                  onChange={(e) => setDraftField('subtitle', e.target.value)}
                />
              </label>
            </div>
          ) : null}

          {editor.kind === 'project' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Año
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  className={inputClass}
                  value={editor.draft?.year ?? ''}
                  onChange={(e) => setDraftField('year', e.target.value)}
                />
              </label>
              <label className={labelClass}>
                Cantidad de proyectos
                <input
                  type="number"
                  min={0}
                  max={99999}
                  className={inputClass}
                  value={editor.draft?.count ?? ''}
                  onChange={(e) => setDraftField('count', e.target.value)}
                />
              </label>
            </div>
          ) : null}

          {editor.kind === 'commissionsMeta' || editor.kind === 'lawsMeta' ? (
            <div className="grid gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={editor.draft?.enabled !== false}
                  onChange={(e) => setDraftField('enabled', e.target.checked)}
                />
                Sección visible en el sitio
              </label>
              <label className={labelClass}>
                Título
                <input
                  className={inputClass}
                  value={editor.draft?.title || ''}
                  onChange={(e) => setDraftField('title', e.target.value)}
                />
              </label>
              <label className={labelClass}>
                Subtítulo
                <textarea
                  className={`${textareaClass} min-h-20`}
                  value={editor.draft?.subtitle || ''}
                  onChange={(e) => setDraftField('subtitle', e.target.value)}
                />
              </label>
            </div>
          ) : null}

          {editor.kind === 'commission' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                N.º
                <input
                  className={inputClass}
                  value={editor.draft?.number || ''}
                  onChange={(e) => setDraftField('number', e.target.value)}
                />
              </label>
              <label className={labelClass}>
                Rol (etiqueta)
                <input
                  className={inputClass}
                  value={editor.draft?.roleLabel || ''}
                  onChange={(e) => setDraftField('roleLabel', e.target.value)}
                  placeholder="PRESIDENTE, SECRETARIO, MIEMBRO…"
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Nombre de la comisión
                <input
                  className={inputClass}
                  value={editor.draft?.name || ''}
                  onChange={(e) => setDraftField('name', e.target.value)}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Titular
                <input
                  className={inputClass}
                  value={editor.draft?.roleHolder || ''}
                  onChange={(e) => setDraftField('roleHolder', e.target.value)}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Competencias
                <textarea
                  className={`${textareaClass} min-h-32`}
                  value={editor.draft?.competencies || ''}
                  onChange={(e) => setDraftField('competencies', e.target.value)}
                />
              </label>
            </div>
          ) : null}

          {editor.kind === 'law' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Número
                <input
                  className={inputClass}
                  value={editor.draft?.number || ''}
                  onChange={(e) => setDraftField('number', e.target.value)}
                  placeholder="9840"
                />
              </label>
              <label className={labelClass}>
                Etiqueta
                <input
                  className={inputClass}
                  value={editor.draft?.label || ''}
                  onChange={(e) => setDraftField('label', e.target.value)}
                  placeholder="LEY 9840"
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Texto de la ley
                <textarea
                  className={`${textareaClass} min-h-36`}
                  value={editor.draft?.body || ''}
                  onChange={(e) => setDraftField('body', e.target.value)}
                />
              </label>
            </div>
          ) : null}
        </Modal>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
        Los cambios quedan en borrador hasta que toques «Guardar cambios» al final de la página.
      </div>

      <form className="mt-6 space-y-8" onSubmit={onSubmit}>
        <section className="overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#f7f7f5]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ddd7ca] bg-white px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Vista previa pública</h2>
              <p className="text-sm text-slate-600">Así se verá la página del legislador.</p>
            </div>
            <EditChip
              label="Editar ficha"
              disabled={loading || saving}
              onClick={() =>
                openEditor('legislator', null, {
                  legislatorName: form.legislatorName,
                  legislatorRole: form.legislatorRole,
                  legislatorBio: form.legislatorBio,
                  legislatorPhotoUrl: form.legislatorPhotoUrl,
                  contactEmail: form.contactEmail,
                  contactPhone: form.contactPhone,
                  officeHours: form.officeHours,
                })
              }
            />
          </div>
          <div className="pointer-events-none p-4 sm:p-6">
            <div className="rounded-[1.75rem] border border-[#ddd7ca] bg-white p-4 opacity-95">
              <p className="text-xs font-bold uppercase tracking-wider text-sky-800">Legislador</p>
              <p className="mt-2 font-serif text-xl font-bold text-[#171b22]">
                {form.legislatorName || '—'}
              </p>
              <p className="text-sm text-slate-600">{form.legislatorRole}</p>
            </div>
            {form.showPresentedProjects && form.presentedProjects?.enabled !== false ? (
              <div className="mt-6">
                <LegisladorProjectsSection section={form.presentedProjects} />
              </div>
            ) : null}
            {form.showCommissions && form.commissions?.enabled !== false ? (
              <LegisladorCommissionsSection section={form.commissions} />
            ) : null}
            {form.showLaws && form.laws?.enabled !== false ? (
              <LegisladorLawsSection section={form.laws} />
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Proyectos por año</h2>
              <p className="mt-1 text-sm text-slate-500">
                Contadores animados en la página pública.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <EditChip
                label="Título de sección"
                disabled={loading || saving}
                onClick={() =>
                  openEditor('projectsMeta', null, { ...form.presentedProjects })
                }
              />
              <AddChip
                label="Agregar año"
                disabled={loading || saving}
                onClick={() => openEditor('project', null, { ...EMPTY_PROJECT })}
              />
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {projects.map((row, index) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-800">
                  {row.year}: <strong>{row.count}</strong> proyectos
                </span>
                <div className="flex gap-2">
                  <EditChip
                    disabled={loading || saving}
                    onClick={() => openEditor('project', index, { ...row })}
                  />
                  <DeleteChip
                    disabled={loading || saving}
                    onClick={() =>
                      setConfirmRemove({
                        title: '¿Quitar este año?',
                        description: `Se eliminará ${row.year} del borrador.`,
                        onConfirm: () => removeItem('presentedProjects', index),
                      })
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Comisiones</h2>
              <p className="mt-1 text-sm text-slate-500">Dos por fila en la vista pública.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <EditChip
                label="Título de sección"
                disabled={loading || saving}
                onClick={() =>
                  openEditor('commissionsMeta', null, { ...form.commissions })
                }
              />
              <AddChip
                label="Agregar comisión"
                disabled={loading || saving}
                onClick={() => openEditor('commission', null, { ...EMPTY_COMMISSION })}
              />
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {commissions.map((row, index) => (
              <li
                key={row.id}
                className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-sky-800">
                      {row.number}. {row.roleLabel}
                    </p>
                    <p className="font-semibold text-slate-900">{row.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <EditChip
                      disabled={loading || saving}
                      onClick={() => openEditor('commission', index, { ...row })}
                    />
                    <DeleteChip
                      disabled={loading || saving}
                      onClick={() =>
                        setConfirmRemove({
                          title: '¿Quitar esta comisión?',
                          onConfirm: () => removeItem('commissions', index),
                        })
                      }
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Leyes</h2>
              <p className="mt-1 text-sm text-slate-500">Listado con línea de tiempo en el sitio.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <EditChip
                label="Título de sección"
                disabled={loading || saving}
                onClick={() => openEditor('lawsMeta', null, { ...form.laws })}
              />
              <AddChip
                label="Agregar ley"
                disabled={loading || saving}
                onClick={() => openEditor('law', null, { ...EMPTY_LAW })}
              />
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {laws.map((row, index) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
              >
                <span className="min-w-0 text-sm font-medium text-slate-800">
                  {row.label || `LEY ${row.number}`}
                </span>
                <div className="flex gap-2">
                  <EditChip
                    disabled={loading || saving}
                    onClick={() => openEditor('law', index, { ...row })}
                  />
                  <DeleteChip
                    disabled={loading || saving}
                    onClick={() =>
                      setConfirmRemove({
                        title: '¿Quitar esta ley?',
                        onConfirm: () => removeItem('laws', index),
                      })
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Visibilidad pública</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <VisibilityToggle
              label="Ficha del legislador (foto y datos)"
              checked={form.showLegislatorPhoto}
              onChange={(v) => setFlag('showLegislatorPhoto', v)}
              disabled={loading || saving}
            />
            <VisibilityToggle
              label="Proyectos presentados por año"
              checked={form.showPresentedProjects}
              onChange={(v) => setFlag('showPresentedProjects', v)}
              disabled={loading || saving}
            />
            <VisibilityToggle
              label="Comisiones del legislador"
              checked={form.showCommissions}
              onChange={(v) => setFlag('showCommissions', v)}
              disabled={loading || saving}
            />
            <VisibilityToggle
              label="Leyes"
              checked={form.showLaws}
              onChange={(v) => setFlag('showLaws', v)}
              disabled={loading || saving}
            />
            <VisibilityToggle
              label="Panel de contacto"
              checked={form.showContactPanel}
              onChange={(v) => setFlag('showContactPanel', v)}
              disabled={loading || saving}
            />
            <VisibilityToggle
              label="Biografía"
              checked={form.showLegislatorBio}
              onChange={(v) => setFlag('showLegislatorBio', v)}
              disabled={loading || saving}
            />
          </div>
        </section>

        <div className="flex justify-end border-t border-slate-200/80 pt-4">
          <button type="submit" disabled={loading || saving || !apiAvailable} className={ACTION_BTN_PRIMARY}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </>
  )
}
