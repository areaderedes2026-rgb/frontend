import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell } from '../../components/admin/AdminPageShell.jsx'
import { SingleImageUploadField } from '../../components/admin/SingleImageUploadField.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Toast } from '../../components/ui/Toast.jsx'
import { inputClass, labelClass, textareaClass } from '../../components/ui/formStyles.js'
import {
  DEFAULT_INTENDENCIA_CONTENT,
  mergeIntendenciaContent,
} from '../../data/intendenciaContent.js'
import { useContentEditorConcurrencyConflict } from '../../hooks/useContentEditorConcurrencyConflict.jsx'
import {
  fetchIntendenciaContent,
  updateIntendenciaContent,
} from '../../services/intendenciaService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { ROUTES } from '../../utils/constants.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'

const TABS = [
  { id: 'portada', label: 'Portada' },
  { id: 'ficha', label: 'Intendente' },
  { id: 'contacto', label: 'Contacto' },
  { id: 'visibilidad', label: 'Visibilidad' },
]

const ACTION_BTN =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60'
const ACTION_PRIMARY = `${ACTION_BTN} bg-sky-700 text-white hover:bg-sky-800`
const ACTION_NEUTRAL = `${ACTION_BTN} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`
const SECTION_CARD = 'rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'

function mapToForm(content) {
  return {
    heroEyebrow: content.heroEyebrow || '',
    heroTitle: content.heroTitle || '',
    heroSubtitle: content.heroSubtitle || '',
    heroImageUrl: content.heroImageUrl || '',
    mayorName: content.mayorName || '',
    mayorRole: content.mayorRole || '',
    mayorBio: content.mayorBio || '',
    mayorPhotoUrl: content.mayorPhotoUrl || '',
    contactEmail: content.contactEmail || '',
    contactPhone: content.contactPhone || '',
    officeHours: content.officeHours || '',
    showMayorPhoto: content.showMayorPhoto !== false,
    showMayorRole: content.showMayorRole !== false,
    showMayorBio: content.showMayorBio !== false,
    showContactPanel: content.showContactPanel !== false,
    showContactEmail: content.showContactEmail !== false,
    showContactPhone: content.showContactPhone !== false,
    showOfficeHours: content.showOfficeHours !== false,
    showContactNote: content.showContactNote !== false,
    showManagementAxes: content.showManagementAxes !== false,
  }
}

function VisibilityToggle({ label, hint, checked, onChange, disabled }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 transition hover:border-slate-300 hover:bg-white">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-sky-600 focus:ring-sky-500 disabled:cursor-not-allowed"
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

function ModalFooter({ onCancel, onApply, applyLabel = 'Aplicar', saving = false }) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" className={ACTION_NEUTRAL} disabled={saving} onClick={onCancel}>
        Cancelar
      </button>
      <button type="button" className={ACTION_PRIMARY} disabled={saving} onClick={onApply}>
        {applyLabel}
      </button>
    </div>
  )
}

