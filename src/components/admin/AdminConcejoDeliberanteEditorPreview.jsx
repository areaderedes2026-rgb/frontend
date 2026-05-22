import { useMemo, useState } from 'react'
import { Modal } from '../ui/Modal.jsx'
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx'
import { Button } from '../ui/Button.jsx'
import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import {
  formErrorClass,
  inputClass,
  labelClass,
  textareaClass,
} from '../ui/formStyles.js'
import {
  cleanMemberSortOrder,
  getInitialsFromName,
  nextConcejoMemberPriority,
  sortConcejoMembers,
} from '../../data/concejoDeliberanteContent.js'

const ACTION_BTN_BASE =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
const ACTION_BTN_NEUTRAL = `${ACTION_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const ACTION_BTN_PRIMARY = `${ACTION_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`

function Spinner({ tone = 'sky', size = 'sm' }) {
  const dim = size === 'sm' ? 'h-4 w-4 border-2' : 'h-5 w-5 border-2'
  const color =
    tone === 'white'
      ? 'border-white/40 border-t-white'
      : 'border-slate-300 border-t-sky-700'
  return (
    <span
      className={`inline-block animate-spin rounded-full ${color} ${dim}`}
      aria-hidden
    />
  )
}

function PencilIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487 18.549 2.799a2.121 2.121 0 1 1 3 3L19.862 7.487m-3-3L6.34 14.99a4.5 4.5 0 0 0-1.113 1.81L4.5 19.5l2.7-.727a4.5 4.5 0 0 0 1.81-1.113l10.49-10.49m-3-3L19.5 7.5"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  )
}

function EditChip({ label = 'Editar', onClick, disabled = false, tone = 'neutral' }) {
  const base =
    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60'
  const styles =
    tone === 'overlay'
      ? 'border-white/30 bg-white/95 text-[#171b22] backdrop-blur hover:bg-white'
      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-900'
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      <PencilIcon />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden sr-only">{label}</span>
    </button>
  )
}

function AddChip({ label = 'Agregar', onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <PlusIcon />
      <span>{label}</span>
    </button>
  )
}

function OrderChip({ label, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={label}
      title={label}
    >
      {label === 'Subir' ? '↑' : '↓'}
    </button>
  )
}

function DeleteChip({ label = 'Quitar', onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <TrashIcon />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden sr-only">{label}</span>
    </button>
  )
}

function SectionCard({ id, title, description, rightSlot, children, className = '', variant = 'card' }) {
  const base =
    variant === 'plain'
      ? ''
      : 'rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] p-5 shadow-sm sm:p-7'
  return (
    <section id={id} className={`scroll-mt-32 ${base} ${className}`.trim()}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
        {rightSlot ? <div className="flex shrink-0 flex-wrap gap-2">{rightSlot}</div> : null}
      </div>
      <div className={variant === 'plain' ? 'mt-5' : 'mt-5'}>{children}</div>
    </section>
  )
}

function EmptyHint({ children, onAdd, addLabel = 'Agregar' }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
      <p className="text-sm text-slate-600">{children}</p>
      {onAdd ? (
        <div className="mt-4 inline-flex">
          <AddChip label={addLabel} onClick={onAdd} />
        </div>
      ) : null}
    </div>
  )
}

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function MemberAvatar({ name, photoUrl, color }) {
  const initials = getInitialsFromName(name)
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className="h-full w-full object-cover object-center"
      />
    )
  }
  return (
    <div
      className="flex h-full w-full items-center justify-center text-xl font-bold tracking-wide text-white sm:text-2xl"
      style={{
        backgroundImage: `linear-gradient(135deg, ${color || '#0369a1'} 0%, rgba(15, 23, 42, 0.9) 100%)`,
      }}
      aria-hidden
    >
      {initials}
    </div>
  )
}

function emptyMemberDraft(sortOrder = 0) {
  return {
    id: makeId('concejal'),
    name: '',
    role: '',
    photoUrl: '',
    bio: '',
    email: '',
    phone: '',
    period: '',
    sortOrder,
  }
}

function memberToDraft(member) {
  return {
    id: String(member?.id || ''),
    name: String(member?.name || ''),
    role: String(member?.role || ''),
    photoUrl: String(member?.photoUrl || ''),
    bio: String(member?.bio || ''),
    email: String(member?.email || ''),
    phone: String(member?.phone || ''),
    period: String(member?.period || ''),
    sortOrder: cleanMemberSortOrder(member?.sortOrder, 0),
  }
}

function draftToMember(draft) {
  return {
    id: String(draft.id || '').trim() || makeId('concejal'),
    name: String(draft.name || '').trim(),
    role: String(draft.role || '').trim(),
    photoUrl: String(draft.photoUrl || '').trim(),
    bio: String(draft.bio || '').trim(),
    email: String(draft.email || '').trim().toLowerCase(),
    phone: String(draft.phone || '').trim(),
    period: String(draft.period || '').trim(),
    sortOrder: cleanMemberSortOrder(draft.sortOrder, 0),
  }
}

export function AdminConcejoDeliberanteEditorPreview({
  form,
  setForm,
  loading,
  saving,
  error,
  onChangeCover,
  onSubmit,
  apiAvailable,
}) {
  const [editor, setEditor] = useState(null)
  const [memberDialog, setMemberDialog] = useState(null)
  const [memberDraft, setMemberDraft] = useState(() => emptyMemberDraft())
  const [memberFormError, setMemberFormError] = useState('')
  const [removeMemberId, setRemoveMemberId] = useState(null)
  const [removeParagraphIndex, setRemoveParagraphIndex] = useState(null)

  const heroUrl = (form.heroImageUrl || '').trim()

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

  function closeMemberModal() {
    setMemberDialog(null)
    setMemberFormError('')
  }

  const sortedMembers = useMemo(
    () => sortConcejoMembers(form.members || []),
    [form.members],
  )

  function openNewMember() {
    setMemberDraft(emptyMemberDraft(nextConcejoMemberPriority(form.members)))
    setMemberFormError('')
    setMemberDialog('new')
  }

  function openEditMember(memberId) {
    const row = (form.members || []).find((m) => m.id === memberId)
    if (!row) return
    setMemberDraft(memberToDraft(row))
    setMemberFormError('')
    setMemberDialog(memberId)
  }

  function moveMember(memberId, direction) {
    setForm((prev) => {
      const list = sortConcejoMembers(prev.members || [])
      const index = list.findIndex((m) => m.id === memberId)
      if (index < 0) return prev
      const target = index + direction
      if (target < 0 || target >= list.length) return prev
      const next = [...list]
      const currentOrder = cleanMemberSortOrder(next[index].sortOrder, (index + 1) * 10)
      const swapOrder = cleanMemberSortOrder(next[target].sortOrder, (target + 1) * 10)
      next[index] = { ...next[index], sortOrder: swapOrder }
      next[target] = { ...next[target], sortOrder: currentOrder }
      return { ...prev, members: next }
    })
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
    } else if (typeof memberDialog === 'string' && memberDialog !== 'new') {
      setForm((prev) => ({
        ...prev,
        members: (prev.members || []).map((m) => (m.id === memberDialog ? built : m)),
      }))
    }
    closeMemberModal()
  }

  function applyIdentity(draft) {
    setForm((prev) => ({
      ...prev,
      heroEyebrow: String(draft.heroEyebrow || '').trim(),
      heroTitle: String(draft.heroTitle || '').trim(),
      heroSubtitle: String(draft.heroSubtitle || ''),
      heroImageUrl: String(draft.heroImageUrl || '').trim(),
    }))
  }

  function applyIntroTitle(draft) {
    setForm((prev) => ({
      ...prev,
      introTitle: String(draft.introTitle || '').trim(),
    }))
  }

  function applyParagraph(draft, index) {
    const value = String(draft.text ?? '')
    setForm((prev) => {
      const list = [...(prev.introParagraphs || [])]
      if (index === null || index === undefined) {
        list.push(value)
      } else {
        list[index] = value
      }
      return { ...prev, introParagraphs: list }
    })
  }

  function applyPresident(draft) {
    setForm((prev) => ({
      ...prev,
      presidentName: String(draft.presidentName || '').trim(),
      presidentRole: String(draft.presidentRole || '').trim(),
      presidentBio: String(draft.presidentBio || ''),
      presidentPhotoUrl: String(draft.presidentPhotoUrl || '').trim(),
    }))
  }

  function applySessions(draft) {
    setForm((prev) => ({
      ...prev,
      sessionsTitle: String(draft.sessionsTitle || '').trim(),
      sessionsSchedule: String(draft.sessionsSchedule || '').trim(),
      sessionsLocation: String(draft.sessionsLocation || '').trim(),
      sessionsNote: String(draft.sessionsNote || ''),
    }))
  }

  function applyContact(draft) {
    setForm((prev) => ({
      ...prev,
      contactEmail: String(draft.contactEmail || '').trim(),
      contactPhone: String(draft.contactPhone || '').trim(),
      contactAddress: String(draft.contactAddress || '').trim(),
      contactHours: String(draft.contactHours || '').trim(),
    }))
  }

  function handleSaveEditor() {
    if (!editor) return
    const { kind, index, draft } = editor
    switch (kind) {
      case 'identity':
        applyIdentity(draft)
        break
      case 'introTitle':
        applyIntroTitle(draft)
        break
      case 'paragraph':
        applyParagraph(draft, index)
        break
      case 'president':
        applyPresident(draft)
        break
      case 'sessions':
        applySessions(draft)
        break
      case 'contact':
        applyContact(draft)
        break
      default:
        break
    }
    closeEditor()
  }

  const editorTitle = useMemo(() => {
    if (!editor) return ''
    switch (editor.kind) {
      case 'identity':
        return 'Editar portada (textos e imagen)'
      case 'introTitle':
        return 'Editar título de la introducción'
      case 'paragraph':
        return editor.index === null || editor.index === undefined
          ? 'Agregar párrafo'
          : 'Editar párrafo'
      case 'president':
        return 'Editar presidencia del Concejo'
      case 'sessions':
        return 'Sesiones (datos institucionales)'
      case 'contact':
        return 'Contacto institucional'
      default:
        return ''
    }
  }, [editor])

  const editorWide =
    editor &&
    (editor.kind === 'identity' ||
      editor.kind === 'president' ||
      editor.kind === 'sessions' ||
      editor.kind === 'contact')

  const draft = editor?.draft || null
  const totalMembers = (form.members || []).length

  const presidentPreview =
    form.presidentName ||
    form.presidentRole ||
    form.presidentBio ||
    (form.presidentPhotoUrl || '').trim()

  return (
    <>
      <ConfirmDialog
        open={removeMemberId !== null}
        onClose={() => {
          if (!saving) setRemoveMemberId(null)
        }}
        title="¿Quitar este concejal?"
        description="Se eliminará de la lista. Guardá el formulario para persistir los cambios."
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        loading={false}
        onConfirm={() => {
          if (removeMemberId) {
            setForm((prev) => ({
              ...prev,
              members: (prev.members || []).filter((m) => m.id !== removeMemberId),
            }))
          }
          setRemoveMemberId(null)
        }}
        variant="danger"
      />

      <ConfirmDialog
        open={removeParagraphIndex !== null}
        onClose={() => {
          if (!saving) setRemoveParagraphIndex(null)
        }}
        title="¿Quitar este párrafo?"
        description="Vas a eliminar el párrafo del borrador."
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        loading={false}
        onConfirm={() => {
          if (removeParagraphIndex !== null) {
            setForm((prev) => ({
              ...prev,
              introParagraphs: (prev.introParagraphs || []).filter(
                (_, i) => i !== removeParagraphIndex,
              ),
            }))
          }
          setRemoveParagraphIndex(null)
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
            Período (opcional)
            <input
              className={inputClass}
              value={memberDraft.period}
              onChange={(e) => setMemberDraft((d) => ({ ...d, period: e.target.value }))}
              disabled={saving}
              placeholder="Ej. 2024 — 2028"
            />
          </label>
          <label className={labelClass}>
            Prioridad de visualización
            <input
              type="number"
              min={0}
              step={1}
              className={inputClass}
              value={memberDraft.sortOrder ?? 0}
              onChange={(e) => setMemberDraft((d) => ({ ...d, sortOrder: e.target.value }))}
              disabled={saving}
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Número más bajo = aparece primero en el portal (ej. 10, 20, 30).
            </span>
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

      <Modal
        open={editor != null}
        onClose={closeEditor}
        loading={saving}
        size={editorWide ? 'wide' : 'default'}
        title={editorTitle}
        description="Los cambios quedan en borrador hasta que toques «Guardar cambios» en el pie de la página."
      >
        <EditorConcejoBody
          editor={editor}
          draft={draft}
          setDraftField={setDraftField}
          saving={saving}
        />
        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={closeEditor} disabled={saving} className={ACTION_BTN_NEUTRAL}>
            Cancelar
          </button>
          <button type="button" onClick={handleSaveEditor} disabled={saving} className={ACTION_BTN_PRIMARY}>
            Aplicar al borrador
          </button>
        </div>
      </Modal>

      <div className="admin-fade-up space-y-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">
            Tocá el lápiz de cada sección para editarla.{' '}
            <span className="hidden sm:inline">
              Los cambios quedan en borrador hasta «Guardar cambios».
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onChangeCover}
              disabled={saving || !apiAvailable}
              className={ACTION_BTN_NEUTRAL}
            >
              Cambiar portada
            </button>
            <button
              type="button"
              onClick={() => void onSubmit()}
              disabled={saving || loading || !apiAvailable}
              className={ACTION_BTN_PRIMARY}
            >
              {saving ? (
                <>
                  <Spinner tone="white" size="sm" />
                  Guardando…
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </div>

        {error ? (
          <p
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <article className="overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
          <header className="relative overflow-hidden">
            {heroUrl ? (
              <img
                src={heroUrl}
                alt=""
                className="h-56 w-full object-cover object-[center_35%] sm:h-64 lg:h-80"
              />
            ) : (
              <div className="flex h-56 w-full items-center justify-center bg-linear-to-br from-slate-700 to-slate-900 text-sm text-slate-300 sm:h-64 lg:h-80">
                Sin imagen de portada
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/75 to-slate-900/35" />
            <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
              <EditChip
                tone="overlay"
                label="Editar portada"
                onClick={() =>
                  openEditor('identity', null, {
                    heroEyebrow: form.heroEyebrow || '',
                    heroTitle: form.heroTitle || '',
                    heroSubtitle: form.heroSubtitle || '',
                    heroImageUrl: form.heroImageUrl || '',
                  })
                }
                disabled={saving}
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
              {form.heroEyebrow ? (
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-200 sm:text-xs">
                  {form.heroEyebrow}
                </p>
              ) : null}
              <h1 className="mt-2 max-w-3xl font-serif text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-4xl lg:text-[2.75rem]">
                {form.heroTitle || 'Sin título'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-100 sm:text-base">
                {form.heroSubtitle || <span className="italic text-slate-300">(Sin subtítulo)</span>}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[#171b22] shadow-sm">
                  Atención al vecino
                </span>
                <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/45 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm">
                  Ver concejales
                </span>
              </div>
            </div>
          </header>

          <div className="space-y-10 p-5 sm:p-7 lg:p-10">
            <SectionCard
              id="intro-concejo"
              title="Introducción"
              description="Texto centrado debajo del hero en la página pública."
              variant="plain"
              rightSlot={
                <div className="flex flex-wrap gap-2">
                  <EditChip
                    label="Editar título"
                    onClick={() =>
                      openEditor('introTitle', null, {
                        introTitle: form.introTitle || '',
                      })
                    }
                    disabled={saving}
                  />
                  <AddChip
                    label="Agregar párrafo"
                    onClick={() => openEditor('paragraph', null, { text: '' })}
                    disabled={saving}
                  />
                </div>
              }
            >
              <div className="rounded-3xl border border-[#ddd7ca] bg-[#f8f7f3] p-6 text-center sm:p-8">
                <h2 className="font-serif text-2xl font-bold tracking-tight text-[#171b22] sm:text-3xl">
                  {form.introTitle || <span className="italic text-slate-400">(Sin título)</span>}
                </h2>
                {(form.introParagraphs || []).length === 0 ? (
                  <div className="mt-4">
                    <EmptyHint
                      onAdd={() => openEditor('paragraph', null, { text: '' })}
                      addLabel="Agregar párrafo"
                    >
                      Aún no hay párrafos. Sumá el primero para presentar el Concejo.
                    </EmptyHint>
                  </div>
                ) : (
                  <ul className="mx-auto mt-4 max-w-4xl space-y-3 text-left">
                    {(form.introParagraphs || []).map((p, idx) => (
                      <li
                        key={`p-${idx}`}
                        className="group relative rounded-2xl border border-transparent bg-white/60 p-3 text-sm leading-relaxed text-[#4b505a] sm:text-base"
                      >
                        <div className="absolute right-2 top-2 flex gap-1.5">
                          <EditChip
                            label="Editar"
                            onClick={() => openEditor('paragraph', idx, { text: p })}
                            disabled={saving}
                          />
                          <DeleteChip
                            label="Quitar"
                            onClick={() => setRemoveParagraphIndex(idx)}
                            disabled={saving}
                          />
                        </div>
                        <p className="pr-24">{p || <span className="italic text-slate-400">(Vacío)</span>}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </SectionCard>

            <SectionCard
              id="presidencia-admin"
              title="Presidencia del Concejo"
              description="Misma tarjeta que en el portal cuando hay datos cargados."
              variant="plain"
              rightSlot={
                <EditChip
                  label="Editar"
                  onClick={() =>
                    openEditor('president', null, {
                      presidentName: form.presidentName || '',
                      presidentRole: form.presidentRole || '',
                      presidentBio: form.presidentBio || '',
                      presidentPhotoUrl: form.presidentPhotoUrl || '',
                    })
                  }
                  disabled={saving}
                />
              }
            >
              {presidentPreview ? (
                <div className="overflow-hidden rounded-3xl border border-[#ddd7ca] bg-[#fcfcfa] shadow-sm">
                  <div className="grid gap-0 sm:grid-cols-12">
                    <div className="relative aspect-square w-full overflow-hidden bg-[#ece8df] sm:col-span-4 sm:aspect-auto sm:min-h-[200px]">
                      <MemberAvatar
                        name={form.presidentName}
                        photoUrl={form.presidentPhotoUrl}
                        color="#0369a1"
                      />
                    </div>
                    <div className="flex flex-col justify-center gap-2 p-5 text-left sm:col-span-8 sm:p-7">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                        Presidencia del Concejo
                      </p>
                      <h3 className="text-xl font-bold tracking-tight text-[#171b22] sm:text-2xl">
                        {form.presidentName || <span className="italic text-slate-400">(Sin nombre)</span>}
                      </h3>
                      {form.presidentRole ? (
                        <p className="-mt-1 text-sm font-semibold text-[#5c6169]">{form.presidentRole}</p>
                      ) : null}
                      {form.presidentBio ? (
                        <p className="text-sm leading-relaxed text-[#4b505a] sm:text-base">{form.presidentBio}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyHint
                  onAdd={() =>
                    openEditor('president', null, {
                      presidentName: '',
                      presidentRole: '',
                      presidentBio: '',
                      presidentPhotoUrl: '',
                    })
                  }
                  addLabel="Configurar presidencia"
                >
                  Todavía no hay datos de presidencia. Sumá nombre, cargo o biografía para mostrar la tarjeta en el
                  portal.
                </EmptyHint>
              )}
            </SectionCard>

            <SectionCard
              id="concejales-admin"
              title="Cuerpo de Concejales"
              description="Definí el orden con prioridad (número más bajo = primero). Podés usar las flechas o el campo al editar."
              variant="plain"
              rightSlot={
                <AddChip label="Nuevo concejal" onClick={openNewMember} disabled={saving} />
              }
            >
              {(form.members || []).length === 0 ? (
                <EmptyHint onAdd={openNewMember} addLabel="Agregar concejal">
                  No hay concejales en el borrador. Agregá la composición del cuerpo legislativo.
                </EmptyHint>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sortedMembers.map((m, idx) => {
                    const color = '#0369a1'
                    const priority = cleanMemberSortOrder(m.sortOrder, (idx + 1) * 10)
                    return (
                      <li
                        key={m.id || `${m.name}-${idx}`}
                        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
                      >
                        <div className="absolute left-2 top-2 z-10">
                          <span className="inline-flex rounded-full bg-slate-900/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                            P.{priority}
                          </span>
                        </div>
                        <div className="absolute right-2 top-2 z-10 flex flex-wrap justify-end gap-1">
                          <OrderChip
                            label="Subir"
                            onClick={() => moveMember(m.id, -1)}
                            disabled={saving || idx === 0}
                          />
                          <OrderChip
                            label="Bajar"
                            onClick={() => moveMember(m.id, 1)}
                            disabled={saving || idx === sortedMembers.length - 1}
                          />
                          <EditChip label="Editar" onClick={() => openEditMember(m.id)} disabled={saving} />
                          <DeleteChip label="Quitar" onClick={() => setRemoveMemberId(m.id)} disabled={saving} />
                        </div>
                        <div className="relative aspect-4/5 w-full overflow-hidden bg-slate-100">
                          <MemberAvatar name={m.name} photoUrl={m.photoUrl} color={color} />
                        </div>
                        <div className="flex flex-1 flex-col gap-2 p-4 text-left">
                          <h3 className="pr-16 text-lg font-bold tracking-tight text-slate-900">
                            {m.name || '(sin nombre)'}
                          </h3>
                          {m.role ? <p className="text-sm font-semibold text-sky-700">{m.role}</p> : null}
                          {m.period ? (
                            <p className="text-xs font-medium text-slate-500">Período {m.period}</p>
                          ) : null}
                          {m.bio ? (
                            <p className="line-clamp-4 text-sm leading-relaxed text-slate-700">{m.bio}</p>
                          ) : null}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
              <p className="mt-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                {totalMembers} {totalMembers === 1 ? 'concejal' : 'concejales'}
              </p>
            </SectionCard>

            <SectionCard
              id="institucional-oculto"
              title="Datos institucionales (no visibles en el portal actual)"
              description="Sesiones y contacto se guardan en el servidor; la vista pública actual no los muestra."
              variant="plain"
              rightSlot={
                <div className="flex flex-wrap gap-2">
                  <EditChip
                    label="Sesiones"
                    onClick={() =>
                      openEditor('sessions', null, {
                        sessionsTitle: form.sessionsTitle || '',
                        sessionsSchedule: form.sessionsSchedule || '',
                        sessionsLocation: form.sessionsLocation || '',
                        sessionsNote: form.sessionsNote || '',
                      })
                    }
                    disabled={saving}
                  />
                  <EditChip
                    label="Contacto"
                    onClick={() =>
                      openEditor('contact', null, {
                        contactEmail: form.contactEmail || '',
                        contactPhone: form.contactPhone || '',
                        contactAddress: form.contactAddress || '',
                        contactHours: form.contactHours || '',
                      })
                    }
                    disabled={saving}
                  />
                </div>
              }
            >
              <div className="grid gap-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Sesiones</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{form.sessionsTitle || '—'}</p>
                  <p className="mt-1 text-sm text-slate-600">{form.sessionsSchedule || '—'}</p>
                  <p className="text-sm text-slate-600">{form.sessionsLocation || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Contacto</p>
                  <p className="mt-1 text-sm text-slate-600">{form.contactEmail || '—'}</p>
                  <p className="text-sm text-slate-600">{form.contactPhone || '—'}</p>
                  <p className="text-sm text-slate-600">{form.contactAddress || '—'}</p>
                  <p className="text-sm text-slate-600">{form.contactHours || '—'}</p>
                </div>
              </div>
            </SectionCard>
          </div>
        </article>

        <div className="sticky bottom-3 z-30 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">
            Los cambios no son visibles en el portal hasta que toques «Guardar cambios».
          </p>
          <button
            type="button"
            onClick={() => void onSubmit()}
            disabled={loading || saving || !apiAvailable}
            className={ACTION_BTN_PRIMARY}
          >
            {saving ? (
              <>
                <Spinner tone="white" size="sm" />
                Guardando…
              </>
            ) : (
              'Guardar cambios del Concejo Deliberante'
            )}
          </button>
        </div>
      </div>
    </>
  )
}

function EditorConcejoBody({ editor, draft, setDraftField, saving }) {
  if (!editor || !draft) return null
  switch (editor.kind) {
    case 'identity':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Etiqueta superior (eyebrow)
            <input
              className={inputClass}
              value={draft.heroEyebrow || ''}
              onChange={(e) => setDraftField('heroEyebrow', e.target.value)}
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Título principal
            <input
              className={inputClass}
              value={draft.heroTitle || ''}
              onChange={(e) => setDraftField('heroTitle', e.target.value)}
              disabled={saving}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Subtítulo
            <textarea
              className={`${textareaClass} min-h-24`}
              value={draft.heroSubtitle || ''}
              onChange={(e) => setDraftField('heroSubtitle', e.target.value)}
              disabled={saving}
            />
          </label>
          <div className="sm:col-span-2">
            <SingleImageUploadField
              label="Imagen de portada"
              helpText="Podés cambiarla también con «Cambiar portada» en la barra superior."
              value={draft.heroImageUrl || ''}
              onChange={(value) => setDraftField('heroImageUrl', value)}
              kind="cover"
              disabled={saving}
            />
          </div>
        </div>
      )
    case 'introTitle':
      return (
        <label className={labelClass}>
          Título de la introducción
          <input
            className={inputClass}
            value={draft.introTitle || ''}
            onChange={(e) => setDraftField('introTitle', e.target.value)}
            disabled={saving}
          />
        </label>
      )
    case 'paragraph':
      return (
        <label className={labelClass}>
          Texto del párrafo
          <textarea
            className={`${textareaClass} min-h-32`}
            value={draft.text || ''}
            onChange={(e) => setDraftField('text', e.target.value)}
            disabled={saving}
          />
        </label>
      )
    case 'president':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Nombre
            <input
              className={inputClass}
              value={draft.presidentName || ''}
              onChange={(e) => setDraftField('presidentName', e.target.value)}
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Cargo
            <input
              className={inputClass}
              value={draft.presidentRole || ''}
              onChange={(e) => setDraftField('presidentRole', e.target.value)}
              disabled={saving}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Biografía
            <textarea
              className={`${textareaClass} min-h-28`}
              value={draft.presidentBio || ''}
              onChange={(e) => setDraftField('presidentBio', e.target.value)}
              disabled={saving}
            />
          </label>
          <div className="sm:col-span-2">
            <SingleImageUploadField
              label="Foto"
              helpText="Formato retrato o URL."
              value={draft.presidentPhotoUrl || ''}
              onChange={(value) => setDraftField('presidentPhotoUrl', value)}
              kind="cover"
              disabled={saving}
            />
          </div>
        </div>
      )
    case 'sessions':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Título de la sección
            <input
              className={inputClass}
              value={draft.sessionsTitle || ''}
              onChange={(e) => setDraftField('sessionsTitle', e.target.value)}
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Día y horario
            <input
              className={inputClass}
              value={draft.sessionsSchedule || ''}
              onChange={(e) => setDraftField('sessionsSchedule', e.target.value)}
              disabled={saving}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Lugar
            <input
              className={inputClass}
              value={draft.sessionsLocation || ''}
              onChange={(e) => setDraftField('sessionsLocation', e.target.value)}
              disabled={saving}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Nota
            <textarea
              className={`${textareaClass} min-h-20`}
              value={draft.sessionsNote || ''}
              onChange={(e) => setDraftField('sessionsNote', e.target.value)}
              disabled={saving}
            />
          </label>
        </div>
      )
    case 'contact':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Correo
            <input
              className={inputClass}
              value={draft.contactEmail || ''}
              onChange={(e) => setDraftField('contactEmail', e.target.value)}
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Teléfono
            <input
              className={inputClass}
              value={draft.contactPhone || ''}
              onChange={(e) => setDraftField('contactPhone', e.target.value)}
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Dirección
            <input
              className={inputClass}
              value={draft.contactAddress || ''}
              onChange={(e) => setDraftField('contactAddress', e.target.value)}
              disabled={saving}
            />
          </label>
          <label className={labelClass}>
            Horario de atención
            <input
              className={inputClass}
              value={draft.contactHours || ''}
              onChange={(e) => setDraftField('contactHours', e.target.value)}
              disabled={saving}
            />
          </label>
        </div>
      )
    default:
      return null
  }
}
