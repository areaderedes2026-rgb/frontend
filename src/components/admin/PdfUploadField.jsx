import { useCallback, useId, useRef, useState } from 'react'
import { uploadMediaPdf } from '../../services/mediaUploadService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { Toast } from '../ui/Toast.jsx'
import { formErrorClass, inputClass, labelClass } from '../ui/formStyles.js'

const ACCEPT = 'application/pdf,.pdf'

const FIELD_BTN_BASE =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition shadow-sm disabled:cursor-not-allowed disabled:opacity-60'
const FIELD_BTN_PRIMARY = `${FIELD_BTN_BASE} bg-sky-700 text-white hover:bg-sky-800`
const FIELD_BTN_NEUTRAL = `${FIELD_BTN_BASE} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`
const FIELD_BTN_DANGER = `${FIELD_BTN_BASE} border border-rose-200 bg-white text-rose-700 hover:bg-rose-50`

function shortPdfLabel(url) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  try {
    const parsed = new URL(raw)
    const segment = parsed.pathname.split('/').filter(Boolean).pop()
    if (segment) return decodeURIComponent(segment)
    return parsed.hostname
  } catch {
    return raw.length > 48 ? `${raw.slice(0, 45)}…` : raw
  }
}

function isValidPdfUrl(value) {
  const v = String(value || '').trim()
  if (!v) return false
  if (!v.startsWith('http://') && !v.startsWith('https://')) return false
  try {
    new URL(v)
    return true
  } catch {
    return false
  }
}

function Spinner() {
  return (
    <span
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-sky-700"
      aria-hidden
    />
  )
}

/**
 * Campo para subir o vincular un PDF (documentos legislativos, etc.).
 */
export function PdfUploadField({
  label = 'Documento PDF',
  helpText = 'PDF · máx. 10 MB. Se abrirá en una pestaña nueva en el sitio público.',
  value,
  onChange,
  disabled = false,
  onNotify,
  onBusyChange,
}) {
  const inputId = useId()
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [remoteUrl, setRemoteUrl] = useState('')
  const [toast, setToast] = useState(null)
  const dismissToast = useCallback(() => setToast(null), [])
  const api = isApiConfigured()
  const isInteractive = api && !disabled && !busy
  const hasFile = Boolean(String(value || '').trim())

  function notify(variant, message) {
    setToast({ variant, message })
    onNotify?.({ variant, message })
  }

  function setBusyState(next) {
    setBusy(next)
    onBusyChange?.(next)
  }

  async function handleFile(file) {
    if (!file) return
    if (file.type && file.type !== 'application/pdf') {
      const msg = 'Solo se permiten archivos PDF.'
      setError(msg)
      notify('error', msg)
      return
    }
    if (!api) {
      const msg = 'No hay conexión con el backend para subir el PDF.'
      setError(msg)
      notify('error', msg)
      return
    }
    setError('')
    setBusyState(true)
    try {
      const next = await uploadMediaPdf(file)
      onChange(next)
      notify('success', 'PDF cargado correctamente.')
    } catch (e) {
      const msg = e.message || 'No se pudo subir el PDF.'
      setError(msg)
      notify('error', msg)
    } finally {
      setBusyState(false)
    }
  }

  function applyRemoteUrl() {
    const remote = remoteUrl.trim()
    if (!remote) return
    if (!isValidPdfUrl(remote)) {
      const msg = 'Ingresá una URL válida (http o https).'
      setError(msg)
      notify('error', msg)
      return
    }
    setError('')
    onChange(remote)
    notify('success', 'URL del PDF guardada en el borrador.')
  }

  function openFilePicker() {
    if (!isInteractive) return
    fileRef.current?.click()
  }

  return (
    <div className="min-w-0 max-w-full">
      {toast ? (
        <Toast variant={toast.variant} message={toast.message} onDismiss={dismissToast} />
      ) : null}

      {label ? (
        <label className={labelClass} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      {helpText ? <p className="mb-2 text-xs text-slate-500">{helpText}</p> : null}

      {error ? (
        <p className={`${formErrorClass} mb-2 break-words`} role="alert">
          {error}
        </p>
      ) : null}

      <div
        className={`rounded-2xl border border-dashed p-4 transition ${
          busy
            ? 'border-sky-300 bg-sky-50/50'
            : 'border-slate-300 bg-slate-50/60 hover:border-sky-300 hover:bg-sky-50/40'
        }`}
      >
        {busy ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm font-semibold text-sky-800">
            <Spinner />
            Subiendo PDF…
          </div>
        ) : hasFile ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-800">PDF cargado</p>
              <p className="mt-1 truncate text-sm font-medium text-slate-800">
                {shortPdfLabel(value)}
              </p>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex text-xs font-semibold text-sky-700 hover:text-sky-900"
              >
                Ver en nueva pestaña
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={FIELD_BTN_NEUTRAL}
                disabled={!isInteractive}
                onClick={openFilePicker}
              >
                Reemplazar
              </button>
              <button
                type="button"
                className={FIELD_BTN_DANGER}
                disabled={!isInteractive}
                onClick={() => onChange('')}
              >
                Quitar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="text-3xl" aria-hidden>
              📄
            </span>
            <p className="text-sm font-medium text-slate-700">
              Subí el PDF de proyectos o pegá una URL directa.
            </p>
            <button
              type="button"
              className={FIELD_BTN_PRIMARY}
              disabled={!isInteractive}
              onClick={openFilePicker}
            >
              Elegir PDF
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={!isInteractive}
        onChange={(e) => {
          const picked = e.target.files?.[0] ?? null
          e.target.value = ''
          if (picked) void handleFile(picked)
        }}
      />

      <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          type="url"
          inputMode="url"
          placeholder="https://ejemplo.com/proyectos.pdf"
          className={`${inputClass} min-w-0`}
          value={remoteUrl}
          disabled={!isInteractive}
          onChange={(e) => setRemoteUrl(e.target.value)}
        />
        <button
          type="button"
          disabled={!isInteractive || !remoteUrl.trim()}
          onClick={applyRemoteUrl}
          className={`${FIELD_BTN_NEUTRAL} w-full sm:w-auto`}
        >
          Usar URL
        </button>
      </div>
    </div>
  )
}
