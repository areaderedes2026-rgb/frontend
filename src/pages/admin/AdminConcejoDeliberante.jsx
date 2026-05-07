import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { SingleImageUploadField } from '../../components/admin/SingleImageUploadField.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import {
  formErrorClass,
  inputClass,
  labelClass,
  textareaClass,
} from '../../components/ui/formStyles.js'
import {
  DEFAULT_CONCEJO_DELIBERANTE_CONTENT,
  mergeConcejoDeliberanteContent,
} from '../../data/concejoDeliberanteContent.js'
import {
  fetchConcejoDeliberanteContent,
  updateConcejoDeliberanteContent,
} from '../../services/concejoDeliberanteService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { isConcurrencyConflictError } from '../../utils/concurrencyConflict.js'
import { ROUTES } from '../../utils/constants.js'

function cloneContent(c) {
  return JSON.parse(JSON.stringify(c))
}

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

const EMPTY_MEMBER_DRAFT = (blocks) => ({
  id: makeId('concejal'),
  name: '',
  role: '',
  block: blocks?.[0]?.name || '',
  photoUrl: '',
  bio: '',
  email: '',
  phone: '',
  period: '',
})

function memberToDraft(member) {
  return {
    id: String(member?.id || ''),
    name: String(member?.name || ''),
    role: String(member?.role || ''),
    block: String(member?.block || ''),
    photoUrl: String(member?.photoUrl || ''),
    bio: String(member?.bio || ''),
    email: String(member?.email || ''),
    phone: String(member?.phone || ''),
    period: String(member?.period || ''),
  }
}

function draftToMember(draft) {
  return {
    id: String(draft.id || '').trim() || makeId('concejal'),
    name: String(draft.name || '').trim(),
    role: String(draft.role || '').trim(),
    block: String(draft.block || '').trim(),
    photoUrl: String(draft.photoUrl || '').trim(),
    bio: String(draft.bio || '').trim(),
    email: String(draft.email || '').trim().toLowerCase(),
    phone: String(draft.phone || '').trim(),
    period: String(draft.period || '').trim(),
  }
}

