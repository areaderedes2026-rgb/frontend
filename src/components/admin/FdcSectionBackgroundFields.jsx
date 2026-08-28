import { SingleImageUploadField } from './SingleImageUploadField.jsx'

const STYLE_OPTIONS = [
  {
    id: 'light',
    label: 'Blanco',
    description: 'Fondo claro (#f7f7f5)',
    swatch: '#f7f7f5',
    ring: '#e8e5dd',
  },
  {
    id: 'dark',
    label: 'Azul',
    description: 'Fondo oscuro (#171b22)',
    swatch: '#171b22',
    ring: '#2a313b',
  },
  {
    id: 'image',
    label: 'Imagen',
    description: 'Foto de fondo con overlay',
    swatch: null,
    ring: '#cbd5e1',
  },
]

function normalizeOverlay(value, fallback = 55) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(90, Math.max(0, Math.round(n))) : fallback
}

/**
 * Selector de fondo de sección FDC: blanco, azul o imagen (excluyentes).
 */
export function FdcSectionBackgroundFields({
  backgroundStyle = 'light',
  backgroundImageUrl = '',
  overlayOpacity = 55,
  disabled = false,
  onStyleChange,
  onImageChange,
  onOverlayChange,
  onNotify,
  imageLabel = 'Imagen de fondo',
  labelClass = '',
}) {
  const style = STYLE_OPTIONS.some((o) => o.id === backgroundStyle) ? backgroundStyle : 'light'
  const hasImage = Boolean(String(backgroundImageUrl || '').trim())
  const overlay = normalizeOverlay(overlayOpacity, 55)

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
      <h3 className="text-base font-bold text-slate-900">Fondo de la sección</h3>
      <p className="mt-1 text-sm text-slate-600">
        Elegí un color sólido o una imagen. Solo se aplica una opción a la vez.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {STYLE_OPTIONS.map((option) => {
          const selected = style === option.id
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onStyleChange?.(option.id)}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                selected
                  ? 'border-sky-600 bg-white ring-2 ring-sky-600/25'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {option.id === 'image' ? (
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-500"
                  aria-hidden
                >
                  IMG
                </span>
              ) : (
                <span
                  className="h-10 w-10 shrink-0 rounded-lg border-2"
                  style={{ backgroundColor: option.swatch, borderColor: option.ring }}
                  aria-hidden
                />
              )}
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
                <span className="block text-xs text-slate-500">{option.description}</span>
              </span>
            </button>
          )
        })}
      </div>

      {style === 'image' ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <SingleImageUploadField
              label={imageLabel}
              value={backgroundImageUrl || ''}
              disabled={disabled}
              kind="cover"
              onChange={onImageChange}
              onNotify={onNotify}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Opacidad del overlay: {overlay}%
              <input
                type="range"
                min={0}
                max={90}
                step={1}
                className="mt-2 w-full accent-sky-700"
                value={overlay}
                disabled={disabled || !hasImage}
                onChange={(e) => onOverlayChange?.(normalizeOverlay(e.target.value, 55))}
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Más alto = fondo más oscuro y texto más legible.
              </span>
            </label>
          </div>
          {!hasImage ? (
            <p className="sm:col-span-2 text-xs text-amber-700">
              Subí una imagen para usar este fondo. Si no hay imagen, se mostrará el fondo blanco.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
