import { SingleImageUploadField } from './SingleImageUploadField.jsx'
import { Button } from '../ui/Button.jsx'
import { Modal } from '../ui/Modal.jsx'

export function HeroImageModal({
  open,
  title = 'Cambiar imagen de portada',
  description = 'Subí una imagen local o importala desde una URL.',
  value,
  onChange,
  onClose,
  onSave,
  saving = false,
  disabled = false,
  saveLabel = 'Guardar portada',
}) {
  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title={title}
      description={description}
      loading={saving}
    >
      <SingleImageUploadField
        label="Imagen de portada"
        helpText="Subí la imagen principal de esta sección o importala por URL."
        value={value}
        onChange={onChange}
        kind="cover"
        disabled={disabled || saving}
      />
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