export function AdminConcejoDeliberante() {
  const [form, setForm] = useState(() => cloneContent(DEFAULT_CONCEJO_DELIBERANTE_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [conflictOpen, setConflictOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])

  const [memberDialog, setMemberDialog] = useState(null)
  const [memberDraft, setMemberDraft] = useState(() =>
    EMPTY_MEMBER_DRAFT(DEFAULT_CONCEJO_DELIBERANTE_CONTENT.blocks),
  )
  const [memberFormError, setMemberFormError] = useState('')
  const [removeMemberIndex, setRemoveMemberIndex] = useState(null)
  const [removeBlockIndex, setRemoveBlockIndex] = useState(null)
  const [removeCommissionIndex, setRemoveCommissionIndex] = useState(null)

  const blockOptions = useMemo(
    () => (form.blocks || []).map((b) => b.name).filter(Boolean),
    [form.blocks],
  )

  useEffect(() => {
    let cancelled = false
    async function loadContent() {
      setError('')
      setLoading(true)
      if (!isApiConfigured()) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const remote = await fetchConcejoDeliberanteContent()
        const merged = mergeConcejoDeliberanteContent(
          DEFAULT_CONCEJO_DELIBERANTE_CONTENT,
          remote || {},
        )
        if (!cancelled) {
          setForm(cloneContent(merged))
          setContentUpdatedAt(remote?.updatedAt || null)
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'No se pudo cargar el Concejo Deliberante.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadContent()
    return () => {
      cancelled = true
    }
  }, [])

  function closeMemberModal() {
    setMemberDialog(null)
    setMemberFormError('')
  }

  function openNewMember() {
    setMemberDraft(EMPTY_MEMBER_DRAFT(form.blocks))
    setMemberFormError('')
    setMemberDialog('new')
  }

  function openEditMember(index) {
    const row = form.members?.[index]
    if (!row) return
    setMemberDraft(memberToDraft(row))
    setMemberFormError('')
    setMemberDialog(index)
  }

  function handleSaveMember() {
    const built = draftToMember(memberDraft)
    if (!built.name) {
      setMemberFormError('Completá al menos el nombre del concejal.')
      return
    }
    if (memberDialog === 'new') {
      setForm((prev) => ({
        ...prev,
        members: [...(prev.members || []), built],
      }))
    } else if (typeof memberDialog === 'number') {
      setForm((prev) => {
        const next = [...(prev.members || [])]
        next[memberDialog] = built
        return { ...prev, members: next }
      })
    }
    closeMemberModal()
  }

  function addParagraph() {
    setForm((prev) => ({
      ...prev,
      introParagraphs: [...(prev.introParagraphs || []), ''],
    }))
  }

  function setParagraph(i, value) {
    setForm((prev) => {
      const ps = [...(prev.introParagraphs || [])]
      ps[i] = value
      return { ...prev, introParagraphs: ps }
    })
  }

  function removeParagraph(i) {
    setForm((prev) => ({
      ...prev,
      introParagraphs: (prev.introParagraphs || []).filter((_, j) => j !== i),
    }))
  }

  function addBlock() {
    setForm((prev) => ({
      ...prev,
      blocks: [
        ...(prev.blocks || []),
        { id: makeId('bloque'), name: 'Nuevo bloque', color: '#0369a1', description: '' },
      ],
    }))
  }

  function setBlock(i, key, value) {
    setForm((prev) => {
      const next = [...(prev.blocks || [])]
      next[i] = { ...next[i], [key]: value }
      return { ...prev, blocks: next }
    })
  }

  function commitRemoveBlock(i) {
    setForm((prev) => {
      const removed = (prev.blocks || [])[i]
      const blocks = (prev.blocks || []).filter((_, j) => j !== i)
      const members = (prev.members || []).map((m) =>
        removed && m.block === removed.name ? { ...m, block: '' } : m,
      )
      return { ...prev, blocks, members }
    })
  }

  function addCommission() {
    setForm((prev) => ({
      ...prev,
      commissions: [
        ...(prev.commissions || []),
        { id: makeId('comision'), name: 'Nueva comisión', description: '' },
      ],
    }))
  }

  function setCommission(i, key, value) {
    setForm((prev) => {
      const next = [...(prev.commissions || [])]
      next[i] = { ...next[i], [key]: value }
      return { ...prev, commissions: next }
    })
  }

  function commitRemoveCommission(i) {
    setForm((prev) => ({
      ...prev,
      commissions: (prev.commissions || []).filter((_, j) => j !== i),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!isApiConfigured()) {
      setToast({ type: 'error', message: 'No hay conexión disponible con el backend.' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        expectedUpdatedAt: contentUpdatedAt,
        heroEyebrow: form.heroEyebrow.trim(),
        heroTitle: form.heroTitle.trim(),
        heroSubtitle: form.heroSubtitle,
        heroImageUrl: form.heroImageUrl.trim(),
        introTitle: form.introTitle.trim(),
        introParagraphs: (form.introParagraphs || [])
          .map((p) => String(p || '').trim())
          .filter(Boolean),
        presidentName: form.presidentName.trim(),
        presidentRole: form.presidentRole.trim(),
        presidentBio: form.presidentBio,
        presidentPhotoUrl: form.presidentPhotoUrl.trim(),
        sessionsTitle: form.sessionsTitle.trim(),
        sessionsSchedule: form.sessionsSchedule.trim(),
        sessionsLocation: form.sessionsLocation.trim(),
        sessionsNote: form.sessionsNote,
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
        contactAddress: form.contactAddress.trim(),
        contactHours: form.contactHours.trim(),
        blocks: (form.blocks || []).map((b) => ({
          id: b.id || makeId('bloque'),
          name: String(b.name || '').trim(),
          color: String(b.color || '').trim(),
          description: String(b.description || '').trim(),
        })),
        members: form.members || [],
        commissions: (form.commissions || []).map((c) => ({
          id: c.id || makeId('comision'),
          name: String(c.name || '').trim(),
          description: String(c.description || '').trim(),
        })),
      }
      const saved = await updateConcejoDeliberanteContent(payload)
      const merged = mergeConcejoDeliberanteContent(
        DEFAULT_CONCEJO_DELIBERANTE_CONTENT,
        saved || {},
      )
      setForm(cloneContent(merged))
      setContentUpdatedAt(saved?.updatedAt || null)
      setToast({ type: 'success', message: 'Se guardó el Concejo Deliberante.' })
    } catch (e) {
      if (isConcurrencyConflictError(e)) setConflictOpen(true)
      setError(e.message || 'No se pudo guardar.')
      setToast({ type: 'error', message: e.message || 'No se pudo guardar.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <ConfirmDialog
        open={conflictOpen}
        onClose={() => setConflictOpen(false)}
        title="Cambios desactualizados"
        description="Otro usuario guardó cambios antes que vos. Recargá la última versión y reintentá."
        confirmLabel="Recargar última versión y reintentar"
        cancelLabel="Cerrar"
        onConfirm={() => window.location.reload()}
      />
      {toast ? <Toast variant={toast.type} message={toast.message} onDismiss={dismissToast} /> : null}

      <ConfirmDialog
        open={removeMemberIndex !== null}
        onClose={() => {
          if (!saving) setRemoveMemberIndex(null)
        }}
        title="¿Quitar este concejal?"
        description="Se eliminará de la lista. Guardá el formulario para persistir los cambios."
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (removeMemberIndex !== null) {
            setForm((prev) => ({
              ...prev,
              members: (prev.members || []).filter((_, i) => i !== removeMemberIndex),
            }))
          }
          setRemoveMemberIndex(null)
        }}
        variant="danger"
      />

      <ConfirmDialog
        open={removeBlockIndex !== null}
        onClose={() => {
          if (!saving) setRemoveBlockIndex(null)
        }}
        title="¿Quitar este bloque?"
        description="Los concejales que lo tengan asignado quedarán sin bloque. Guardá para persistir."
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (removeBlockIndex !== null) commitRemoveBlock(removeBlockIndex)
          setRemoveBlockIndex(null)
        }}
        variant="danger"
      />

      <ConfirmDialog
        open={removeCommissionIndex !== null}
        onClose={() => {
          if (!saving) setRemoveCommissionIndex(null)
        }}
        title="¿Quitar esta comisión?"
        description="Se eliminará de la lista. Guardá el formulario para persistir."
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (removeCommissionIndex !== null) commitRemoveCommission(removeCommissionIndex)
          setRemoveCommissionIndex(null)
        }}
        variant="danger"
      />

      <Modal
        open={memberDialog !== null}
        onClose={() => !saving && closeMemberModal()}
        title={memberDialog === 'new' ? 'Nuevo concejal' : 'Editar concejal'}
        description="Completá los datos del concejal. Podés dejar vacíos los campos opcionales."
        size="wide"
        loading={saving}
      >
        <div className="grid max-h-[min(70dvh,560px)] gap-4 overflow-y-auto px-1 pb-1 sm:grid-cols-2">
          {memberFormError ? (
            <p className={`${formErrorClass} sm:col-span-2`} role="alert">
              {memberFormError}
            </p>
          ) : null}
          <label className={labelClass}>
            Nombre completo
            <input
              className={inputClass}
              value={memberDraft.name}
              onChange={(e) => setMemberDraft((d) => ({ ...d, name: e.target.value }))}
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Cargo (opcional)
            <input
              className={inputClass}
              value={memberDraft.role}
              onChange={(e) => setMemberDraft((d) => ({ ...d, role: e.target.value }))}
              disabled={saving}
              placeholder="Ej. Vicepresidente 1°"
            />
          </label>
          <label className={labelClass}>
            Bloque
            <select
              className={inputClass}
              value={blockOptions.includes(memberDraft.block) ? memberDraft.block : ''}
              onChange={(e) => setMemberDraft((d) => ({ ...d, block: e.target.value }))}
              disabled={saving}
            >
              <option value="">Sin bloque</option>
              {blockOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Período (opcional)
            <input
              className={inputClass}
              value={memberDraft.period}
              onChange={(e) => setMemberDraft((d) => ({ ...d, period: e.target.value }))}
              disabled={saving}
              placeholder="Ej. 2024 — 2028"
            />
          </label>
          <div className="sm:col-span-2">
            <SingleImageUploadField
              label="Foto"
              helpText="Subí una foto en formato retrato o importala por URL."
              value={memberDraft.photoUrl}
              onChange={(value) => setMemberDraft((d) => ({ ...d, photoUrl: value }))}
              kind="cover"
              disabled={saving}
            />
          </div>
          <label className={`${labelClass} sm:col-span-2`}>
            Biografía corta (opcional)
            <textarea
              className={`${textareaClass} min-h-24`}
              value={memberDraft.bio}
              onChange={(e) => setMemberDraft((d) => ({ ...d, bio: e.target.value }))}
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Correo (opcional)
            <input
              className={inputClass}
              value={memberDraft.email}
              onChange={(e) => setMemberDraft((d) => ({ ...d, email: e.target.value }))}
              disabled={saving}
              placeholder="ej. concejal@trancas.gob.ar"
            />
          </label>
          <label className={labelClass}>
            Teléfono (opcional)
            <input
              className={inputClass}
              value={memberDraft.phone}
              onChange={(e) => setMemberDraft((d) => ({ ...d, phone: e.target.value }))}
              disabled={saving}
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={closeMemberModal} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSaveMember} disabled={saving}>
            Guardar concejal
          </Button>
        </div>
      </Modal>

      <AdminPageShell
        backTo={ROUTES.adminSettings}
        backLabel="Volver a configuración"
        eyebrow="Gobierno"
        title="Concejo Deliberante"
        subtitle="Editá la información pública del Concejo: bloques políticos, concejales, comisiones, sesiones y datos de contacto."
        maxWidthClass="max-w-5xl"
        variant="plain"
      >
        {!isApiConfigured() ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend para guardar cambios.
          </div>
        ) : null}
        {error ? (
          <p className={formErrorClass} role="alert">
            {error}
          </p>
        ) : null}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Portada</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Etiqueta
                <input
                  className={inputClass}
                  value={form.heroEyebrow}
                  onChange={(e) => setForm((p) => ({ ...p, heroEyebrow: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Título
                <input
                  className={inputClass}
                  value={form.heroTitle}
                  onChange={(e) => setForm((p) => ({ ...p, heroTitle: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Subtítulo
                <textarea
                  className={`${textareaClass} min-h-24`}
                  value={form.heroSubtitle}
                  onChange={(e) => setForm((p) => ({ ...p, heroSubtitle: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <div className="sm:col-span-2">
                <SingleImageUploadField
                  label="Imagen de portada"
                  helpText="Imagen panorámica para el encabezado o URL."
                  value={form.heroImageUrl}
                  onChange={(value) => setForm((p) => ({ ...p, heroImageUrl: value }))}
                  kind="cover"
                  disabled={loading || saving}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Introducción</h2>
            <div className="mt-4 space-y-4">
              <label className={labelClass}>
                Título de la sección
                <input
                  className={inputClass}
                  value={form.introTitle}
                  onChange={(e) => setForm((p) => ({ ...p, introTitle: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-700">Párrafos</span>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={loading || saving}
                    onClick={addParagraph}
                  >
                    Añadir párrafo
                  </Button>
                </div>
                <ul className="mt-3 space-y-3">
                  {(form.introParagraphs || []).map((p, i) => (
                    <li key={`p-${i}`} className="flex gap-2">
                      <textarea
                        className={`${textareaClass} min-h-20 flex-1`}
                        value={p}
                        onChange={(e) => setParagraph(i, e.target.value)}
                        disabled={loading || saving}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={loading || saving}
                        onClick={() => removeParagraph(i)}
                      >
                        Quitar
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Presidencia del Concejo</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Nombre
                <input
                  className={inputClass}
                  value={form.presidentName}
                  onChange={(e) => setForm((p) => ({ ...p, presidentName: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Cargo
                <input
                  className={inputClass}
                  value={form.presidentRole}
                  onChange={(e) => setForm((p) => ({ ...p, presidentRole: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Biografía
                <textarea
                  className={`${textareaClass} min-h-24`}
                  value={form.presidentBio}
                  onChange={(e) => setForm((p) => ({ ...p, presidentBio: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <div className="sm:col-span-2">
                <SingleImageUploadField
                  label="Foto del presidente"
                  helpText="Subí una foto en formato retrato o importala por URL."
                  value={form.presidentPhotoUrl}
                  onChange={(value) => setForm((p) => ({ ...p, presidentPhotoUrl: value }))}
                  kind="cover"
                  disabled={loading || saving}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Sesiones</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Título de la sección
                <input
                  className={inputClass}
                  value={form.sessionsTitle}
                  onChange={(e) => setForm((p) => ({ ...p, sessionsTitle: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Día y horario
                <input
                  className={inputClass}
                  value={form.sessionsSchedule}
                  onChange={(e) => setForm((p) => ({ ...p, sessionsSchedule: e.target.value }))}
                  disabled={loading || saving}
                  placeholder="Ej. Martes a las 19:00 hs"
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Lugar
                <input
                  className={inputClass}
                  value={form.sessionsLocation}
                  onChange={(e) => setForm((p) => ({ ...p, sessionsLocation: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Nota
                <textarea
                  className={`${textareaClass} min-h-20`}
                  value={form.sessionsNote}
                  onChange={(e) => setForm((p) => ({ ...p, sessionsNote: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">Bloques políticos</h2>
              <Button
                type="button"
                variant="secondary"
                disabled={loading || saving}
                onClick={addBlock}
              >
                Añadir bloque
              </Button>
            </div>
            <ul className="mt-4 space-y-3">
              {(form.blocks || []).length === 0 ? (
                <li className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-sm text-slate-600">
                  Todavía no agregaste bloques. Añadí al menos uno para asignar concejales.
                </li>
              ) : (
                (form.blocks || []).map((b, i) => (
                  <li
                    key={b.id || `b-${i}`}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-12">
                      <label className={`${labelClass} sm:col-span-5`}>
                        Nombre
                        <input
                          className={inputClass}
                          value={b.name}
                          onChange={(e) => setBlock(i, 'name', e.target.value)}
                          disabled={loading || saving}
                        />
                      </label>
                      <label className={`${labelClass} sm:col-span-3`}>
                        Color (hex)
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="color"
                            className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                            value={b.color || '#0369a1'}
                            onChange={(e) => setBlock(i, 'color', e.target.value)}
                            disabled={loading || saving}
                            aria-label="Color del bloque"
                          />
                          <input
                            className={`${inputClass} flex-1`}
                            value={b.color || ''}
                            onChange={(e) => setBlock(i, 'color', e.target.value)}
                            disabled={loading || saving}
                            placeholder="#0369a1"
                          />
                        </div>
                      </label>
                      <div className="flex items-end justify-end sm:col-span-4">
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={loading || saving}
                          onClick={() => setRemoveBlockIndex(i)}
                        >
                          Quitar bloque
                        </Button>
                      </div>
                      <label className={`${labelClass} sm:col-span-12`}>
                        Descripción (opcional)
                        <textarea
                          className={`${textareaClass} min-h-16`}
                          value={b.description || ''}
                          onChange={(e) => setBlock(i, 'description', e.target.value)}
                          disabled={loading || saving}
                        />
                      </label>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">Concejales</h2>
              <Button
                type="button"
                variant="secondary"
                disabled={loading || saving}
                onClick={openNewMember}
              >
                Nuevo concejal
              </Button>
            </div>
            <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">
              {(form.members || []).length === 0 ? (
                <li className="px-4 py-6 text-sm text-slate-600">
                  No hay concejales. Agregá la composición del cuerpo legislativo.
                </li>
              ) : (
                (form.members || []).map((m, idx) => (
                  <li
                    key={m.id || idx}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">
                        {m.name || '(sin nombre)'}
                      </p>
                      <p className="text-xs text-slate-600">
                        {m.role || 'Concejal'} · {m.block || 'Sin bloque'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={loading || saving}
                        onClick={() => openEditMember(idx)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={loading || saving}
                        onClick={() => setRemoveMemberIndex(idx)}
                      >
                        Quitar
                      </Button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                Comisiones de trabajo
              </h2>
              <Button
                type="button"
                variant="secondary"
                disabled={loading || saving}
                onClick={addCommission}
              >
                Añadir comisión
              </Button>
            </div>
            <ul className="mt-4 space-y-3">
              {(form.commissions || []).length === 0 ? (
                <li className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-sm text-slate-600">
                  No hay comisiones cargadas.
                </li>
              ) : (
                (form.commissions || []).map((c, i) => (
                  <li
                    key={c.id || `c-${i}`}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-12">
                      <label className={`${labelClass} sm:col-span-8`}>
                        Nombre
                        <input
                          className={inputClass}
                          value={c.name}
                          onChange={(e) => setCommission(i, 'name', e.target.value)}
                          disabled={loading || saving}
                        />
                      </label>
                      <div className="flex items-end justify-end sm:col-span-4">
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={loading || saving}
                          onClick={() => setRemoveCommissionIndex(i)}
                        >
                          Quitar comisión
                        </Button>
                      </div>
                      <label className={`${labelClass} sm:col-span-12`}>
                        Descripción (opcional)
                        <textarea
                          className={`${textareaClass} min-h-16`}
                          value={c.description || ''}
                          onChange={(e) => setCommission(i, 'description', e.target.value)}
                          disabled={loading || saving}
                        />
                      </label>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Contacto institucional</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Correo
                <input
                  className={inputClass}
                  value={form.contactEmail}
                  onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Teléfono
                <input
                  className={inputClass}
                  value={form.contactPhone}
                  onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Dirección
                <input
                  className={inputClass}
                  value={form.contactAddress}
                  onChange={(e) => setForm((p) => ({ ...p, contactAddress: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
              <label className={labelClass}>
                Horario de atención
                <input
                  className={inputClass}
                  value={form.contactHours}
                  onChange={(e) => setForm((p) => ({ ...p, contactHours: e.target.value }))}
                  disabled={loading || saving}
                />
              </label>
            </div>
          </section>

          <div className="flex justify-end border-t border-slate-200/80 pt-4">
            <Button type="submit" disabled={loading || saving}>
              {saving ? 'Guardando…' : 'Guardar Concejo Deliberante'}
            </Button>
          </div>
        </form>
      </AdminPageShell>
    </>
  )
}
