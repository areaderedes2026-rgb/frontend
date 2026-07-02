import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { Button } from '../ui/Button.jsx'
import { Modal } from '../ui/Modal.jsx'
import { labelClass } from '../ui/formStyles.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { heroOverlayGradientStyle, normalizeHeroOverlayOpacity } from '../../utils/heroOverlay.js'

export function AreasPageCoverModal({
  open,
  title = 'Portada de Áreas',
  description = 'Imagen y overlay oscuro del header público del listado de áreas.',
  value,
  overlayOpacity = 65,
  onChange,
  onOverlayChange,
  onClose,
  onSave,
  saving = false,
  disabled = false,
  saveLabel = 'Guardar portada',
  previewBadge = 'Municipalidad de Trancas',
  previewTitle = 'Todas las áreas en un solo lugar',
}) {
  const image = value ? resolveMediaUrl(value) || value : ''
  const overlay = normalizeHeroOverlayOpacity(overlayOpacity)

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title={title}
      description={description}
      loading={saving}
      size="wide"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <SingleImageUploadField
            label="Imagen de portada"
            helpText="Subí la imagen principal del listado de áreas o importala por URL."
            value={value}
            onChange={onChange}
            kind="cover"
            disabled={disabled || saving}
          />
          <label className={labelClass}>
            Opacidad del overlay: {overlay}%
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              className="mt-2 w-full accent-sky-700"
              value={overlay}
              disabled={disabled || saving}
              onChange={(e) => onOverlayChange?.(Number(e.target.value))}
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Subila si necesitás más contraste en los textos; bajala si la imagen ya tiene buen contraste.
            </span>
          </label>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Vista previa
          </p>
          <div className="relative mt-3 aspect-16/9 overflow-hidden rounded-xl bg-slate-900">
            {image ? (
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
            ) : (
              <div className="grid h-full place-items-center text-sm text-slate-400">
                Sin imagen
              </div>
            )}
            <div className="absolute inset-0" style={heroOverlayGradientStyle(overlay)} aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100">
                {previewBadge}
              </p>
              <p className="mt-1 font-serif text-lg font-bold leading-snug text-white sm:text-xl">
                {previewTitle}
              </p>
            </div>
            <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
              Overlay: {overlay}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button type="button" onClick={onSave} disabled={disabled || saving}>
          {saving ? 'Guardando…' : saveLabel}
        </Button>
      </div>
    </Modal>
  )
}
