import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { Button } from '../ui/Button.jsx'
import { Modal } from '../ui/Modal.jsx'
import { inputClass, labelClass, textareaClass } from '../ui/formStyles.js'
import { resolveMediaUrl } from '../../utils/imageUrl.js'
import { heroOverlayGradientStyle, normalizeHeroOverlayOpacity } from '../../utils/heroOverlay.js'

function Toggle({ label, checked, onChange, disabled = false }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-sky-700"
      />
      {label}
    </label>
  )
}

/**
 * Editor de portada de sección: imagen, overlay, textos, buscador y botones (patrón banners de Inicio).
 */
export function PageCoverModal({
  open,
  title = 'Portada',
  description = 'Configurá imagen, textos, buscador y botones del header público.',
  draft,
  onFieldChange,
  onClose,
  onSave,
  saving = false,
  disabled = false,
  saveLabel = 'Guardar portada',
  imageHelpText = 'Subí la imagen principal de la sección o importala por URL.',
  previewTitleClassName = '',
}) {
  if (!draft) return null

  const update = (key, value) => onFieldChange?.(key, value)
  const image = draft.heroImageUrl ? resolveMediaUrl(draft.heroImageUrl) || draft.heroImageUrl : ''
  const overlay = normalizeHeroOverlayOpacity(draft.overlayOpacity)

  const previewBadge = draft.showHeroBadge ? draft.heroBadge : ''
  const previewTitle = draft.showHeroTitle ? draft.heroTitle : ''
  const previewSubtitle = draft.showHeroSubtitle ? draft.heroSubtitle : ''

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title={title}
      description={description}
      loading={saving}
      size="xlarge"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,20rem)]">
        <div className="max-h-[min(70dvh,50rem)] space-y-5 overflow-y-auto pr-1">
          <SingleImageUploadField
            label="Imagen de portada"
            helpText={imageHelpText}
            value={draft.heroImageUrl || ''}
            onChange={(value) => update('heroImageUrl', value)}
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
              onChange={(e) => update('overlayOpacity', Number(e.target.value))}
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Subila si necesitás más contraste en los textos; bajala si la imagen ya tiene buen contraste.
            </span>
          </label>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Textos del header</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                Antetítulo
                <input
                  className={inputClass}
                  value={draft.heroBadge || ''}
                  disabled={disabled || saving}
                  onChange={(e) => update('heroBadge', e.target.value)}
                  placeholder="Municipalidad de Trancas"
                />
              </label>
              <label className={labelClass}>
                Título
                <input
                  className={inputClass}
                  value={draft.heroTitle || ''}
                  disabled={disabled || saving}
                  onChange={(e) => update('heroTitle', e.target.value)}
                />
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                Subtítulo
                <textarea
                  className={`${textareaClass} min-h-24`}
                  value={draft.heroSubtitle || ''}
                  disabled={disabled || saving}
                  onChange={(e) => update('heroSubtitle', e.target.value)}
                />
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                Placeholder del buscador
                <input
                  className={inputClass}
                  value={draft.heroSearchPlaceholder || ''}
                  disabled={disabled || saving}
                  onChange={(e) => update('heroSearchPlaceholder', e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Visibilidad</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <Toggle
                label="Antetítulo"
                checked={draft.showHeroBadge !== false}
                disabled={disabled || saving}
                onChange={(value) => update('showHeroBadge', value)}
              />
              <Toggle
                label="Título"
                checked={draft.showHeroTitle !== false}
                disabled={disabled || saving}
                onChange={(value) => update('showHeroTitle', value)}
              />
              <Toggle
                label="Subtítulo"
                checked={draft.showHeroSubtitle !== false}
                disabled={disabled || saving}
                onChange={(value) => update('showHeroSubtitle', value)}
              />
              <Toggle
                label="Buscador"
                checked={draft.showSearch !== false}
                disabled={disabled || saving}
                onChange={(value) => update('showSearch', value)}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Botones</h3>
              <div className="flex flex-wrap gap-2">
                <Toggle
                  label="Botón principal"
                  checked={draft.showPrimaryButton === true}
                  disabled={disabled || saving}
                  onChange={(value) => update('showPrimaryButton', value)}
                />
                <Toggle
                  label="Botón secundario"
                  checked={draft.showSecondaryButton === true}
                  disabled={disabled || saving}
                  onChange={(value) => update('showSecondaryButton', value)}
                />
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                Texto botón principal
                <input
                  className={inputClass}
                  value={draft.primaryLabel || ''}
                  disabled={disabled || saving || draft.showPrimaryButton !== true}
                  onChange={(e) => update('primaryLabel', e.target.value)}
                />
              </label>
              <label className={labelClass}>
                Enlace botón principal
                <input
                  className={inputClass}
                  value={draft.primaryHref || ''}
                  disabled={disabled || saving || draft.showPrimaryButton !== true}
                  onChange={(e) => update('primaryHref', e.target.value)}
                  placeholder="#areas-grid, /ruta o https://..."
                />
              </label>
              <label className={labelClass}>
                Texto botón secundario
                <input
                  className={inputClass}
                  value={draft.secondaryLabel || ''}
                  disabled={disabled || saving || draft.showSecondaryButton !== true}
                  onChange={(e) => update('secondaryLabel', e.target.value)}
                />
              </label>
              <label className={labelClass}>
                Enlace botón secundario
                <input
                  className={inputClass}
                  value={draft.secondaryHref || ''}
                  disabled={disabled || saving || draft.showSecondaryButton !== true}
                  onChange={(e) => update('secondaryHref', e.target.value)}
                  placeholder="#seccion, /ruta o https://..."
                />
              </label>
            </div>
          </section>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 xl:sticky xl:top-0 xl:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Vista previa
          </p>
          <div className="relative mt-3 aspect-[4/5] overflow-hidden rounded-xl bg-slate-900 sm:aspect-[3/4]">
            {image ? (
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
            ) : (
              <div className="grid h-full place-items-center px-4 text-center text-sm text-slate-400">
                Sin imagen
              </div>
            )}
            <div className="absolute inset-0" style={heroOverlayGradientStyle(overlay)} aria-hidden />
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-4 text-center">
              {previewBadge ? (
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100">
                  {previewBadge}
                </p>
              ) : null}
              {previewTitle ? (
                <p
                  className={`font-serif text-lg font-bold leading-snug text-white sm:text-xl ${previewTitleClassName}`.trim()}
                >
                  {previewTitle}
                </p>
              ) : null}
              {previewSubtitle ? (
                <p className="line-clamp-3 text-xs leading-relaxed text-slate-100">{previewSubtitle}</p>
              ) : null}
              {draft.showSearch !== false && draft.heroSearchPlaceholder ? (
                <div className="mx-auto mt-2 max-w-[92%] rounded-xl bg-white/95 px-3 py-2 text-left text-[11px] text-slate-400">
                  {draft.heroSearchPlaceholder}
                </div>
              ) : null}
              {draft.showPrimaryButton === true && draft.primaryLabel ? (
                <span className="mt-2 inline-flex rounded-xl bg-sky-700 px-3 py-1.5 text-[11px] font-semibold text-white">
                  {draft.primaryLabel}
                </span>
              ) : null}
              {draft.showSecondaryButton === true && draft.secondaryLabel ? (
                <span className="ml-2 inline-flex rounded-xl border border-white/40 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white">
                  {draft.secondaryLabel}
                </span>
              ) : null}
            </div>
            <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
              {overlay}%
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

/** @deprecated Usar PageCoverModal */
export const AreasPageCoverModal = PageCoverModal
