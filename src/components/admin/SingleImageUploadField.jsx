import { useId, useState } from 'react'
import {
  importNewsImageFromUrl,
  uploadNewsImage,
} from '../../services/newsService.js'
import { isApiConfigured } from '../../utils/apiConfig.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { Button } from '../ui/Button.jsx'
import { formErrorClass, inputClass, labelClass } from '../ui/formStyles.js'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

export function SingleImageUploadField({
  label,
  helpText = 'JPEG, PNG, WebP o GIF (máx. 10 MB).',
  value,
  onChange,
  kind = 'cover',
  disabled = false,
}) {
  const inputId = useId()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [remoteUrl, setRemoteUrl] = useState('')
  const api = isApiConfigured()

  async function handleFile(file) {
    if (!file || !api) return
    setError('')
    setBusy(true)
    try {
      const next = await uploadNewsImage(file, kind === 'gallery' ? 'gallery' : 'cover')
      onChange(next)
    } catch (e) {
      setError(e.message || 'No se pudo subir la imagen.')
    } finally {
      setBusy(false)
    }
  }

  async function handleImport() {
    const remote = remoteUrl.trim()
    if (!remote || !api) return
    setError('')
    setBusy(true)
    try {
      const next = await importNewsImageFromUrl(
        remote,
        kind === 'gallery' ? 'gallery' : 'cover',
      )
      onChange(next)
      setRemoteUrl('')
    } catch (e) {
      setError(e.message || 'No se pudo importar la imagen.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <label className={labelClass} htmlFor={inputId}>
        {label}
      </label>
      <p className="mb-2 text-xs text-slate-500">{helpText}</p>
      {error ? (
        <p className={`${formErrorClass} mb-2`} role="alert">
          {error}
        </p>
      ) : null}
      <input
        id={inputId}
        type="file"
        accept={ACCEPT}
        className={inputClass}
        disabled={!api || disabled || busy}
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) void handleFile(f)
        }}
      />
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="url"
          inputMode="url"
          placeholder="https://..."
          className={inputClass}
          value={remoteUrl}
          disabled={!api || disabled || busy}
          onChange={(e) => setRemoteUrl(e.target.value)}
        />
        <Button
          type="button"
          disabled={!api || disabled || busy || !remoteUrl.trim()}
          onClick={() => void handleImport()}
        >
          Importar URL
        </Button>
      </div>
      {value ? (
        <div className="mt-3 flex flex-wrap items-start gap-3">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <img
              src={resolveMediaUrl(value)}
              alt=""
              className="max-h-40 max-w-full object-contain"
            />
          </div>
          <Button type="button" variant="danger" onClick={() => onChange('')}>
            Quitar
          </Button>
        </div>
      ) : null}
    </div>
  )
}