export function AdminIntendencia() {
  const [form, setForm] = useState(() => mapToForm(DEFAULT_INTENDENCIA_CONTENT))
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('portada')
  const [coverModalOpen, setCoverModalOpen] = useState(false)
  const [coverDraft, setCoverDraft] = useState('')
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const [photoDraft, setPhotoDraft] = useState('')
  const dismissToast = useCallback(() => setToast(null), [])
  const apiAvailable = isApiConfigured()

  const loadFromServer = useCallback(async () => {
    const remote = await fetchIntendenciaContent()
    const merged = mergeIntendenciaContent(DEFAULT_INTENDENCIA_CONTENT, remote || {})
    setForm(mapToForm(merged))
    setContentUpdatedAt(remote?.updatedAt || null)
    setError('')
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadContent() {
      setError('')
      setLoading(true)
      if (!apiAvailable) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        await loadFromServer()
      } catch (e) {
        if (!cancelled) setError(e.message || 'No se pudo cargar Intendencia.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadContent()
    return () => {
      cancelled = true
    }
  }, [apiAvailable, loadFromServer])

  const buildPayload = useCallback(
    (forceOverwrite = false) => ({
      expectedUpdatedAt: contentUpdatedAt,
      forceOverwrite,
      heroEyebrow: form.heroEyebrow.trim(),
      heroTitle: form.heroTitle.trim(),
      heroSubtitle: form.heroSubtitle,
      heroImageUrl: form.heroImageUrl.trim(),
      mayorName: form.mayorName.trim(),
      mayorRole: form.mayorRole.trim(),
      mayorBio: form.mayorBio,
      mayorPhotoUrl: form.mayorPhotoUrl.trim(),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      officeHours: form.officeHours.trim(),
      showMayorPhoto: Boolean(form.showMayorPhoto),
      showMayorRole: Boolean(form.showMayorRole),
      showMayorBio: Boolean(form.showMayorBio),
      showContactPanel: Boolean(form.showContactPanel),
      showContactEmail: Boolean(form.showContactEmail),
      showContactPhone: Boolean(form.showContactPhone),
      showOfficeHours: Boolean(form.showOfficeHours),
      showContactNote: Boolean(form.showContactNote),
      showManagementAxes: Boolean(form.showManagementAxes),
    }),
    [contentUpdatedAt, form],
  )

  const persistContent = useCallback(
    async ({ forceOverwrite = false } = {}) => {
      const saved = await updateIntendenciaContent(buildPayload(forceOverwrite))
      const merged = mergeIntendenciaContent(DEFAULT_INTENDENCIA_CONTENT, saved || {})
      setForm(mapToForm(merged))
      setContentUpdatedAt(saved?.updatedAt || null)
      setError('')
      setToast({ variant: 'success', message: 'Se guardaron los cambios de Intendencia.' })
    },
    [buildPayload],
  )

  const { conflictDialog, handleConflict } = useContentEditorConcurrencyConflict({
    reloadFromServer: loadFromServer,
    persistContent,
    entityLabel: 'Intendencia',
    onReloadSuccess: () =>
      setToast({
        variant: 'success',
        message: 'Se cargó la última versión del servidor.',
      }),
    onReloadError: (e) =>
      setToast({
        variant: 'error',
        message: e.message || 'No se pudo recargar el contenido.',
      }),
    onForceSaveError: (e) => {
      const msg = e.message || 'No se pudo guardar Intendencia.'
      setError(msg)
      setToast({ variant: 'error', message: msg })
    },
  })

  function setFlag(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    setError('')
    if (!apiAvailable) {
      setToast({
        variant: 'error',
        message: 'No hay conexión disponible con el backend.',
      })
      return
    }
    setSaving(true)
    try {
      await persistContent()
    } catch (e) {
      if (handleConflict(e)) return
      const msg = e.message || 'No se pudo guardar Intendencia.'
      setError(msg)
      setToast({ variant: 'error', message: msg })
    } finally {
      setSaving(false)
    }
  }

  const coverSrc = form.heroImageUrl ? resolveMediaUrl(form.heroImageUrl) || form.heroImageUrl : ''
  const photoSrc = form.mayorPhotoUrl
    ? resolveMediaUrl(form.mayorPhotoUrl) || form.mayorPhotoUrl
    : ''
  const busy = loading || saving

  return (
    <>
      {conflictDialog}
      {toast ? (
        <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} />
      ) : null}

      <Modal
        open={coverModalOpen}
        onClose={() => setCoverModalOpen(false)}
        title="Imagen de portada"
        description="Subí o importá la imagen principal de la sección Intendencia."
        size="wide"
        footer={
          <ModalFooter
            saving={saving}
            onCancel={() => setCoverModalOpen(false)}
            onApply={() => {
              setForm((prev) => ({ ...prev, heroImageUrl: coverDraft }))
              setCoverModalOpen(false)
              setToast({
                variant: 'success',
                message: 'Portada aplicada al borrador. Guardá para publicarla.',
              })
            }}
          />
        }
      >
        <SingleImageUploadField
          label="Imagen de portada"
          helpText="Subí imagen principal o importala por URL."
          value={coverDraft}
          onChange={setCoverDraft}
          kind="cover"
          disabled={busy}
          onNotify={setToast}
        />
      </Modal>

      <Modal
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        title="Foto del intendente"
        description="Subí una foto en formato retrato o importala por URL."
        size="wide"
        footer={
          <ModalFooter
            saving={saving}
            onCancel={() => setPhotoModalOpen(false)}
            onApply={() => {
              setForm((prev) => ({ ...prev, mayorPhotoUrl: photoDraft }))
              setPhotoModalOpen(false)
              setToast({
                variant: 'success',
                message: 'Foto aplicada al borrador. Guardá para publicarla.',
              })
            }}
          />
        }
      >
        <SingleImageUploadField
          label="Foto del intendente"
          helpText="Preferí una imagen vertical o cuadrada."
          value={photoDraft}
          onChange={setPhotoDraft}
          kind="cover"
          disabled={busy}
          onNotify={setToast}
        />
      </Modal>

      <AdminPageShell showBackLink={false} maxWidthClass="max-w-7xl" variant="plain">
        {!apiAvailable ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Esta sección requiere conexión activa con el backend para guardar cambios.
          </div>
        ) : null}
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
              <div className="flex min-w-max gap-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                      activeTab === tab.id
                        ? 'bg-sky-700 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'portada' ? (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-sm">
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-100">
                      Vista previa de portada
                    </p>
                    <button
                      type="button"
                      className={ACTION_NEUTRAL}
                      disabled={busy}
                      onClick={() => {
                        setCoverDraft(form.heroImageUrl || '')
                        setCoverModalOpen(true)
                      }}
                    >
                      Cambiar imagen
                    </button>
                  </div>
                  <div className="relative min-h-[14rem] sm:min-h-[18rem]">
                    {coverSrc ? (
                      <img
                        src={coverSrc}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-slate-700 to-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-slate-950/55" />
                    <div className="relative flex min-h-[14rem] flex-col justify-end p-6 sm:min-h-[18rem] sm:p-8">
                      {form.heroEyebrow ? (
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
                          {form.heroEyebrow}
                        </p>
                      ) : null}
                      <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {form.heroTitle || 'Intendencia'}
                      </h2>
                      {form.heroSubtitle ? (
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
                          {form.heroSubtitle}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <section className={SECTION_CARD}>
                  <h2 className="text-base font-semibold text-slate-900">Textos del encabezado</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className={labelClass}>
                      Etiqueta
                      <input
                        className={inputClass}
                        value={form.heroEyebrow}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, heroEyebrow: e.target.value }))
                        }
                        disabled={busy}
                      />
                    </label>
                    <label className={labelClass}>
                      Título
                      <input
                        className={inputClass}
                        value={form.heroTitle}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, heroTitle: e.target.value }))
                        }
                        disabled={busy}
                      />
                    </label>
                    <label className={`${labelClass} sm:col-span-2`}>
                      Subtítulo
                      <textarea
                        className={`${textareaClass} min-h-24`}
                        value={form.heroSubtitle}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))
                        }
                        disabled={busy}
                      />
                    </label>
                  </div>
                </section>
              </div>
            ) : null}

            {activeTab === 'ficha' ? (
              <section className={SECTION_CARD}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Ficha del intendente</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Nombre, cargo, biografía y foto que se muestran en la página pública.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={ACTION_NEUTRAL}
                    disabled={busy}
                    onClick={() => {
                      setPhotoDraft(form.mayorPhotoUrl || '')
                      setPhotoModalOpen(true)
                    }}
                  >
                    {form.mayorPhotoUrl ? 'Cambiar foto' : 'Agregar foto'}
                  </button>
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-[11rem_1fr]">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    {photoSrc ? (
                      <img src={photoSrc} alt="" className="aspect-3/4 h-full w-full object-cover" />
                    ) : (
                      <div className="flex aspect-3/4 items-center justify-center px-3 text-center text-xs text-slate-500">
                        Sin foto
                      </div>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className={labelClass}>
                      Nombre
                      <input
                        className={inputClass}
                        value={form.mayorName}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, mayorName: e.target.value }))
                        }
                        disabled={busy}
                      />
                    </label>
                    <label className={labelClass}>
                      Cargo
                      <input
                        className={inputClass}
                        value={form.mayorRole}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, mayorRole: e.target.value }))
                        }
                        disabled={busy}
                      />
                    </label>
                    <label className={`${labelClass} sm:col-span-2`}>
                      Biografía
                      <textarea
                        className={`${textareaClass} min-h-36`}
                        value={form.mayorBio}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, mayorBio: e.target.value }))
                        }
                        disabled={busy}
                      />
                    </label>
                  </div>
                </div>
              </section>
            ) : null}

            {activeTab === 'contacto' ? (
              <section className={SECTION_CARD}>
                <h2 className="text-base font-semibold text-slate-900">Datos de contacto</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Información del panel lateral de la página pública.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Correo
                    <input
                      className={inputClass}
                      value={form.contactEmail}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, contactEmail: e.target.value }))
                      }
                      disabled={busy}
                    />
                  </label>
                  <label className={labelClass}>
                    Teléfono
                    <input
                      className={inputClass}
                      value={form.contactPhone}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, contactPhone: e.target.value }))
                      }
                      disabled={busy}
                    />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Horario de atención
                    <input
                      className={inputClass}
                      value={form.officeHours}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, officeHours: e.target.value }))
                      }
                      disabled={busy}
                    />
                  </label>
                </div>
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  La visibilidad de cada dato se controla en la pestaña{' '}
                  <button
                    type="button"
                    className="font-semibold text-sky-700 hover:text-sky-900"
                    onClick={() => setActiveTab('visibilidad')}
                  >
                    Visibilidad
                  </button>
                  .
                </div>
              </section>
            ) : null}

            {activeTab === 'visibilidad' ? (
              <section className={SECTION_CARD}>
                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-semibold text-slate-900">Visibilidad pública</h2>
                  <p className="text-sm text-slate-500">
                    Controlá qué elementos se muestran. Los datos no se borran: podés volver a
                    habilitarlos cuando quieras.
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <VisibilityToggle
                    label="Foto del intendente"
                    hint="Muestra la imagen retrato junto a la ficha."
                    checked={form.showMayorPhoto}
                    onChange={(v) => setFlag('showMayorPhoto', v)}
                    disabled={busy}
                  />
                  <VisibilityToggle
                    label="Cargo del intendente"
                    hint="Texto debajo del nombre (ej. Intendente Municipal)."
                    checked={form.showMayorRole}
                    onChange={(v) => setFlag('showMayorRole', v)}
                    disabled={busy}
                  />
                  <VisibilityToggle
                    label="Biografía / descripción"
                    hint="Párrafo de presentación del intendente."
                    checked={form.showMayorBio}
                    onChange={(v) => setFlag('showMayorBio', v)}
                    disabled={busy}
                  />
                  <VisibilityToggle
                    label="Panel lateral de contacto"
                    hint="Si lo desactivás, no se muestra el bloque oscuro de la derecha."
                    checked={form.showContactPanel}
                    onChange={(v) => setFlag('showContactPanel', v)}
                    disabled={busy}
                  />
                  <VisibilityToggle
                    label="Correo dentro del panel"
                    hint="Línea “Correo” en el panel de contacto."
                    checked={form.showContactEmail}
                    onChange={(v) => setFlag('showContactEmail', v)}
                    disabled={busy || !form.showContactPanel}
                  />
                  <VisibilityToggle
                    label="Teléfono dentro del panel"
                    hint="Línea “Teléfono” en el panel de contacto."
                    checked={form.showContactPhone}
                    onChange={(v) => setFlag('showContactPhone', v)}
                    disabled={busy || !form.showContactPanel}
                  />
                  <VisibilityToggle
                    label="Horario de atención"
                    hint="Línea “Horario” en el panel de contacto."
                    checked={form.showOfficeHours}
                    onChange={(v) => setFlag('showOfficeHours', v)}
                    disabled={busy || !form.showContactPanel}
                  />
                  <VisibilityToggle
                    label="Nota institucional"
                    hint='Recuadro azul: "La intendencia articula con todas las áreas…".'
                    checked={form.showContactNote}
                    onChange={(v) => setFlag('showContactNote', v)}
                    disabled={busy || !form.showContactPanel}
                  />
                  <VisibilityToggle
                    label="Sección Ejes de gestión"
                    hint="Tarjeta inferior con los seis ejes."
                    checked={form.showManagementAxes}
                    onChange={(v) => setFlag('showManagementAxes', v)}
                    disabled={busy}
                  />
                </div>
              </section>
            ) : null}

            <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
              <Link
                to={ROUTES.governmentIntendencia}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-sky-700 hover:text-sky-900"
              >
                Ver página pública ↗
              </Link>
              <button
                type="button"
                className={ACTION_PRIMARY}
                disabled={busy || !apiAvailable}
                onClick={() => void handleSubmit()}
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}
      </AdminPageShell>
    </>
  )
}
